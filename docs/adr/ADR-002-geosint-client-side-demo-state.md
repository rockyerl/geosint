# ADR-002: GEOSINT demo state lives client-side on synthetic fixtures

- **Status:** Accepted (retroactive, records existing code)
- **Date:** 2026-11-18
- **Scope:** `src/features/geosint`

## Context

The PoC has to show the end-to-end GEOSINT chain quickly, offline, and repeatably on stage. The SUNDAWA template already has a server DB (Drizzle + libSQL) for auth and RBAC. No GEOSINT tables exist yet.

## Decision

- All GEOSINT state (`DemoState`) is built from `INITIAL_FIXTURE` (`fixtures.ts`). It is held in React context and persisted in `localStorage` (`geosint-demo-v2`).
- Domain logic lives in a pure, framework-free `GeosintRepository` class (`repository.ts`). Every method takes the caller's `role`, so it can move server-side later unchanged.
- The role (`analis` / `pimpinan` / `operator`) is chosen in the UI (`geosint-role-v1`) and enforced **only** inside the repository and `RoleGuard`.
- `resetDemo` restores the seed for repeatable demos.

## Consequences

**Positive**

- Zero backend setup; works offline; deterministic tests (`geosint.test.ts`).
- The repository is unit-testable and portable to Server Actions later.

**Negative / accepted for the PoC**

- **Not access control.** Any user can switch role. The full state, including internal review notes, is in the browser. G-DEMO-08 proves the _projection_, not isolation. The UI and docs must say so.
- The GEOSINT pages bypass the template's `requirePermission` layers. This is an accepted, known deviation from AGENTS.md §3 _for demo data only_.
- No multi-user sharing; each browser has its own state.

## Revisit when

- Real or sensitive data enters the system, or
- Stakeholders require login-bound roles (questions Q13, Q17).

Migration path: move the repository behind Server Actions with `requirePermission`, and back `DemoState` with Drizzle tables.
