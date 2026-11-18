# Plan 002: Narrative / Actor Correlation

## Design

```
NarrativeItem[] ──group(topic, mentionedAoi, window)──► ComputedCluster[] ──rank──► Concentration
      │                                                     │
      └──group(authorAccount)──► ActorLink[] ◄──area+window── GeoEvent[]
```

### Types (`types.ts`)

- `ComputedCluster`: `{ id, topicId, aoiId | null, itemIds, totalContent, distinctAccounts, itemsPerAccount, firstObservedAt, lastObservedAt, trendBuckets, publishLocationCoverage }`
- `ActorLink`: `{ account, itemIds, aoiIds, topicIds, eventIds, isCrossEvent }`
- Remove: `AccountAggregate`, `accountAggregateStatus`, `optionalAccountAggregates`, the hand-written `NarrativeCluster` fields, and the `correlations` numbers in `DemoState`. Keep `MultiSourceCorrelation` only if the UI needs prose, with no numbers in it. Remove the "Ambang batas RAB" comment (`types.ts:192`).

### Logic (new `src/features/geosint/analysis.ts`, pure)

- `computeTrendBuckets(times, window)`: extracted from `repository.ts:486-510`
- `computeNarrativeClusters(items, window)`
- `computeConcentration(clusters, topicId)`
- `computeActorLinks(items, events, window)`
- `GeosintRepository` wraps these with role checks and uses them in `getCorrelationWorkspace`. The threshold block at `repository.ts:512-522` is deleted.

### Fixtures (`fixtures.ts`, `fixtureVersion: 3`)

- Keep NC-01..NC-11 unchanged (G-DEMO-11/12 hold).
- Add N-201..N-206: TOP-02, `mentionedAoiId` AOI-02, `publishedAoiId` null, inside P48. Use 4 handles, 2 of them reused from Aruna (`@pantau_ops_01`, `@radar_lintas`).
- Delete `optionalAccountAggregates`. Delete `narrativeClusters`, or reduce it to theme text only. Reduce `correlations` to number-free prose, or delete it.
- Update the `fixtureVersion` check in `loadStateFromStorage` (`repository.ts:69`).

### UI

- `narrative-panel.tsx`, `correlation-matrix.tsx`, `event-detail-*`: use computed data; remove the hide-under-10 rule; every count opens its items.
- Concentration ranking per topic.
- "Aktor lintas kejadian" list (analyst only), with a drill-down to the account timeline.

## Risks

| Risk                                     | Mitigation                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Components depend on removed fields      | Grep usages of the removed types first; use a thin adapter if needed |
| Old `localStorage` state                 | `fixtureVersion` bump triggers self-heal                             |
| Someone re-adds a threshold from the RAB | ADR-006; NAC-11 checks that no "RAB" text remains                    |

## Verification

`pnpm check`; manual demo: concentration ranking → Aruna/G-101 → cross-event actors → Sagara.
