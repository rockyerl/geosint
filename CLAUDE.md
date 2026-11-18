# CLAUDE.md — GEOSINT PoC

Guidance for Claude Code in this repository. **AGENTS.md is binding** (SUNDAWA AI-01..AI-08);
this file adds project context and does not repeat it. Imported here so it loads in every session: @AGENTS.md

## 1. What this project is

A **Proof of Concept** for a GEOSINT platform: geospatial OSINT based on Big Data / AI
(satellite-based). It collects, processes and **correlates** geospatial data and open data
to map patterns, movements and threats.

Reference class of tools: Maltego, Palantir Gotham, IBM i2 Analyst Notebook, QGIS + AI,
Google Earth Engine.

**Reference use case:** map the concentration of accounts spreading the same narrative in a
region, then correlate it with incident location, time and actor.

**Framing (decided 2026-11-18, `docs/questions.md`):** product name SUNDAWA GEOSINT. The audience
is a defense/security stakeholder, and the goal is situational awareness: physical incidents plus
the information environment. The PoC is proven by a presenter-led offline demo of 10 minutes or
less. AI, satellite and open data are **mocked** (labeled). The UI is in Indonesian only.

### PoC rule: prove the big picture, not the detail

- Show the end-to-end chain _source → event → evidence → narrative → correlation → briefing_
  working on **synthetic data**. Depth (real connectors, real imagery, real ML) is out of scope
  unless a spec says otherwise.
- Prefer deterministic, testable logic over realistic-looking fixtures. If a number is shown,
  it should be **computed**, not hand-typed.
- Every mocked capability must be visibly labeled as simulated in the UI and in docs.
- Do not grow the SUNDAWA template parts (health facilities, etc.). They are out of scope.

## 2. Where things are

| Path                                                                | What                                                                                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/geosint/`                                             | **The PoC.** All GEOSINT logic and UI.                                                                                                                    |
| `src/features/geosint/types.ts`                                     | Domain model (Area/AOI, Source, Scene, GeoEvent, Evidence, NarrativeItem, NarrativeCluster, CorrelationFinding, Review, Briefing, AuditEntry, DemoState). |
| `src/features/geosint/fixtures.ts`                                  | Synthetic seed `INITIAL_FIXTURE` (3 AOIs, 4 sources, 3 events, NC-01..NC-11).                                                                             |
| `src/features/geosint/repository.ts`                                | `GeosintRepository`: pure in-memory domain logic + role projection. **Put new logic here** so it stays unit-testable.                                     |
| `src/features/geosint/context.tsx`                                  | React context; persists state + role in `localStorage`.                                                                                                   |
| `src/features/geosint/components/`                                  | Views: map-canvas (custom SVG), radar-comparison, narrative-panel, correlation-matrix, events, briefing, wallboard, sources, audit.                       |
| `src/app/{kejadian,peta,briefing,audit,sumber,wallboard,dashboard}` | GEOSINT routes (client components behind `RoleGuard`).                                                                                                    |
| `src/features/{auth,users,roles,reports,navigation}`                | SUNDAWA template: server auth, RBAC, user/role CRUD, audit.                                                                                               |
| `src/db/schema.ts`, `src/db/seed.ts`                                | Drizzle/libSQL schema: template tables + health-facility tables (unused by the PoC).                                                                      |
| `tests/unit/`                                                       | Vitest. `geosint.test.ts` = scenarios G-DEMO-01..15.                                                                                                      |
| `docs/`                                                             | State, checklists, questions, ADRs, specs (see §8).                                                                                                       |

## 3. Commands

```bash
pnpm dev            # http://localhost:3000
pnpm check          # format:check + lint + typecheck + test (required before finishing, AGENTS.md)
pnpm test           # vitest run
pnpm db:push && pnpm db:seed   # only needed for template login/RBAC pages
```

**Update 2026-11-19:** Node **24.22.1** is pinned in `.nvmrc` and `engines`, and CI reads `.nvmrc`. pnpm 12.15.0 is pinned in `packageManager`.

## 4. Domain vocabulary (keep Indonesian terms as-is, they match code & UI)

| Term                          | Meaning                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| AOI / Area                    | Area of interest (AOI-01 Sungai Aruna, AOI-02 Bukit Sagara, AOI-03 Dataran Nila)             |
| kejadian / GeoEvent           | Detected event (G-101 flood, G-102 hotspot, G-103 land_change)                               |
| bukti / Evidence              | E-xx; kinds `scene`, `indicator`, `field_report`, `field_confirmation`                       |
| narasi / NarrativeItem        | Open-source post (NC-xx) with `topicId`, `mentionedAoiId`, `publishedAoiId`, `authorAccount` |
| topik / Topic                 | Narrative theme (TOP-01 "Akses Aruna terputus")                                              |
| korelasi / CorrelationFinding | Same-area-and-time candidate linking event + evidence + narrative                            |
| briefing                      | Versioned, approved snapshot for `pimpinan`                                                  |
| peran / Role                  | `analis` (analyst), `pimpinan` (leadership, read-only summary), `operator` (imports, reset)  |
| aktor / actor                 | A social account (`authorAccount`); "cross-event" if linked to ≥ 2 areas or events           |

**Not an analysis rule:** "RAB 10 akun" is the on-premise capacity in the _rencana fitur_. Do not
add an account-count threshold to the analysis (ADR-006); always show the computed counts.

Event status machine: `pending_review → follow_up_required → resolved`.
Resolving **requires** a `field_confirmation` evidence (rule "E-06") → else `EVIDENCE_REQUIRED`.

## 5. Real vs simulated (as of 2026-11-18)

| Capability                                                             | State                                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Event review workflow, briefing versioning, audit trail                | Real logic, in-memory                                                   |
| Area + time correlation (48h window, 24h buckets, missing-source list) | Real logic on fixtures                                                  |
| Role projection (pimpinan sees summary only)                           | Real in repository, **UI-only security**                                |
| Narrative clustering, distinct-account counting                        | **Hand-authored in fixtures**, not computed                             |
| Actor (account) across events, link-analysis graph                     | **Missing**                                                             |
| Map                                                                    | Custom SVG, fixture coordinates, no basemap (Leaflet installed, unused) |
| Link graph (planned, spec 003)                                         | Cytoscape.js: `preset` layout + headless centrality (ADR-003)           |
| Satellite imagery                                                      | Static `public/demo/*.webp`                                             |
| Ingestion                                                              | `simulateImport` with hand-built payload                                |
| AI                                                                     | **None.** `generateDraftSummary` is a string template                   |

Details and evidence: `docs/project_state.md`.

**Update 2026-11-19:** narrative clustering and distinct-account counts are computed (`analysis.ts`, spec 002); the UI labels still apply the old threshold until T209–T212.

**Update 2026-11-19 (b):** `/narasi` (analyst) shows the computed concentration map, ranked clusters, cross-event actors and account movement (T217).

**Update 2026-11-19 (c):** UI threshold labels removed (T209); briefing snapshots carry narrative totals, counts only (T212).

## 6. Rules for working on the PoC

1. **Logic in `repository.ts`, UI in components.** Repository methods take `role` first and
   return `{ success, ... } | { success: false, code, error }`. Keep that shape.
2. **Every new behavior gets a scenario test** in `tests/unit/` with an ID from its spec
   (e.g. `NAC-03`). Test IDs must match `docs/specs/*/checklists/test-case.md`.
3. **Fixtures must be self-consistent.** Counts, account totals and flags must equal what the
   code would compute from the items. Don't hard-code derived numbers.
4. **Synthetic data only** (AGENTS.md AI-03). Fictional handles (`@pantau_ops_01`), fictional
   places. No real accounts, people, coordinates of real sites, or credentials.
5. **No network calls** in the GEOSINT slice. The demo must run offline (G-DEMO-10).
   Real sources/LLMs go behind an adapter interface with a mock default (ADR-004).
6. **Label simulation** in UI text ("simulasi", "AI-generated draft, needs analyst review").
7. **Don't touch template modules** (auth/users/roles/health tables) unless the task says so.
   GEOSINT does not use the DB yet (ADR-002); adding tables needs a spec + Drizzle push.
8. Indonesian for UI copy and domain terms; English for code identifiers and docs.

## 7. Known issues (don't be surprised; don't fix unless asked)

- `AUTH_SECRET` has a hard-coded fallback in `src/lib/auth/session.ts:18` and `src/middleware.ts:7`.
- GEOSINT role is client-chosen (`context.tsx` `setRole`) and all state ships to the browser.
- README/RUNBOOK sidebar tables and the "DB-driven sidebar" claim are wrong
  (`getDynamicSidebarNavigation` is never called; sidebar is hard-coded in `geosint-shell.tsx`).
- Fixture inconsistencies: NC-01..10 have 10 distinct handles but aggregate says 3;
  `NAR-01.totalContent` 10 vs 3 items; `CORR-01` geo flag contradicts `NAR-01`. **Update 2026-11-19:** counts fixed by fixture v3 (spec 002 T215/T206); CORR-xx `status` / `hasSufficientGeoData` / rationale are still hand-typed until T218. **Update 2026-11-19 (c):** CORR-xx removed; correlation computed (T218).
- `repository.ts:512-522` and `types.ts:192` apply a misread "RAB 10 akun" threshold (ADR-006).
  Spec 002 removes it. **Update 2026-11-19:** removed from repository and types (spec 002 T203); UI labels remain until T209–T212. **Update 2026-11-19 (c):** UI labels removed (T209).
- `tests/unit/geosint.test.ts` describe label says "01 s/d 10" (there are 15);
  G-DEMO-15 claims "v1 archived" but no archive exists.
- Topic `TOP-02` is used by `NAR-02` / `N-201` but not defined. The Sagara demo scenario
  (G-102) has no ending, because no confirmation can be imported for it. **Update 2026-11-19:** TOP-02/TOP-03 defined in fixture v3; Sagara ending exists (B-103).

Fix list: `docs/checklists.md`. Every scenario verdict: `docs/scenario_review.md`.

## 8. Docs policy and map

**All work happens in the working docs. Existing docs are reference only.** Read them for
context, but do not edit them unless the user asks. When a reference doc contradicts the code,
the code wins: record the finding in `docs/scenario_review.md` (§H lists pending corrections).

### Working docs (create and update these)

| Doc                                           | Use it for                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `CLAUDE.md`                                   | This guide                                                                    |
| `docs/project_state.md`                       | Status per PoC capability, risks, decisions log                               |
| `docs/scenarios.md`                           | **The 5 demo scenarios DS-1..DS-5**: steps, expected results, data, run order **Update 2026-11-19:** presenter run book in `docs/demo_manual.md`. |
| `docs/scenario_review.md`                     | Verdict for every scenario (✅⚠️❌), missing scenarios, proposed demo set     |
| `docs/checklists.md`                          | PoC done criteria, fix list, cleanup backlog                                  |
| `docs/questions.md`                           | Decided context answers (Q1–Q20) + open items; check before assuming          |
| `docs/adr/`                                   | PoC decisions ADR-002..007                                                    |
| `docs/specs/001-geosint-demo-baseline/`       | What already exists (G-DEMO-01..15)                                           |
| `docs/specs/002-narrative-actor-correlation/` | Core use case: computed clusters, concentration, actors                       |
| `docs/specs/003-link-analysis-view/`          | Cytoscape entity graph + key-actor centrality                                 |
| `docs/specs/004-ai-assist-mocked/`            | AI port with deterministic mock adapter                                       |
| `docs/specs/005-narrative-verification/`      | Terkonfirmasi / belum terverifikasi / bertentangan + indicators (DS-5)        |
| `docs/architecture.md`                        | _Planned_: PoC architecture (not the old `docs/architecture/` folder)         |

Each spec folder: `spec.md` (what/why) → `plan.md` (how) → `tasks.md` (steps) →
`checklists/requirements.md` + `checklists/test-case.md`. New specs continue the numbering (006…).
Build order: 001 → 002 → 005 → 003 → 004. **Editing a doc that already exists:** don't rewrite it. Add
a note at the end of the affected line, or a new "Update <date>" section. The newest update section wins.

### Reference only (read, don't edit)

| Doc                                        | Note                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| `AGENTS.md`                                | **Binding rules**; never edit. **Update 2026-11-19:** §6 (pointer to this file) added at the developer's request; keep it in step with this file. |
| `README.md`                                | Template README; sidebar claims wrong                    |
| `docs/PROJECT_PROFILE.md`                  | Template profile; NFRs unmeasured                        |
| `docs/architecture/` (incl. `adr/ADR-001`) | Template architecture; ADR-001 still valid for auth/RBAC |
| `docs/runbooks/RUNBOOK.md`                 | Local setup works; sidebar table wrong                   |
| `docs/security/SECURITY_GUIDELINES.md`     | Mostly accurate for the template modules                 |

## 9. Workflow

1. Read the relevant spec, `docs/questions.md` and `docs/scenario_review.md` first.
2. Ask the user before writing when scope or a question is unresolved.
3. Spec work goes through `/feature-flow <spec> [task IDs]`: plan in plan mode, then build, test and
   review in manual mode. Small fixes (one or two files) are done in the main session.
4. The developer runs `pnpm check`. Working docs are updated in the same change.

## 10. Agents and skills (`.claude/`)

| Agent / skill                         | Model / effort     | Role                                                                        |
| ------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `searcher`                            | Haiku 5.5, low     | Read-only lookups during planning (plan mode)                               |
| `implementer`                         | Sonnet 5.5, low    | Builds the approved plan exactly; never runs commands                       |
| `test-writer`                         | Sonnet 5.5, medium | Vitest scenario tests with spec IDs; never runs them                        |
| `reviewer`                            | Opus 5.5           | Rules pass + thermo-nuclear pass on the diff; read-only git only            |
| `/feature-flow`                       | main session Opus  | Runs the phases above for one spec task group                               |
| `/thermo-nuclear-code-quality-review` | —                  | Strict maintainability review (used by `reviewer`)                          |
| `/improve-codebase-architecture`      | —                  | Architecture deepening report; uses `docs/adr/` (see note)                  |
| `playwright-cli`                      | —                  | Browser walk-through of `M-xxx` checks, only on request, `pnpm dev` running |

Third-party skills are byte-identical copies (listed in `.prettierignore`). `/improve-codebase-architecture`
calls `codebase-design`, `grilling` and `domain-modeling` skills and reads `GLOSSARY.md`; none are installed
yet, so it runs in a reduced form.
