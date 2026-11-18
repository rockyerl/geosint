import type {
  AccountProfile,
  AccountStop,
  ActorLink,
  ComputedCluster,
  CorrelationTrendBucket,
  GeoEvent,
  NarrativeCluster,
  NarrativeItem,
  NarrativeTheme,
  TimeWindow,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Locale-independent string order, so results are identical on every machine. */
function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort(compareText);
}

function compareByTime(a: NarrativeItem, b: NarrativeItem): number {
  return Date.parse(a.publishedAt) - Date.parse(b.publishedAt) || compareText(a.id, b.id);
}

export function isValidWindow(window: TimeWindow): boolean {
  const fromMs = Date.parse(window.from);
  const toMs = Date.parse(window.to);
  return !isNaN(fromMs) && !isNaN(toMs) && fromMs < toMs;
}

/** Half-open window [from, to). */
export function isInWindow(iso: string, window: TimeWindow): boolean {
  const t = Date.parse(iso);
  return t >= Date.parse(window.from) && t < Date.parse(window.to);
}

export function clusterId(topicId: string, aoiId: string | null): string {
  return `${topicId}:${aoiId ?? "unlocated"}`;
}

/** 24-hour buckets over the window; last bucket is capped at the window end. */
export function computeTrendBuckets(times: string[], window: TimeWindow): CorrelationTrendBucket[] {
  const fromMs = Date.parse(window.from);
  const toMs = Date.parse(window.to);
  const durationMs = toMs - fromMs;
  const numBuckets = Math.max(1, Math.ceil(durationMs / DAY_MS));
  const timesMs = times.map((t) => Date.parse(t));
  const buckets: CorrelationTrendBucket[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const bFromMs = fromMs + i * DAY_MS;
    const bToMs = Math.min(toMs, bFromMs + DAY_MS);
    const count = timesMs.filter((t) => t >= bFromMs && t < bToMs).length;

    buckets.push({
      bucketIndex: i,
      from: new Date(bFromMs).toISOString(),
      to: new Date(bToMs).toISOString(),
      count,
      label: i === 0 ? "24 Jam Pertama" : i === 1 ? "24 Jam Kedua" : `24 Jam ke-${i + 1}`,
    });
  }
  return buckets;
}

export function computeNarrativeClusters(
  items: NarrativeItem[],
  window: TimeWindow
): ComputedCluster[] {
  const groups = new Map<string, NarrativeItem[]>();
  for (const item of items) {
    if (!isInWindow(item.publishedAt, window)) continue;
    const id = clusterId(item.topicId, item.mentionedAoiId);
    groups.set(id, [...(groups.get(id) ?? []), item]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([id, group]) => buildCluster(id, group, window));
}

function buildCluster(id: string, group: NarrativeItem[], window: TimeWindow): ComputedCluster {
  const ordered = [...group].sort(compareByTime);
  const accounts = sortedUnique(ordered.flatMap((i) => (i.authorAccount ? [i.authorAccount] : [])));
  const located = ordered.filter((i) => i.publishedAoiId !== null).length;
  return {
    id,
    topicId: ordered[0].topicId,
    aoiId: ordered[0].mentionedAoiId,
    itemIds: ordered.map((i) => i.id),
    totalContent: ordered.length,
    distinctAccounts: accounts.length,
    itemsPerAccount: accounts.length === 0 ? 0 : ordered.length / accounts.length,
    firstObservedAt: ordered[0].publishedAt,
    lastObservedAt: ordered[ordered.length - 1].publishedAt,
    trendBuckets: computeTrendBuckets(
      ordered.map((i) => i.publishedAt),
      window
    ),
    publishLocationCoverage: located / ordered.length,
  };
}

/** Located clusters of one topic, ranked: distinct accounts desc, then content desc, then aoiId (FR-203). */
export function computeConcentration(
  clusters: ComputedCluster[],
  topicId: string
): ComputedCluster[] {
  return clusters
    .filter((c) => c.topicId === topicId && c.aoiId !== null)
    .sort(
      (a, b) =>
        b.distinctAccounts - a.distinctAccounts ||
        b.totalContent - a.totalContent ||
        compareText(a.aoiId ?? "", b.aoiId ?? "")
    );
}

/** Sorted ids of events in one area, observed in the window. */
function eventIdsInArea(events: GeoEvent[], aoiId: string, window: TimeWindow): string[] {
  return sortedUnique(
    events.filter((e) => e.aoiId === aoiId && isInWindow(e.observedAt, window)).map((e) => e.id)
  );
}

export function computeActorLinks(
  items: NarrativeItem[],
  events: GeoEvent[],
  window: TimeWindow
): ActorLink[] {
  const byAccount = new Map<string, NarrativeItem[]>();
  for (const item of items) {
    if (!item.authorAccount || !isInWindow(item.publishedAt, window)) continue;
    byAccount.set(item.authorAccount, [...(byAccount.get(item.authorAccount) ?? []), item]);
  }
  return [...byAccount.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([account, own]) => {
      const ordered = [...own].sort(compareByTime);
      const aoiIds = sortedUnique(
        ordered.flatMap((i) => (i.mentionedAoiId ? [i.mentionedAoiId] : []))
      );
      const eventIds = sortedUnique(aoiIds.flatMap((a) => eventIdsInArea(events, a, window)));
      return {
        account,
        itemIds: ordered.map((i) => i.id),
        aoiIds,
        topicIds: sortedUnique(ordered.map((i) => i.topicId)),
        eventIds,
        isCrossEvent: aoiIds.length >= 2 || eventIds.length >= 2,
      };
    });
}

export function computeAccountProfile(
  items: NarrativeItem[],
  events: GeoEvent[],
  window: TimeWindow,
  account: string
): AccountProfile | null {
  const link = computeActorLinks(items, events, window).find((a) => a.account === account);
  if (!link) return null;
  const own = items.filter((i) => link.itemIds.includes(i.id)).sort(compareByTime);
  return { ...link, items: own, stops: computeAccountStops(own, events, window) };
}

/**
 * Movement of one account (spec 002 FR-214): each run of consecutive posts that mention the same
 * area is one stop; a later return to an area is a new stop. Posts without a mentioned area are
 * skipped and do not split a run. `ordered` must already be in time order.
 */
export function computeAccountStops(
  ordered: NarrativeItem[],
  events: GeoEvent[],
  window: TimeWindow
): AccountStop[] {
  const stops: AccountStop[] = [];
  for (const item of ordered) {
    if (!item.mentionedAoiId) continue;
    const last = stops[stops.length - 1];
    if (last && last.aoiId === item.mentionedAoiId) {
      last.itemIds.push(item.id);
      last.lastPostAt = item.publishedAt;
    } else {
      stops.push({
        aoiId: item.mentionedAoiId,
        firstPostAt: item.publishedAt,
        lastPostAt: item.publishedAt,
        itemIds: [item.id],
        eventIds: eventIdsInArea(events, item.mentionedAoiId, window),
      });
    }
  }
  return stops;
}

/** Builds the screen view of each theme from the computed cluster of its topic + area (no typed numbers). */
export function buildNarrativeClusterViews(
  themes: NarrativeTheme[],
  items: NarrativeItem[],
  window: TimeWindow
): NarrativeCluster[] {
  const clusters = computeNarrativeClusters(items, window);
  return themes.flatMap((theme) => {
    const cluster = clusters.find((c) => c.id === clusterId(theme.topicId, theme.targetAoiId));
    if (!cluster) return [];
    return [
      {
        id: theme.id,
        theme: theme.theme,
        sourceId: theme.sourceId,
        targetAoiId: theme.targetAoiId,
        firstObservedAt: cluster.firstObservedAt,
        lastObservedAt: cluster.lastObservedAt,
        totalContent: cluster.totalContent,
        uniqueAccountsCount: cluster.distinctAccounts,
        hasSufficientGeoMetadata: cluster.publishLocationCoverage > 0,
        volumeTrend: cluster.trendBuckets.map((b) => ({ time: b.label, count: b.count })),
        items: items.filter((i) => cluster.itemIds.includes(i.id)).sort(compareByTime),
      },
    ];
  });
}
