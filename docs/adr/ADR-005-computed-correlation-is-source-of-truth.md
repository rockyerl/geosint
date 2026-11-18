# ADR-005: Derived values are computed, not stored in fixtures

- **Status:** Proposed (implemented by specs 001 and 002)
- **Date:** 2026-11-18

## Context

There are two correlation models:

- `state.correlations` (`MultiSourceCorrelation`, CORR-01/02) and `state.narrativeClusters` (NAR-01/02) are hand-written in fixtures, including totals, distinct-account counts and geo flags.
- `getCorrelationWorkspace()` computes `CorrelationFinding`s and trend buckets from items.

The hand-written values contradict the items:

| Field                                   | Hand-written | Computed from items |
| --------------------------------------- | ------------ | ------------------- |
| Distinct accounts for AOI-01 / 48h      | 3            | 10                  |
| `NAR-01.totalContent`                   | 10           | 3 items listed      |
| `CORR-01` geo flag vs `NAR-01` geo flag | `true`       | `false`             |

For a tool whose value is "count and correlate", showing numbers that disagree with their own data undermines the PoC.

## Decision

- **Fixtures hold only raw facts**: areas, sources, scenes, events, evidence, narrative items, topics.
- **All derived values are computed** in `GeosintRepository`: clusters, totals, distinct accounts, concentration ranking, geo sufficiency, correlation status and rationale text. There is no account threshold (ADR-006).
- `narrativeClusters`, `optionalAccountAggregates` and `correlations` are removed from `DemoState`, or reduced to presentation-only text keyed by computed IDs. Bump `fixtureVersion` to 3 (old `localStorage` state self-heals via `loadStateFromStorage`).
- Tests assert computed values. G-DEMO-14 is retired (spec 002, ADR-006).

## Consequences

- One source of truth; numbers are traceable; tests catch drift.
- Demo storytelling must be achieved through the **items** For example, to show a weaker cluster (Sagara), the fixture must actually contain fewer items and accounts and no posted-from locations.
- A breaking change to `DemoState`. Components reading `correlations` / `narrativeClusters` must switch to computed data.
