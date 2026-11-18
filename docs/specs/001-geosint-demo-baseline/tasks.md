# Tasks 001: Demo Baseline

- [x] T001 Fix the describe label in `geosint.test.ts` (FIX-001). Built 2026-11-19, not verified
- [x] T002 Reword the G-DEMO-15 title and comment to "v1 retained" (FIX-002). Built 2026-11-19, not verified
- [x] T003 Reword the G-DEMO-08 title to state that it is a projection, not access control (FIX-003). Built 2026-11-19, not verified
- [x] T004 Check the comparison, sources and draft-summary views for a "simulasi" label; add where missing (FIX-004). Built 2026-11-19, not verified: only the portal Aruna card lacked it (`portal-home.tsx:176`); comparison shows `scene.sensor` ("Radar simulasi"), sources and draft were already labeled
- [x] T005 Run `pnpm check` Developer reported pass for commit 55f09d5 (2026-11-19)
- [x] T006 Walk through the storyline manually in `pnpm dev` (spec §3), offline DS-3 walked in browser 2026-11-19; full storyline walk pending. Update 2026-11-19: DS-1 storyline and the N1 hint walked in the browser (playwright-cli), all steps pass; found the briefing page stuck on v1 (T014)
- [x] T007 Update `docs/project_state.md` §4.1 verdicts Done 2026-11-19 (project_state.md §11)

## Update 2026-11-18 — demo scenario set

- [x] T008 FIX-006 real batch validation; update G-DEMO-06 call (no `reason`); tests G-DEMO-17, G-DEMO-18 Built 2026-11-19, not verified
- [x] T009 FIX-007 `sagaraImport` (B-103 / E-08) + operator button; test G-DEMO-16 Built 2026-11-19, not verified
- [x] T010 FIX-009 deterministic audit IDs (low priority) Built 2026-11-19, not verified (review IDs included; test G-DEMO-20)
- [x] T012 FIX-010 resolve rule for all events; test G-DEMO-19. Built 2026-11-19, not verified
- [ ] T011 FIX-008 portal with 5 DS cards. **After specs 002 and 005**; Q21 answered first
- [x] T013 Close review items S1, S2, N1, N2, S3 from the FIX-006..010 review; test G-DEMO-21. Built 2026-11-19, not verified
- [x] T014 Briefing page opens the newest version: `briefing-view.tsx` picked v1 before the stored state loaded. Fixed 2026-11-19, checked in the browser (v2 shown by default, v1 still selectable); no unit test (component state)
