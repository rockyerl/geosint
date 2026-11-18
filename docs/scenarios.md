# Demo Scenarios — SUNDAWA GEOSINT PoC

_Working doc. Created 2026-11-18. This is the single source of truth for **what the demo shows**. Specs
describe how each piece is built; `scenario_review.md` records what was right or wrong before this set._

## 1. Decisions behind this set (PO, 2026-11-18)

| #   | Decision                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **Five scenarios**: the existing three, plus narrative concentration (the core use case) and a disinformation case |
| 2   | Narratives are **contrasted**: one is confirmed by physical evidence (Aruna), one is contradicted (Nila)           |
| 3   | The Sagara hotspot ends with a **false alarm**: the patrol finds controlled burning, not a threat                  |
| 4   | "Pergerakan" (movement) is shown as an **account timeline across areas**, with no new library                      |

Scenario IDs are `DS-1`..`DS-5` ("demo scenario"). `SC-` is already used for scenes.

## 2. Run order and time budget (≤ 10 minutes, offline)

| Order | Scenario                              | Proves                                               | Roles            | Time  |
| ----- | ------------------------------------- | ---------------------------------------------------- | ---------------- | ----- |
| 1     | **DS-1** Aruna flood                  | Satellite + evidence workflow                        | analis, operator | 2.5 m |
| 2     | **DS-2** Narrative concentration      | **Core use case**: accounts → area → time → actor    | analis           | 2.5 m |
| 3     | **DS-5** Disinformation at Nila       | Threat: a coordinated claim with no physical support | analis, operator | 2 m   |
| 4     | **DS-3** Sagara hotspot (false alarm) | Stale sensor + caution + honest outcome              | operator, analis | 1.5 m |
| 5     | **DS-4** Nila land change             | Graceful limits (no image pair)                      | analis           | 0.5 m |
| —     | Wrap-up: leadership view              | Briefings for DS-1, DS-3, DS-5                       | pimpinan         | 1 m   |

The operator resets the demo before each rehearsal (G-DEMO-09).

## 3. Shared setup

- **Demo clock:** 17 Nov 2026 09:00 WIB. **Window P48:** 15 Nov 09:00 → 17 Nov 09:00 (24h buckets).
- **Areas:** AOI-01 Sungai Aruna, AOI-02 Bukit Sagara, AOI-03 Dataran Nila (fictional).
- **Topics** (each claims a kind of event, which verification uses, §9):

| Topic  | Label                       | Claims event kind | Status today                               |
| ------ | --------------------------- | ----------------- | ------------------------------------------ |
| TOP-01 | Akses Aruna Terputus        | `flood`           | Exists                                     |
| TOP-02 | Kepulan Asap Bukit Sagara   | `hotspot`         | **Used by NAR-02 but never defined** → add |
| TOP-03 | Banjir Bandang Dataran Nila | `flood`           | **New** (DS-5)                             |

- **Account cast** (all fictional):

| Handle                                                                                                                                                  | Posts in                                           | Story role                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `@warga_aruna_net`, `@info_daerah_ops`, `@logistik_pantau`, `@warga_siaga`, `@netizen_pantau`, `@suara_warga_ops`, `@pantau_media`, `@analisis_terbuka` | Aruna TOP-01 (one post each)                       | Local voices, genuine reports                  |
| `@pantau_ops_01`                                                                                                                                        | Aruna TOP-01 (NC-01) → Sagara TOP-02               | Cross-event actor (2 areas)                    |
| `@radar_lintas`                                                                                                                                         | Sagara TOP-02 → Nila TOP-03 → Aruna TOP-01 (NC-05) | **Key actor, moves across 3 areas** (movement) |
| `@pengamat_langit`, `@warga_sagara`                                                                                                                     | Sagara TOP-02, and TOP-01 mentioning Sagara        | Local voices at Sagara                         |
| `@nila_waspada`, `@kabar_nila_24`, `@info_cepat_id`                                                                                                     | Nila TOP-03 (3 posts each)                         | Burst accounts in the disinformation case      |
| `@anon_user`                                                                                                                                            | NC-11, no area                                     | Unlocated post                                 |

## 4. DS-1 — Aruna flood: from imagery to briefing

**Proves:** satellite before/after, evidence import, the review rule and a versioned briefing.

| Step | Who      | Action                                                 | Expected result                                               | Covered by           |
| ---- | -------- | ------------------------------------------------------ | ------------------------------------------------------------- | -------------------- |
| 1.1  | analis   | Open the dashboard                                     | 3 areas, 3 active events, 2 pending, 1 follow-up              | G-DEMO-01            |
| 1.2  | analis   | Open G-101, compare SC-01 / SC-02                      | Both scenes, dates, flood outline; label "simulasi"           | G-DEMO-02, M-003     |
| 1.3  | analis   | Mark G-101 `follow_up_required` with E-02 + note       | Status and KPIs change; history shows who, when, evidence     | G-DEMO-04            |
| 1.4  | analis   | Try to resolve without field confirmation              | Refused: `EVIDENCE_REQUIRED`                                  | G-DEMO-05            |
| 1.5  | operator | Import B-102, then B-101 twice                         | B-102 rejected; E-06 added once; repeat reported as duplicate | G-DEMO-06 ⚠️ (§11)   |
| 1.6  | analis   | Resolve G-101 with E-06, publish briefing v1, later v2 | Resolved; both versions kept                                  | G-DEMO-07, G-DEMO-15 |

**Status:** exists. Needs the "simulasi" label on the portal card and real batch validation (§11).

## 5. DS-2 — Narrative concentration (core use case)

**Proves:** _"memetakan konsentrasi akun yang menyebarkan narasi yang sama di wilayah tertentu, lalu
mengorelasikan dengan lokasi kejadian, waktu, dan aktor."_

| Step | Who    | Action                                       | Expected result                                                                                                     | Covered by          |
| ---- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 2.1  | analis | Pick topic TOP-01, window P48                | **Concentration map:** Aruna 10 accounts / 10 posts, Sagara 2 / 2, Nila 0; NC-11 listed as "lokasi tidak diketahui" | spec 002 (NAC)      |
| 2.2  | analis | Open the Aruna cluster                       | Trend 2 → 8 per 24h; 1.0 post per account; posted-from coverage shown; every number opens its posts                 | NAC, G-DEMO-11      |
| 2.3  | analis | See correlation with incidents               | Aruna cluster **terkonfirmasi**: G-101 (flood) in the same area and window, backed by E-02 (scene) and E-03 (field) | G-DEMO-12, spec 005 |
| 2.4  | analis | See actors                                   | 2 cross-event accounts: `@pantau_ops_01` (Aruna, Sagara) and `@radar_lintas` (Aruna, Sagara, Nila)                  | spec 002 (NAC)      |
| 2.5  | analis | Open `@radar_lintas` timeline (**movement**) | Sagara (16 Nov morning) → Nila (16 Nov evening) → Aruna (16 Nov 21:30), with linked events per stop                 | spec 002 FR-206     |
| 2.6  | analis | Open the link graph                          | G-101, G-102 and G-103 subgraphs joined through the 2 accounts; "Aktor kunci" list ranks `@radar_lintas` first      | spec 003 (LNK)      |

**Status:** new. Needs specs 002, 003 and 005 and new fixture data (§10).

## 6. DS-5 — Disinformation at Nila: a claim without physical support

**Proves:** the "ancaman" side. The tool separates a coordinated claim from a real incident. It **flags
indicators; the analyst decides**. The system never labels an account as a disinformation actor.

| Step | Who      | Action                                          | Expected result                                                                                                                                                 | Covered by    |
| ---- | -------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 5.1  | analis   | Pick topic TOP-03 "Banjir Bandang Dataran Nila" | 12 posts from 4 accounts at Nila, all between 16 Nov 18:00 and 23:30                                                                                            | spec 002      |
| 5.2  | analis   | Check verification                              | **Belum terverifikasi:** no flood event at Nila in the window, and no field report yet. The latest scene (SC-03) predates the claims                            | spec 005      |
| 5.3  | analis   | See coordination indicators                     | 3.0 posts per account (Aruna: 1.0); all posts within 5.5 h; posted-from coverage 0%; 1 account also active in 2 other areas. Shown as indicators, not a verdict | spec 005, 004 |
| 5.4  | operator | Import patrol report B-104 (E-07, Nila)         | E-07 "Patroli Dataran Nila: tidak ada genangan, akses normal" added; it refutes TOP-03                                                                          | spec 005      |
| 5.5  | analis   | Re-check verification                           | Status changes to **bertentangan** (contradicted by field report)                                                                                               | spec 005      |
| 5.6  | analis   | Draft briefing (AI mock) and publish            | Draft states: claim not supported, indicators, the contradicting report; labeled "Draf AI (simulasi)"; pimpinan sees counts only, no handles                    | spec 004      |

**Status:** new. Needs spec 005 (verification + indicators), TOP-03 data and batch B-104.

## 7. DS-3 — Sagara hotspot: stale sensor, honest false alarm

**Proves:** source freshness matters, the analyst stays cautious, and the outcome can be "not a threat".

| Step | Who      | Action                                    | Expected result                                                                                                                          | Covered by               |
| ---- | -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 3.1  | operator | Open sources                              | FIRMS **delayed** (26 h old, fresh for 12 h)                                                                                             | G-DEMO-10                |
| 3.2  | analis   | Open G-102                                | `follow_up_required`; one FIRMS indicator (E-04); TOP-02 cluster: 6 posts from 4 accounts, **terkonfirmasi** (smoke matches the hotspot) | spec 002, spec 005       |
| 3.3  | operator | Import patrol report B-103 (E-08, G-102)  | E-08 `field_confirmation`: "pembakaran lahan terkendali oleh warga, tidak ada ancaman bagi area latihan"                                 | spec 001 (new G-DEMO-16) |
| 3.4  | analis   | Resolve G-102 with E-08, publish briefing | Resolved; briefing says **bukan ancaman**: the smoke was real, the threat was not                                                        | spec 001 (new G-DEMO-16) |

**Status:** start exists; the ending is new (batch B-103 / E-08).

## 8. DS-4 — Nila land change: graceful limits

| Step | Who    | Action                     | Expected result                                                  | Covered by |
| ---- | ------ | -------------------------- | ---------------------------------------------------------------- | ---------- |
| 4.1  | analis | Open the AOI-03 comparison | Single optical scene, cloud 38%; "Pasangan citra belum tersedia" | G-DEMO-03  |
| 4.2  | analis | Open G-103                 | `insufficient_evidence`, missing sources listed                  | G-DEMO-13  |

**Status:** exists.

## 9. Verification rule (used by DS-2, DS-3, DS-5)

For a cluster of topic **T** mentioning area **A** in window **W** (computed, ADR-005):

| Status                  | Code           | Rule                                                                                                                                    |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Bertentangan**        | `contradicted` | Field evidence (`field_report` / `field_confirmation`) in A within W explicitly refutes T (`refutesTopicIds` contains T). Checked first |
| **Terkonfirmasi**       | `corroborated` | An event in A, of the kind T claims, observed within W, with at least one evidence item                                                 |
| **Belum terverifikasi** | `unverified`   | Neither of the above                                                                                                                    |
| Lokasi tidak diketahui  | `unlocated`    | Cluster has no area (e.g. NC-11)                                                                                                        |

The refutation is explicit data on the evidence (a patrol report says what it rules out). The code does not
guess contradictions from text. If both corroborating and refuting evidence exist, the status is
`contradicted` and the UI says "bukti bertentangan, perlu tinjauan analis".

Expected statuses in P48:

| Cluster         | Before imports      | After DS-3 / DS-5 imports                         |
| --------------- | ------------------- | ------------------------------------------------- |
| TOP-01 / Aruna  | terkonfirmasi       | terkonfirmasi                                     |
| TOP-01 / Sagara | belum terverifikasi | belum terverifikasi                               |
| TOP-02 / Sagara | terkonfirmasi       | terkonfirmasi (threat assessed in briefing: none) |
| TOP-03 / Nila   | belum terverifikasi | **bertentangan**                                  |

## 10. Data the scenarios need (fixture v3)

| Change                                                                                                    | For        |
| --------------------------------------------------------------------------------------------------------- | ---------- |
| Define TOP-02 and TOP-03; add `claimsEventKind` to `Topic`                                                | DS-2/3/5   |
| N-201..N-206: TOP-02, AOI-02, 16 Nov 04:00–11:00, 4 accounts (§3), as real `narrativeItems`               | DS-2, DS-3 |
| 2 TOP-01 posts mentioning AOI-02 (`@pengamat_langit`, `@warga_sagara`)                                    | DS-2 map   |
| 12 TOP-03 posts mentioning AOI-03, 16 Nov 18:00–23:30, 4 accounts × 3 (incl. `@radar_lintas` 18:00–20:00) | DS-5       |
| `Evidence.refutesTopicIds?: string[]`                                                                     | §9         |
| Batch B-103: E-08 `field_confirmation`, G-102, SRC-INT, 17 Nov 08:10                                      | DS-3       |
| Batch B-104: E-07 `field_report`, G-103, SRC-INT, 17 Nov 07:30, refutes TOP-03                            | DS-5       |
| Remove hand-typed derived data (`optionalAccountAggregates`, NAR-xx numbers, CORR-xx numbers)             | ADR-005    |

Unchanged on purpose: NC-01..NC-11, the 3 areas, the 3 scenes. G-DEMO-01..13 keep passing.

## 11. Gaps found while writing these scenarios

| #   | Gap                                                                                                                                                                                              | Effect on scenarios                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1   | **Batch validation is fake:** a batch is "invalid" only when its ID is `B-102`, its `aoiId` is `AOI-99` or it has a `reason` (`repository.ts:757`). Nothing checks the area, event or source     | G-DEMO-06 passes for the wrong reason (⚠️). DS-1 step 1.5                                                     |
| 2   | A valid batch is accepted even when its `eventId` does not exist (`repository.ts:839-845`)                                                                                                       | Bad imports would silently add orphan evidence                                                                |
| 3   | Audit IDs use `Date.now()` (`repository.ts:773, 816, 867`, `1008`)                                                                                                                               | Not deterministic; harmless for the demo, noisy in tests                                                      |
| 4   | Source nodes (e.g. SRC-SAT, SRC-INT) connect areas in the link graph                                                                                                                             | Lowers account centrality; spec 003 may exclude sources from centrality                                       |
| 5   | **No screen uses the computed correlation.** `getCorrelationWorkspace` is called only by tests; event detail shows the hand-typed `NAR-xx` / `CORR-xx` data (`event-detail-analyst.tsx:302-312`) | G-DEMO-11..13 prove logic the audience never sees. DS-2 / DS-5 need the new `/narasi` route (spec 002 FR-212) |

## 12. Impact on specs (proposal, not applied yet) — **Update 2026-11-18: applied** as "Update 2026-11-18" sections in specs 001–004, new spec 005 and ADR-007. Build order: 001 → 002 → 005 → 003 → 004.

| Spec           | Change                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 baseline   | Portal shows 5 scenario cards with "simulasi" wording; real batch validation (gaps 1–2); DS-3 ending: B-103 / E-08 + new G-DEMO-16                             |
| 002 narrative  | Owns all fixture v3 narrative data (§10); NAC expectations updated (`@radar_lintas` in 3 areas; TOP-01 Sagara cluster; TOP-03 cluster)                         |
| 003 link graph | Clusters coloured by verification status; key-actor ranking excludes source nodes (gap 4); expected first key actor `@radar_lintas`                            |
| 004 AI mock    | Draft and coordination hint cover DS-5 (contradicted claim + indicators) and DS-3 ("bukan ancaman")                                                            |
| **005 new**    | **Narrative verification & coordination indicators:** §9 rule, `refutesTopicIds`, B-104 / E-07, indicators of §6 step 5.3 (facts only, no verdict on accounts) |
