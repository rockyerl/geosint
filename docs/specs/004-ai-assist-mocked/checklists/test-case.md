# Test Cases 004: AIA-01..AIA-08

Fixture v3 (spec 002). P48 = `2026-11-15T09:00+07:00` → `2026-11-17T09:00+07:00`.

| ID     | Precondition | Steps                                              | Expected                                                                                                                                      |
| ------ | ------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AIA-01 | Seed v3      | `aiDraft("analis", "G-101", P48)`                  | `generatedBy = "ai_mock"`; the findings text mentions the evidence labels of E-02 and E-03 and the computed item count of the Aruna cluster   |
| AIA-02 | Seed v3      | `aiDraft("analis", "G-102", P48)`                  | The text references G-102 / Bukit Sagara evidence, "4 akun" and "lokasi unggahan tidak tersedia"; it does **not** contain "Aruna" or "ambang" |
| AIA-03 | Seed v3      | `aiDraft` for G-103                                | The limitations text lists the missing sources from the candidate correlation                                                                 |
| AIA-04 | Seed v3      | `aiSuggestTheme("analis", "NC-11")`                | `topicId = "TOP-01"`, confidence ≥ "sedang", reason lists the matched words                                                                   |
| AIA-05 | Seed v3      | `aiCoordinationHint` for (TOP-01, AOI-01)          | Includes "lonjakan volume" (2 → 8) and "akun lintas kejadian"                                                                                 |
| AIA-06 | Seed v3      | Same input twice                                   | Identical output (deterministic)                                                                                                              |
| AIA-07 | Seed v3      | Publish a briefing from an AI draft                | `snapshot.draftSource = "ai_mock"`; audit details mention it                                                                                  |
| AIA-08 | Seed v3      | `aiDraft("pimpinan", …)`, `aiDraft("operator", …)` | `FORBIDDEN`                                                                                                                                   |

### Update 2026-11-18 — DS-3 and DS-5

| ID     | Precondition                             | Steps                                        | Expected                                                                                                                                          |
| ------ | ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| AIA-09 | Seed v3 + B-104 imported (spec 005)      | `aiDraft("analis", "G-103", P48)`            | Mentions the TOP-03 cluster as "bertentangan", quotes the E-07 label, and states 12 posts, 4 accounts and a 5.5-hour span; contains no `@` handle |
| AIA-10 | Seed v3 + B-103 imported, G-102 resolved | `aiDraft("analis", "G-102", P48)`            | Quotes the E-08 label and status "resolved"; does not contain "bukan ancaman" (the analyst writes that)                                           |
| AIA-11 | Seed v3                                  | `aiCoordinationHint` for `TOP-03:AOI-03`     | Includes "lonjakan volume", "konten berulang dari sedikit akun", "lokasi unggahan tidak tersedia", "akun lintas kejadian"                         |
| AIA-12 | Seed v3                                  | Drafts and hints for all events and clusters | No output contains "disinformasi", "hoaks" or an `@` handle                                                                                       |

## Manual

| ID    | Check                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------- |
| M-401 | The label "Draf AI (simulasi) — perlu tinjauan analis" is visible on every AI output               |
| M-402 | The analyst can edit the draft before publishing; publishing without a review step is not possible |
| M-403 | No network requests while using AI features (DevTools)                                             |
