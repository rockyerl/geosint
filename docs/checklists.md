# PoC Checklists

Top-level checklist. Spec-specific checklists live in `docs/specs/<n>/checklists/`.
Tick an item only when the evidence (test ID, file, or demo step) exists.

## 1. PoC "big picture proven" criteria

The PoC is done when a single demo run (≈10 min, offline) shows:

- [x] **Sources** listed with freshness (ready / delayed / unavailable) — G-DEMO-10
- [x] **Event** detected in an AOI with satellite before/after (simulated) — G-DEMO-02
- [x] **Evidence** imported via a batch, with invalid + duplicate handling — G-DEMO-06
- [x] **Area + time correlation** of event, evidence and narrative — G-DEMO-11/12
- [ ] **Narrative cluster computed** from items (topic + area + window) — spec 002
- [ ] **Account concentration computed** (distinct accounts + ranking across areas, no threshold) — spec 002
- [ ] **Actor across events**: same account linked to ≥ 2 events/areas — spec 002
- [ ] **Link-analysis graph** of event–area–account–narrative–evidence — spec 003
- [ ] **AI assist** (mock) drafts summary / theme, clearly labeled — spec 004
- [x] **Analyst review** with evidence rule (E-06) — G-DEMO-04/05
- [x] **Briefing** versioned, printable, for pimpinan — G-DEMO-07/15
- [x] **Role views**: analis / pimpinan / operator (UI projection) — G-DEMO-08
- [x] **Audit trail** of review / import / publish / reset — G-DEMO-04/09
- [x] **Reset** to seed for repeatable demos — G-DEMO-09
- [ ] Every number on screen is computed or traceable to an item — spec 001 + 002
- [ ] Every simulated capability is labeled "simulasi" in the UI — spec 001
- [ ] `pnpm check` green

## 2. Code fixes found in review (small, in scope)

- [ ] `tests/unit/geosint.test.ts:5` describe label → "G-DEMO-01 s/d G-DEMO-15"
- [ ] G-DEMO-15 wording "v1 archived" → "v1 retained" (or implement superseded flag) — spec 001
- [ ] G-DEMO-08 name → state it is a UI/repository projection, not access control
- [ ] Fixture consistency (accounts 3 vs 10, NAR-01/NAR-02 totals, CORR-01 geo flag,
      CORR-01 "< 24 jam", CORR-02 E-04 twice) — spec 001 / 002 Update 2026-11-19 (c): CORR items removed (T218).
- [ ] `generateDraftSummary` flood branch hard-codes G-101 text — spec 004
- [ ] Remove the misread "RAB 10 akun" threshold (`repository.ts:512-522`, `types.ts:192`, fixture comments) — spec 002, ADR-006
- [ ] **Task (Q12, decided):** remove the `AUTH_SECRET` hard-coded fallback (`session.ts:18`, `middleware.ts:7`).
      Wire `lib/env.ts` so the app fails fast in production when the variable is missing. Keep `.env.example` documented. Do this in a later coding session.

## 3. Out of scope — cleanup backlog (do not do now)

Recorded so they are not forgotten; each needs explicit go-ahead.

- [ ] README / RUNBOOK sidebar tables and "DB-driven sidebar" claim
- [ ] ARCHITECTURE: nav sequence, Layer 2 claim, ERD FK on `audit_logs`, no GEOSINT section
- [ ] SECURITY: Zod claim vs `delete*Action(id)`
- [ ] PROJECT_PROFILE: Argon2 mention, unmeasured NFRs
- [ ] RUNBOOK: migrations folder `drizzle/` does not exist
- [ ] `rbac.test.ts` Staff test contradicts seed
- [ ] 7 seeded menu paths without routes (`/dashboard/gis`, `/organizations`, …)
- [ ] Unused: `lib/env.ts`, `lib/api-response.ts`, `features/dashboard`, `features/navigation`
      components, health-facility tables, `leaflet` deps
- [ ] Branding: "SUNDAWA Enterprise" login vs "GEOSINT" title vs package name
- [ ] Login: no rate limit, failed logins not audited, `ipAddress` never set
- [ ] Removing health-facility tables = destructive migration → Tech Lead approval (AGENTS.md AI-05)

## 4. Per-change checklist (every PR)

- [ ] Logic in `repository.ts`; UI only renders
- [ ] Scenario test added with spec test ID
- [ ] Fixture derived values still consistent
- [ ] No network calls in GEOSINT slice; synthetic data only
- [ ] Simulated features labeled
- [ ] `pnpm check` passes
- [ ] `docs/project_state.md` and spec `tasks.md` updated

## 5. Update 2026-11-18 — demo scenario set (`docs/scenarios.md`)

§1 still applies. The demo is proven when each scenario runs offline in the order of `scenarios.md` §2:

- [ ] **DS-1** Aruna flood: imagery → review → B-101 import → briefing v1/v2 (spec 001)
- [ ] **DS-2** Narrative concentration on `/narasi`: map, Aruna cluster terkonfirmasi, 2 cross-event actors, `@radar_lintas` timeline, graph with key actors (specs 002, 005, 003)
- [ ] **DS-5** Nila claim: belum terverifikasi → B-104 import → bertentangan; indicators with the ADR-007 note; AI draft without handles (specs 005, 004)
- [ ] **DS-3** Sagara: FIRMS delayed → B-103 import → G-102 resolved → briefing "bukan ancaman" (spec 001) (B-103 built 2026-11-19)
- [ ] **DS-4** Nila land change: no pair → graceful message (spec 001)
- [ ] Portal shows the 5 DS cards in run order (spec 001 FIX-008)
- [ ] Whole run ≤ 10 minutes, after an operator reset

New fixes (in scope):

- [ ] Real batch validation; no hard-coded `B-102` (spec 001 FIX-006) — built 2026-11-19, not verified
- [ ] A screen uses the computed correlation (`/narasi`, spec 002 FR-212); event detail stops showing hand-typed NAR/CORR data — Update 2026-11-19: screens now get computed counts via the adapter; /narasi still pending (T217). Update 2026-11-19 (b): `/narasi` built (T217), not verified; event detail still pending (T218). Update 2026-11-19 (c): event detail, dashboard and map read the computed correlation; CORR-xx removed (T218), not verified.
- [ ] Deterministic audit IDs (spec 001 FIX-009, low priority) — built 2026-11-19, not verified
- [x] Briefing page opens the newest version, not v1 (`briefing-view.tsx`; spec 001 T014) — fixed 2026-11-19, checked in the browser
