# ADR-007: Narratives get a verification status and indicators, never a verdict on accounts

- **Status:** Accepted (PO chose the disinformation scenario DS-5, 2026-11-18)
- **Date:** 2026-11-18
- **Related:** `docs/scenarios.md` DS-5 and §9, spec 005, ADR-005, ADR-006

## Context

DS-5 shows a narrative pushed by a few accounts in a short burst, with no physical support and later
contradicted by a patrol report. A defense/security audience may expect the tool to say "disinformasi" or
to flag the accounts. Automated labels on people are error-prone and hard to defend, and the PoC data is
synthetic and small.

## Decision

- The system computes a **verification status per narrative cluster** (`corroborated`, `unverified`,
  `contradicted`, `unlocated`) from explicit data only: events of the claimed kind, and field evidence that
  lists the topics it refutes. It does not infer contradiction from text.
- It shows **coordination indicators as facts** (posts per account, time span, posted-from coverage,
  cross-event accounts, volume jump). There is no combined score and no threshold (ADR-006).
- It **never labels an account or a narrative as disinformation.** UI copy says
  "Indikator, bukan kesimpulan. Keputusan ada pada analis." The analyst's conclusion goes into the briefing.
- Leadership (`pimpinan`) sees statuses and numbers, never handles.

## Consequences

- The demo still lands the threat story: "Bertentangan" plus strong indicators.
- The rule is simple to test (VER-01..VER-12) and to explain to stakeholders.
- A future real deployment would need its own review (legal, privacy, false positives) before adding any
  account-level scoring.
