# Spec 005: Narrative Verification & Coordination Indicators

- **Status:** Draft, ready after spec 002
- **Date:** 2026-11-18
- **Related:** `docs/scenarios.md` DS-2, DS-3, DS-5 and §9; ADR-005, ADR-006, ADR-007; spec 002 (clusters, actor links)

## 1. Why

The PoC must show **threats**, not only correlations. A threat signal is a narrative that many accounts push
**without physical support**, or against it. Today nothing compares a narrative with evidence: every cluster
looks equally credible. This spec gives each narrative cluster a **verification status** computed from
events and field evidence, plus **coordination indicators** stated as facts. The analyst decides; the
system never labels an account (ADR-007).

## 2. User stories

- **US-1 (analis):** Each located cluster shows **Terkonfirmasi**, **Belum terverifikasi** or
  **Bertentangan**, with the events and evidence behind the status.
- **US-2 (analis):** After the operator imports a patrol report that refutes a claim, the cluster's status
  changes to **Bertentangan** without any other action (DS-5 step 5.5).
- **US-3 (analis):** Each cluster shows coordination indicators: posts per account, time span of the posts,
  posted-from coverage, number of cross-event accounts, and the volume jump. They are shown with the note
  _"Indikator, bukan kesimpulan. Keputusan ada pada analis."_
- **US-4 (pimpinan):** A briefing carries the verification status and indicator values as totals, never
  account handles.

## 3. Functional requirements

| ID     | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-501 | `Topic` gains `claimsEventKind: EventKind`. TOP-01 `flood`, TOP-02 `hotspot`, TOP-03 `flood` (data added by spec 002 fixture v3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR-502 | `Evidence` gains optional `refutesTopicIds: string[]`. Only `field_report` and `field_confirmation` may carry it. `simulateImport` rejects other kinds that carry it (`INVALID_BATCH`).                                                                                                                                                                                                                                                                                                                                                                                                          |
| FR-503 | `computeVerification(cluster, state, window)` (pure, `analysis.ts`) returns `{ status, corroboratingEventIds, refutingEvidenceIds, conflicting }`. Rule (`scenarios.md` §9): **contradicted** if field evidence in the cluster's area, observed within the window, lists the topic in `refutesTopicIds` (checked first); else **corroborated** if an event in the area, of `claimsEventKind`, observed within the window, has ≥ 1 evidence item; else **unverified**. A cluster with no area is **unlocated**. `conflicting = true` when both refuting evidence and a corroborating event exist. |
| FR-504 | `computeCoordinationIndicators(cluster, actorLinks)` returns facts only: `itemsPerAccount`, `spanHours` (last − first post), `publishLocationCoverage`, `crossEventAccountCount`, `volumeJump` (`{ first, last }` bucket counts). No score, no threshold (ADR-006), no label on accounts (ADR-007).                                                                                                                                                                                                                                                                                              |
| FR-505 | `getNarrativeVerification(role, window, topicId?)` returns clusters with status and indicators. `analis` only; others `FORBIDDEN`; bad window `INVALID_WINDOW`.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FR-506 | Demo action `nilaPatrolImport`: batch B-104, evidence E-07 (`field_report`, G-103, SRC-INT, `2026-11-17T07:30:00+07:00`, "Patroli Dataran Nila: tidak ada genangan, akses normal", `refutesTopicIds: ["TOP-03"]`). The operator imports it via the existing `simulateImport`.                                                                                                                                                                                                                                                                                                                    |
| FR-507 | UI: status badge per cluster (Terkonfirmasi / Belum terverifikasi / Bertentangan / Lokasi tidak diketahui), "bukti bertentangan, perlu tinjauan analis" when `conflicting`, and an indicator panel with the US-3 note. Copy in Indonesian.                                                                                                                                                                                                                                                                                                                                                       |
| FR-508 | `BriefingSnapshot` may carry `verificationStatus` and indicator values (numbers only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 4. Out of scope

- Inferring contradiction from text or imagery (refutation is explicit data).
- Account scoring, bot detection, account age or follower data.
- Any automatic "disinformation" label on a narrative or an account.

## 5. Acceptance

- VER-01..VER-12 pass; NAC and G-DEMO tests stay green.
- Demo DS-5 runs: Nila TOP-03 **Belum terverifikasi** → operator imports B-104 → **Bertentangan**.
- DS-2 shows Aruna **Terkonfirmasi**; DS-3 shows Sagara TOP-02 **Terkonfirmasi** before and after E-08.
