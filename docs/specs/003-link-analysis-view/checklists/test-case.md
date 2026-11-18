# Test Cases 003: LNK-01..LNK-11

Fixture v3 (spec 002). P48 = `2026-11-15T09:00+07:00` → `2026-11-17T09:00+07:00`.

| ID     | Precondition | Steps                                         | Expected                                                                                                                                                                                                                                      |
| ------ | ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LNK-01 | Seed v3      | `getLinkGraph("analis", P48)`                 | Nodes include `event:G-101`, `event:G-102`, `area:AOI-01`, `area:AOI-02`                                                                                                                                                                      |
| LNK-02 | Seed v3      | Same                                          | Edges `evidence:E-02 → event:G-101` (supports) and `event:G-101 → area:AOI-01` (occurs_in) exist                                                                                                                                              |
| LNK-03 | Seed v3      | Same                                          | Cluster (TOP-01, AOI-01) has a `correlates_with` edge to G-101                                                                                                                                                                                |
| LNK-04 | Seed v3      | Same                                          | The 2 cross-event accounts have `emphasis: true` and `posted_in` edges to clusters in both AOI-01 and AOI-02                                                                                                                                  |
| LNK-05 | Seed v3      | Same                                          | No node without edges                                                                                                                                                                                                                         |
| LNK-06 | Seed v3      | Call twice                                    | Identical nodes, edges and x/y coordinates                                                                                                                                                                                                    |
| LNK-07 | Seed v3      | Window outside all data (e.g. 2026-01-01..02) | Empty `{ nodes: [], edges: [] }`, success                                                                                                                                                                                                     |
| LNK-08 | Seed v3      | `getLinkGraph("pimpinan", P48)`               | `FORBIDDEN`                                                                                                                                                                                                                                   |
| LNK-09 | Seed v3      | `getKeyActors("analis", P48)`                 | The first two entries are `@pantau_ops_01` and `@radar_lintas` (the only bridges between the Aruna and Sagara subgraphs). **Update 2026-11-18:** order is `@radar_lintas` first, then `@pantau_ops_01` (fixture v3, sources excluded, FR-311) |
| LNK-10 | Seed v3      | Same                                          | Accounts that post in only one cluster score 0 and are not returned; repeating the call gives identical scores                                                                                                                                |
| LNK-11 | Seed v3      | `getKeyActors("pimpinan", P48)`               | `FORBIDDEN`                                                                                                                                                                                                                                   |

### Update 2026-11-18 — fixture v3 and verification

| ID     | Precondition       | Steps                         | Expected                                                                                                                                                      |
| ------ | ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LNK-12 | Seed v3            | `getLinkGraph("analis", P48)` | Includes `event:G-103`, `area:AOI-03` and the `TOP-03:AOI-03` cluster; `account:@radar_lintas` has `posted_in` edges to clusters in AOI-01, AOI-02 and AOI-03 |
| LNK-13 | Seed v3 + spec 005 | Same                          | Cluster nodes carry `verificationStatus`: `TOP-01:AOI-01` corroborated, `TOP-03:AOI-03` unverified (contradicted after B-104)                                 |
| LNK-14 | Seed v3            | `getKeyActors("analis", P48)` | Scores are identical whether or not source nodes exist in the drawn graph (centrality ignores `source` nodes)                                                 |

## Manual

| ID    | Check                                                                   |
| ----- | ----------------------------------------------------------------------- |
| M-301 | Selecting `account:@pantau_ops_01` highlights both incident subgraphs   |
| M-302 | The graph renders offline, with no network requests in DevTools         |
| M-303 | The non-cross-event account collapse ("+n akun") is readable            |
| M-304 | Clicking a key actor in the list selects and highlights it in the graph |
