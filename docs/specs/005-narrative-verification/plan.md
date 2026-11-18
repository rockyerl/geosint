# Plan 005: Narrative Verification & Coordination Indicators

## Design

```
ComputedCluster (spec 002) ──► computeVerification ◄── events + evidence (area, window, claimsEventKind, refutesTopicIds)
        │
        └──────────────────► computeCoordinationIndicators ◄── ActorLink[] (spec 002)
```

### Types (`types.ts`)

- `Topic.claimsEventKind: EventKind`
- `Evidence.refutesTopicIds?: string[]`
- `VerificationStatus = "corroborated" | "unverified" | "contradicted" | "unlocated"`
- `NarrativeVerification { clusterId, status, corroboratingEventIds, refutingEvidenceIds, conflicting, indicators }`
- `CoordinationIndicators { itemsPerAccount, spanHours, publishLocationCoverage, crossEventAccountCount, volumeJump: { first, last } }`
- `BriefingSnapshot.verificationStatus?`, `BriefingSnapshot.indicators?`

### Logic (`analysis.ts`, pure)

- `computeVerification(cluster, events, evidence, topics, window)`: exact rule from spec FR-503.
  Evidence time filter `[from, to)`; event time filter `[from, to)`.
- `computeCoordinationIndicators(cluster, actorLinks)`: `crossEventAccountCount` = accounts in the cluster
  whose `ActorLink.isCrossEvent` is true. `spanHours` is rounded to 1 decimal.

### Repository

- `getNarrativeVerification(role, window, topicId?)` with an analyst-only check, reusing
  `computeNarrativeClusters` and `computeActorLinks` (spec 002).
- `simulateImport`: reject `refutesTopicIds` on kinds other than `field_report` / `field_confirmation`.

### Fixtures

- `demoActions.nilaPatrolImport` (FR-506). Topics' `claimsEventKind` is set by spec 002's fixture v3.

### UI

- Status badge + indicator panel inside the narrative workspace (spec 002 route `/narasi`).
- Operator view: "Impor laporan patroli Nila (B-104)" button next to the existing B-101 action.

## Expected values (seed v3, P48)

| Cluster         | Status before | After B-103 + B-104 | itemsPerAccount | spanHours | coverage | crossEventAccountCount |
| --------------- | ------------- | ------------------- | --------------- | --------- | -------- | ---------------------- |
| TOP-01 / AOI-01 | corroborated  | corroborated        | 1.0             | 44.4      | computed | 2                      |
| TOP-01 / AOI-02 | unverified    | unverified          | 1.0             | 1.5       | 0        | 0                      |
| TOP-02 / AOI-02 | corroborated  | corroborated        | 1.5             | 7.0       | 0        | 2                      |
| TOP-03 / AOI-03 | unverified    | **contradicted**    | 3.0             | 5.5       | 0        | 1                      |

`spanHours` for TOP-01/AOI-01: 15 Nov 12:00 → 17 Nov 08:25 = 44 h 25 m ≈ 44.4.

## Risks

| Risk                                 | Mitigation                                                     |
| ------------------------------------ | -------------------------------------------------------------- |
| Status read as a verdict on people   | ADR-007 wording; indicator note; no account labels             |
| A refuting report for the wrong area | Rule requires the evidence's event to be in the cluster's area |

## Verification

`pnpm check`; manual DS-5 walk-through (before/after B-104).
