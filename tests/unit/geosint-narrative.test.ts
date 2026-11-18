import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach } from "vitest";
import { GeosintRepository } from "@/features/geosint/repository";
import { INITIAL_FIXTURE } from "@/features/geosint/fixtures";
import {
  buildNarrativeClusterViews,
  computeActorLinks,
  computeConcentration,
  computeNarrativeClusters,
} from "@/features/geosint/analysis";
import type { GeoEvent, NarrativeItem, TimeWindow } from "@/features/geosint/types";

const P48: TimeWindow = INITIAL_FIXTURE.demoPreset.window;

describe("Spec 002 narrative / actor correlation (NAC-01..12, 15..18)", () => {
  let repo: GeosintRepository;

  beforeEach(() => {
    repo = new GeosintRepository(INITIAL_FIXTURE);
  });

  const clustersOfSeed = () => computeNarrativeClusters(INITIAL_FIXTURE.narrativeItems, P48);
  const aruna = () => clustersOfSeed().find((c) => c.id === "TOP-01:AOI-01");

  // NC-01..NC-10 are the items of TOP-01 that mention AOI-01 in the fixture
  const arunaFixtureItems = () =>
    INITIAL_FIXTURE.narrativeItems.filter(
      (n) =>
        n.topicId === "TOP-01" &&
        n.mentionedAoiId === "AOI-01" &&
        Date.parse(n.publishedAt) >= Date.parse(P48.from) &&
        Date.parse(n.publishedAt) < Date.parse(P48.to)
    );

  const idsOf = (clusterKey: string) =>
    [...(clustersOfSeed().find((c) => c.id === clusterKey)?.itemIds ?? [])].sort();
  const range = (prefix: string, from: number, to: number) =>
    [...Array(to - from + 1)].map((_, i) => `${prefix}${String(from + i).padStart(2, "0")}`);

  it("NAC-01: seed clusters TOP-01 into AOI-01 (NC-01..NC-10) and an unlocated cluster (NC-11)", () => {
    const clusters = clustersOfSeed();
    const arunaCluster = clusters.find((c) => c.id === "TOP-01:AOI-01");
    expect(arunaCluster).toBeDefined();
    expect([...(arunaCluster?.itemIds ?? [])].sort()).toEqual(
      [...Array(10)].map((_, i) => `NC-${String(i + 1).padStart(2, "0")}`).sort()
    );

    const unlocated = clusters.find((c) => c.id === "TOP-01:unlocated");
    expect(unlocated?.itemIds).toEqual(["NC-11"]);

    expect(idsOf("TOP-01:AOI-02")).toEqual(["NC-12", "NC-13"]);
    expect(idsOf("TOP-02:AOI-02")).toEqual(range("N-", 201, 206));
    expect(idsOf("TOP-03:AOI-03")).toEqual(range("NL-", 1, 12));
  });

  it("NAC-04: TOP-02:AOI-02 counts 6 posts from 4 accounts, 1.5 per account, no publish location", () => {
    // N-201..N-206: @warga_sagara x2, @pantau_ops_01, @pengamat_langit x2, @radar_lintas
    const cluster = clustersOfSeed().find((c) => c.id === "TOP-02:AOI-02");
    expect(cluster?.totalContent).toBe(6);
    expect(cluster?.distinctAccounts).toBe(4);
    expect(cluster?.itemsPerAccount).toBe(1.5);
    expect(cluster?.publishLocationCoverage).toBe(0);
  });

  it("NAC-02: TOP-01:AOI-01 trend buckets count 2 then 8 across the 48h window", () => {
    expect(aruna()?.trendBuckets.map((b) => b.count)).toEqual([2, 8]);
  });

  it("NAC-03: workspace reports distinct accounts computed from authorAccount, with no aggregate fields", () => {
    // Expected value derived from the fixture items, not typed by hand
    const expected = new Set(
      arunaFixtureItems()
        .map((n) => n.authorAccount)
        .filter((a): a is string => !!a)
    ).size;
    expect(expected).toBe(10); // NC-01..NC-10, 10 distinct handles

    const res = repo.getCorrelationWorkspace("analis", "AOI-01", P48, "TOP-01");
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.distinctAccounts).toBe(expected);
    expect(res.data.narrativeCluster?.id).toBe("TOP-01:AOI-01");
    expect("accountAggregateStatus" in res.data).toBe(false);
    expect("accountAggregate" in res.data).toBe(false);
  });

  it("NAC-05: publish-location coverage equals located items over total items of the cluster", () => {
    const items = arunaFixtureItems();
    const located = items.filter((n) => n.publishedAoiId !== null).length;
    expect(aruna()?.publishLocationCoverage).toBe(located / items.length);
  });

  it("NAC-06: concentration of TOP-01 ranks AOI-01 first and excludes unlocated clusters", () => {
    const ranked = computeConcentration(clustersOfSeed(), "TOP-01");
    expect(ranked[0].aoiId).toBe("AOI-01");
    expect(ranked.some((c) => c.aoiId === null)).toBe(false);
    // NC-01..NC-10 (10 handles) in AOI-01, NC-12/NC-13 (2 handles) in AOI-02
    expect(ranked.map((c) => c.aoiId)).toEqual(["AOI-01", "AOI-02"]);
    expect(ranked.map((c) => c.distinctAccounts)).toEqual([10, 2]);
  });

  it("NAC-07: only @pantau_ops_01 and @radar_lintas are cross-event, linked to their areas and events", () => {
    const res = repo.getActorLinks("analis", P48);
    expect(res.success).toBe(true);
    if (!res.success) return;
    const cross = res.actors.filter((a) => a.isCrossEvent);
    expect(cross.map((a) => a.account).sort()).toEqual(["@pantau_ops_01", "@radar_lintas"]);

    const pantau = res.actors.find((a) => a.account === "@pantau_ops_01");
    expect(pantau?.aoiIds).toEqual(["AOI-01", "AOI-02"]);
    expect(pantau?.eventIds).toEqual(expect.arrayContaining(["G-101", "G-102"]));

    const radar = res.actors.find((a) => a.account === "@radar_lintas");
    expect(radar?.aoiIds).toEqual(["AOI-01", "AOI-02", "AOI-03"]);
    expect(radar?.eventIds).toEqual(expect.arrayContaining(["G-101", "G-102", "G-103"]));
  });

  it("NAC-11: fixture is version 3 with no stored aggregates and no RAB text in source", () => {
    expect(INITIAL_FIXTURE.fixtureVersion).toBe(3);
    expect("optionalAccountAggregates" in INITIAL_FIXTURE).toBe(false);
    expect("narrativeClusters" in INITIAL_FIXTURE).toBe(false);
    for (const file of ["fixtures.ts", "types.ts", "repository.ts"]) {
      const source = readFileSync(path.join(process.cwd(), "src/features/geosint", file), "utf8");
      expect(source, file).not.toMatch(/RAB/);
    }
  });

  it("NAC-12: TOP-03:AOI-03 holds 12 posts from 4 accounts, 3 per account, all in the second bucket", () => {
    // NL-01..NL-12: @radar_lintas, @nila_waspada, @kabar_nila_24, @info_cepat_id x3 each
    const cluster = clustersOfSeed().find((c) => c.id === "TOP-03:AOI-03");
    expect(cluster?.itemIds).toHaveLength(12);
    expect(cluster?.distinctAccounts).toBe(4);
    expect(cluster?.itemsPerAccount).toBe(3);
    expect(cluster?.trendBuckets.map((b) => b.count)).toEqual([0, 12]);
    expect(cluster?.publishLocationCoverage).toBe(0);
  });

  it("NAC-18: cluster views carry computed counts, trend and items; a theme without posts is omitted", () => {
    const { narrativeThemes, narrativeItems } = INITIAL_FIXTURE;
    const views = buildNarrativeClusterViews(narrativeThemes, narrativeItems, P48);
    const computed = clustersOfSeed();

    const nar1 = views.find((v) => v.id === "NAR-01");
    const c1 = computed.find((c) => c.id === "TOP-01:AOI-01");
    expect(nar1?.totalContent).toBe(10);
    expect(nar1?.uniqueAccountsCount).toBe(10);
    expect(nar1?.volumeTrend.map((b) => b.count)).toEqual([2, 8]);
    expect(nar1?.items.map((i) => i.id).sort()).toEqual(range("NC-", 1, 10));
    expect(nar1?.totalContent).toBe(c1?.totalContent);
    expect(nar1?.uniqueAccountsCount).toBe(c1?.distinctAccounts);
    expect(nar1?.volumeTrend.map((b) => b.count)).toEqual(c1?.trendBuckets.map((b) => b.count));

    const nar2 = views.find((v) => v.id === "NAR-02");
    const c2 = computed.find((c) => c.id === "TOP-02:AOI-02");
    expect(nar2?.totalContent).toBe(6);
    expect(nar2?.uniqueAccountsCount).toBe(4);
    expect(nar2?.totalContent).toBe(c2?.totalContent);
    expect(nar2?.uniqueAccountsCount).toBe(c2?.distinctAccounts);

    const orphan = {
      id: "NAR-X",
      theme: "x",
      topicId: "TOP-99",
      sourceId: "SRC-GDELT",
      targetAoiId: "AOI-01",
    };
    const withOrphan = buildNarrativeClusterViews(
      [...narrativeThemes, orphan],
      narrativeItems,
      P48
    );
    expect(withOrphan.some((v) => v.id === "NAR-X")).toBe(false);
    expect(withOrphan.map((v) => v.id)).toEqual(views.map((v) => v.id));
  });

  it("NAC-08: account profile of @pantau_ops_01 is time-ordered and links AOI-01 and G-101", () => {
    const res = repo.getAccountProfile("analis", "@pantau_ops_01", P48);
    expect(res.success).toBe(true);
    if (!res.success) return;
    const times = res.profile.items.map((i) => Date.parse(i.publishedAt));
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(res.profile.items.some((i) => i.id === "NC-01")).toBe(true);
    expect(res.profile.aoiIds).toContain("AOI-01");
    expect(res.profile.eventIds).toContain("G-101");
  });

  it("NAC-09: getActorLinks and getAccountProfile return FORBIDDEN for pimpinan and operator", () => {
    for (const role of ["pimpinan", "operator"] as const) {
      const links = repo.getActorLinks(role, P48);
      expect(links.success).toBe(false);
      if (!links.success) expect(links.code).toBe("FORBIDDEN");

      const profile = repo.getAccountProfile(role, "@pantau_ops_01", P48);
      expect(profile.success).toBe(false);
      if (!profile.success) expect(profile.code).toBe("FORBIDDEN");
    }
  });

  it("NAC-10: equal and reversed windows give INVALID_WINDOW for actor links, profile and workspace", () => {
    const windows: TimeWindow[] = [
      { from: P48.from, to: P48.from },
      { from: P48.to, to: P48.from },
    ];
    for (const w of windows) {
      const links = repo.getActorLinks("analis", w);
      expect(links.success).toBe(false);
      if (!links.success) expect(links.code).toBe("INVALID_WINDOW");

      const profile = repo.getAccountProfile("analis", "@pantau_ops_01", w);
      expect(profile.success).toBe(false);
      if (!profile.success) expect(profile.code).toBe("INVALID_WINDOW");

      const workspace = repo.getCorrelationWorkspace("analis", "AOI-01", w, "TOP-01");
      expect(workspace.success).toBe(false);
      if (!workspace.success) expect(workspace.code).toBe("INVALID_WINDOW");
    }
  });

  // Inline data for NAC-15/16: dates are inside or outside this window
  const W: TimeWindow = { from: "2026-11-17T00:00:00Z", to: "2026-11-19T00:00:00Z" };
  const IN = "2026-11-17T12:00:00Z";
  const OUT = "2026-11-25T12:00:00Z";

  const item = (
    id: string,
    topicId: string,
    mentionedAoiId: string | null,
    authorAccount: string | undefined,
    publishedAt = IN
  ): NarrativeItem => ({
    id,
    sourceId: "SRC-GDELT",
    title: `Uji ${id}`,
    topicId,
    publishedAt,
    mentionedAoiId,
    publishedAoiId: null,
    authorAccount,
  });

  const event = (id: string, aoiId: string, observedAt = IN): GeoEvent => ({
    id,
    aoiId,
    kind: "flood",
    title: `Kejadian ${id}`,
    observedAt,
    status: "pending_review",
    point: [0, 0],
    evidenceIds: [],
  });

  it("NAC-15: actor links flag cross-event accounts, ignore out-of-window and accountless items, sort by account", () => {
    const items = [
      item("T-01", "TOP-X", "AOI-Z", "@c_akun"), // 1 area, 1 event
      item("T-02", "TOP-X", "AOI-X", "@b_akun"),
      item("T-03", "TOP-X", "AOI-X", "@a_akun"),
      item("T-04", "TOP-X", "AOI-Y", "@a_akun"),
      item("T-05", "TOP-X", "AOI-Z", "@d_akun", OUT), // outside the window
      item("T-06", "TOP-X", "AOI-Z", undefined), // no account
    ];
    const events = [
      event("EV-X1", "AOI-X"),
      event("EV-X2", "AOI-X"),
      event("EV-Y1", "AOI-Y"),
      event("EV-Z1", "AOI-Z"),
    ];
    const links = computeActorLinks(items, events, W);

    expect(links.map((l) => l.account)).toEqual(["@a_akun", "@b_akun", "@c_akun"]);
    const byAccount = Object.fromEntries(links.map((l) => [l.account, l]));
    expect(byAccount["@a_akun"].aoiIds).toEqual(["AOI-X", "AOI-Y"]);
    expect(byAccount["@a_akun"].isCrossEvent).toBe(true); // 2 areas
    expect(byAccount["@b_akun"].eventIds).toEqual(["EV-X1", "EV-X2"]);
    expect(byAccount["@b_akun"].isCrossEvent).toBe(true); // 1 area, 2 events
    expect(byAccount["@c_akun"].eventIds).toEqual(["EV-Z1"]);
    expect(byAccount["@c_akun"].isCrossEvent).toBe(false); // 1 area, 1 event
    expect(links.some((l) => l.account === "@d_akun")).toBe(false);
    expect(links.flatMap((l) => l.itemIds)).not.toContain("T-06");
  });

  it("NAC-16: concentration ties break by content then aoiId, and clustering is order-independent", () => {
    const items = [
      item("K-01", "TOP-T", "AOI-B", "@p1"),
      item("K-02", "TOP-T", "AOI-B", "@p2"),
      item("K-03", "TOP-T", "AOI-C", "@p3"),
      item("K-04", "TOP-T", "AOI-C", "@p4"),
      item("K-05", "TOP-T", "AOI-A", "@p5"),
      item("K-06", "TOP-T", "AOI-A", "@p6"),
      item("K-07", "TOP-T", "AOI-D", "@p7"),
      item("K-08", "TOP-T", "AOI-D", "@p8"),
      item("K-09", "TOP-T", "AOI-D", "@p8"), // AOI-D: 2 accounts, 3 items
      item("K-10", "TOP-T", null, "@p9"), // unlocated, never ranked
    ];
    const clusters = computeNarrativeClusters(items, W);
    const ranked = computeConcentration(clusters, "TOP-T");
    // All 2 accounts; AOI-D has more content; then AOI-A < AOI-B < AOI-C
    expect(ranked.map((c) => c.aoiId)).toEqual(["AOI-D", "AOI-A", "AOI-B", "AOI-C"]);

    const reversed = computeNarrativeClusters([...items].reverse(), W);
    expect(reversed).toEqual(clusters);
  });

  it("NAC-17: account profile for an unknown account returns NOT_FOUND", () => {
    const res = repo.getAccountProfile("analis", "@tidak_ada", P48);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.code).toBe("NOT_FOUND");
  });
});
