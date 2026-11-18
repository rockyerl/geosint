# Test Cases 005: VER-01..VER-12

Fixture v3 (spec 002). P48 = `2026-11-15T09:00+07:00` → `2026-11-17T09:00+07:00`.

| ID     | Precondition                                      | Steps                                                                                          | Expected                                                                                                |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| VER-01 | Seed v3                                           | `getNarrativeVerification("analis", P48, "TOP-01")`, cluster AOI-01                            | `corroborated`; `corroboratingEventIds` = [G-101]; `conflicting` false                                  |
| VER-02 | Seed v3                                           | Same, cluster TOP-01 / AOI-02                                                                  | `unverified` (no flood event at Sagara)                                                                 |
| VER-03 | Seed v3                                           | `TOP-02`, cluster AOI-02                                                                       | `corroborated` by G-102 (hotspot, evidence E-04)                                                        |
| VER-04 | Seed v3                                           | `TOP-03`, cluster AOI-03                                                                       | `unverified`; `refutingEvidenceIds` empty                                                               |
| VER-05 | Operator imported `nilaPatrolImport` (B-104)      | Same as VER-04                                                                                 | `contradicted`; `refutingEvidenceIds` = [E-07]                                                          |
| VER-06 | Seed v3                                           | `TOP-01`, unlocated cluster                                                                    | `unlocated` (NC-11)                                                                                     |
| VER-07 | Seed v3                                           | Indicators of TOP-03 / AOI-03                                                                  | itemsPerAccount 3.0; spanHours 5.5; coverage 0; crossEventAccountCount 1; volumeJump {first 0, last 12} |
| VER-08 | Seed v3                                           | Indicators of TOP-01 / AOI-01                                                                  | itemsPerAccount 1.0; crossEventAccountCount 2; volumeJump {first 2, last 8}                             |
| VER-09 | Test adds field evidence at G-101 refuting TOP-01 | Verification of TOP-01 / AOI-01                                                                | `contradicted`; `conflicting` true                                                                      |
| VER-10 | Operator imported Sagara B-103 (E-08)             | Verification of TOP-02 / AOI-02                                                                | Still `corroborated` (E-08 refutes nothing)                                                             |
| VER-11 | Seed v3                                           | `simulateImport` with a `scene` evidence carrying `refutesTopicIds`                            | `INVALID_BATCH`; evidence count unchanged                                                               |
| VER-12 | Seed v3                                           | `getNarrativeVerification("pimpinan", P48)` and `("operator", P48)`; same call twice as analis | `FORBIDDEN` for both; analyst results identical across calls                                            |

## Manual

| ID    | Check                                                                                     |
| ----- | ----------------------------------------------------------------------------------------- |
| M-501 | DS-5: Nila badge reads "Belum terverifikasi", then "Bertentangan" after the B-104 import  |
| M-502 | Indicator panel shows the note "Indikator, bukan kesimpulan. Keputusan ada pada analis."  |
| M-503 | No screen shows an account labelled as disinformation; pimpinan briefing shows no handles |
