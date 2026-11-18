# AI CODING AGENT GUIDELINES (SUNDAWA AI-01 s/d AI-08)

Repositori ini mengikuti **SUNDAWA Code Setup Standards**. Setiap AI Assistant / Coding Agent yang beroperasi di repositori ini WAJIB mematuhi ketentuan berikut:

1. **Boundary & Arsitektur (AI-01, AI-02):**
   - Hormati arsitektur Feature-Driven modular: Routing (`src/app`), Features/Vertical Slices (`src/features/*`), Shared UI Primitives (`src/shared`), dan Persistence (`src/db`).
   - Jangan melakukan refactoring spekulatif pada berkas yang tidak diminta oleh pengguna.
   - Periksa schema database (`src/db/schema.ts`) dan tipe data sebelum menambahkan fitur baru.

2. **Kerahasiaan & Data Pribadi (AI-03):**
   - JANGAN PERNAH menyisipkan kredensial asli, token API rahasia, atau data nasabah/pengguna nyata ke dalam kode, prompt, atau fixtures tes.
   - Selalu gunakan data dummy representatif pada seeder dan pengujian.

3. **Integritas Keamanan & Otorisasi (SEC-07, BE-03):**
   - JANGAN PERNAH mengandalkan proteksi sisi klien (UI semata). Setiap mutasi (Server Action) dan pembacaan data WAJIB memeriksa sesi dan hak akses (`requireAuth` / `requirePermission`).
   - Password WAJIB di-hash menggunakan fungsi `hashPassword` (`bcryptjs`). Dilarang menyimpan plaintext.

4. **Kualitas Kode & Verifikasi Wajib (AI-04, Universal Command):**
   - Sebelum menyelesaikan tugas, selalu jalankan dan pastikan lolos:
     ```bash
     pnpm check
     ```
     (Menjalankan `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, dan `pnpm test`).
   - Jangan menekan atau mengabaikan peringatan linter (`// eslint-disable`) tanpa justifikasi teknis yang disetujui.

5. **Disiplin Basis Data (AI-05):**
   - Dilarang menjalankan migrasi destruktif (`drop table/column`) tanpa konfirmasi eksplisit dari Tech Lead.
   - Skema database harus terdefinisi di `src/db/schema.ts` dan disinkronkan melalui Drizzle Kit (`pnpm db:push` / `pnpm db:generate`).

6. **Project guide (update 2026-11-19):**
   - This file holds the binding rules. The project process lives in [`CLAUDE.md`](CLAUDE.md): what the project is, where things are, commands, domain terms, PoC rules, known issues, docs policy and workflow. Every agent reads `CLAUDE.md` before working, whatever tool it runs in. In `CLAUDE.md` and the docs it lists, the newest "Update <date>" section wins.
   - The workflow is `CLAUDE.md` §9: read the spec and the decided questions → plan and get approval → build → tests → review, with the working docs updated in the same change. Agents without Claude Code subagents follow the same phases in one session, as written in `.claude/skills/feature-flow/SKILL.md`.
   - How the GEOSINT PoC meets two rules above (decided, recorded in `CLAUDE.md`):
     - Rule 3 (SEC-07): GEOSINT roles are UI-only on synthetic data (ADR-002, `docs/questions.md` Q13), and the UI calls them demo roles. The template modules (auth, users, roles) still check `requireAuth` / `requirePermission`.
     - Rule 4 (AI-04), exception for this PoC: `pnpm check` must pass before a task is closed. The developer runs it and pastes the result. Agents do not run pnpm, tests or the dev server.
