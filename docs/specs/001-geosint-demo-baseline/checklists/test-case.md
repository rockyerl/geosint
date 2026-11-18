# Test Cases 001: G-DEMO-01..15

Source: `tests/unit/geosint.test.ts`. Fixture: `INITIAL_FIXTURE`, demo clock `2026-11-17T09:00+07:00`.
Window preset P48 = `2026-11-15T09:00+07:00` → `2026-11-17T09:00+07:00`.

| ID        | Precondition          | Steps                                                     | Expected                                                                                                                   | Status                                                                                                                                                                                   |
| --------- | --------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-DEMO-01 | Seed                  | `getKpis()`, `listEvents("analis")`                       | 3 areas, 3 active, 2 pending, 1 follow-up, 0 resolved; 3 events                                                            | ✅ Correct                                                                                                                                                                               |
| G-DEMO-02 | Seed                  | `getComparison("analis","AOI-01","SC-01","SC-02")`        | success; capturedAt 12 Nov / 17 Nov 06:20; sensor "Radar simulasi"; flood outline                                          | ✅ Correct                                                                                                                                                                               |
| G-DEMO-03 | Seed                  | `getComparison("analis","AOI-03","SC-03","SC-UNKNOWN")`   | `INVALID_PAIR`, "Pasangan citra belum tersedia"                                                                            | ✅ Correct                                                                                                                                                                               |
| G-DEMO-04 | Seed                  | review G-101 → `follow_up_required` with E-02 and a note  | status changed; actor `analis-01`; KPI pending 1 / follow-up 2; audit[0] = review G-101                                    | ✅ Correct                                                                                                                                                                               |
| G-DEMO-05 | G-101 follow-up       | resolve with E-01 only                                    | `EVIDENCE_REQUIRED` mentioning `field_confirmation`; status unchanged                                                      | ✅ Correct                                                                                                                                                                               |
| G-DEMO-06 | Seed                  | import B-102 (AOI-99), then B-101 twice                   | B-102 `INVALID_BATCH`, evidence unchanged; B-101 adds E-06 to G-101, SRC-INT ready; repeat is a duplicate, no new evidence | ✅ Correct. **Update 2026-11-18: ⚠️** passes only because `B-102` / `reason` are hard-coded (`repository.ts:757`). After FIX-006 the call drops `reason` and expects "AOI tidak dikenal" |
| G-DEMO-07 | Seed                  | follow-up → import E-06 → resolve with E-06 → publish     | resolved; briefing v1 status resolved; KPI active 2, resolved 1                                                            | ✅ Correct                                                                                                                                                                               |
| G-DEMO-08 | Analyst note on G-101 | `getEvent("pimpinan")`; pimpinan review; operator compare | no `reviews` / `draftSummary` in projection; both mutations `FORBIDDEN`                                                    | ⚠️ Correct, **rename**: projection is not access control (FIX-003)                                                                                                                       |
| G-DEMO-09 | Modified state        | `resetDemo("operator", true)`                             | KPIs as seed; 5 evidence; demoNow seed; audit[0] = reset                                                                   | ✅ Correct                                                                                                                                                                               |
| G-DEMO-10 | Seed                  | Inspect scenes and freshness                              | all assets `/demo/*`; SAT ready, FIRMS delayed (26h > 12h), GDELT ready                                                    | ✅ Correct                                                                                                                                                                               |
| G-DEMO-11 | Seed                  | workspace(AOI-01, P48, TOP-01)                            | G-101 in period; 10 items all AOI-01; buckets [2, 8]; NC-11 unlocated only; SC-01 historical, SC-02 in period              | ✅ Correct                                                                                                                                                                               |
| G-DEMO-12 | Seed                  | same; `getNarrativeItem("NC-07")`                         | G-101 `candidate`, basis same_area_and_time, E-02 + E-03, 10 items, 0 missing; NC-07 mentioned AOI-01, published null      | ✅ Correct                                                                                                                                                                               |
| G-DEMO-13 | Seed                  | workspace(AOI-03, P48, TOP-01)                            | 0 items; all candidates `insufficient_evidence`; G-103 missing sources > 0                                                 | ✅ Correct                                                                                                                                                                               |
| G-DEMO-14 | Seed                  | workspace(AOI-01, P48, TOP-01)                            | aggregate distinct 3 → `below_threshold`; items still 10                                                                   | ❌ **Wrong**: the 10 items have 10 distinct `authorAccount`, and the threshold is a misread RAB capacity figure (ADR-006). Retired; see NAC-03 / NAC-04                                  |
| G-DEMO-15 | Seed                  | follow-up → v1 → import E-06 → resolve → v2               | v1 and v2 both exist; v2 resolved and contains E-06                                                                        | ⚠️ Correct assertions, **wrong wording** "archived" (FIX-002)                                                                                                                            |

### Update 2026-11-18 — new scenarios (DS-1, DS-3; FIX-006, FIX-007)

| ID        | Precondition | Steps                                                                                        | Expected                                                                                                       |
| --------- | ------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| G-DEMO-16 | Seed         | Operator imports `sagaraImport` (B-103); analis resolves G-102 with E-08; publishes briefing | E-08 linked to G-102; G-102 `resolved`; briefing v1 status resolved; KPI active 2 (G-101, G-103), resolved 1   |
| G-DEMO-17 | Seed         | Operator imports a batch whose evidence has `eventId: "G-999"`                               | `INVALID_BATCH`, "Kejadian tidak dikenal"; evidence count unchanged; batch log `failed`                        |
| G-DEMO-18 | Seed         | Import `{ batchId: "B-199", aoiId: "AOI-99" }`; then a batch with `sourceId: "SRC-XXX"`      | Both `INVALID_BATCH` ("AOI tidak dikenal", "Sumber tidak dikenal"): validation does not depend on the batch ID |

### Update 2026-11-19

| ID        | Precondition    | Steps                                                                                                          | Expected                                                                                                                    |
| --------- | --------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| G-DEMO-19 | Seed            | Analis resolves G-102 with `["E-04"]` and a note                                                               | `EVIDENCE_REQUIRED`, error mentions `field_confirmation`; G-102 still `follow_up_required`                                  |
| G-DEMO-20 | Two fresh repos | Same steps on each: review G-101 follow-up `["E-02"]`, import B-101, publish G-101 briefing; then reset on one | Audit IDs `AUD-0003, AUD-0002, AUD-0001` on both, arrays deep-equal; review ID `REV-0001`; after reset one audit `AUD-0001` |

- G-DEMO-16: the analyst draft and the published briefing findings also contain "bukan ancaman" (D2).
- G-DEMO-18: also covers the empty payload ("Payload batch tidak valid") and a valid batch named `B-102` (succeeds, so the batch ID is not a trigger).

### Update 2026-11-19 (b)

- G-DEMO-21 (seed, N1): the analis `getEvent` projection exposes `missingFieldConfirmation`. G-102 is `true` from the seed and `false` after `sagaraImport`. G-101 is `false` after the full DS-1 resolve. The pimpinan projection of G-102 has no `missingFieldConfirmation` key.
- G-DEMO-18 also asserts `itemCount` / `failedCount` derived from the payload (0 for an empty batch).

## Not covered by automated tests (manual)

| ID    | Check                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------ |
| M-001 | Storyline (spec §3) runs offline in `pnpm dev`                                                         |
| M-002 | Briefing prints via the browser print dialog                                                           |
| M-003 | Simulated imagery, sources and draft are visibly labeled "simulasi"                                    |
| M-004 | Corrupt `localStorage` → app recovers to seed (`loadStateFromStorage`)                                 |
| M-005 | Portal shows 5 DS cards in run order, each link opens its scenario (update 2026-11-18)                 |
| M-006 | DS-3: operator B-103 button, then G-102 resolved and briefing says "bukan ancaman" (update 2026-11-18) |
