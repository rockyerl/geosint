# Spec 001: GEOSINT Demo Baseline

- **Status:** Implemented (retroactive spec) + small corrections pending
- **Date:** 2026-11-18
- **Related:** ADR-002, ADR-004, ADR-005 · tests `tests/unit/geosint.test.ts` (G-DEMO-01..15)

## 1. Purpose

This spec records what the existing demo already proves, so later specs build on a known baseline. It also lists the corrections needed so that the baseline's scenarios are true.

## 2. Actors

| Role       | Can                                                                                                       | Cannot                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `analis`   | See all events, evidence and comparisons; use the correlation workspace; review events; publish briefings | Import, reset                                          |
| `pimpinan` | See a summary projection and the latest approved briefing; print                                          | See internal reviews or draft summary; mutate anything |
| `operator` | Import batches, view sources and freshness, reset the demo                                                | Compare imagery, review                                |

Roles are a **UI / repository projection**, not access control (ADR-002).

## 3. Demo storyline (Sektor Sungai Aruna, demo clock 17 Nov 2026 09:00 WIB)

1. **Dashboard:** 3 AOIs, 3 active events (G-101 flood, G-102 hotspot, G-103 land change). 2 are pending review and 1 needs follow-up.
2. **Comparison:** the analyst compares SC-01 and SC-02 (simulated radar) for AOI-01. AOI-03 has no pair and the comparison degrades gracefully.
3. **Correlation workspace** (AOI-01, TOP-01, 48h preset):
   - G-101 appears, with 10 narrative items mentioning Aruna in 24h buckets of 2 and 8.
   - NC-11 is shown as unlocated.
   - The candidate correlation combines E-02 (scene), E-03 (field report) and the narratives.
4. **Review:** G-101 moves to `follow_up_required`. Resolving is blocked until `field_confirmation` evidence exists.
5. **Import:** the operator imports B-102 (rejected) and then B-101 (adds E-06). Re-importing B-101 is reported as a duplicate.
6. **Resolve and brief:** the analyst resolves G-101 with E-06 and publishes briefing v1, then v2 after new evidence. Both versions are kept.
7. **Leadership view:** `pimpinan` sees the concise projection and the printable briefing.
8. **Reset:** the operator restores the seed.

## 4. Functional requirements (as built)

| ID     | Requirement                                                                                                                                               | Code                                 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| FR-001 | KPIs from event statuses                                                                                                                                  | `getKpis`                            |
| FR-002 | Event list and detail, role-projected                                                                                                                     | `listEvents`, `getEvent`             |
| FR-003 | Scene pair comparison, `INVALID_PAIR` when missing                                                                                                        | `getComparison`                      |
| FR-004 | Status machine `pending_review → follow_up_required → resolved`; resolve requires `field_confirmation`                                                    | `reviewEvent`                        |
| FR-005 | Batch import: validation, idempotent by batch ID, source freshness update                                                                                 | `simulateImport`                     |
| FR-006 | Correlation workspace: same AOI, `[from,to)` window, topic filter, 24h buckets, unlocated group, historical scenes, candidate status plus missing sources | `getCorrelationWorkspace`            |
| FR-007 | Account aggregate status against a threshold of 10. **Misread requirement**: "RAB 10 akun" is on-premise capacity (ADR-006); spec 002 removes it          | `getCorrelationWorkspace` (L512-522) |
| FR-008 | Versioned briefing snapshot; earlier versions retained                                                                                                    | `publishBriefing`                    |
| FR-009 | Audit entry per review, import, publish and reset                                                                                                         | `state.audits`                       |
| FR-010 | Demo reset to seed and `demoNow`                                                                                                                          | `resetDemo`                          |
| FR-011 | Offline: all assets local; no network                                                                                                                     | fixtures `/demo/*`                   |

## 5. Corrections in scope

| ID      | Correction                                                                                                                                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIX-001 | Test describe label "01 s/d 10" → "01 s/d 15"                                                                                                      |
| FIX-002 | G-DEMO-15: "v1 archived" → "v1 retained". The test already asserts the right thing. No archive flag is added (latest version = highest `version`). |
| FIX-003 | G-DEMO-08: title and comment state "repository projection (not access control)"                                                                    |
| FIX-004 | Visible "simulasi" label on imagery, sources and draft summary where missing                                                                       |
| FIX-005 | G-DEMO-14 and fixture account consistency: **retired / moved to spec 002** (ADR-005, ADR-006)                                                      |

## 6. Out of scope

- Template modules, server authorization, and real data sources.
- Fixing the template-era docs (tracked in `docs/checklists.md` §3).

## 7. Acceptance

- All G-DEMO scenarios pass with corrected wording.
- `pnpm check` is green.
- A demo can be run end-to-end in under 10 minutes, offline.

## 8. Update 2026-11-18 — demo scenario set (`docs/scenarios.md`)

The PO adopted five demo scenarios (DS-1..DS-5). This spec owns **DS-1** (Aruna flood), **DS-3** (Sagara
hotspot, now with an ending) and **DS-4** (Nila land change), plus the portal that lists all five. The
storyline in §3 stays valid for DS-1; `scenarios.md` is now the source of truth for demo steps.

New corrections in scope:

| ID      | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FIX-006 | **Real batch validation** in `simulateImport` (`scenarios.md` §11 gaps 1–2). Remove the hard-coded triggers (`batchId === "B-102"`, `draft.reason`) at `repository.ts:757`. Reject with `INVALID_BATCH`, checked before the duplicate check: `aoiId` given but not in `areas` → "AOI tidak dikenal"; `evidence.eventId` not in `events` → "Kejadian tidak dikenal"; `evidence.sourceId` not in `sources` → "Sumber tidak dikenal"; no evidence → "Payload batch tidak valid". `demoActions.invalidImport` becomes `{ batchId: "B-102", aoiId: "AOI-99" }` (no `reason`). |
| FIX-007 | **DS-3 ending.** `demoActions.sagaraImport = { batchId: "B-103", evidence: { id: "E-08", eventId: "G-102", sourceId: "SRC-INT", kind: "field_confirmation", observedAt: "2026-11-17T08:10:00+07:00", label: "Patroli: pembakaran lahan terkendali oleh warga, tidak ada ancaman bagi area latihan" } }`, plus an operator button "Impor laporan patroli Sagara (B-103)" next to the B-101 action. The analyst resolves G-102 with E-08 and publishes a briefing stating "bukan ancaman".                                                                                 |
| FIX-008 | **Portal shows five scenario cards** in run order (DS-1, DS-2, DS-5, DS-3, DS-4), each labeled with its DS ID, wording that keeps "simulasi" (no bare "Sentinel SAR"). Links: DS-1 `/peta/AOI-01/bandingkan`, DS-2 `/narasi?topic=TOP-01`, DS-5 `/narasi?topic=TOP-03`, DS-3 `/kejadian/G-102`, DS-4 `/peta/AOI-03/bandingkan`. Build it **after specs 002 and 005**; until then the DS-2 and DS-5 cards stay hidden. DS-5 title pending Q21.                                                                                                                            |
| FIX-009 | (Low priority) Deterministic audit IDs: replace `Date.now()` (`repository.ts:773, 816, 867, 1008`) with a counter derived from state, e.g. `AUD-0001`.                                                                                                                                                                                                                                                                                                                                                                                                                   |

New acceptance: G-DEMO-16..18 pass; DS-1, DS-3 and DS-4 run as written in `scenarios.md`.

## 9. Update 2026-11-19 — decisions while building FIX-006/007/009

Built, not verified. Decisions taken by the developer:

- **FIX-010 (D1):** the resolve rule "requires linked `field_confirmation` evidence" applies to **every
  event**, not only G-101 (`EVIDENCE_REQUIRED`, generic message naming the event). Test G-DEMO-19.
- **D2:** `generateDraftSummary` hotspot branch states "bukan ancaman" once the event has a linked
  `field_confirmation`, so the DS-3 briefing says it. Spec 004 replaces the template later.
- **Validation order (FIX-006):** area (`aoiId` given but unknown) → payload (no evidence) → event → source,
  all before the duplicate check. A failed batch is logged `failed`, audited with `success: false`, and adds
  no evidence. The batch ID is never a trigger (G-DEMO-18 imports a valid batch named `B-102`).
- **FIX-009 scope:** review IDs (`REV-0001`, …) also come from a state counter, and every audit writer
  (review, import, publish, reset) uses one helper (`AUD-0001`, …; reset restarts at `AUD-0001`). Test G-DEMO-20.
- `fixtureVersion` stays 2: only `demoActions` changed and the UI reads it directly.

## 10. Update 2026-11-19 (b) — review clean-up

- The analyst hint is generic and driven by the projection flag `missingFieldConfirmation`.
- The batch-log counts come from the payload (an empty batch logs `itemCount` 0).
- The import outcome (batch log, audit, clock) is written in one place.
