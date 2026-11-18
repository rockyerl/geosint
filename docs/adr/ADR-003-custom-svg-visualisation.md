# ADR-003: Custom SVG map; Cytoscape.js for the link graph

- **Status:** Accepted (map: retroactive; graph: Q16 decided by PO 2026-11-18)
- **Date:** 2026-11-18

## Context

The map (`map-canvas.tsx`) and comparison views use hand-written SVG on fixture coordinates. `leaflet` and `@types/leaflet` are in `package.json` but never imported. Spec 003 needs a link-analysis graph. The PO allowed adding a library (Q16).

## Decision

- **Map: keep the custom SVG.** The AOIs are fictional, so a real basemap would add online tiles, network calls and licensing without proving anything new. It would also break the offline demo (G-DEMO-10).
- **Graph: use Cytoscape.js** (MIT licence, offline, mature, Maltego-like look).
  - Use the **`preset` layout only**. Node positions come from `buildLinkGraph` in the repository, so the same input always gives the same coordinates and the tests stay exact.
  - Do not use physics layouts (cose, fcose) in the PoC.
  - Allow zoom, pan and select. Node dragging is off.
  - Wrap Cytoscape in a single client component (`link-graph.tsx`), loaded with `next/dynamic` and `ssr: false`.
  - Also use Cytoscape **headless** (no browser) in `analysis.ts` for graph algorithms. Betweenness centrality gives the "key actor" ranking (spec 003 FR-308).
- Leave the unused `leaflet` dependencies for the cleanup backlog.

## Alternatives considered

| Option                       | Why not chosen                                                                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| vis-network (vis.js, 10.1.5) | Easier first result and good physics, but it is a visualiser only: no graph algorithms, and it needs a browser page, so it can't be unit-tested in Node. It is a volunteer-maintained fork of a project abandoned in 2019. |
| Custom SVG graph             | No zoom/pan or selection for free; we would reimplement what Cytoscape gives.                                                                                                                                              |
| vis-timeline (later)         | Not a replacement. It could sit **beside** Cytoscape for a future "movement over time" scenario (scenario_review F7).                                                                                                      |

## Consequences

- One new runtime dependency: `cytoscape` (MIT; checked on npm at 3.35.0 on 2026-11-18; it bundles its own types). There are no network calls.
- Graph model and layout stay plain TypeScript. Only the centrality step and the renderer use Cytoscape. Swapping the renderer only touches `link-graph.tsx`.
- The interaction is close to Maltego / i2 (zoom, pan, select-highlight) plus computed key actors, which is enough for "big picture".
