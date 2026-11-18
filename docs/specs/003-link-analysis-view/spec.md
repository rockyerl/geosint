# Spec 003: Link-Analysis View (Maltego / i2-style)

- **Status:** Ready after spec 002 (Q16 decided: Cytoscape.js, ADR-003)
- **Date:** 2026-11-18

## 1. Why

The reference tools (Maltego, i2 Analyst's Notebook, Gotham) are recognized by their **entity–link graph**. The PoC has a map and a tabular matrix but no graph, so it does not yet _look like_ or _prove_ link analysis. This spec adds one read-only graph that shows how an incident connects to place, evidence, narrative and accounts.

## 2. User stories

- **US-1 (analis):** For an AOI and window (default: G-101 / Aruna / P48), I see a graph of **events, areas, evidence, sources, narrative clusters and accounts**, with links between them.
- **US-2 (analis):** Selecting a node highlights its direct neighbours and shows its details (reusing existing detail panels).
- **US-3 (analis):** Cross-event accounts (spec 002) are visually emphasized and connect two incident subgraphs. This is the "aha" moment of the demo.
- **US-4 (analis):** Changing the window rebuilds the graph from the same data.
- **US-5 (analis):** I see the **key actors**: the accounts that connect otherwise separate parts of the graph, ranked by a centrality score and listed next to the graph. Clicking one selects it in the graph. This answers "which actor links the incidents?" with a computed number instead of guesswork.

## 3. Graph model (computed, ADR-005)

| Node type  | From                         | Label                               |
| ---------- | ---------------------------- | ----------------------------------- |
| `event`    | `GeoEvent`                   | G-101 …                             |
| `area`     | `Area`                       | AOI name                            |
| `evidence` | `Evidence`                   | E-xx + kind                         |
| `source`   | `Source`                     | SRC-xx                              |
| `cluster`  | `ComputedCluster` (spec 002) | topic + area + n items + n accounts |
| `account`  | `ActorLink` (spec 002)       | handle                              |

| Edge              | Meaning                                                  |
| ----------------- | -------------------------------------------------------- |
| event → area      | `occurs_in`                                              |
| evidence → event  | `supports`                                               |
| evidence → source | `from_source`                                            |
| cluster → area    | `mentions`                                               |
| cluster → event   | `correlates_with` (same area + window, i.e. a candidate) |
| account → cluster | `posted_in`                                              |

## 4. Functional requirements

| ID     | Requirement                                                                                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-301 | `getLinkGraph(role, window, aoiIds?)` returns `{ nodes, edges }` with stable IDs (`event:G-101`, `account:@x`).                                                                                                                                         |
| FR-302 | Only entities inside the window (or linked to an in-window event) are included. Isolated nodes are dropped.                                                                                                                                             |
| FR-303 | Node positions come from a deterministic layout: columns by type (source \| evidence \| event \| area \| cluster \| account). Same input gives the same coordinates.                                                                                    |
| FR-304 | Cross-event accounts carry `emphasis: true`.                                                                                                                                                                                                            |
| FR-305 | `analis` only. Others get `FORBIDDEN`.                                                                                                                                                                                                                  |
| FR-306 | Rendered with Cytoscape.js, `preset` layout using FR-303 positions (ADR-003), on route `/peta/graf`. Zoom, pan, select and highlight; no node drag, no physics.                                                                                         |
| FR-307 | The graph supports up to ~200 nodes on PoC data without visible lag.                                                                                                                                                                                    |
| FR-308 | `getKeyActors(role, window)` computes **betweenness centrality** (normalised 0–1) and degree for every `account` node on the full graph, using Cytoscape.js in headless mode. It returns accounts with score > 0, sorted by score desc and then handle. |
| FR-309 | Key-actor scores are computed on the full graph, before the "+n akun" UI collapse, so collapsing never changes a score. Analyst only.                                                                                                                   |

## 5. Out of scope

- Editing the graph, manual entity creation, or "transforms" (the Maltego-style expansion).
- Export (PNG / i2 format). This could be a later spec.
- Map-graph synchronisation.

## 6. Acceptance

- LNK-01..LNK-11 pass.
- In the demo, the analyst opens the graph for P48 and sees G-101 and G-102 subgraphs joined through 2 emphasized accounts. The same 2 accounts top the key-actor list. **Update 2026-11-18:** with fixture v3 the graph joins G-101, G-102 **and G-103** subgraphs, and `@radar_lintas` ranks first (see §7).

## 7. Update 2026-11-18 — demo scenario set (`docs/scenarios.md`)

The graph is DS-2 step 2.6. Fixture v3 (spec 002 §8.2) and spec 005 change it as follows.

| ID     | Requirement                                                                                                                                                                                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-310 | Cluster nodes carry `verificationStatus` from spec 005 and are coloured by it (Terkonfirmasi / Belum terverifikasi / Bertentangan), with a legend. Needs spec 005.                                                                                                                                             |
| FR-311 | Key-actor centrality is computed on the graph **without `source` nodes**. Sources link areas generically (SRC-SAT joins Aruna and Nila; SRC-INT joins every area once patrol reports are imported), which would hide the account bridges (`scenarios.md` §11 gap 4). Source nodes stay visible in the drawing. |

Expected with fixture v3: `@radar_lintas` (Aruna, Sagara, Nila) ranks first and `@pantau_ops_01` (Aruna, Sagara)
second. `@pengamat_langit` and `@warga_sagara` post in two Sagara clusters, so they may score just above 0, below the top two.
Build order is now 002 → 005 → 003.
