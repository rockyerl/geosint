# Plan 003: Link-Analysis View

## Design

- **Model:** `analysis.ts` gets `buildLinkGraph(state, window, aoiIds?)`. It reuses `computeNarrativeClusters` and `computeActorLinks` from spec 002. New types:
  - `GraphNode { id, type, label, refId, emphasis?, x, y }`
  - `GraphEdge { id, from, to, kind }`
- **Layout:** fixed columns by node type (source | evidence | event | area | cluster | account). Within a column, sort by `(aoiId, id)` and space nodes equally. It is a pure function, so it can be unit tested.
- **Key actors:** `computeKeyActors(graph)` in `analysis.ts`:
  - Load the full `{ nodes, edges }` into `cytoscape({ headless: true })`.
  - Run `betweennessCentrality({ directed: false })` and degree, then return the account nodes with score > 0, ranked.
  - It runs in Node, so vitest can test it without a browser.
- **Repository:** `getLinkGraph(role, window, aoiIds?)` and `getKeyActors(role, window)`, both with analyst-only checks.
- **UI:** `components/link-graph.tsx`
  - Cytoscape.js, loaded with `next/dynamic` and `ssr: false`.
  - Node positions are passed to the `preset` layout.
  - Style per node type, with lucide-like glyphs or colours. Emphasized accounts get a thick border.
  - Selecting a node dims nodes that are not neighbours; a side panel shows details.
  - A "Aktor kunci" list beside the graph (score bar + handle); clicking an entry selects that node.
  - `autoungrabify: true` (no drag).
- **Route:** `src/app/peta/graf/page.tsx` with `RoleGuard` (analis), linked from the correlation workspace.

## Dependency

`pnpm add cytoscape` only. It ships its own TypeScript types (`index.d.ts`, checked on npm 3.35.0, 2026-11-18), so `@types/cytoscape` is not needed. Chosen over vis-network because it has built-in graph algorithms and runs headless (comparison in the conversation of 2026-11-18, summarised in ADR-003).

## Risks

| Risk                                          | Mitigation                                                            |
| --------------------------------------------- | --------------------------------------------------------------------- |
| Column layout gets crowded with many accounts | Collapse accounts that are not cross-event into "+n akun" per cluster |
| Cytoscape breaks under server-side rendering  | Client-only dynamic import                                            |
| Depends on spec 002                           | Implement after spec 002 is merged                                    |

## Verification

`pnpm check`; manual walk-through of the demo step; DevTools shows no network calls.
