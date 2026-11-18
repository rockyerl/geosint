# Requirements Checklist 002

## Spec quality

- [x] Tied to the reference use case (account concentration → location/time/actor)
- [x] Decisions recorded with sources (spec §2)
- [x] Each FR is testable
- [x] Role boundary stated (FR-207)
- [x] Privacy: pimpinan sees totals only (US-5)
- [x] Q8: "RAB 10 akun" is capacity, not an analysis threshold (ADR-006)
- [x] Q9: actor = account
- [x] Q10: grouped by mentioned area; posted-from area shown as coverage
- [x] Q11: window presets 24h / 48h / 7d

## Requirement status

- [ ] FR-201 Clusters computed by topic + mentioned area + window
- [ ] FR-202 Cluster fields incl. distinct accounts, items per account, coverage
- [ ] FR-203 Concentration ranking
- [ ] FR-204 Workspace uses computed count; threshold removed
- [ ] FR-205 Actor links + cross-event flag
- [ ] FR-206 Account timeline
- [ ] FR-207 Analyst-only access
- [ ] FR-208 No derived numbers or RAB text in fixtures; `fixtureVersion` 3
- [ ] FR-209 Fixture has a Sagara cluster + cross-event accounts from raw items
- [ ] FR-210 Insufficiency explained by evidence or location only
- [ ] FR-211 UI drill-down; hide-under-10 rule removed
