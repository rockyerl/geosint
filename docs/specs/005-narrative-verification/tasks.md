# Tasks 005: Narrative Verification & Coordination Indicators

**Prerequisite:** spec 002 done (clusters, actor links, fixture v3 with TOP-02/TOP-03 and `claimsEventKind`).

- [ ] T501 Types: `claimsEventKind`, `refutesTopicIds`, `VerificationStatus`, `NarrativeVerification`, `CoordinationIndicators`, snapshot fields
- [ ] T502 `computeVerification` and `computeCoordinationIndicators` in `analysis.ts`
- [ ] T503 Repository `getNarrativeVerification` (analyst only); `simulateImport` rejects `refutesTopicIds` on non-field kinds
- [ ] T504 `demoActions.nilaPatrolImport` (B-104 / E-07)
- [ ] T505 Tests VER-01..VER-12 (`tests/unit/geosint-verification.test.ts`)
- [ ] T506 UI: status badge, conflicting note, indicator panel with the ADR-007 note, operator B-104 button
- [ ] T507 Briefing snapshot carries status + indicator numbers (no handles)
- [ ] T508 `pnpm check`; DS-5 manual walk-through; update `project_state.md` and `scenarios.md` status
