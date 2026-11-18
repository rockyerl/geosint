# ADR-006: No fixed account threshold in analysis ("RAB 10 akun" is capacity)

- **Status:** Accepted
- **Date:** 2026-11-18
- **Related:** ADR-005, spec 002, questions Q8 / Q8a

## Context

The code has a rule labeled **"Ambang batas RAB: minimum 10 akun per wilayah/periode"**:

- `types.ts:192`
- `repository.ts:519-521`
- fixture comments for NAR-01 and NAR-02 and the CORR-02 rationale

When an area/topic/window had fewer than 10 distinct accounts, the code returned `below_threshold`, and the UI hid the number.

The product owner clarified on 2026-11-18 that the RAB (_Rencana Anggaran Biaya_) "10 akun" is an **on-premise capacity figure proposed in the _rencana fitur_**. It is not an analytical rule.

## Decision

- Remove the threshold from analysis.
  - `accountAggregateStatus` (`valid` / `below_threshold` / `not_available`) is removed.
  - The UI rule that hides counts under 10 is removed.
  - Distinct-account counts are **always computed and shown** to `analis`.
- "Concentration" is expressed through computed, comparable measures instead (spec 002):
  - distinct accounts per area + topic + window
  - items per account
  - ranking across areas for the same topic and window
- Insufficiency in a correlation comes only from **missing evidence** (scene, field report, narrative) or **missing location**, not from an account count.
- Remove every reference to "ambang RAB" from code comments, fixtures and docs.
- The capacity figure belongs to deployment sizing in `docs/architecture.md`. What it counts (user seats or monitored accounts) is open as Q8a.

## Consequences

- G-DEMO-14 is retired. NAC-03 / NAC-04 assert the computed counts.
- CORR-02's "data_insufficient" story is kept, but its reason becomes missing geolocation and evidence.
- `pimpinan` still sees counts only, never handles (privacy, Q15). This is not a threshold.
- If a minimum-significance rule is wanted later, it must be a named, configurable analysis parameter with its own justification. It must not be inherited from a budget document.
