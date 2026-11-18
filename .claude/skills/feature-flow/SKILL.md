---
name: feature-flow
description: Deliver one spec task group or small task through model-per-phase agents. Heavy planning in plan mode (Opus main session + Haiku searcher), then light manual-mode build (Sonnet implementer, low effort), tests (Sonnet test-writer, medium effort) and review (Opus reviewer). Use as /feature-flow <spec> [task IDs] [scope] or /feature-flow <task text>.
disable-model-invocation: true
---

# Feature flow

Deliver one piece of work in fixed phases, each on its own model. The main session (keep it on Opus)
plans and coordinates; it hands each phase to a subagent from `.claude/agents/`.

| Phase                  | Who           | Model      | Effort  | Permission mode             |
| ---------------------- | ------------- | ---------- | ------- | --------------------------- |
| Lookups while planning | `searcher`    | Haiku 5.5  | low     | plan (read-only)            |
| Plan                   | main session  | Opus 5.5   | session | plan mode                   |
| Build                  | `implementer` | Sonnet 5.5 | low     | manual (each edit approved) |
| Tests                  | `test-writer` | Sonnet 5.5 | medium  | manual                      |
| Review                 | `reviewer`    | Opus 5.5   | default | manual                      |

**Plan heavy, execute light.** Tokens go into the plan (Opus, advisor at most once). The implementer and
test-writer follow it without re-deriving anything; the reviewer catches what they missed.
**One task group per session:** when the report is done, tell the developer to `/clear` before the next item.

**Manual mode needs the main session in default mode.** A subagent's `permissionMode` applies only while the
main session is in default mode. If the session is in `acceptEdits`, auto or `bypassPermissions`, the subagents
inherit that and nothing is asked; while it is in plan mode, they stay in plan mode. Before step 4, check that
the session is in default mode (not plan mode) and ask the developer to switch with Shift+Tab if not.
Background subagents show each permission prompt in the main session and name the agent asking.

**Small tasks** (one or two files, an obvious change, e.g. spec 001 FIX-001..003): skip the agents and do the
work in the main session, still in plan mode first and manual mode after. Each agent launch costs tokens to
rebuild context.

## Input

- `/feature-flow <spec> [task IDs] [scope]`, e.g. `/feature-flow 002 T201-T204 computed clusters`:
  read `docs/specs/<spec>-*/spec.md`, `plan.md`, `tasks.md` and `checklists/`; the work is the named open
  `[ ]` tasks (all open tasks if none are named, but propose splitting when that is more than about 6 tasks).
- `/feature-flow <task text>`: the task as written. If it belongs to no spec and is more than a small fix,
  propose a new spec folder (next number, same five files) in the plan.

## Steps

1. **Check what to do.** Read `CLAUDE.md`, `docs/project_state.md`, `docs/checklists.md` §1,
   `docs/scenario_review.md` and `docs/questions.md`. Check the item is in PoC scope ("prove the big picture,
   not the detail") and its dependencies are built and verified (specs go 001 → 002 → 003 → 004; **update
   2026-11-18:** 001 → 002 → 005 → 003 → 004, and also read `docs/scenarios.md` and each doc's newest
   "Update" section, which wins). An open
   question never silently blocks: if it changes the design, ask the developer; otherwise pick the default,
   write it in the plan as `ASSUMPTION (Qn)`, and plan a `docs/questions.md` row.

2. **Enter plan mode** (EnterPlanMode) and stay in it until the plan is approved.
   Send the `searcher` agent for every code and doc lookup. **This skill overrides the default plan-mode agent
   choice: use `searcher`, not the built-in `Explore` or `Plan` agents**, so lookups run on Haiku.
   Send independent lookups in parallel, in one message. Give each one a precise question; it starts with no
   context.

3. **Write the plan** to the plan file. It must be **executable**, so a low-effort executor can follow it
   without design choices. It must contain:
   - the change itself: files, functions/types to reuse (from the searcher's `path:line` results), where new
     logic goes (`analysis.ts` rather than growing `repository.ts`), docs to update (working docs only);
   - exact names and shapes: types and fields, function signatures, error codes, routes, component names,
     fixture IDs **with their full raw values** (e.g. every new `NarrativeItem`), `fixtureVersion` bump;
   - the test list: file, test IDs from the spec's `test-case.md` and behavior sentences, including role
     (`FORBIDDEN`), invalid-input and determinism tests; manual `M-xxx` checks for UI;
   - the line **"Do not deviate from this plan. If it looks wrong or incomplete, stop and report."**;
   - a **commands summary** for the developer: `pnpm typecheck`, `pnpm test tests/unit/<file>.test.ts`,
     `pnpm test -t "<ID>"`, `pnpm check`, and `pnpm dev` + the `M-xxx` steps when UI changed;
   - the **commit message**: Conventional Commits (`feat`, `fix`, `test`, `docs`, `refactor`, `chore`) with a
     scope such as `geosint`, `auth`, `db`, `docs`, header ≤ 100 characters, no work-item IDs (`FR-…`, `T…`,
     `NAC-…`, `ADR-…`) in the header, the context in words in the body, ending with the attribution line.
     Call the advisor at most once, here, when the analysis is long or uncertain. Ask questions until the need
     is clear. Then call **ExitPlanMode** for the developer's approval. Do nothing else until it is approved.

4. **Build.** Send the `implementer` agent the **full approved plan text** (not a summary) plus any searcher
   findings it needs. It runs in manual mode: the developer approves each edit.

5. **Tests.** Send the `test-writer` agent the plan and the implementer's list of changed files.

   **Between phases, check lightly.** After steps 4 and 5, check only the agent's report: did it stop and
   report, or deviate from the plan? A stop goes to the developer. Otherwise move on. Don't re-read the diff
   yourself; the reviewer does the full check.

6. **Review.** Send the `reviewer` agent: it reviews the uncommitted diff against the repository rules and the
   thermo-nuclear quality rules. The reviewer only reports; you route its findings.
   - **No blocking issues:** go to the report; the reviewer's "Next up" list goes into it.
   - **Blocking issues found:** route each blocking finding by where it lies (each already carries
     `path:line`, so no `searcher` is needed):
     - production code or working docs → `implementer`;
     - tests or `checklists/test-case.md` → `test-writer`;
     - **the plan itself is wrong** (wrong design, wrong scope, an ADR conflict) → don't patch it; stop and
       bring it to the developer, because the approved plan must change (back to step 3).
       Send each agent all its findings in one message, with the plan text. Then send the `reviewer` **once
       more** on the new diff. If blocking issues remain after that second review, stop and list them for the
       developer. At most one fix round and one re-review; never loop further.

7. **Report** to the developer:
   - status as **built** (not verified: nobody has run it yet);
   - files changed, tests added (with IDs), review verdict and any open findings;
   - the commands to run, in order, ending with `pnpm check`;
   - for UI changes, the manual `M-xxx` checks; offer a `playwright-cli` walk-through of them (see below);
   - the commit message;
   - a reminder to `/clear` before the next item.

## Optional UI walk-through

Only when the developer asks, and only after they have started `pnpm dev` themselves, the main session may use
the `playwright-cli` skill to walk the `M-xxx` checks on `http://localhost:3000` (offline data, demo roles via
the role switcher) and report what it saw, with screenshots if useful. It never starts or stops the server and
never edits code during the walk-through.

## Never

- Never run pnpm, tests, the dev server or `node` yourself; the developer runs them and pastes results.
- Never `git add`, `commit` or `push`. Read-only git (`status`, `diff`, `log`) is fine.
- Never switch to `acceptEdits` or `bypassPermissions`: everything outside planning stays manual.
- Never edit reference docs (`AGENTS.md`, `README.md`, `docs/architecture/`, `docs/runbooks/`,
  `docs/security/`, `docs/PROJECT_PROFILE.md`).
