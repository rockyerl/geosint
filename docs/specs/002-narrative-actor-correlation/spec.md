# Spec 002: Narrative Cluster, Account Concentration & Actor Correlation

- **Status:** Ready (decisions Q8–Q11 recorded 2026-11-18)
- **Date:** 2026-11-18
- **Related:** ADR-002, ADR-005, ADR-006, spec 001 (retires G-DEMO-14)

## 1. Why

The PoC's reference use case: _"map the concentration of accounts that spread the same narrative in a region, then correlate with incident location, time and actor."_

Today clusters and account counts are typed into fixtures, and the typed values contradict the items (3 vs 10 accounts). A misread budget figure ("RAB 10 akun", which is really on-premise capacity, ADR-006) hides small counts. Nothing links an account to more than one event. This spec makes the chain **computed and traceable**.

## 2. Decisions

| #   | Decision                                                                                                                                                                                | Source      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| D1  | "Actor" = social account (`authorAccount`). People or groups named in content are out of scope                                                                                          | Q9          |
| D2  | Items are grouped by the area **mentioned** (`mentionedAoiId`). The area **posted from** (`publishedAoiId`) is shown as coverage only. Items with no mentioned area → "unlocated" group | Q10         |
| D3  | **No fixed account threshold.** Counts are always computed and shown to `analis`                                                                                                        | Q8, ADR-006 |
| D4  | Window presets 24h / 48h / 7d, default 48h                                                                                                                                              | Q11         |
| D5  | `pimpinan` sees counts only, never handles                                                                                                                                              | Q15         |

## 3. User stories

- **US-1 (analis):** For a topic and window, I see the narrative clusters **computed** from items, one per mentioned area: total content, distinct accounts, items per account, 24h trend, and posted-from coverage. Every number opens the list of items behind it.
- **US-2 (analis):** I see **concentration**: areas **ranked** by distinct accounts for the same topic and window. This shows where the narrative is spread by the most accounts.
- **US-3 (analis):** I see **cross-event actors**: accounts whose items mention ≥ 2 different areas, or link to ≥ 2 events, within the window.
- **US-4 (analis):** For one account, I see its timeline: items, mentioned areas, and correlated events.
- **US-5 (pimpinan):** The briefing gives cluster size, distinct-account count and the number of cross-event actors as **totals only** (no handles).

## 4. Functional requirements

| ID     | Requirement                                                                                                                                                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-201 | `computeNarrativeClusters(items, window)` groups items by (`topicId`, `mentionedAoiId`) within `[from,to)`. Items with `mentionedAoiId = null` form an "unlocated" group per topic.                                                                                                                           |
| FR-202 | Each cluster exposes `id` (`topicId:aoiId\|unlocated`), `topicId`, `aoiId \| null`, `itemIds`, `totalContent`, `distinctAccounts`, `itemsPerAccount`, `firstObservedAt`, `lastObservedAt`, `trendBuckets` (24h) and `publishLocationCoverage` (0–1).                                                          |
| FR-203 | `computeConcentration(clusters, topicId)` ranks the located clusters of a topic by `distinctAccounts` (desc), with ties broken by `totalContent` and then `aoiId`.                                                                                                                                            |
| FR-204 | `getCorrelationWorkspace` reports the computed `distinctAccounts` for the selected area. `accountAggregateStatus`, `optionalAccountAggregates` and the "RAB" constant are removed (ADR-006).                                                                                                                  |
| FR-205 | `getActorLinks(role, window)` returns, per account: `itemIds`, `aoiIds`, `topicIds`, `eventIds` (events in a mentioned area within the window), and `isCrossEvent` (≥ 2 areas or ≥ 2 events).                                                                                                                 |
| FR-206 | `getAccountProfile(role, account, window)` returns that account's timeline.                                                                                                                                                                                                                                   |
| FR-207 | Only `analis` may call FR-205 / FR-206 (`FORBIDDEN` otherwise). `pimpinan` gets totals only, through the briefing snapshot.                                                                                                                                                                                   |
| FR-208 | Static `narrativeClusters` / `correlations` / `optionalAccountAggregates` are removed from fixtures, or reduced to text with no numbers. Every "ambang RAB" comment is removed. `fixtureVersion` → 3.                                                                                                         |
| FR-209 | Extend the fixture with **raw items**: Sagara/TOP-02 gets N-201..N-206 (6 items, 4 accounts). **2 of those accounts** also posted in Aruna/TOP-01, so they are cross-event actors. NC-01..NC-11 stay unchanged. **Update 2026-11-18:** full fixture v3 data in §8 (adds TOP-01 at Sagara and TOP-03 at Nila). |
| FR-210 | CORR-02-style insufficiency is explained only by missing evidence or location (e.g. Sagara items have no posted-from location; G-102 has no field report), never by account count.                                                                                                                            |
| FR-211 | UI (narrative panel, correlation matrix, event detail) reads computed data. The UI rule that hides counts under 10 is removed. Every count opens its items.                                                                                                                                                   |

## 5. Non-functional

- Pure functions in `src/features/geosint/analysis.ts`; no network; deterministic.
- Synthetic, fictional handles only (AI-03).
- Simple loops are acceptable at PoC scale (fewer than 1,000 items).

## 6. Out of scope

- Coordinated-behaviour scoring (account age, posting cadence). Spec 004 adds only a rule-based _hint_.
- NLP topic detection. Topics stay pre-labeled.
- Real social or GDELT ingestion.
- Any minimum-significance rule (ADR-006). It would need a new decision.

## 7. Acceptance

- NAC-01..NAC-11 pass. G-DEMO-11/12/13 still pass. G-DEMO-14 is retired.
- No derived number or "RAB" reference remains in `fixtures.ts`, `types.ts` or `repository.ts`.
- Demo shows:
  - Aruna ranks first for TOP-01 (10 accounts) → G-101 is correlated.
  - Sagara has 4 accounts, with no posted-from location.
  - 2 cross-event actors link the two areas.

## 8. Update 2026-11-18 — demo scenario set (`docs/scenarios.md`)

This spec owns **DS-2** (narrative concentration, including movement) and **all fixture v3 narrative data**
used by DS-2, DS-3 and DS-5. Spec 005 adds the verification rule on top.

### 8.1 New requirements

| ID     | Requirement                                                                                                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-212 | **Narrative workspace route `/narasi`** (analyst only, `?topic=` and `?window=` params). Today no screen calls `getCorrelationWorkspace`: event detail shows the hand-typed `NAR-xx` / `CORR-xx` data. DS-2 and DS-5 run on this route. |
| FR-213 | **Concentration map**: for the chosen topic and window, the map colours each area by distinct accounts (from `computeConcentration`), and lists unlocated posts separately.                                                             |
| FR-214 | **Movement**: `getAccountProfile` returns stops in time order (`aoiId`, first and last post time, `itemIds`, linked `eventIds`); the UI shows them as a timeline (DS-2 step 2.5).                                                       |
| FR-215 | Topics carry `claimsEventKind` (used by spec 005): TOP-01 `flood`, TOP-02 `hotspot`, TOP-03 `flood`.                                                                                                                                    |

### 8.2 Fixture v3 data

Defaults for every new item: `sourceId: "SRC-GDELT"`, `publishedAoiId: null`, `authorLocation: null`.
All times are `2026-11-16`, `+07:00`.

**Topics:** TOP-01 "Akses Aruna Terputus" (exists, add `claimsEventKind`), TOP-02 "Kepulan Asap Bukit
Sagara", TOP-03 "Banjir Bandang Dataran Nila".

**TOP-02, mentioning AOI-02** (replaces the hand-written NAR-02 / N-201):

| ID    | Time  | Account            | Title                                    |
| ----- | ----- | ------------------ | ---------------------------------------- |
| N-201 | 04:00 | `@warga_sagara`    | Bau asap di perbukitan timur sejak subuh |
| N-202 | 05:20 | `@pantau_ops_01`   | Kepulan asap terlihat dari jalur Sagara  |
| N-203 | 06:10 | `@pengamat_langit` | Asap makin tebal di lereng Sagara        |
| N-204 | 08:30 | `@pengamat_langit` | Terlihat asap tebal di arah lereng bukit |
| N-205 | 09:40 | `@radar_lintas`    | Kabar asap di Bukit Sagara menyebar      |
| N-206 | 11:00 | `@warga_sagara`    | Asap mulai berkurang siang ini           |

**TOP-01, mentioning AOI-02** (makes the concentration map show more than one area):

| ID    | Time  | Account            | Title                                             |
| ----- | ----- | ------------------ | ------------------------------------------------- |
| NC-12 | 14:00 | `@pengamat_langit` | Akses jalan ke Sagara ikut terganggu?             |
| NC-13 | 15:30 | `@warga_sagara`    | Warga Sagara menanyakan akses setelah kabar Aruna |

**TOP-03, mentioning AOI-03** (DS-5; 4 accounts × 3 posts, 18:00–23:30):

| ID    | Time  | Account          | Title                                           |
| ----- | ----- | ---------------- | ----------------------------------------------- |
| NL-01 | 18:00 | `@radar_lintas`  | Banjir bandang landa Dataran Nila               |
| NL-02 | 18:20 | `@nila_waspada`  | Banjir bandang di Nila, warga diminta mengungsi |
| NL-03 | 18:45 | `@kabar_nila_24` | Dataran Nila terendam banjir bandang            |
| NL-04 | 19:00 | `@radar_lintas`  | Akses Dataran Nila putus total akibat banjir    |
| NL-05 | 19:30 | `@info_cepat_id` | Banjir bandang Nila, hindari jalur selatan      |
| NL-06 | 20:00 | `@radar_lintas`  | Ketinggian air di Nila terus naik               |
| NL-07 | 20:40 | `@nila_waspada`  | Warga Nila mengungsi malam ini                  |
| NL-08 | 21:15 | `@kabar_nila_24` | Banjir bandang Nila belum surut                 |
| NL-09 | 21:50 | `@info_cepat_id` | Jembatan Nila dikabarkan hanyut                 |
| NL-10 | 22:10 | `@nila_waspada`  | Bantuan diminta untuk korban banjir Nila        |
| NL-11 | 23:00 | `@kabar_nila_24` | Situasi Nila makin parah                        |
| NL-12 | 23:30 | `@info_cepat_id` | Banjir bandang Nila jadi perhatian              |

`@radar_lintas` movement: Sagara 09:40 → Nila 18:00–20:00 → Aruna 21:30 (NC-05).

### 8.3 Changed expectations (append to NAC rows; see `checklists/test-case.md` update)

- Cross-event accounts stay exactly 2: `@pantau_ops_01` {AOI-01, AOI-02}, `@radar_lintas` {AOI-01, AOI-02, AOI-03}.
- TOP-01 concentration: AOI-01 10 accounts, AOI-02 2 accounts.
- New: NAC-12 (TOP-03 cluster), NAC-13 (movement), NAC-14 (`/narasi` uses computed data, manual + unit on the selector it calls).
