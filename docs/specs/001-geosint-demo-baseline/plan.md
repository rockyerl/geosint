# Plan 001: Demo Baseline corrections

## Approach

Make only wording and labeling changes. Domain logic does not change. The fixture and account consistency fix moves to spec 002 because it needs computed values (ADR-005).

## Changes

| File                                                                                 | Change                                                                                   |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `tests/unit/geosint.test.ts:5`                                                       | Describe label → `G-DEMO-01 s/d G-DEMO-15`                                               |
| `tests/unit/geosint.test.ts:191`                                                     | G-DEMO-08 title: "...repository projection hides internal notes (not access control)..." |
| `tests/unit/geosint.test.ts:385-387`                                                 | G-DEMO-15 comment and title: "v1 retained" instead of "archived"                         |
| `components/radar-comparison.tsx`, `sources-catalog.tsx`, `event-detail-analyst.tsx` | Make sure a visible "simulasi" badge exists (check first; add only where missing)        |

## Risks

- None functional. UI label changes need a quick manual check in `pnpm dev`.

## Verification

- `pnpm check`
- Manual walk-through of the storyline in spec §3.
