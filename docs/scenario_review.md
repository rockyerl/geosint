# Scenario Review — GEOSINT PoC

_Reviewed 2026-11-18 against the code, not against other docs. This file only lists findings. Existing docs are not changed here (see §8 for the corrections they need later)._

## Legend

| Mark | Meaning                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| ✅   | **Correct**: the claim matches the code and the test proves it                                                     |
| ⚠️   | **Partly correct**: the logic is right, but the wording overclaims, or the comment says more than the test asserts |
| ❌   | **Wrong**: contradicts the code, its own data, or another source                                                   |
| ❓   | **Ambiguous**: can be read in more than one way                                                                    |
| 🚫   | **Untestable here**: no way to verify it in this repository                                                        |
| ➖   | **Missing**: needed by the PoC description, but not written anywhere                                               |

## Summary

| Group                                       | ✅  | ⚠️  | ❌  | ❓  | 🚫  | ➖  |
| ------------------------------------------- | --- | --- | --- | --- | --- | --- |
| A. Portal demo scenarios (UI, 3 + 1)        | 1   | 2   | 0   | 0   | 0   | 1   |
| B. GEOSINT tests G-DEMO-01..15 + label      | 12  | 2   | 2   | 0   | 0   | 0   |
| C. Stories inside the fixture data          | 0   | 0   | 8   | 1   | 0   | 0   |
| D. Template tests (RBAC, password, session) | 8   | 2   | 0   | 0   | 0   | 0   |
| E. Template doc claims                      | 3   | 4   | 5   | 1   | 2   | 0   |
| F. PoC scenarios nobody wrote               | 0   | 0   | 0   | 0   | 0   | 10  |

**Main finding.** The written scenarios are mostly correct for **incidents seen from satellite or sensor data** (flood, hotspot, land change). The **core use case is not a scenario anywhere**. That use case is: map the concentration of accounts spreading the same narrative in a region, then correlate it with incident location, time and actor. It appears only as a side panel inside Scenario 1, and the narrative and account data behind it contradicts itself (group C).

---

## A. Portal demo scenarios

Source: `src/features/geosint/components/portal-home.tsx:149-244`, titled _"Tiga Skenario Pengambilan Keputusan … siap dievaluasi oleh Tim Kodiklat"_.

| #   | Scenario                                                                                                                             | Verdict | Evidence / issue                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **Genangan Sektor Sungai Aruna (AOI-01).** SAR before/after, flood layer, field access report, import of E-06                        | ⚠️      | The flow works (G-DEMO-02/04–07/15). The card text says "radar **Sentinel SAR**" and drops the word "simulasi", although the data says "Sentinel simulasi" / "Radar simulasi" (`fixtures.ts:47,79`). The narrative correlation, the core of the PoC, is not mentioned on the card.                                                                          |
| S2  | **Titik Panas Bukit Sagara (AOI-02).** FIRMS delayed (>12 h); analyst asks for patrol confirmation                                   | ⚠️      | The starting state is correct: FIRMS is 26 h old with a 12 h freshness limit, so it is "delayed" (G-DEMO-10), and G-102 is `follow_up_required` (`fixtures.ts:120`). **But the scenario has no ending.** No field confirmation for G-102 can be imported (`demoActions.validImport` exists only for G-101), so G-102 can never be resolved during the demo. |
| S3  | **Perubahan Lahan Dataran Nila (AOI-03).** Single optical scene with 38% cloud; slider disabled with "Pasangan citra belum tersedia" | ✅      | `fixtures.ts:97-99` (cloud 38); `INVALID_PAIR` message (G-DEMO-03).                                                                                                                                                                                                                                                                                         |
| S4  | **Narrative/account concentration** (the reference use case)                                                                         | ➖      | No headline scenario. It exists only in the correlation workspace inside S1.                                                                                                                                                                                                                                                                                |

## B. Automated GEOSINT scenarios: `tests/unit/geosint.test.ts`

Each test has an Indonesian comment that states the scenario and an assertion that proves part of it. The "Gap" column lists what the comment claims but the test does not check.

| ID             | Scenario (short)                                                  | Verdict | Gap / issue                                                                                                                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-DEMO-01      | Seed: 3 areas, 3 active, 2 pending, 1 follow-up                   | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-02      | Compare SC-01 / SC-02 for AOI-01                                  | ✅      | Comment: "penanda umur data dan sumber tampil, posisi kedua citra sejajar". This is UI behaviour and is manual only.                                                                                                                                                             |
| G-DEMO-03      | AOI-03 has no pair → `INVALID_PAIR`                               | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-04      | G-101 → `follow_up_required` with E-02 + note                     | ✅      | Comment says the history shows "pelaku, waktu dan bukti". The time (`createdAt`) is not asserted.                                                                                                                                                                                |
| G-DEMO-05      | Resolving without `field_confirmation` → `EVIDENCE_REQUIRED`      | ✅      | Comment says "briefing tetap pada versi sebelumnya". The briefing is not asserted.                                                                                                                                                                                               |
| G-DEMO-06      | Invalid batch B-102 rejected; B-101 accepted once, then duplicate | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-07      | Resolve G-101 with E-06 → briefing v1                             | ✅      | Comment says "Wallboard menampilkan KPI terbaru". The test checks repository KPIs, not the wallboard.                                                                                                                                                                            |
| G-DEMO-08      | Pimpinan gets a projection; pimpinan and operator are blocked     | ⚠️      | It is true in the repository. But the role is chosen in the browser (`context.tsx:176`), and the full state, including internal notes, is in `localStorage`. The scenario reads like access control, and it is not.                                                              |
| G-DEMO-09      | Operator reset restores the seed                                  | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-10      | Assets are local; freshness ready/delayed/ready                   | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-11      | Aruna 48h: 10 items, buckets 2/8, NC-11 unlocated                 | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-12      | G-101 candidate E-02 + E-03 + 10 items; NC-07 posted-from null    | ✅      | —                                                                                                                                                                                                                                                                                |
| G-DEMO-13      | AOI-03: no narrative; G-103 `insufficient_evidence`               | ✅      | Comment says "Panel Aruna diperbarui". That is UI behaviour, not asserted.                                                                                                                                                                                                       |
| G-DEMO-14      | Account aggregate 3 < 10 → `below_threshold`                      | ❌      | **Wrong twice.** (1) NC-01..NC-10 have **10 different** `authorAccount` handles, so the real count is 10, not 3. The test passes only because 3 is typed into `fixtures.ts:370`. (2) "RAB 10 akun" is an on-premise capacity figure, not an analysis threshold (PO, 2026-11-18). |
| G-DEMO-15      | Briefing v1 → import E-06 → resolve → v2                          | ⚠️      | Title says "**v1 archived**", but there is no archive state; the test only checks that v1 and v2 both exist. Comment says "versi awal memuat korelasi"; that is not asserted.                                                                                                    |
| describe label | "G-DEMO-01 s/d G-DEMO-10"                                         | ❌      | There are 15 scenarios.                                                                                                                                                                                                                                                          |

## C. Stories inside the fixture data (`fixtures.ts`, `repository.ts`)

These are scenario claims written into the data and shown in the UI.

| #   | Item                                                           | Verdict | Issue                                                                                                                                                                                              |
| --- | -------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `optionalAccountAggregates[0]`: 3 accounts for Aruna 48h       | ❌      | The items contain 10 distinct accounts.                                                                                                                                                            |
| C2  | `NAR-01`: totalContent 10, uniqueAccounts 3                    | ❌      | Its `items` list has 3 entries (NC-07, NC-02, NC-11), and NC-11 has no area, so it is excluded from the Aruna count elsewhere. "3 < 10 RAB" is a misread rule.                                     |
| C3  | `NAR-02`: Sagara, totalContent 6, uniqueAccounts 4             | ❌      | Only 1 item exists (N-201), and it is not in `narrativeItems`, so the workspace never sees it. It uses topic `TOP-02`, **which is not defined** (`topics` has only TOP-01, `fixtures.ts:188-193`). |
| C4  | `CORR-01` `hasSufficientGeoData: true`                         | ❌      | Contradicts `NAR-01.hasSufficientGeoMetadata: false`.                                                                                                                                              |
| C5  | `CORR-01` rationale "rentang waktu < 24 jam"                   | ❌      | The narrative items span 15 Nov 12:00 → 17 Nov 08:25 (about 44 h), and the cited window is 48 h.                                                                                                   |
| C6  | `CORR-01` status `investigating`                               | ❓      | The computed result for the same event is `candidate` (G-DEMO-12). Two labels for one finding, with no rule for how they relate.                                                                   |
| C7  | `CORR-02`: satellite evidence and field report are both `E-04` | ❌      | One FIRMS indicator is counted as two independent sources. G-102 has no field report.                                                                                                              |
| C8  | `CORR-02` rationale "6 konten … 4 akun … ambang RAB"           | ❌      | 1 item exists; the 4 is typed; the threshold is a misread rule.                                                                                                                                    |
| C9  | `generateDraftSummary` (`repository.ts:108-135`)               | ❌      | The flood branch hard-codes G-101, SC-02, coordinates `[20, 68]`, "2 menjadi 8", NC-11 and "RAB (3 < 10 akun)". **Any** flood event would get Aruna's text, including the wrong account claim.     |

## D. Template tests

| Test                                  | Verdict | Note                                                                                                                                                                                                                                     |
| ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RBAC: Super Admin bypass              | ✅      | `hasPermission`                                                                                                                                                                                                                          |
| RBAC: Admin allowed / denied          | ✅      | It uses a hand-built session, but its assertions agree with the seed: the seeded ADMIN also lacks `users.delete` and `roles.manage` (`seed.ts:350-365`).                                                                                 |
| RBAC: Staff "only Dashboard, Reports" | ⚠️      | The assertions are correct: the seeded STAFF also lacks `users.read` and `roles.read`. The **title** is wrong, because the seeded STAFF also has `gis.view`, `organizations.read`, `facilities.*` and `resources.*` (`seed.ts:374-383`). |
| RBAC: null / undefined session        | ✅      |                                                                                                                                                                                                                                          |
| Password: hash / verify / reject (3)  | ✅      | bcrypt                                                                                                                                                                                                                                   |
| Session: "signed with AUTH_SECRET"    | ⚠️      | It passes **without** `AUTH_SECRET`, because of the hard-coded fallback (`session.ts:18`), so it does not prove the env secret is used.                                                                                                  |
| Session: verify, tamper rejected      | ✅      |                                                                                                                                                                                                                                          |

## E. Template doc claims

| Source                        | Claim                                                              | Verdict | Evidence                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| README L3, L17-18             | The sidebar adapts automatically and instantly to role/permissions | ❌      | `getDynamicSidebarNavigation` is never called. The live sidebar is hard-coded in `geosint-shell.tsx`.                                                                                     |
| README L19, SECURITY L25-26   | Multi-layer guard: middleware + page + action                      | ⚠️      | True only for `/dashboard/users`, `/dashboard/roles` and `/dashboard/reports` (`middleware.ts:49-51`). No GEOSINT route is covered.                                                       |
| README L21                    | Users page: search and role filter                                 | ✅      | `user-management-view.tsx:45-49`                                                                                                                                                          |
| README L22, SECURITY          | Self-delete block; last Super Admin protected                      | ✅      | `users/service.ts`                                                                                                                                                                        |
| README L91-93, RUNBOOK L34-36 | Sidebar menus per role (SA: 4, Admin: 4, Staff: 2)                 | ❌      | The seed gives more menus (e.g. Staff also gets GIS, Organisasi, Faskes and SDM/Alkes/Matkes). In any case the sidebar shown is the hard-coded GEOSINT shell.                             |
| Seed menus                    | 11 menu paths                                                      | ❌      | 7 have no page: `/dashboard/gis`, `/dashboard/organizations`, `/dashboard/facilities`, `/dashboard/verification`, `/dashboard/personnel`, `/dashboard/equipment`, `/dashboard/materials`. |
| RUNBOOK L48-52                | `db:generate` writes migrations to `./drizzle`                     | ⚠️      | The procedure is valid, but it has never been run (no `drizzle/` folder). CI uses `db:push`.                                                                                              |
| RUNBOOK L65                   | Backup with `sqlite3 .backup`                                      | 🚫      | Needs the `sqlite3` CLI.                                                                                                                                                                  |
| ARCHITECTURE L51              | Layout calls `getDynamicSidebarNavigation`                         | ❌      | Never called.                                                                                                                                                                             |
| ARCHITECTURE L69              | ERD `USERS → AUDIT_LOGS` relation                                  | ❌      | `audit_logs.actor_id` is plain text with no foreign key (`schema.ts:77`).                                                                                                                 |
| ARCHITECTURE L139             | Every server page calls `requirePermission`                        | ⚠️      | Only 3 pages do. GEOSINT pages are client components.                                                                                                                                     |
| SECURITY L35                  | All input is validated with Zod                                    | ⚠️      | `deleteUserAction(id)` and `deleteRoleAction(id)` take a raw string (`users/actions.ts:81`, `roles/actions.ts:78`).                                                                       |
| PROFILE L41                   | "Argon2/Bcrypt" hashing                                            | ❓      | Only bcrypt is used.                                                                                                                                                                      |
| PROFILE L51-53                | p95 < 150 ms, 99.9% uptime, ASVS L2                                | 🚫      | Nothing in the repo measures or proves these.                                                                                                                                             |
| ADR-001 L59                   | A role change takes effect at the next login                       | ✅      | Stateless JWT carries the permissions.                                                                                                                                                    |

## F. Scenarios the PoC description needs but nobody wrote

Measured against: _"Mengumpulkan, mengolah, dan mengorelasikan data geospasial dan data terbuka … memetakan pola, pergerakan, dan ancaman"_ and the example _"konsentrasi akun yang menyebarkan narasi yang sama di wilayah tertentu → lokasi kejadian, waktu, aktor"_.

| #   | Missing scenario                                                                                          | Covered by                                       |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| F1  | Narrative cluster **computed** from posts (topic + area + time window)                                    | spec 002                                         |
| F2  | **Account concentration**: areas ranked by the number of distinct accounts on the same narrative          | spec 002                                         |
| F3  | Account linked to an area (mentioned area vs posted-from area vs unknown)                                 | spec 002                                         |
| F4  | **The same account across several events or areas** (actor correlation)                                   | spec 002                                         |
| F5  | Link graph: event – area – evidence – narrative – account                                                 | spec 003                                         |
| F6  | AI assist drafts or suggests, and the analyst decides (mock)                                              | spec 004                                         |
| F7  | **Movement**: activity of one actor or cluster across areas over time (the description says "pergerakan") | none yet                                         |
| F8  | A stale source lowers confidence in a correlation (freshness is shown but not used)                       | none yet                                         |
| F9  | Ending for S2: the G-102 patrol confirmation can be imported and G-102 resolved                           | none yet                                         |
| F10 | A briefing for leadership states the threat in plain terms (what, where, when, who, confidence)           | partly (briefing exists; no "who" or confidence) |

## G. Proposal: a clear scenario set for the demo (for discussion, not applied)

| #   | Scenario                                                                                                                                                                                                    | Proves                                                | Status                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| 1   | **Aruna flood**: imagery → evidence → field confirmation → briefing                                                                                                                                         | Satellite + workflow                                  | Exists (fix label "simulasi")                   |
| 2   | **Narrative concentration** (new headline): topic "Akses Aruna Terputus" → areas ranked by accounts → Aruna first → correlated with G-101 by place and time → 2 accounts also active in Sagara → link graph | **Core use case** (account → location → time → actor) | Needs specs 002 + 003                           |
| 3   | **Sagara hotspot**: stale FIRMS + weak narrative → patrol confirmation → resolved                                                                                                                           | Source freshness + honest uncertainty                 | Needs an ending (F9) and a fixture fix (C3, C7) |
| 4   | **Nila land change**: single cloudy scene → "pair not available"                                                                                                                                            | Graceful limits                                       | Exists                                          |
| +   | Role views (pimpinan briefing, operator import/reset)                                                                                                                                                       | Audience separation                                   | Exists (labeled as UI projection)               |

## H. Corrections needed in existing docs (not applied; this review must not touch them)

| Doc                     | Item                                                 | Correction                                                                                              |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `docs/project_state.md` | §4.3 says "`rbac.test.ts` Staff … Incorrect vs seed" | The **title** is overstated; the assertions agree with the seed (D above).                              |
| `docs/checklists.md`    | §3 lists the menu paths as "`/organizations`, …"     | The paths are `/dashboard/organizations` and so on (E above).                                           |
| `docs/project_state.md` | §4.2 fixture table                                   | Add C3 (TOP-02 undefined; N-201 not in `narrativeItems`), C6 and C9 details.                            |
| `docs/project_state.md` | Scenario gaps                                        | Add A-S2 (no ending), A-S4 (core use case not a headline), F7 (movement), and the session test gap (D). |

## I. Update 2026-11-18 — after the demo scenario set (`docs/scenarios.md`)

The PO adopted five scenarios (DS-1..DS-5). This review's findings map to them as follows. Rows above are kept
as written; where a verdict changed, this section wins.

### Verdict changes

| Item                | Was                 | Now                | Why                                                                                                                                                                      |
| ------------------- | ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-DEMO-06           | ✅                  | ⚠️                 | B-102 is rejected only because the ID, `aoiId: "AOI-99"` or `reason` is hard-coded (`repository.ts:757`); nothing validates area, event or source. Fix: spec 001 FIX-006 |
| G-DEMO-11, -12, -13 | ✅                  | ⚠️                 | Logic is correct, but **no screen calls `getCorrelationWorkspace`**: the audience sees the hand-typed NAR/CORR data instead. Fix: spec 002 FR-212 (`/narasi`)            |
| Summary row B       | 12 ✅ / 2 ⚠️ / 2 ❌ | 8 ✅ / 6 ⚠️ / 2 ❌ | The four changes above                                                                                                                                                   |

### How earlier findings are resolved

| Finding                                         | Resolved by                                           |
| ----------------------------------------------- | ----------------------------------------------------- |
| A-S1 card drops "simulasi"                      | DS-1, spec 001 FIX-008                                |
| A-S2 Sagara has no ending                       | DS-3 false alarm, spec 001 FIX-007, G-DEMO-16         |
| A-S4 core use case not a headline               | DS-2, spec 002 §8                                     |
| C3 TOP-02 undefined, N-201 not a real item      | Spec 002 fixture v3 (§8.2)                            |
| C7 E-04 counted twice                           | CORR-xx removed (ADR-005); verification by spec 005   |
| F1–F4 clusters, concentration, actors           | DS-2, spec 002                                        |
| F5 link graph                                   | DS-2 step 2.6, spec 003                               |
| F6 AI assist                                    | DS-5 step 5.6, spec 004                               |
| F7 movement                                     | DS-2 step 2.5 (account timeline), spec 002 FR-214     |
| F9 Sagara ending                                | DS-3                                                  |
| F10 threat stated for leadership                | DS-3 / DS-5 briefings; verification status (spec 005) |
| **New:** threat from narratives without support | DS-5, spec 005, ADR-007                               |
| Still open: F8 stale source lowers confidence   | Not in the scenario set; candidate for a later spec   |

**Update 2026-11-19 (T218):** C4–C8 resolved: CORR-xx removed; correlation status, missing sources and rationale are computed (analysis.ts).

### New gaps (details in `scenarios.md` §11)

- Orphan evidence: a batch whose `eventId` does not exist is accepted (spec 001 FIX-006, G-DEMO-17). **Update 2026-11-19:** fixed by FIX-006 (built, not verified)
- Audit IDs use `Date.now()` (spec 001 FIX-009, low priority). **Update 2026-11-19:** fixed by FIX-009 (built, not verified)
- Source nodes would hide account bridges in centrality (spec 003 FR-311).

## Update 2026-11-19

- G-DEMO-06: fixed by spec 001 FIX-006 (built 2026-11-19, not verified).
