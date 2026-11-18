# ADR-004: Satellite, open sources and AI are mocked behind adapters

- **Status:** Accepted. Satellite and sources are retroactive; AI was confirmed as mock by the PO on 2026-11-18 (Q4, Q5, Q6).
- **Date:** 2026-11-18

## Context

The target tool class (Google Earth Engine, Gotham, QGIS + AI) relies on real imagery, live feeds and ML. The PoC must prove the _workflow_, run offline, and use synthetic data only (AGENTS.md AI-03). Today:

- **Imagery** is static `public/demo/*.webp`. The labels Sentinel, FIRMS and GDELT are used as names only.
- **Ingestion** is `simulateImport` with a hand-built payload.
- **AI** does not exist. `generateDraftSummary` is a string template.

## Decision

1. Every external capability is reached through a **port (TypeScript interface)** with a **deterministic mock adapter** as the default:
   - `SourceAdapter` (import a batch). Mock: fixture batches. _Existing behavior, interface to formalise later._
   - `ImageryAdapter` (scene asset for an AOI and time). Mock: `/demo/*.webp`.
   - `AiAssistAdapter` (draft summary, theme label, coordination hint). Mock: rule-based, defined in spec 004.
2. Mock output is **labeled** in the UI ("simulasi" / "Draf AI (simulasi), perlu tinjauan analis").
3. No adapter makes network calls unless a later ADR approves a real adapter.

## Consequences

- The demo stays offline and deterministic, and tests remain exact.
- A real Sentinel, GDELT or LLM adapter can be added without touching views or domain logic.
- Stakeholders see an honest "AI-ready" architecture, not a fake AI claim.
