# Tasks 002: Narrative / Actor Correlation

Decisions are recorded (spec §2), so nothing blocks this spec.

## Model & logic

- [x] T201 Add `ComputedCluster` and `ActorLink` types; remove `AccountAggregate` / `accountAggregateStatus` and the RAB comment Built 2026-11-19, not verified
- [x] T202 Create `analysis.ts`: `computeTrendBuckets` (extracted), `computeNarrativeClusters`, `computeConcentration`, `computeActorLinks` Built 2026-11-19, not verified
- [x] T203 Wire into `getCorrelationWorkspace`; delete the threshold block (`repository.ts:512-522`) Built 2026-11-19, not verified
- [x] T204 Repository `getActorLinks`, `getAccountProfile` with analyst-only checks Built 2026-11-19, not verified

## Fixtures

- [ ] T205 Add N-201..N-206 (TOP-02 / AOI-02, 4 handles, 2 shared with Aruna, `publishedAoiId` null) Superseded by T215
- [x] T206 Remove derived data and RAB comments (`optionalAccountAggregates`, `narrativeClusters` numbers, `correlations` numbers); `fixtureVersion` → 3; update `loadStateFromStorage` Built 2026-11-19, not verified

## Tests

- [ ] T207 NAC-01..NAC-11 in `tests/unit/geosint-narrative.test.ts` Partly: NAC-01, 04, 06, 07, 11, 12, NAC-18 on fixture v3 (2026-11-19); NAC-13 with T216, NAC-14 with T217; NAC-13 written 2026-11-19; NAC-14 written 2026-11-19 (T217)
- [x] T208 Remove G-DEMO-14 (retired, see spec 001); keep G-DEMO-11..13 green Built 2026-11-19, not verified

## UI

- [ ] T209 Narrative panel and correlation matrix use computed clusters; remove the hide-under-10 rule; counts open their items
- [ ] T210 Concentration ranking per topic
- [ ] T211 "Aktor lintas kejadian" list and account timeline (analyst only)
- [ ] T212 Briefing snapshot carries totals only (no handles) for pimpinan

## Close

- [ ] T213 `pnpm check`
- [ ] T214 Update `project_state.md` (C7, C8, C9 → Real) and `checklists.md` §1

## Update 2026-11-18 — demo scenario set

- [x] T215 Fixture v3: TOP-02, TOP-03, `claimsEventKind`; N-201..N-206, NC-12, NC-13, NL-01..NL-12 exactly as spec §8.2 (replaces T205) Built 2026-11-19, not verified
- [x] T216 `getAccountProfile` stops in time order (FR-214); tests NAC-12, NAC-13 Built 2026-11-19, not verified (NAC-12 already present; NAC-13 added)
- [x] T217 Route `/narasi` (analyst, `RoleGuard`) with concentration map, clusters, actors, timeline (FR-212..214); test NAC-14 Built 2026-11-19, not verified
- [x] T218 Event detail stops reading hand-typed `NAR-xx` / `CORR-xx`; links to `/narasi` instead Built 2026-11-19, not verified

## Update 2026-11-19

- `optionalAccountAggregates` was removed with T201 (part of T206).
- `fixtureVersion` stays 2 until T215.
- NAC-01 (TOP-02/03 parts), NAC-04, NAC-07, NAC-11..13 are written with T207 after fixture v3.
- `narrativeClusters` became text-only `narrativeThemes`; screens use the computed `buildNarrativeClusterViews` (NAC-18).
- No Nila theme until spec 005 adds the verification label.
- T218 must also compute or remove CORR-xx `status` / `hasSufficientGeoData` and the rationale facts (CORR-02 'no field report' is false after B-103).

## Update 2026-11-19 (b)

- CORR-xx and `MultiSourceCorrelation` are removed. Event detail, dashboard and tactical map read `computeEventCorrelations` / `getAreaCorrelations`.
- A field confirmation counts as field evidence, like a field report (D4); this also changes `getCorrelationWorkspace`.
