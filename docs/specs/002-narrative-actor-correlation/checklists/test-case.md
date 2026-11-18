# Test Cases 002: NAC-01..NAC-11

Fixture v3. P48 = `2026-11-15T09:00+07:00` → `2026-11-17T09:00+07:00`.

| ID     | Precondition | Steps                                                    | Expected                                                                                                                                  |
| ------ | ------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| NAC-01 | Seed v3      | `computeNarrativeClusters(items, P48)`                   | Cluster `TOP-01:AOI-01` has 10 items NC-01..NC-10; `TOP-01:unlocated` has NC-11 only; `TOP-02:AOI-02` has N-201..N-206                    |
| NAC-02 | Seed v3      | Trend buckets of `TOP-01:AOI-01`                         | [2, 8], equal to G-DEMO-11                                                                                                                |
| NAC-03 | Seed v3      | Workspace AOI-01 / TOP-01 / P48                          | `distinctAccounts` = 10 (computed from `authorAccount`), always shown; no `accountAggregateStatus` field                                  |
| NAC-04 | Seed v3      | Cluster `TOP-02:AOI-02`                                  | `totalContent` = 6, `distinctAccounts` = 4, `itemsPerAccount` = 1.5, `publishLocationCoverage` = 0                                        |
| NAC-05 | Seed v3      | Cluster `TOP-01:AOI-01`                                  | `publishLocationCoverage` = share of NC-01..NC-10 with `publishedAoiId` ≠ null, computed (NC-07 counts as missing)                        |
| NAC-06 | Seed v3      | `computeConcentration(clusters, "TOP-01")`               | AOI-01 is ranked first; the unlocated cluster is excluded from the ranking                                                                |
| NAC-07 | Seed v3      | `getActorLinks("analis", P48)`                           | Exactly `@pantau_ops_01` and `@radar_lintas` have `isCrossEvent = true`, with `aoiIds` = {AOI-01, AOI-02} and `eventIds` ⊇ {G-101, G-102} |
| NAC-08 | Seed v3      | `getAccountProfile("analis", "@pantau_ops_01", P48)`     | Items sorted by time; mentioned areas and linked events listed                                                                            |
| NAC-09 | Seed v3      | `getActorLinks("pimpinan", P48)` and `("operator", P48)` | `FORBIDDEN`                                                                                                                               |
| NAC-10 | Seed v3      | Window with `from >= to`                                 | `INVALID_WINDOW`                                                                                                                          |
| NAC-11 | Seed v3      | Scan `INITIAL_FIXTURE` and source text                   | `fixtureVersion` = 3; no `optionalAccountAggregates`; no "RAB" text in `fixtures.ts`, `types.ts` or `repository.ts`                       |

### Update 2026-11-18 — fixture v3 extended (spec §8)

Changes to rows above (rows kept as written; these notes win):

- **NAC-01:** also `TOP-01:AOI-02` = NC-12, NC-13; `TOP-02:AOI-02` = N-201..N-206; `TOP-03:AOI-03` = NL-01..NL-12.
- **NAC-06:** ranking for TOP-01 = AOI-01 (10), then AOI-02 (2).
- **NAC-07:** `@radar_lintas` `aoiIds` = {AOI-01, AOI-02, AOI-03}, `eventIds` ⊇ {G-101, G-102, G-103}; `@pantau_ops_01` `aoiIds` = {AOI-01, AOI-02}. Still exactly 2 cross-event accounts.

| ID     | Precondition | Steps                                               | Expected                                                                                                      |
| ------ | ------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| NAC-12 | Seed v3      | Cluster `TOP-03:AOI-03`                             | 12 items, 4 distinct accounts, itemsPerAccount 3.0, buckets [0, 12], coverage 0                               |
| NAC-13 | Seed v3      | `getAccountProfile("analis", "@radar_lintas", P48)` | Stops in order AOI-02 (09:40) → AOI-03 (18:00–20:00) → AOI-01 (21:30), with linked events G-102, G-103, G-101 |
| NAC-14 | Seed v3      | Data selector used by `/narasi` for TOP-01 / P48    | Returns computed clusters (no `NAR-xx` / `CORR-xx` fields); counts equal NAC-01 / NAC-03                      |

## Regression

- G-DEMO-11, G-DEMO-12, G-DEMO-13 still pass unchanged.
- G-DEMO-14 is retired (ADR-006). Its intent is covered by NAC-03 / NAC-04.

## Manual

| ID    | Check                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------- |
| M-201 | Clicking any count in the narrative panel lists exactly those items                                       |
| M-202 | Pimpinan briefing shows counts, never account handles                                                     |
| M-203 | Old v2 `localStorage` state self-heals to v3 on load                                                      |
| M-204 | No "di bawah ambang" text appears anywhere in the UI                                                      |
| M-205 | DS-2 on `/narasi`: concentration map, Aruna cluster, actors, `@radar_lintas` timeline (update 2026-11-18) |
