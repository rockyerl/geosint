# Spec 004: AI Assist (mocked adapter)

- **Status:** Ready after spec 002 (Q4 decided by PO: mock)
- **Date:** 2026-11-18
- **Related:** ADR-004, ADR-006

## 1. Why

The project is pitched as "Big Data / AI". Today there is no AI. `generateDraftSummary` (`repository.ts:108`) is a template whose flood branch hard-codes G-101 text, coordinates and counts for **every** flood event. The PoC should show **where AI fits in the analyst's workflow** and keep the analyst in control. It does not need to prove model quality.

## 2. User stories

- **US-1 (analis):** In event detail I click **"Buat draf (AI)"** and get findings, limitations and next action generated from the event's **actual** evidence, correlation and cluster data. The draft is labeled _"Draf AI (simulasi) — perlu tinjauan analis"_.
- **US-2 (analis):** In the correlation workspace I see a **theme suggestion** for unlabeled or unlocated items (e.g. NC-11 → "mungkin TOP-01"), with a confidence label and an accept or ignore choice.
- **US-3 (analis):** I see a **coordination hint** for a cluster (e.g. "8 dari 10 konten dalam 24 jam; 2 akun lintas kejadian"), explained in plain rules rather than as a score.
- **US-4 (pimpinan):** A briefing records whether its text started from an AI draft (`draftSource: "ai_mock" | "manual"`).

## 3. Functional requirements

| ID     | Requirement                                                                                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-401 | Port `AiAssistAdapter` with `draftSummary(ctx)`, `suggestTheme(item, topics)` and `coordinationHint(cluster, actorLinks)`. All are synchronous or Promise, pure, and make no network calls.        |
| FR-402 | `MockAiAdapter` is rule-based and deterministic. It builds text **only from the input context** (no hard-coded IDs, coordinates or numbers).                                                       |
| FR-403 | `suggestTheme` uses keyword overlap between the item title/snippet and topic labels. It returns `{ topicId, confidence: "rendah" \| "sedang" \| "tinggi", reason }`, or `null`.                    |
| FR-404 | `coordinationHint` derives statements from the cluster's trend buckets, items per account, posted-from coverage and cross-event accounts (spec 002). It uses no account-count threshold (ADR-006). |
| FR-405 | Every AI output carries `generatedBy: "ai_mock"`, and the UI shows the simulation label. The analyst must edit or accept before publishing.                                                        |
| FR-406 | `publishBriefing` stores `draftSource`. The audit entry notes it.                                                                                                                                  |
| FR-407 | `generateDraftSummary` is replaced by the adapter call (removing the hard-coded G-101 text).                                                                                                       |
| FR-408 | Only `analis` may invoke AI assist.                                                                                                                                                                |

## 4. Out of scope

- A real LLM or provider integration (PO decided mock for the PoC, Q4). A real one would need a new ADR, data-egress rules and an API key policy per AI-03.
- Embeddings, vector search, ML clustering, and image analysis on scenes.

## 5. Acceptance

- AIA-01..AIA-08 pass.
- Grep shows no event IDs, coordinates or numbers hard-coded in `MockAiAdapter` output templates.
- In the demo, the draft for G-102 (hotspot) mentions G-102's own evidence, its 4 accounts and the missing posted-from location, not Aruna.

## 6. Update 2026-11-18 — demo scenario set (`docs/scenarios.md`)

The AI mock is used in DS-1 (draft), DS-3 (Sagara ending) and DS-5 (Nila claim). Build order is now
002 → 005 → 004, because drafts and hints use the verification status and indicators from spec 005.

| ID     | Requirement                                                                                                                                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-409 | `draftSummary` context includes the clusters in the event's area and window with their `verificationStatus` and indicators (spec 005). A contradicted cluster produces a limitation/finding sentence naming the refuting evidence label. |
| FR-410 | Draft text never contains account handles (it can become a pimpinan briefing) and never the words "disinformasi" or "hoaks" (ADR-007). It states facts and indicators only.                                                              |
| FR-411 | The DS-3 outcome is not inferred: the draft quotes the field confirmation label (E-08) and the event status; the analyst writes the "bukan ancaman" conclusion.                                                                          |
| FR-412 | `coordinationHint` "lonjakan volume" also fires when the first bucket is 0 and the last is ≥ 3 (TOP-03: 0 → 12).                                                                                                                         |
