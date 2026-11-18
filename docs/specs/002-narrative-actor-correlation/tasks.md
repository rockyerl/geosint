# Tasks 002: Narrative / Actor Correlation

Decisions are recorded (spec §2), so nothing blocks this spec.

## Model & logic

- [ ] T201 Add `ComputedCluster` and `ActorLink` types; remove `AccountAggregate` / `accountAggregateStatus` and the RAB comment
- [ ] T202 Create `analysis.ts`: `computeTrendBuckets` (extracted), `computeNarrativeClusters`, `computeConcentration`, `computeActorLinks`
- [ ] T203 Wire into `getCorrelationWorkspace`; delete the threshold block (`repository.ts:512-522`)
- [ ] T204 Repository `getActorLinks`, `getAccountProfile` with analyst-only checks

## Fixtures

- [ ] T205 Add N-201..N-206 (TOP-02 / AOI-02, 4 handles, 2 shared with Aruna, `publishedAoiId` null)
- [ ] T206 Remove derived data and RAB comments (`optionalAccountAggregates`, `narrativeClusters` numbers, `correlations` numbers); `fixtureVersion` → 3; update `loadStateFromStorage`

## Tests

- [ ] T207 NAC-01..NAC-11 in `tests/unit/geosint-narrative.test.ts`
- [ ] T208 Remove G-DEMO-14 (retired, see spec 001); keep G-DEMO-11..13 green

## UI

- [ ] T209 Narrative panel and correlation matrix use computed clusters; remove the hide-under-10 rule; counts open their items
- [ ] T210 Concentration ranking per topic
- [ ] T211 "Aktor lintas kejadian" list and account timeline (analyst only)
- [ ] T212 Briefing snapshot carries totals only (no handles) for pimpinan

## Close

- [ ] T213 `pnpm check`
- [ ] T214 Update `project_state.md` (C7, C8, C9 → Real) and `checklists.md` §1

## Update 2026-11-18 — demo scenario set

- [ ] T215 Fixture v3: TOP-02, TOP-03, `claimsEventKind`; N-201..N-206, NC-12, NC-13, NL-01..NL-12 exactly as spec §8.2 (replaces T205)
- [ ] T216 `getAccountProfile` stops in time order (FR-214); tests NAC-12, NAC-13
- [ ] T217 Route `/narasi` (analyst, `RoleGuard`) with concentration map, clusters, actors, timeline (FR-212..214); test NAC-14
- [ ] T218 Event detail stops reading hand-typed `NAR-xx` / `CORR-xx`; links to `/narasi` instead
