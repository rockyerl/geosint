# Plan 004: AI Assist (mock)

## Design

```
event detail / workspace ──► GeosintRepository.aiDraft / aiSuggestTheme / aiCoordinationHint
                                   │  (role check: analis)
                                   ▼
                         AiAssistAdapter (port, src/features/geosint/ai/port.ts)
                                   │
                         MockAiAdapter (src/features/geosint/ai/mock-adapter.ts)
```

- The repository receives the adapter through its constructor, with `MockAiAdapter` as the default. Tests can inject a stub.
- `draftSummary(ctx)`: `ctx = { event, area, evidence[], cluster?, candidate?, sourcesFreshness[] }`. The template is assembled from ctx fields only, with a sentence per available fact and a limitation sentence per missing source, unlocated items, or missing posted-from location.
- `suggestTheme`: lowercase token overlap with the topic label. Confidence is ≥ 3 tokens → tinggi, 2 → sedang, 1 → rendah, 0 → `null`.
- `coordinationHint`: rules over the computed cluster:
  - last bucket ≥ 3× the first gives "lonjakan volume"
  - `itemsPerAccount` ≥ 2 gives "konten berulang dari sedikit akun"
  - `publishLocationCoverage` = 0 gives "lokasi unggahan tidak tersedia"
  - any cross-event account gives "akun lintas kejadian"
- `BriefingSnapshot` gets `draftSource`. The audit `details` mentions it.

## Changes

| File                                              | Change                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `ai/port.ts`, `ai/mock-adapter.ts`                | New                                                              |
| `repository.ts`                                   | Inject adapter; replace `generateDraftSummary`; add 3 AI methods |
| `types.ts`                                        | `AiOutput<T>` with `generatedBy`; `draftSource` on the snapshot  |
| `event-detail-analyst.tsx`, `narrative-panel.tsx` | Buttons, labels, accept / ignore                                 |

## Risks

| Risk                                  | Mitigation                                                   |
| ------------------------------------- | ------------------------------------------------------------ |
| Stakeholder reads the mock as real AI | Mandatory label; this spec's title; ADR-004                  |
| Q4 later requires a real LLM          | Port already isolates it; new ADR + adapter, no view changes |

## Verification

`pnpm check`; grep the mock templates for `G-1|AOI-|\[\d+, \d+\]`; manual G-102 draft check.
