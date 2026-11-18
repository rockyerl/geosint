# Demo Run Book — SUNDAWA GEOSINT PoC

_Working doc. Created 2026-11-19. A step-by-step manual for the presenter. **What** each scenario proves is
in [`scenarios.md`](scenarios.md), which stays the source of truth. This file says **how to run it**._

> Values reflect the code as built on 2026-11-19 (T209/T212 built, not yet verified by `pnpm check` or a
> browser walk). Every expected value cites the test or check that asserts it. When this file and
> `scenarios.md` (2026-11-18) differ, this file follows the newer code and `project_state.md`.

## 1. Status legend

| Mark | Meaning                                                                                      |
| ---- | -------------------------------------------------------------------------------------------- |
| ✅   | Runs today                                                                                   |
| ⏳   | Waits for a later spec (005 verification, 003 link graph, 004 AI draft). Say the line given  |
| ⚠️   | Runs, but has a known gap. Avoid the trap described                                          |

## 2. Before the demo (10 minutes ahead)

1. Node **24.22.1** (`.nvmrc`) and pnpm **12.15.0**. Run `pnpm install` once, then `pnpm dev`.
2. Open `http://localhost:3000`. No login is needed for any GEOSINT screen. The network can be off
   (G-DEMO-10).
3. **Pick a role** in the sidebar under **"PERAN PENGGUNA DEMO:"** with the buttons **"Pimpinan" / "Analis" /
   "Operator"**. You can also use the role cards on `/` ("Pilih Peran Demonstrasi"). The default role is
   Analis. Roles are demo roles, held in the browser only (ADR-002).
4. **Reset** as Operator: go to `/sumber`, click **"Reset Fixture Demo (Seed v1)"**, type `RESET`, then click
   **"Ya, Reset Seluruh Data"** (G-DEMO-09). ⚠️ The button says "Seed v1", but it loads fixture v3.
5. Set browser zoom to 90–100%. For the briefing print, choose "Save as PDF" with A4 portrait.
6. Keep one tab only. State syncs across tabs, but one tab keeps the story simple.

**Avoid these sidebar traps.** Some links show for roles that the page then refuses (403 screen "AKSES
DITOLAK"):

- Pimpinan: "1. Peta Taktis" (`/peta`) and "Jejak Audit Keamanan" (`/audit`).
- Analis: "Katalog Sensor & Impor" (`/sumber`).

Use the role named in each step.

## 3. Run order (≤ 10 minutes)

| Order | Scenario                              | Roles            | Time  |
| ----- | ------------------------------------- | ---------------- | ----- |
| 1     | DS-1 Aruna flood                      | analis, operator | 2.5 m |
| 2     | DS-2 Narrative concentration          | analis           | 2.5 m |
| 3     | DS-5 Disinformation at Nila           | analis           | 2 m   |
| 4     | DS-3 Sagara hotspot (false alarm)     | operator, analis | 1.5 m |
| 5     | DS-4 Nila land change                 | analis           | 0.5 m |
| —     | Wrap-up: leadership view              | pimpinan         | 1 m   |

Opening line: _"Semua data, citra dan narasi dalam demo ini sintetis (simulasi). Angka yang tampil dihitung dari data,
bukan diketik."_

## 4. DS-1 — Aruna flood: from imagery to briefing

**Goal:** satellite before/after, evidence import, the review rule, and a versioned briefing.

| #   | Role     | Do (route → click)                                                                                                                                                                                              | You should see                                                                                                                                                 | Check              | Status |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------ |
| 1.1 | analis   | `/dashboard`                                                                                                                                                                                                    | "TOTAL AREA PANTAUAN" 3, "KEJADIAN AKTIF" 3, "MENUNGGU TINJAUAN" 2, "MENUNGGU KONFIRMASI" 1. The narrative card shows "Akun unik: 10" with no "Ambang RAB" text | G-DEMO-01, M-204   | ✅     |
| 1.2 | analis   | `/peta/AOI-01/bandingkan` (sidebar "2. Pembanding Radar SAR")                                                                                                                                                  | "CITRA ACUAN (SEBELUM)" SC-01 vs "CITRA PASCA HUJAN (SESUDAH)" SC-02, a slider, and the toggle "Lapisan Indikasi Genangan (Perlu Tinjauan)"                    | G-DEMO-02          | ✅     |
| 1.3 | analis   | Click "Buka Detail Kejadian G-101" → tick **E-02** → "STATUS TARGET BERIKUTNYA:" `follow_up_required` → type a note → **"Simpan Peninjauan & Perbarui Status"**                                                | Status "Perlu Konfirmasi Lapangan". "Riwayat Catatan Peninjauan (1)" shows who, when and which evidence                                                        | G-DEMO-04          | ✅     |
| 1.4 | analis   | Same page: tick E-02, choose `resolved (Selesaikan Kejadian)`, add a note, then save                                                                                                                            | Red toast: "Penyelesaian kejadian G-101 memerlukan bukti konfirmasi lapangan (field_confirmation)…". Status unchanged                                          | G-DEMO-05          | ✅     |
| 1.5 | operator | Switch to Operator → `/sumber` → **"Simulasikan Impor Batch B-102 (Invalid / Error)"**, then **"Simulasikan Impor Batch B-101 (Valid E-06)"** twice                                                           | B-102 is rejected (AOI-99). E-06 is added once. The second B-101 is reported as a duplicate. "Histori Batch Ingesti" lists all three                           | G-DEMO-06          | ✅     |
| 1.6 | analis   | Switch to Analis → `/kejadian/G-101` → tick **E-06** ("KONFIRMASI LAPANGAN") → `resolved` → note → save. Then click **"Setujui & Publikasikan Briefing (Versi Baru)"**                                         | Status "Selesai (Resolved)". The briefing page opens on v1, with section "Ringkasan Narasi Terbuka saat Disetujui": "Akses Aruna Terputus: 10 konten · 10 akun unik · 2 aktor lintas kejadian" | G-DEMO-07, NAC-26  | ✅     |
| 1.7 | analis   | Back to `/kejadian/G-101`, edit "3. ARAHAN PENGECEKAN", publish again                                                                                                                                           | Briefing v2. "Arsip Versi:" lists v1 and "v2 (Terkini)"                                                                                                        | G-DEMO-15          | ✅     |

1.5: B-102 is rejected by the batch validator (unknown area AOI-99). This validator replaced the old hard-coded
`B-102` check (spec 001 FIX-006, built 2026-11-19, not yet verified).

**Talking point:** _"Analis tidak bisa menutup kejadian tanpa konfirmasi lapangan. Aturan itu dipaksa sistem, bukan
kebiasaan."_

## 5. DS-2 — Narrative concentration (core use case)

**Goal:** accounts → area → time → actor, all computed from posts.

| #   | Role   | Do                                                                                                   | You should see                                                                                                                                                                                         | Check             | Status |
| --- | ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------ |
| 2.1 | analis | Sidebar "Konsentrasi Narasi & Aktor" (`/narasi`). Topic "Akses Aruna Terputus", window "48 jam"      | Map and "Peringkat konsentrasi": #1 Sektor Sungai Aruna — 10 akun · 10 unggahan, #2 Bukit Sagara — 2 akun · 2 unggahan, Nila 0. "Lokasi tidak diketahui" lists NC-11                                   | NAC-06, M-205.1   | ✅     |
| 2.2 | analis   | Open the Aruna cluster                                                                               | Trend 2 → 8 per 24 h, "Unggahan per akun" 1.0, "Cakupan lokasi unggah" %, and "Unggahan di balik angka ini" (10 posts)                                                                                | NAC-02, M-205.2   | ✅     |
| 2.2b | analis | `/kejadian/G-101`, narrative panel: click the VOLUME number, a 24-h bucket, then an account chip     | Each click lists exactly those posts ("Konten ditampilkan (n dari 10)"). In the correlation matrix, clicking "10 konten · 10 akun unik" expands the 10 posts                                           | NAC-24, M-201     | ✅     |
| 2.3 | analis | Correlation with incidents                                                                          | Today: G-101 detail shows **"KANDIDAT KORELASI"**, pillars E-02 (scene) and E-03 (field). The "terkonfirmasi" label comes with spec 005                                                              | NAC-19, M-206.1   | ✅ / ⏳ |
| 2.4 | analis | `/narasi`, section "Aktor lintas kejadian"                                                           | Exactly 2 accounts: `@pantau_ops_01` and `@radar_lintas`                                                                                                                                               | NAC-07, M-205.3   | ✅     |
| 2.5 | analis | "Lihat pergerakan" on `@radar_lintas`                                                                 | Bukit Sagara 16 Nov 09:40 (G-102) → Dataran Nila 18:00–20:00 (G-103) → Sektor Sungai Aruna 21:30 (G-101)                                                                                              | NAC-13, M-205.4   | ✅     |
| 2.6 | analis | Link graph                                                                                           | Not built. Say: _"Graf tautan aktor–kejadian adalah tahap berikutnya (spec 003)."_                                                                                                                       | spec 003          | ⏳     |

**Talking point:** _"Sepuluh akun berbeda menyebut Aruna dalam 48 jam. Dua di antaranya juga muncul di area lain. Satu
akun bergerak dari Sagara ke Nila lalu ke Aruna dalam satu hari."_

## 6. DS-5 — Disinformation at Nila

**Goal:** separate a coordinated claim from a real incident. The system shows indicators; the analyst decides.

| #   | Role     | Do                                                       | You should see                                                                                         | Check   | Status |
| --- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- | ------ |
| 5.1 | analis   | `/narasi` → topic "Banjir Bandang Dataran Nila"          | Dataran Nila 4 akun · 12 unggahan, "Unggahan per akun" 3.0, trend 0 → 12, cakupan lokasi 0%             | NAC-12, M-205.5 | ✅ |
| 5.2 | analis   | Verification status                                      | Not built. Say: _"Status verifikasi klaim (terkonfirmasi / belum terverifikasi / bertentangan) ditambahkan di spec 005."_ | spec 005 | ⏳ |
| 5.3 | analis   | Coordination indicators                                  | Partly visible now: 3.0 posts per account vs Aruna 1.0, and `@radar_lintas` in the actor list. The indicator panel comes with spec 005 | spec 005 | ⏳ |
| 5.4–5.5 | operator, analis | Patrol report B-104 / E-07 that refutes the claim | **B-104 does not exist yet.** Skip it                                                                  | spec 005 | ⏳ |
| 5.6 | analis   | AI draft briefing                                        | Not built (spec 004). The draft today is a template, labeled "Ringkasan simulasi"                       | spec 004 | ⏳ |

**Talking point:** _"Volume besar dari sedikit akun dalam beberapa jam. Ini indikator, bukan vonis. Keputusan tetap di
analis."_

## 7. DS-3 — Sagara hotspot: stale sensor, honest false alarm

| #   | Role     | Do                                                                                       | You should see                                                                                                                                                                                       | Check                 | Status |
| --- | -------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| 3.1 | operator | `/sumber`                                                                                | FIRMS card **"DELAYED (TERTUNDA)"**: the last import is older than 12 h                                                                                                                                         | G-DEMO-10             | ✅     |
| 3.2 | analis   | `/kejadian/G-102`                                                                        | Status "Perlu Konfirmasi Lapangan", one FIRMS indicator (E-04). Matrix tabs TOP-02 / TOP-01, "BUKTI BELUM LENGKAP", missing SRC-SAT and SRC-INT. TOP-02: 6 konten · 4 akun unik. ("terkonfirmasi" ⏳ spec 005) | NAC-20, M-206.2       | ✅     |
| 3.3 | operator | `/sumber` → **"Impor laporan patroli Sagara (B-103)"**                                   | E-08 (field confirmation) added to G-102                                                                                                                                                             | G-DEMO-16             | ✅     |
| 3.4 | analis   | `/kejadian/G-102` → tick E-08 → `resolved` → note → save → publish the briefing          | Event "Selesai (Resolved)". The briefing states **"bukan ancaman"**. **The correlation stays "BUKTI BELUM LENGKAP"**: only SRC-SAT is still missing, because there is no scene in the window       | G-DEMO-16, NAC-20     | ✅     |

**Talking point:** _"Asapnya nyata, ancamannya tidak. Sistem tidak menutup celah data. Citra satelit tetap tercatat
belum ada."_

## 8. DS-4 — Nila land change: graceful limits

| #   | Role   | Do                          | You should see                                                                                     | Check     | Status |
| --- | ------ | --------------------------- | -------------------------------------------------------------------------------------------------- | --------- | ------ |
| 4.1 | analis | `/peta/AOI-03/bandingkan`   | "Pasangan Citra Belum Tersedia untuk Dataran Nila", "KONTROL PEMBANDING NONAKTIF", awan 38%        | G-DEMO-03 | ✅     |
| 4.2 | analis | `/kejadian/G-103`           | Correlation TOP-03: 12 konten · 4 akun unik, scene E-05, missing source SRC-INT listed                  | NAC-21    | ✅     |

## 9. Wrap-up — leadership view

| #   | Role     | Do                                                    | You should see                                                                                                                                         | Check        | Status |
| --- | -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------ |
| W.1 | pimpinan | Switch to Pimpinan → `/kejadian/G-101`                | "Briefing Resmi Disetujui (Versi 2)" and the box "Narasi terbuka saat briefing disetujui (jumlah saja):" with 10 konten · 10 akun unik · 2 aktor lintas kejadian. **No `@` handles anywhere** | NAC-26, M-202 | ✅ |
| W.2 | pimpinan | "Buka Lembar Briefing Cetak" → "Cetak Dokumen / Simpan PDF" | The printable briefing with the narrative totals section                                                                                         | G-DEMO-07    | ✅     |
| W.3 | pimpinan | `/kejadian/G-102`                                     | Counts only, "Korelasi belum lengkap", no "RAB" text. Briefing totals: TOP-02 6 · 4 · 2, TOP-01 2 · 2 · 0                                              | NAC-25, M-206.3 | ✅  |

**Talking point:** _"Pimpinan melihat jumlah, bukan identitas akun."_

## 10. Troubleshooting

| Symptom                                    | Fix                                                                                                                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Counts or events look wrong after rehearsal | Reset as Operator (§2 step 4)                                                                                                                                                                       |
| Data still looks old after reset            | DevTools → Application → Local Storage → delete `geosint-demo-v2` and `geosint-role-v1`, then reload. ⚠️ The automatic self-heal (`loadStateFromStorage`) is never called, so old state is only ignored in memory |
| "AKSES DITOLAK (FORBIDDEN · 403)"           | Wrong role for the page. Use "Masuk sebagai …" on that screen or the sidebar role buttons                                                                                                           |
| Briefing shows an older version             | Reload the page or pick "(Terkini)" in "Arsip Versi:"                                                                                                                                                |
| Red toast at 1.4                            | Expected. That refusal is the point of the step                                                                                                                                                      |

## 11. After the demo

- Reset as Operator.
- Detailed checks: `M-xxx` rows in `docs/specs/*/checklists/test-case.md`. Scenario intent: `scenarios.md`.
