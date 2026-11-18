export type Role = "pimpinan" | "analis" | "operator";

export type EventStatus = "pending_review" | "follow_up_required" | "resolved";

export type EventKind = "flood" | "hotspot" | "land_change";

export type SourceKind = "radar" | "optical" | "hotspot" | "metadata" | "internal";

export type EvidenceKind = "scene" | "indicator" | "field_report" | "field_confirmation";

export type AuditAction = "review" | "publish_brief" | "import_batch" | "reset";

export type SourceFreshness = "ready" | "delayed" | "unavailable";

export type Point = [number, number];

export interface Area {
  id: string;
  name: string;
  areaKm2: number;
  outline: Point[];
}

export interface Source {
  id: string;
  label: string;
  kinds: SourceKind[];
  lastSuccessfulImportAt: string | null;
  freshForHours: number;
}

export interface Scene {
  id: string;
  aoiId: string;
  sourceId: string;
  sensor: string;
  capturedAt: string;
  cloudPercent: number | null;
  assetPath: string;
}

export interface GeoEvent {
  id: string;
  aoiId: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  evidenceIds: string[];
}

export interface Evidence {
  id: string;
  eventId: string;
  sourceId: string;
  kind: EvidenceKind;
  observedAt: string;
  label: string;
  sceneId?: string;
}

export interface TimeWindow {
  from: string;
  to: string;
}

export interface Topic {
  id: string;
  label: string;
  claimsEventKind: EventKind; // spec 002 FR-215; used by spec 005 verification
}

export interface NarrativeItem {
  id: string;
  sourceId: string;
  title: string;
  topicId: string;
  publishedAt: string;
  mentionedAoiId: string | null;
  publishedAoiId: string | null;
  // UI helper fields
  headline?: string;
  snippet?: string;
  sourceChannel?: string;
  mentionedLocation?: string;
  authorLocation?: string | null;
  authorAccount?: string;
}

export interface CorrelationFinding {
  eventId: string;
  aoiId: string;
  window: TimeWindow;
  topicId: string;
  basis: "same_area_and_time";
  status: "candidate" | "insufficient_evidence";
  evidenceIds: string[];
  narrativeItemIds: string[];
  missingSources: string[];
}

/** Same-area-and-time correlation of one event with one topic; every field computed (spec 002 T218, ADR-005). */
export interface EventCorrelation {
  eventId: string;
  aoiId: string;
  topicId: string;
  window: TimeWindow;
  status: CorrelationFinding["status"];
  /** Linked scene evidence whose scene is in the event's area and captured in the window. */
  sceneEvidenceIds: string[];
  /** Linked field_report or field_confirmation evidence (D4). */
  fieldEvidenceIds: string[];
  /** Topic posts mentioning the area in the window, time order. */
  narrativeItemIds: string[];
  totalContent: number;
  distinctAccounts: number;
  /** Posts with a posted-from area (publishedAoiId !== null); coverage only, never changes status (Q10). */
  locatedContent: number;
  missingSources: string[];
  /** Computed fact sentences (Indonesian). */
  rationale: string[];
}

/** EventCorrelation for pimpinan, dashboard and map: counts only, no evidence or post ids (not even in rationale). */
export type CorrelationSummary = Omit<
  EventCorrelation,
  "sceneEvidenceIds" | "fieldEvidenceIds" | "narrativeItemIds"
>;

export interface Review {
  id: string;
  eventId: string;
  actorId: string;
  note: string;
  evidenceIds: string[];
  toStatus: EventStatus;
  createdAt: string;
}

/** Narrative totals frozen into a briefing for one correlated topic: counts only, no handles or post ids (spec 002 US-5, D5). */
export interface BriefingNarrativeTotal {
  topicId: string;
  totalContent: number;
  distinctAccounts: number;
  /** Accounts in this topic's posts that are cross-event (ActorLink.isCrossEvent) in the window. */
  crossEventActors: number;
}

export interface BriefingSnapshot {
  title: string;
  status: EventStatus;
  observedAt: string;
  findings: string;
  limitations: string;
  nextAction: string;
  evidenceIds: string[];
  aoiId?: string;
  window?: TimeWindow;
  topicId?: string;
  narrativeTotals?: BriefingNarrativeTotal[]; // one per event correlation, in that order; absent on briefings published before 2026-11-19
}

export interface Briefing {
  id: string;
  eventId: string;
  version: number;
  approvedBy: string;
  approvedAt: string;
  snapshot: BriefingSnapshot;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  role: Role;
  action: AuditAction;
  targetId: string;
  details: string;
  success: boolean;
}

export interface BatchLog {
  batchId: string;
  timestamp: string;
  status: "success" | "duplicate" | "failed";
  itemCount: number;
  acceptedCount: number;
  duplicateCount: number;
  failedCount: number;
  reason?: string;
}

/** Batch import payload (operator). Validated by GeosintRepository.simulateImport. */
export interface ImportDraft {
  batchId: string;
  aoiId?: string;
  evidence?: Evidence;
}

/** A demo batch that carries one evidence item. */
export interface EvidenceImport {
  batchId: string;
  evidence: Evidence;
}

export interface DemoActions {
  arunaFloodOutline: Point[];
  validImport: EvidenceImport;
  sagaraImport: EvidenceImport;
  invalidImport: ImportDraft;
}

export interface NarrativeTrendPoint {
  time: string;
  count: number;
  itemIds: string[]; // posts in this 24h bucket, time order; length === count
}

/** Text-only narrative theme; every number for it is computed from items (ADR-005, spec 002 T206). */
export interface NarrativeTheme {
  id: string;
  theme: string;
  topicId: string;
  sourceId: string;
  targetAoiId: string;
}

/** Posts of one account inside a cluster view (analyst drill-down, spec 002 FR-211). */
export interface NarrativeAccountItems {
  account: string;
  itemIds: string[]; // time order
}

/** Which posts of a cluster view the panel lists (spec 002 FR-211, M-201). */
export type NarrativeItemFilter =
  | { kind: "all" }
  | { kind: "bucket"; index: number }
  | { kind: "account"; account: string };

/** Screen view of a theme, built by buildNarrativeClusterViews (analysis.ts) from computed clusters. */
export interface NarrativeCluster {
  id: string;
  theme: string;
  sourceId: string;
  targetAoiId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  totalContent: number;
  uniqueAccountsCount: number;
  accounts: NarrativeAccountItems[]; // sorted by account; length === uniqueAccountsCount
  hasSufficientGeoMetadata: boolean;
  volumeTrend: NarrativeTrendPoint[];
  items: NarrativeItem[];
}

export interface CorrelationTrendBucket {
  bucketIndex: number;
  from: string;
  to: string;
  count: number;
  label: string;
}

/** Narrative cluster computed from raw items: one per (topicId, mentionedAoiId) in a window (spec 002 FR-202). */
export interface ComputedCluster {
  id: string; // `${topicId}:${aoiId}` or `${topicId}:unlocated`
  topicId: string;
  aoiId: string | null;
  itemIds: string[]; // time order
  totalContent: number;
  distinctAccounts: number;
  itemsPerAccount: number;
  firstObservedAt: string;
  lastObservedAt: string;
  trendBuckets: CorrelationTrendBucket[];
  publishLocationCoverage: number; // 0..1, share of items with publishedAoiId
}

/** One social account and what it links in a window (spec 002 FR-205). */
export interface ActorLink {
  account: string;
  itemIds: string[]; // time order
  aoiIds: string[]; // sorted, mentioned areas only
  topicIds: string[]; // sorted
  eventIds: string[]; // sorted; events in a mentioned area, observed in the window
  isCrossEvent: boolean; // >= 2 areas or >= 2 events
}

/** One stay of an account in an area: consecutive posts mentioning the same area (spec 002 FR-214). */
export interface AccountStop {
  aoiId: string;
  firstPostAt: string;
  lastPostAt: string;
  itemIds: string[]; // time order
  eventIds: string[]; // sorted; events in this area, observed in the window
}

/** Timeline of one account (spec 002 FR-206, FR-214). */
export interface AccountProfile extends ActorLink {
  items: NarrativeItem[]; // time order
  stops: AccountStop[]; // time order
}

/** One area's share of a topic in a window (spec 002 FR-213); every area appears, 0 when silent. */
export interface AreaConcentration {
  aoiId: string;
  distinctAccounts: number;
  totalContent: number;
  /** 1-based rank from computeConcentration; null when the area has no posts. */
  rank: number | null;
}

/** Data behind the /narasi route (spec 002 FR-212..214, NAC-14). All numbers are computed. */
export interface NarrativeWorkspaceData {
  topic: Topic;
  window: TimeWindow;
  /** Located clusters of the topic, ranked (computeConcentration order). */
  clusters: ComputedCluster[];
  /** Every area in state order. */
  areas: AreaConcentration[];
  /** The topic's unlocated cluster, or null. */
  unlocated: ComputedCluster | null;
  /** Cross-event accounts in the window, all topics, sorted by account. */
  crossEventActors: ActorLink[];
}

export interface CorrelationWorkspaceData {
  aoi: Area;
  window: TimeWindow;
  topic: Topic | null;
  eventsInPeriod: GeoEvent[];
  scenesInPeriod: Scene[];
  historicalReferenceScenes: Scene[];
  sources: Source[];
  narrativeTrendBuckets: CorrelationTrendBucket[];
  narrativeItemsInWindow: NarrativeItem[];
  unlocatedNarrativeItems: NarrativeItem[];
  candidateCorrelations: CorrelationFinding[];
  /** Computed cluster for the selected topic + area in the window (spec 002 FR-201/202); null when no item. */
  narrativeCluster: ComputedCluster | null;
  /** Computed distinct authorAccount count for that cluster; 0 when none (FR-204, ADR-006: no threshold). */
  distinctAccounts: number;
}

export interface DemoPreset {
  aoiId: string;
  topicId: string;
  window: TimeWindow;
}

export interface DemoState {
  fixtureVersion: number;
  demoNow: string;
  areas: Area[];
  sources: Source[];
  scenes: Scene[];
  events: GeoEvent[];
  evidence: Evidence[];
  topics: Topic[];
  narrativeItems: NarrativeItem[];
  demoPreset: DemoPreset;
  narrativeThemes: NarrativeTheme[];
  demoActions: DemoActions;
  reviews: Review[];
  briefings: Briefing[];
  audits: AuditEntry[];
  batchLogs: BatchLog[];
  processedBatchIds: string[];
}

export interface EventFilter {
  aoiId?: string;
  kind?: EventKind | "all";
  status?: EventStatus | "all";
  from?: string;
  to?: string;
  search?: string;
  timeWindowHours?: number; // Filter rentang waktu bersama (e.g. 48 jam)
}

export interface EventSummaryProjection {
  id: string;
  aoiId: string;
  areaName: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  evidenceCount: number;
  latestApprovedBriefing?: Briefing;
  hasCorrelatedNarrative?: boolean;
}

export interface PimpinanEventDetail {
  id: string;
  aoiId: string;
  areaName: string;
  kind: EventKind;
  title: string;
  observedAt: string;
  status: EventStatus;
  point: Point;
  area: Area;
  latestApprovedBriefing?: Briefing;
  isBriefingStale: boolean;
  briefingsCount: number;
  correlations: CorrelationSummary[];
  narrativeSummary?: string;
}

export interface AnalystEventDetail {
  event: GeoEvent;
  area: Area;
  evidence: Evidence[];
  scenes: Scene[];
  reviews: Review[];
  briefings: Briefing[];
  latestApprovedBriefing?: Briefing;
  isBriefingStale: boolean;
  correlations: Evidence[];
  eventCorrelations: EventCorrelation[];
  narrativeClusters: NarrativeCluster[];
  draftSummary: { findings: string; limitations: string; nextAction: string };
  /** True while the event is unresolved and has no linked field_confirmation (resolve rule, FIX-010). */
  missingFieldConfirmation: boolean;
}
