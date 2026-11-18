# Questions — Project Context

Status legend: **Decided** = confirmed by the product owner (PO). **Decided (proposed)** = suggested from the scan and the project description, then accepted by the PO on 2026-11-18. **Open** = still needs an answer.

## A. Purpose & audience

**Q1. Audience?** — Decided (proposed)
A presenter-led demo to a **defense/security stakeholder**. Basis: the seed uses military ranks, and the fixtures use "rute latihan", "satuan setempat" and "pimpinan".

**Q2. What does "proven" mean?** — Decided (proposed)
A **live offline demo of 10 minutes or less** (`checklists.md` §1), with a recorded video as backup. Hands-on use by the stakeholder is not required.

**Q3. Framing?** — Decided (proposed)
**Defense/security situational awareness.** It combines physical incidents (flood, hotspot, land change) from satellite or sensors with the **information environment** (narratives and accounts), to map patterns, movements and threats. Disaster response appears only as an incident type, not as the product framing.

## B. Scope of "AI / Big Data / Satellite"

**Q4. Real AI or mock?** — **Decided by PO: mock.**
Use a deterministic, clearly labeled mock adapter (spec 004, ADR-004). No LLM provider and no data egress.

**Q5. Real satellite data?** — Decided (proposed)
No. Use static simulated scenes in `public/demo/`, labeled "simulasi".

**Q6. Live open data?** — Decided (proposed)
No. Use synthetic data only. The demo stays offline (G-DEMO-10, AGENTS.md AI-03).

**Q7. How is "Big Data" shown?** — Decided (proposed)
As a **target pipeline** in `docs/architecture.md` (ingest → store → process → correlate → present). The UI does not fake data volume.

## C. Core use case: narrative & actors

**Q8. What is "RAB, minimum 10 akun"?** — **Decided by PO.**
RAB = _Rencana Anggaran Biaya_. The "10 akun" figure is an **on-premise capacity figure** proposed in the _rencana fitur_. It is **not an analysis rule**. The code comments (`types.ts:192`, `repository.ts:519`) wrongly turned it into a `below_threshold` rule that hides account counts under 10. Decision: remove the rule and always show computed counts (ADR-006, spec 002).

**Q8a. What exactly does the capacity of 10 accounts count?** — **Open** (not blocking any spec)
Does it count **system user accounts** (analyst seats) or **monitored target accounts**? This affects only `docs/architecture.md` (on-premise sizing).

**Q9. What is an "actor"?** — Decided (proposed)
A **social account** (`authorAccount`). People or groups named inside content are out of scope for the PoC.

**Q10. Which location counts?** — Decided (proposed)
Group by the **area mentioned** in the post (`mentionedAoiId`). The **area posted from** (`publishedAoiId`) is shown only as a coverage percentage. Posts without a mentioned area go to an "unlocated" group and are not counted in an area.

**Q11. Time window?** — Decided (proposed)
Presets of **24h / 48h / 7d**, default **48h**.

## D. Security & data

**Q12. AUTH_SECRET fallback?** — **Decided by PO: record as a task.**
Fix it in a later coding session (`checklists.md` §2).

**Q13. Server-side authority for GEOSINT?** — Decided (proposed)
Not for the PoC. Roles shown only in the UI are acceptable on synthetic data, provided they are labeled (ADR-002).

**Q14. Seed names with military ranks?** — Decided (proposed)
Treat them as fictional. Replace them with obviously synthetic names during the template cleanup (out of scope now).

**Q15. Privacy of account handles?** — Decided (proposed)
`pimpinan` sees **counts only, never handles** (spec 002 US-5). No retention policy is needed for synthetic data. For production, pseudonymisation and retention need their own ADR.

## E. Platform & tech

**Q16. Graph or map library allowed?** — **Decided by PO: yes.**
Use **Cytoscape.js** for the link graph, with the `preset` layout so positions are computed in the repository and tests stay exact. The map stays custom SVG, because Leaflet would need online tiles and break the offline demo (ADR-003).

**Q17. GEOSINT data in a database?** — Decided (proposed)
No. It stays in the browser for the whole PoC (ADR-002).

**Q18. Template parts?** — Decided (proposed)
Keep auth and user/role management as "platform admin". Hide or remove the health-facility module later; removal is destructive and needs Tech Lead approval (AGENTS.md AI-05).

**Q19. Product name?** — Decided (proposed)
**SUNDAWA GEOSINT**.

**Q20. UI language?** — Decided (proposed)
Indonesian only.

## F. Update 2026-11-18 — demo scenarios

**S1. Scenario set?** — **Decided by PO.** Five scenarios DS-1..DS-5 (`docs/scenarios.md`), including a narrative without physical support (DS-5).

**S2. How do narratives relate to evidence?** — **Decided by PO.** Contrast: Aruna is confirmed by SAR imagery and a field report; Nila is contradicted by a patrol report.

**S3. Sagara ending?** — **Decided by PO.** False alarm: the patrol finds controlled burning, so the outcome is "bukan ancaman".

**S4. How is movement (pergerakan) shown?** — **Decided by PO.** As an account timeline across areas (`@radar_lintas`: Sagara → Nila → Aruna). No new library.

**Q21. DS-5 title wording?** — **Open** (blocks only spec 001 FIX-008, the portal card)
A defense audience may expect the word "disinformasi", but ADR-007 says the system never labels narratives or accounts. Proposal: **"Klaim Banjir Dataran Nila: Narasi Tanpa Dukungan Bukti"**. The analyst's own conclusion goes into the briefing.

## Update 2026-11-19

Decided while building spec 001: D1 the resolve rule (requires `field_confirmation`) applies to every event (FIX-010); D2 the hotspot draft summary states "bukan ancaman" once a field confirmation is linked, replaced later by spec 004. See spec 001 §9.

## Update 2026-11-19 (b) — T218

- **D3:** remove `correlations` / `MultiSourceCorrelation` everywhere. Event detail (analyst and pimpinan), dashboard and tactical map read one computed per-event correlation.
- **D4:** a `field_report` or a `field_confirmation` satisfies the internal field source (SRC-INT). This also changes `getCorrelationWorkspace`.
- **ASSUMPTION (Q10):** posted-from location never changes the status. It is shown as a computed count (`locatedContent` / `totalContent`) and a rationale sentence. Status depends on missing sources only (FR-210).
- **ASSUMPTION:** an event's correlations are the topics with at least one post mentioning the event's area in the window (same area + time), using `state.demoPreset.window`. An event observed outside the window has no correlation.
- **ASSUMPTION:** `fixtureVersion` stays 3. An old saved state that still holds a `correlations` key is harmless, because nothing reads it any more.
