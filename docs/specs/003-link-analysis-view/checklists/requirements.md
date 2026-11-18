# Requirements Checklist 003

## Spec quality

- [x] Graph model derived from existing and spec-002 data only
- [x] Deterministic, testable layout
- [x] Scope excludes editing, transforms and export
- [x] Q16 library decision recorded: Cytoscape.js with `preset` layout (ADR-003)
- [ ] Spec 002 implemented

## Requirement status

- [ ] FR-301 `getLinkGraph` with stable IDs
- [ ] FR-302 Window filter; no isolated nodes
- [ ] FR-303 Deterministic layout
- [ ] FR-304 Cross-event emphasis
- [ ] FR-305 Analyst only
- [ ] FR-306 Cytoscape view with zoom/pan/select/highlight, no drag
- [ ] FR-307 About 200 nodes without lag
- [ ] FR-308 Key actors by betweenness centrality (headless Cytoscape)
- [ ] FR-309 Scores computed on the full graph; analyst only
