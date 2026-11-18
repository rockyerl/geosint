# Tasks 004: AI Assist (mock)

**Prerequisite:** spec 002 done (FR-404 needs clusters and actor links). Q4 is decided: mock.

- [ ] T401 `ai/port.ts`: `AiAssistAdapter`, `AiOutput<T>` with `generatedBy`
- [ ] T402 `ai/mock-adapter.ts`: `draftSummary`, `suggestTheme`, `coordinationHint` (context-only text)
- [ ] T403 Inject the adapter into `GeosintRepository` (default mock); replace `generateDraftSummary`
- [ ] T404 Repository methods `aiDraft`, `aiSuggestTheme`, `aiCoordinationHint` (analyst only)
- [ ] T405 Add `draftSource` to the briefing snapshot and audit details
- [ ] T406 Tests AIA-01..AIA-08 (`tests/unit/geosint-ai.test.ts`)
- [ ] T407 UI: "Buat draf (AI)" button, theme suggestion chip, coordination hint, simulation label
- [ ] T408 `pnpm check`; grep for hard-coded IDs; update `project_state.md` C11

## Update 2026-11-18 — demo scenario set

**Prerequisite changes:** spec 005 done as well.

- [ ] T409 Draft context with cluster verification and indicators (FR-409); no handles, no "disinformasi" or "hoaks" (FR-410)
- [ ] T410 DS-3 draft quotes E-08, no inferred conclusion (FR-411); hint rule for first bucket 0 (FR-412)
- [ ] T411 Tests AIA-09..AIA-12
