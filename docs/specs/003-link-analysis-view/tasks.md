# Tasks 003: Link-Analysis View

**Prerequisite:** spec 002 done.

- [ ] T301 Add `GraphNode` / `GraphEdge` types
- [ ] T302 `buildLinkGraph` + deterministic column layout in `analysis.ts`
- [x] T303 `pnpm add cytoscape` (types bundled). Installed 3.35.0 on 2026-11-18; a headless betweenness smoke test gave bridge = 1.00 and leaf = 0.00
- [ ] T304 `computeKeyActors` (headless Cytoscape betweenness + degree) in `analysis.ts`
- [ ] T305 Repository `getLinkGraph` and `getKeyActors` with analyst-only checks; tests LNK-01..LNK-11 (`tests/unit/geosint-graph.test.ts`)
- [ ] T306 `link-graph.tsx`: Cytoscape `preset` layout, client-only, select/highlight, detail panel, no drag
- [ ] T307 Route `/peta/graf` + link from the correlation workspace + `RoleGuard`
- [ ] T308 Collapse non-cross-event accounts into "+n akun" (UI only; scores unchanged)
- [ ] T308a "Aktor kunci" list beside the graph, synced with selection
- [ ] T309 `pnpm check`; manual demo step; update `project_state.md` C10

## Update 2026-11-18 — demo scenario set

**Prerequisite changes:** spec 005 done before T310.

- [ ] T310 Cluster nodes coloured by `verificationStatus`, with legend (FR-310); test LNK-13
- [ ] T311 Centrality ignores `source` nodes (FR-311); tests LNK-12, LNK-14; LNK-09 expects `@radar_lintas` first
- [ ] T312 Graph route also reachable from `/narasi` (spec 002 FR-212), not only from the old workspace link
