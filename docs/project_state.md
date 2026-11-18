# Project State — GEOSINT PoC

_Last reviewed: 2026-11-18 (static review of code + docs; `pnpm check` not run for this review)._

## 1. Summary

The repository is the **SUNDAWA full-stack template** (server auth, RBAC, user/role CRUD,
audit log, health-facility schema) with a **GEOSINT demo** added in `src/features/geosint`.
The GEOSINT demo is client-side, runs on synthetic fixtures held in `localStorage`, and has
no server, ingestion, AI, or real satellite data.

**Verdict for the PoC goal** ("concentration of accounts with the same narrative in a region,
correlated with incident location, time and actor"):

- The **location + time** half is demonstrated with real (fixture-driven) logic.
- The **account concentration** and **actor** half is not: clusters and account counts are
  typed into fixtures, and the typed numbers contradict the fixture items.
- The **link-analysis** and **AI** parts that define the tool class (Maltego / i2 / Gotham)
  are missing.

The big picture is therefore **about 50% proven**. Specs 002–004 close the gap.

## 2. Capability status

| #   | PoC capability                               | Status                                   | Evidence                                                                                                                                                                                                             |
| --- | -------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Data collection / ingestion                  | Mock                                     | `repository.ts` `simulateImport` (~L730) takes a hand-built payload; batch dedupe and validation are real                                                                                                            |
| C2  | Source freshness                             | Real                                     | `getSourceFreshness` `repository.ts:31`                                                                                                                                                                              |
| C3  | Geospatial map                               | Partial                                  | `components/map-canvas.tsx`: custom SVG, AOI outlines and event points, no basemap or projection                                                                                                                     |
| C4  | Satellite before/after                       | Mock                                     | `radar-comparison.tsx` slider over `public/demo/*.webp`; pair validation real (`getComparison`)                                                                                                                      |
| C5  | Event review workflow + E-06 rule            | Real                                     | `reviewEvent`; G-DEMO-04/05/07                                                                                                                                                                                       |
| C6  | Area + time correlation                      | Real                                     | `getCorrelationWorkspace` `repository.ts:407-572`                                                                                                                                                                    |
| C7  | Narrative clustering                         | Mock                                     | `fixtures.ts:374` `narrativeClusters` hand-authored; no clustering code                                                                                                                                              |
| C8  | Account concentration (distinct accounts)    | Mock + wrong                             | Count typed (`fixtures.ts:370` = 3) while NC-01..10 have 10 distinct `authorAccount`; plus a misread "RAB 10 akun" threshold (`repository.ts:520`) that hides counts. "RAB 10 akun" is on-premise capacity (ADR-006) |
| C9  | Actor correlation across events              | Missing                                  | No account→event links                                                                                                                                                                                               |
| C10 | Link-analysis graph                          | Missing                                  | `correlation-matrix.tsx` is tabular only                                                                                                                                                                             |
| C11 | AI assist                                    | Missing                                  | `generateDraftSummary` `repository.ts:108` is a template with hard-coded G-101 text                                                                                                                                  |
| C12 | Briefing (versioned) + print                 | Real                                     | `publishBriefing`, `briefing-view.tsx` `window.print()`                                                                                                                                                              |
| C13 | Role projection pimpinan / analis / operator | Real in repository, **UI-only security** | `getEvent` projection; role from `localStorage` (`context.tsx:176`)                                                                                                                                                  |
| C14 | Audit trail (GEOSINT)                        | Real, in-memory                          | `state.audits`                                                                                                                                                                                                       |
| C15 | Demo reset                                   | Real                                     | `resetDemo`; G-DEMO-09                                                                                                                                                                                               |

## 3. Two parallel correlation models

There are two separate correlation models:

- `state.correlations` (`CORR-01`, `CORR-02`, type `MultiSourceCorrelation`) is **static fixture text** shown in event detail.
- `getCorrelationWorkspace().candidateCorrelations` (type `CorrelationFinding`) is **computed**.

They can disagree. For example, CORR-01 says `hasSufficientGeoData: true` while NAR-01 says `hasSufficientGeoMetadata: false`. See ADR-005 and spec 002.

## 4. Scenario validation

### 4.1 GEOSINT scenarios: `tests/unit/geosint.test.ts`

| ID             | Verdict                | Note                                                                                                                                                                                                                                       |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-DEMO-01      | Correct                | KPIs 3 areas / 3 active / 2 pending / 1 follow-up                                                                                                                                                                                          |
| G-DEMO-02      | Correct                | SC-01 vs SC-02 pair plus flood outline                                                                                                                                                                                                     |
| G-DEMO-03      | Correct                | `INVALID_PAIR` for AOI-03                                                                                                                                                                                                                  |
| G-DEMO-04      | Correct                | pending → follow_up with E-02 and a note; audit written                                                                                                                                                                                    |
| G-DEMO-05      | Correct                | `EVIDENCE_REQUIRED` without `field_confirmation`                                                                                                                                                                                           |
| G-DEMO-06      | Correct                | Invalid B-102 rejected; B-101 accepted once, then reported as duplicate                                                                                                                                                                    |
| G-DEMO-07      | Correct                | Resolve, then briefing v1                                                                                                                                                                                                                  |
| G-DEMO-08      | Correct but misleading | Projection holds in the repository, but full state incl. internal notes is in the browser. Rename to "UI projection"                                                                                                                       |
| G-DEMO-09      | Correct                | Reset restores seed and `demoNow`                                                                                                                                                                                                          |
| G-DEMO-10      | Correct                | Local assets; freshness SAT ready / FIRMS delayed / GDELT ready                                                                                                                                                                            |
| G-DEMO-11      | Correct                | 10 items, buckets 2 and 8, NC-11 unlocated, SC-01 historical                                                                                                                                                                               |
| G-DEMO-12      | Correct                | G-101 candidate E-02 + E-03 + 10 items; NC-07 `publishedAoiId` null                                                                                                                                                                        |
| G-DEMO-13      | Correct                | AOI-03: no narrative; G-103 `insufficient_evidence`                                                                                                                                                                                        |
| G-DEMO-14      | **Wrong twice**        | Asserts 3 distinct accounts, but the 10 in-window items have 10 distinct handles (it passes only because the aggregate is hand-typed). Its `below_threshold` rule is based on a misread RAB capacity figure (ADR-006). Retired by spec 002 |
| G-DEMO-15      | **Wording wrong**      | Says "v1 archived"; no archive state exists, the test only checks that v1 and v2 both exist                                                                                                                                                |
| describe label | **Wrong**              | Says "G-DEMO-01 s/d G-DEMO-10"; there are 15                                                                                                                                                                                               |

### 4.2 Fixture consistency (`fixtures.ts`)

| Item                                                      | Problem                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `optionalAccountAggregates[0].distinctAccounts = 3`       | Contradicts NC-01..10 (10 distinct handles)                                                                   |
| `NAR-01.totalContent = 10`, `uniqueAccountsCount = 3`     | `items` holds 3 entries (NC-07, NC-02, NC-11); NC-11 is unlocated and excluded from the Aruna count elsewhere |
| `NAR-02.totalContent = 6`                                 | `items` holds 1 entry (N-201)                                                                                 |
| `CORR-01.hasSufficientGeoData = true`                     | Contradicts `NAR-01.hasSufficientGeoMetadata = false`                                                         |
| `CORR-01.rationale` "< 24 jam"                            | Narrative items span 15 Nov 12:00 to 17 Nov 08:25 (about 44h)                                                 |
| `CORR-02` satellite and field-report evidence both `E-04` | One evidence item counted as two source types                                                                 |
| `generateDraftSummary` flood branch                       | Hard-codes G-101 / SC-02 / coordinates for **every** flood event                                              |

### 4.3 Template scenarios (README, RUNBOOK, ARCHITECTURE, SECURITY, `rbac.test.ts`)

| Claim                                                                | Verdict                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Sidebar per role tables (README L91-93, RUNBOOK L34-36)              | Incorrect: seed gives more menus, and the sidebar is hard-coded anyway |
| "Change role → sidebar adapts" (README L18, ADR-001)                 | Incorrect: `getDynamicSidebarNavigation` is never called               |
| "Every server page calls `requirePermission`" (ARCHITECTURE Layer 2) | Partial: only 3 template pages                                         |
| "All input validated with Zod" (SECURITY)                            | Partial: `delete*Action(id)` unvalidated                               |
| ERD `audit_logs` FK to `users`                                       | Incorrect: plain text `actor_id`                                       |
| `db:generate` → `./drizzle` (RUNBOOK)                                | Not followed: no `drizzle/` folder; CI uses `db:push`                  |
| `rbac.test.ts` Staff "Dashboard, Reports only"                       | Incorrect vs seed: STAFF has 8 permissions                             |
| Session / cookie flags, last-Super-Admin guard, audit action list    | Correct                                                                |

### 4.4 Scenarios the PoC needs but nobody wrote

Spec 002 covers items 1–4 and spec 003 covers item 5. The rest are noted in [questions.md](questions.md) for later.

1. A cluster is **computed** from items (topic + area + window), not typed.
2. Distinct-account count (no threshold) and the concentration ranking are computed from `authorAccount`.
3. An account attributed to an area (mentioned vs published vs unknown).
4. The **same actor across multiple events or areas** is flagged.
5. Graph of event – area – account – narrative – evidence, filtered by time.
6. Stale source lowers confidence of a correlation (freshness is shown, not used).
7. Coordinated-behaviour indicators (burst posting, new accounts).
8. Privacy: pseudonymised handles and retention.
9. Server-side authority for GEOSINT mutations.

## 5. Template-era docs status

| Doc                                    | Status                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `README.md`                            | Template; sidebar tables wrong; no GEOSINT section                                  |
| `docs/PROJECT_PROFILE.md`              | Template; NFRs (p95, 99.9%, ASVS L2) unmeasured; mentions Argon2 (only bcrypt used) |
| `docs/architecture/ARCHITECTURE.md`    | Template; nav sequence and Layer 2 claims wrong; no GEOSINT                         |
| `docs/architecture/adr/ADR-001`        | Accurate for the template                                                           |
| `docs/runbooks/RUNBOOK.md`             | Sidebar table wrong; migrations step not followed                                   |
| `docs/security/SECURITY_GUIDELINES.md` | Mostly accurate; Zod claim partial                                                  |

Decision: these documents are out of scope for now and stay as they are. Cleanup is tracked in [checklists.md](checklists.md) §3.

## 6. Risks

| Risk                                                                 | Impact                                    | Mitigation                                     |
| -------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Demo shows numbers that contradict their own data (3 vs 10 accounts) | Credibility at demo time                  | Spec 002: compute derived values               |
| Stakeholders read role projection as real access control             | Wrong security expectations               | Label as "UI projection"; ADR-002              |
| Hard-coded `AUTH_SECRET` fallback                                    | Session forgery if env missing            | Checklist §2                                   |
| PoC looks like a dashboard, not an intelligence tool                 | Fails the "Maltego / i2 / Gotham" framing | Spec 003 link graph                            |
| "AI" claim with no AI                                                | Expectation gap                           | Spec 004: explicit mock adapter + label        |
| Seed has person-like names with military ranks                       | Data-policy concern (AI-03)               | Treated as fictional; replace at cleanup (Q14) |
| A budget figure misread as an analysis rule ("RAB 10 akun")          | Wrong demo story; hidden counts           | ADR-006; spec 002 removes it                   |

## 7. Next steps (proposed order)

1. Spec 001 fixes: test label, G-DEMO-15 wording, fixture consistency.
2. Spec 002: computed clusters, accounts and actors. This is the core of the PoC.
3. Spec 003: link-analysis view.
4. Spec 004: AI assist (mock).
5. Write `docs/architecture.md`, including the Big Data target pipeline (Q7) and on-premise sizing (Q8a).

## 8. Decisions log

The context questions were answered on 2026-11-18 (see [questions.md](questions.md)).

- **Decided by the PO:** Q4 (AI is a mock), Q8 (RAB is capacity, not a threshold), Q12 (AUTH_SECRET recorded as a task), Q16 (Cytoscape.js allowed).
- **Accepted from proposals:** all other questions.
- **Open:** only Q8a (what the on-premise capacity of 10 accounts counts).

## 9. Update 2026-11-18 — demo scenario set

**Decided by the PO:** five demo scenarios (`docs/scenarios.md`):

- DS-1 Aruna flood
- DS-2 Narrative concentration
- DS-3 Sagara hotspot, ending in a false alarm
- DS-4 Nila land change
- DS-5 Narrative without physical support at Nila

Narratives are contrasted (confirmed vs contradicted). Movement is shown as an account timeline.

**Changes to earlier sections** (kept as written; this section wins):

- **§7 next steps**, new build order: spec 001 fixes (incl. FIX-006/007) → **002** (fixture v3, `/narasi`) →
  **005** (verification, new) → **003** (graph) → **004** (AI mock) → 001 FIX-008 (portal with 5 cards) →
  `docs/architecture.md`.
- **§2 capability status additions:**
  - C6: the logic is real, but **no screen uses it** (`getCorrelationWorkspace` is test-only).
  - C1: batch validation is hard-coded to `B-102`.
  - New **C16 Narrative verification / threat indicators: Missing** (spec 005).
- **§4.1:** G-DEMO-06 and G-DEMO-11..13 move to ⚠️ (`scenario_review.md` §I).
- **§4.2:** add the unused topic `TOP-02` and the non-item `N-201` (fixed by spec 002 fixture v3).

**New decision records:** ADR-007 (verification status and indicators, never verdicts on accounts).
**New open question:** Q21 (wording of the DS-5 title).

## 10. Update 2026-11-19 — spec 001 FIX-006/007/009/010 built

Status: **built, not verified** (developer's `pnpm check` pending).

- **C1:** batch validation is now real (area, event, source); no hard-coded `B-102` trigger.
- **DS-3** now has an ending: operator imports B-103 (E-08), the analyst resolves G-102, and the draft briefing states "bukan ancaman" (D2; spec 004 replaces the template).
- Audit and review IDs are deterministic (`AUD-0001`, `REV-0001`).
- The resolve rule (needs `field_confirmation`) is generic for every event (FIX-010).
- Known leftover: `event-detail-pimpinan.tsx:183` still shows the hard-coded "4 akun unik < 10 batas RAB" text for Sagara (spec 002 / ADR-006).

## 11. Update 2026-11-19 — §4.1 verdicts after spec 001 fixes

Supersedes the §4.1 verdicts listed here. Verified by `pnpm check` for commit 55f09d5; this change needs its own `pnpm check`.

- G-DEMO-06: Correct. Real validation (FIX-006); "AOI tidak dikenal".
- G-DEMO-08: Correct. Title says it is a projection, not access control (FIX-003).
- G-DEMO-14: Retired. Replaced by spec 002 NAC-03 / NAC-04.
- G-DEMO-15: Correct. Says "v1 retained" (FIX-002).
- Describe label: Correct. Says "G-DEMO-01 s/d G-DEMO-21".
- G-DEMO-16..21: New, Correct. DS-3 ending, batch validation, generic resolve rule, deterministic IDs, resolve-hint flag.
- All other rows are unchanged from §4.1.
- Review clean-up (S1, S2, N1, N2, S3) built, not verified: one import-outcome writer, the validator returns the event and source, the analyst hint uses `missingFieldConfirmation`, failed-batch counts come from the payload.

## 12. Update 2026-11-19 — storyline walk (spec 001 T006)

- DS-1 (dashboard → compare → review → refused resolve → B-102/B-101 → resolve → briefing v1/v2 → pimpinan → reset) and DS-3 were walked offline in the browser with `playwright-cli`. All steps pass.
- Found and fixed: the briefing page showed v1 even when v2 was the newest version, because the selected version was set before the stored state loaded (`briefing-view.tsx`, spec 001 T014).
- Leadership projection checked: no internal notes, no draft, no resolve hint.
