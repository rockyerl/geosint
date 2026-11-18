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

### Update 2026-11-19 — tests written with T201–T204

- Written now on the v2 seed: NAC-01 (TOP-01 part), NAC-02, NAC-03, NAC-05, NAC-06, NAC-08, NAC-09, NAC-10.
- NAC-10 also covers `getCorrelationWorkspace`.
- NAC-15 (inline items): `computeActorLinks` flags cross-event accounts, ignores out-of-window and handle-less items, and sorts by account.
- NAC-16 (inline): `computeConcentration` breaks ties by content then `aoiId`, and `computeNarrativeClusters` is order-independent.
- NAC-17: `getAccountProfile` for an unknown account returns `NOT_FOUND`.

### Update 2026-11-19 (b) — fixture v3 tests

- Now written on the v3 seed: NAC-01 (full), NAC-04, NAC-06 (full), NAC-07, NAC-11, NAC-12.
- NAC-18 (adapter): `buildNarrativeClusterViews` gives NAR-01 10 posts / 10 accounts / [2, 8] and NAR-02 6 / 4, all equal to the computed clusters; a theme without items is omitted.

### Update 2026-11-19 (c) — movement stops (T216)

- NAC-13 written: `profile.stops` for `@radar_lintas` on the v3 seed (AOI-02 N-205 → AOI-03 NL-01/04/06 → AOI-01 NC-05, events G-102, G-103, G-101), plus an inline `computeAccountStops` test (a return visit is a new stop, posts without an area are skipped, out-of-window events are not linked).

### Update 2026-11-19 (d) — `/narasi` (T217)

- NAC-14 runs on `getNarrativeWorkspace`: FORBIDDEN, NOT_FOUND, INVALID_WINDOW, presets, determinism.
- M-205 (manual, as analis):
  1. TOP-01 / 48 jam shows Aruna "10 akun · 10 unggahan", Sagara "2 akun · 2 unggahan", Nila "0 akun"; "Lokasi tidak diketahui" lists NC-11.
  2. The Aruna cluster shows trend 2 / 8, 1.0 per account, coverage %, and 10 posts.
  3. Cross-event actors are `@pantau_ops_01` and `@radar_lintas`.
  4. "Lihat pergerakan" on `@radar_lintas` shows Bukit Sagara 16 Nov 09:40 (G-102) → Dataran Nila 18:00–20:00 (G-103) → Sektor Sungai Aruna 21:30 (G-101).
  5. Switching to TOP-03 shows Nila 4 accounts / 12 posts; `?window=7d` survives a reload.
  6. As pimpinan the nav item is hidden; switching role to pimpinan on `/narasi` goes to `/dashboard`; breadcrumb reads "Konsentrasi Narasi & Aktor".

### Update 2026-11-19 (e) — computed event correlation (T218)

| ID     | Case                                                                                                                                                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NAC-19 | G-101 on the seed: one correlation, TOP-01, `candidate`, scene `["E-02"]`, field `["E-03"]`, 10 posts, 10 accounts, no missing source; located count computed from fixture items; rationale has "10 konten topik TOP-01 menyebut AOI-01, dari 10 akun unik."             |
| NAC-20 | G-102 on the seed: topics `["TOP-02", "TOP-01"]`; TOP-02 6 posts, 4 accounts, 0 located, `insufficient_evidence`, missing SRC-SAT and SRC-INT. After the B-103 import: field `["E-08"]`, only SRC-SAT missing. `getCorrelationWorkspace` G-102 also misses only SRC-SAT (D4) |
| NAC-21 | G-103: `["TOP-03"]`, 12 posts, 4 accounts, scene `["E-05"]`, missing SRC-INT only. A window ending before G-103 gives `[]`. Deterministic for reversed inputs                                                                                                              |
| NAC-22 | Analyst `eventCorrelations` equals `computeEventCorrelations`, no `multiSourceCorrelations` key. Pimpinan entries carry no evidence or post ids and no handles. `INITIAL_FIXTURE` has no `correlations`; `fixtures.ts` has no `CORR-`                                       |
| NAC-23 | `getAreaCorrelations`: analis AOI-02 gives G-102/TOP-02 then G-102/TOP-01 without `narrativeItemIds`; pimpinan AOI-01 succeeds; operator `FORBIDDEN`; AOI-99 `NOT_FOUND`                                                                                                  |

- Note (fix round): NAC-22 also covers pimpinan G-101 and `getAreaCorrelations` (no `E-` ids even in the rationale; summaries show counts such as "1 citra dalam periode."). NAC-21 adds a two-element (E-03, E-06) order-independence case.

- M-206 (manual):
  1. As analis, G-101 shows `KANDIDAT KORELASI`, E-02 / E-03 pillars and "10 konten · 10 akun unik". "Buka di Konsentrasi Narasi" opens `/narasi?topic=TOP-01&window=48h`.
  2. G-102 shows tabs TOP-02 / TOP-01 and `BUKTI BELUM LENGKAP`, missing SRC-SAT and SRC-INT. After importing B-103 as operator, only SRC-SAT is missing and the field pillar shows E-08.
  3. As pimpinan, G-102 shows counts and "Korelasi belum lengkap", with no "RAB" text and no handles.
  4. The dashboard and the tactical map show the computed rationale with no "CORR-" ids.

### Update 2026-11-19 (f) — T209 / T212

| ID     | Case                                                                                                                                                                                                                                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NAC-24 | Drill-down on `buildNarrativeClusterViews`: NAR-01 bucket `itemIds` lengths equal `count` (2, 8) and concatenate to `items`; `accounts` is sorted, length 10 = `uniqueAccountsCount`. NAR-02 `accounts` groups N-201..N-206 per handle. `selectClusterItems`: `all`, `bucket`, `account`; unknown account or bucket 9 gives `[]`; deterministic.                  |
| NAC-25 | `computeBriefingNarrativeTotals`: G-101 `[TOP-01, 10, 10, 2]`; G-102 `[TOP-02, 6, 4, 2]`, `[TOP-01, 2, 2, 0]`; G-103 `[TOP-03, 12, 4, 1]`; same result for reversed items; `formatBriefingNarrativeTotal` gives "Akses Aruna Terputus: 10 konten · 10 akun unik · 2 aktor lintas kejadian".                                                                       |
| NAC-26 | `publishBriefing` snapshot for G-101 carries `narrativeTotals` equal to NAC-25, has no `narrativeItemIds` key; pimpinan `latestApprovedBriefing` JSON has no `@` and no `NC-`; pimpinan `publishBriefing` is `FORBIDDEN`.                                                                                                                                         |

- M-201 (manual, as analis): clicking VOLUME KONTEN, a trend bucket or an account chip lists exactly those posts; the correlation matrix count expands its posts.
- M-202 (manual, as pimpinan): the briefing and event detail show "… konten · … akun unik · … aktor lintas kejadian" and no `@`.
- M-204 (manual): no "Ambang" / "RAB" text on the event detail, dashboard or map.
