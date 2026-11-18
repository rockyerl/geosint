import { describe, it, expect, beforeEach } from "vitest";
import { GeosintRepository, getSourceFreshness } from "@/features/geosint/repository";
import { INITIAL_FIXTURE } from "@/features/geosint/fixtures";

describe("GEOSINT Prototype Verification (G-DEMO-01 s/d G-DEMO-21)", () => {
  let repo: GeosintRepository;

  beforeEach(() => {
    repo = new GeosintRepository(INITIAL_FIXTURE);
  });

  // G-DEMO-01: Mulai dari seed sebagai analis
  // Dashboard menunjukkan 3 kejadian aktif, 2 menunggu tinjauan, 1 menunggu konfirmasi
  it("G-DEMO-01: Seed state provides exactly 3 areas, 3 active events, 2 pending review, 1 follow up required", () => {
    const kpis = repo.getKpis();
    expect(kpis.totalAreas).toBe(3);
    expect(kpis.activeEvents).toBe(3);
    expect(kpis.pendingReview).toBe(2);
    expect(kpis.followUpRequired).toBe(1);
    expect(kpis.resolvedEvents).toBe(0);

    const { events } = repo.listEvents("analis");
    expect(events.length).toBe(3);
  });

  // G-DEMO-02: Buka G-101 dan tarik slider
  // Dua tanggal dari AOI-01 terlihat, penanda umur data dan sumber tampil, posisi kedua citra sejajar
  it("G-DEMO-02: Comparison for AOI-01 returns valid paired scenes (SC-01 and SC-02) with timestamps", () => {
    const res = repo.getComparison("analis", "AOI-01", "SC-01", "SC-02");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.before.id).toBe("SC-01");
      expect(res.after.id).toBe("SC-02");
      expect(res.before.capturedAt).toBe("2026-11-12T06:20:00+07:00");
      expect(res.after.capturedAt).toBe("2026-11-17T06:20:00+07:00");
      expect(res.before.sensor).toBe("Radar simulasi");
      expect(res.after.sensor).toBe("Radar simulasi");
      expect(res.floodOutline).toBeDefined();
    }
  });

  // G-DEMO-03: Buka pembanding AOI-03
  // Aplikasi menampilkan citra tunggal dan status pasangan belum tersedia
  it("G-DEMO-03: Comparison for AOI-03 fails gracefully with INVALID_PAIR when pair does not exist", () => {
    const res = repo.getComparison("analis", "AOI-03", "SC-03", "SC-UNKNOWN");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.code).toBe("INVALID_PAIR");
      expect(res.error).toContain("Pasangan citra belum tersedia");
    }
  });

  // G-DEMO-04: Ubah G-101 ke perlu konfirmasi dengan E-02 dan catatan
  // Status dan KPI berubah. Riwayat menunjukkan pelaku, waktu dan bukti.
  it("G-DEMO-04: Transition G-101 from pending_review to follow_up_required with evidence and note", () => {
    const res = repo.reviewEvent(
      "analis",
      "G-101",
      "follow_up_required",
      "Perlu konfirmasi pengecekan lapangan terkait genangan alur Aruna",
      ["E-02"]
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.event.status).toBe("follow_up_required");
      expect(res.review.actorId).toBe("analis-01");
      expect(res.review.evidenceIds).toContain("E-02");
    }

    const kpis = repo.getKpis();
    expect(kpis.pendingReview).toBe(1);
    expect(kpis.followUpRequired).toBe(2);

    const state = repo.getState();
    expect(state.audits[0].action).toBe("review");
    expect(state.audits[0].targetId).toBe("G-101");
  });

  // G-DEMO-05: Coba selesaikan G-101 sebelum E-06 masuk
  // Aksi dikembalikan sebagai EVIDENCE_REQUIRED. Status dan briefing tetap pada versi sebelumnya
  it("G-DEMO-05: Attempting to resolve G-101 without field_confirmation returns EVIDENCE_REQUIRED", () => {
    // First transition to follow_up_required
    repo.reviewEvent("analis", "G-101", "follow_up_required", "Minta konfirmasi", ["E-01"]);

    // Attempt to resolve without field_confirmation evidence (E-06)
    const res = repo.reviewEvent("analis", "G-101", "resolved", "Selesai tanpa konfirmasi", [
      "E-01",
    ]);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.code).toBe("EVIDENCE_REQUIRED");
      expect(res.error).toContain("field_confirmation");
    }

    const ev = repo.getEvent("analis", "G-101");
    if (ev.success) {
      expect(ev.data.event.status).toBe("follow_up_required");
    }
  });

  // G-DEMO-06: Impor batch invalid lalu valid dua kali
  // Batch invalid tidak menambah bukti. E-06 masuk sekali dan pengulangan dilaporkan duplikat
  it("G-DEMO-06: Invalid import rejected; valid import accepted once and duplicate detected on second run", () => {
    const stateBefore = repo.getState();
    const initialEvidenceCount = stateBefore.evidence.length;

    // 1. Invalid import (B-102)
    const invalidRes = repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.invalidImport);
    expect(invalidRes.success).toBe(false);
    if (!invalidRes.success) {
      expect(invalidRes.code).toBe("INVALID_BATCH");
      expect(invalidRes.error).toBe("AOI tidak dikenal");
    }
    expect(repo.getState().evidence.length).toBe(initialEvidenceCount);

    // 2. Valid import (B-101 with E-06)
    const validDraft = INITIAL_FIXTURE.demoActions.validImport;
    const validRes1 = repo.simulateImport("operator", validDraft);
    expect(validRes1.success).toBe(true);
    if (validRes1.success) {
      expect(validRes1.isDuplicate).toBe(false);
    }
    expect(repo.getState().evidence.length).toBe(initialEvidenceCount + 1);

    // Check that E-06 is associated with G-101
    const eventG101 = repo.getState().events.find((e) => e.id === "G-101");
    expect(eventG101?.evidenceIds).toContain("E-06");

    // Check that source freshness for SRC-INT updated
    const srcInt = repo.getState().sources.find((s) => s.id === "SRC-INT")!;
    expect(getSourceFreshness(srcInt, repo.getState().demoNow)).toBe("ready");

    // 3. Repeat valid import (duplicate test)
    const validRes2 = repo.simulateImport("operator", validDraft);
    expect(validRes2.success).toBe(true);
    if (validRes2.success) {
      expect(validRes2.isDuplicate).toBe(true);
    }
    expect(repo.getState().evidence.length).toBe(initialEvidenceCount + 1);
  });

  // G-DEMO-07: Tinjau E-06, selesaikan G-101, setujui briefing
  // Tersedia versi briefing yang dapat dicetak oleh pimpinan. Wallboard menampilkan KPI terbaru
  it("G-DEMO-07: Full workflow resolution of G-101 with E-06 and briefing approval", () => {
    // 1. First move to follow_up_required
    repo.reviewEvent("analis", "G-101", "follow_up_required", "Menunggu konfirmasi lapangan", [
      "E-02",
    ]);

    // 2. Import E-06
    repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.validImport);

    // 3. Resolve G-101 with E-06
    const resolveRes = repo.reviewEvent(
      "analis",
      "G-101",
      "resolved",
      "Genangan telah diverifikasi lapangan dan jalur alternatif aman",
      ["E-02", "E-06"]
    );
    expect(resolveRes.success).toBe(true);
    if (resolveRes.success) {
      expect(resolveRes.event.status).toBe("resolved");
    }

    // 4. Publish briefing
    const briefRes = repo.publishBriefing("analis", "G-101", {
      findings: "Genangan telah terverifikasi aman untuk rute latihan.",
      limitations: "Pengamatan lokal akurat.",
      nextAction: "Lanjutkan latihan sesuai rencana operasi.",
    });
    expect(briefRes.success).toBe(true);
    if (briefRes.success) {
      expect(briefRes.briefing.version).toBe(1);
      expect(briefRes.briefing.snapshot.status).toBe("resolved");
    }

    // Wallboard/Pimpinan KPI check
    const kpis = repo.getKpis();
    expect(kpis.activeEvents).toBe(2); // G-102 & G-103
    expect(kpis.resolvedEvents).toBe(1); // G-101
  });

  // G-DEMO-08: Ganti peran ke pimpinan lalu buka URL serba detail
  // Layar menampilkan proyeksi ringkas. Bukti lengkap, catatan internal dan aksi ubah tidak tampil
  // Proyeksi ini hanya di repository/UI, bukan kontrol akses: peran dipilih di browser (ADR-002)
  it("G-DEMO-08: Repository projection hides internal notes from pimpinan and blocks mutations (UI projection, not access control)", () => {
    // Analyst leaves an internal review note
    repo.reviewEvent("analis", "G-101", "follow_up_required", "CATATAN_INTERNAL_ANALIS_RAHASIA", [
      "E-01",
    ]);

    // Pimpinan queries G-101
    const pimpinanView = repo.getEvent("pimpinan", "G-101");
    expect(pimpinanView.success).toBe(true);
    if (pimpinanView.success && pimpinanView.role === "pimpinan") {
      // Must NOT contain internal reviews array or draft summary builder
      expect("reviews" in pimpinanView.data).toBe(false);
      expect("draftSummary" in pimpinanView.data).toBe(false);
      expect(pimpinanView.data.title).toBe("Indikasi genangan Sektor Sungai Aruna");
    }

    // Pimpinan cannot review events
    const mutateRes = repo.reviewEvent(
      "pimpinan",
      "G-101",
      "resolved",
      "Pimpinan mencoba merubah",
      ["E-01"]
    );
    expect(mutateRes.success).toBe(false);
    if (!mutateRes.success) {
      expect(mutateRes.code).toBe("FORBIDDEN");
    }

    // Operator cannot view comparison
    const compRes = repo.getComparison("operator", "AOI-01", "SC-01", "SC-02");
    expect(compRes.success).toBe(false);
    if (!compRes.success) {
      expect(compRes.code).toBe("FORBIDDEN");
    }
  });

  // G-DEMO-09: Reset demo as operator restores seed state and demo timestamp
  it("G-DEMO-09: Operator reset restores original seed state and initial demo timestamp", () => {
    // Perform modifications
    repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.validImport);
    repo.reviewEvent("analis", "G-101", "follow_up_required", "Modifikasi", ["E-01"]);

    expect(repo.getState().evidence.length).toBe(6);

    // Operator resets demo
    const resetRes = repo.resetDemo("operator", true);
    expect(resetRes.success).toBe(true);

    const kpis = repo.getKpis();
    expect(kpis.activeEvents).toBe(3);
    expect(kpis.pendingReview).toBe(2);
    expect(kpis.followUpRequired).toBe(1);
    expect(kpis.resolvedEvents).toBe(0);

    const state = repo.getState();
    expect(state.evidence.length).toBe(5);
    expect(state.demoNow).toBe("2026-11-17T09:00:00+07:00");
    expect(state.audits[0].action).toBe("reset");
  });

  // G-DEMO-10: Offline validation - all scenes point to local assets, source freshness accurately computed
  it("G-DEMO-10: Self-contained offline data contract - all asset paths local, source telemetry deterministic", () => {
    const scenes = repo.getState().scenes;
    for (const scene of scenes) {
      expect(scene.assetPath.startsWith("/demo/")).toBe(true);
      expect(scene.assetPath.startsWith("http")).toBe(false);
    }

    const sources = repo.getState().sources;
    const now = repo.getState().demoNow;

    const satFreshness = getSourceFreshness(
      sources.find((s) => s.id === "SRC-SAT")!,
      now
    );
    const firmsFreshness = getSourceFreshness(
      sources.find((s) => s.id === "SRC-FIRMS")!,
      now
    );
    const gdeltFreshness = getSourceFreshness(
      sources.find((s) => s.id === "SRC-GDELT")!,
      now
    );

    expect(satFreshness).toBe("ready");
    expect(firmsFreshness).toBe("delayed");
    expect(gdeltFreshness).toBe("ready");
  });

  // G-DEMO-11: Muat preset Aruna 48 jam
  // G-101 terlihat. Topik Aruna menghitung 10 konten dalam dua bucket 2 dan 8.
  // NC-11 berada di kelompok lokasi belum diketahui. E-01 tetap tersedia sebagai citra acuan historis.
  it("G-DEMO-11: Aruna 48h preset loads G-101, 10 narrative items with 2 and 8 trend buckets, NC-11 unlocated, SC-01 historical", () => {
    const preset = repo.getState().demoPreset;
    expect(preset.aoiId).toBe("AOI-01");
    expect(preset.topicId).toBe("TOP-01");

    const res = repo.getCorrelationWorkspace("analis", preset.aoiId, preset.window, preset.topicId);
    expect(res.success).toBe(true);

    if (res.success) {
      const data = res.data;
      // G-101 is visible in the period
      expect(data.eventsInPeriod.some((e) => e.id === "G-101")).toBe(true);

      // Topik Aruna menghitung 10 konten yang menyebut Aruna
      expect(data.narrativeItemsInWindow.length).toBe(10);
      expect(data.narrativeItemsInWindow.every((n) => n.mentionedAoiId === "AOI-01")).toBe(true);

      // Dua bucket tren 24 jam berturut-turut bernilai 2 dan 8
      expect(data.narrativeTrendBuckets.length).toBe(2);
      expect(data.narrativeTrendBuckets[0].count).toBe(2);
      expect(data.narrativeTrendBuckets[1].count).toBe(8);

      // NC-11 berada di kelompok lokasi belum diketahui dan tidak masuk hitungan Aruna
      expect(data.unlocatedNarrativeItems.length).toBe(1);
      expect(data.unlocatedNarrativeItems[0].id).toBe("NC-11");
      expect(data.unlocatedNarrativeItems[0].mentionedAoiId).toBeNull();
      expect(data.narrativeItemsInWindow.some((n) => n.id === "NC-11")).toBe(false);

      // E-01 / SC-01 tetap tersedia sebagai citra acuan historis di luar jendela
      expect(data.historicalReferenceScenes.some((s) => s.id === "SC-01")).toBe(true);
      expect(data.scenesInPeriod.some((s) => s.id === "SC-02")).toBe(true);
    }
  });

  // G-DEMO-12: Telusuri kandidat Aruna
  // Bukti menyertakan E-02, E-03, serta rekaman topik yang lolos. NC-07 memiliki wilayah disebut Aruna dan lokasi unggahan belum tersedia.
  it("G-DEMO-12: Tracing Aruna correlation candidate includes E-02, E-03, and filtered narrative items; NC-07 details", () => {
    const preset = repo.getState().demoPreset;
    const res = repo.getCorrelationWorkspace("analis", preset.aoiId, preset.window, preset.topicId);
    expect(res.success).toBe(true);

    if (res.success) {
      const g101Candidate = res.data.candidateCorrelations.find((c) => c.eventId === "G-101");
      expect(g101Candidate).toBeDefined();
      expect(g101Candidate?.status).toBe("candidate");
      expect(g101Candidate?.basis).toBe("same_area_and_time");
      expect(g101Candidate?.evidenceIds).toContain("E-02");
      expect(g101Candidate?.evidenceIds).toContain("E-03");
      expect(g101Candidate?.narrativeItemIds.length).toBe(10);
      expect(g101Candidate?.missingSources.length).toBe(0);
    }

    // NC-07 metadata checking
    const itemRes = repo.getNarrativeItem("analis", "NC-07");
    expect(itemRes.success).toBe(true);
    if (itemRes.success) {
      expect(itemRes.item.id).toBe("NC-07");
      expect(itemRes.item.mentionedAoiId).toBe("AOI-01"); // Wilayah disebut Aruna
      expect(itemRes.item.publishedAoiId).toBeNull(); // Wilayah unggahan belum tersedia
    }
  });

  // G-DEMO-13: Ganti AOI ke Nila dalam periode yang sama
  // Panel Aruna diperbarui. Tidak ada kelompok narasi Aruna atau kandidat lengkap untuk Nila.
  it("G-DEMO-13: Switching AOI to Dataran Nila updates workspace; no Aruna narratives or complete candidate for Nila", () => {
    const preset = repo.getState().demoPreset;
    const res = repo.getCorrelationWorkspace("analis", "AOI-03", preset.window, preset.topicId);
    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.data.aoi.id).toBe("AOI-03");
      // Tidak ada konten narasi Aruna yang menyebut AOI-03
      expect(res.data.narrativeItemsInWindow.length).toBe(0);
      // Tidak ada kandidat korelasi lengkap (semua berstatus insufficient_evidence)
      expect(
        res.data.candidateCorrelations.every((c) => c.status === "insufficient_evidence")
      ).toBe(true);
      const nilaCandidate = res.data.candidateCorrelations.find((c) => c.eventId === "G-103");
      expect(nilaCandidate).toBeDefined();
      expect(nilaCandidate?.status).toBe("insufficient_evidence");
      expect(nilaCandidate?.missingSources.length).toBeGreaterThan(0);
    }
  });

  // G-DEMO-15: Terbitkan briefing awal, impor E-06, lalu terbitkan ulang
  // Versi awal memuat korelasi dan permintaan cek. Setelah impor, versi awal tetap tersimpan (tidak dihapus).
  // Versi baru memuat laporan lanjutan dan hasil peninjauan analis.
  it("G-DEMO-15: Publish initial briefing, import E-06, then republish v2; v1 retained, v2 contains updated resolution", () => {
    // 1. Initial review & publish v1 briefing
    repo.reviewEvent(
      "analis",
      "G-101",
      "follow_up_required",
      "Pemeriksaan lapangan diminta untuk akses Sektor Aruna",
      ["E-02", "E-03"]
    );

    const brief1 = repo.publishBriefing("analis", "G-101", {
      findings: "Indikasi genangan SAR teramati dan narasi akses terputus meningkat.",
      limitations: "Verifikasi terestrial belum memadai.",
      nextAction: "Minta petugas cek akses di Sektor Aruna dan laporkan kondisi terkini.",
      aoiId: "AOI-01",
      topicId: "TOP-01",
      narrativeItemIds: ["NC-01", "NC-02", "NC-03"],
    });
    expect(brief1.success).toBe(true);
    if (brief1.success) {
      expect(brief1.briefing.version).toBe(1);
      expect(brief1.briefing.snapshot.nextAction).toContain("cek akses di Sektor Aruna");
    }

    // 2. Operator imports E-06
    const impRes = repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.validImport);
    expect(impRes.success).toBe(true);

    // 3. Analis resolves G-101 with E-06
    const resolveRes = repo.reviewEvent(
      "analis",
      "G-101",
      "resolved",
      "Petugas mengonfirmasi genangan sebagian area dan pengalihan satu akses.",
      ["E-02", "E-03", "E-06"]
    );
    expect(resolveRes.success).toBe(true);

    // 4. Analis publishes v2 briefing
    const brief2 = repo.publishBriefing("analis", "G-101", {
      findings: "Konfirmasi lapangan diterima: genangan sebagian dan pengalihan satu akses.",
      limitations: "Pengamatan lapangan selesai.",
      nextAction: "Rute alternatif aman digunakan untuk manuver latihan.",
      aoiId: "AOI-01",
      topicId: "TOP-01",
      narrativeItemIds: ["NC-01", "NC-02", "NC-03", "NC-07"],
    });
    expect(brief2.success).toBe(true);
    if (brief2.success) {
      expect(brief2.briefing.version).toBe(2);
      expect(brief2.briefing.snapshot.status).toBe("resolved");
      expect(brief2.briefing.snapshot.evidenceIds).toContain("E-06");
    }

    // 5. Check event briefings array: both v1 and v2 exist
    const state = repo.getState();
    const g101Briefings = state.briefings.filter((b) => b.eventId === "G-101");
    expect(g101Briefings.length).toBe(2);
    expect(g101Briefings.some((b) => b.version === 1)).toBe(true);
    expect(g101Briefings.some((b) => b.version === 2)).toBe(true);
  });

  // G-DEMO-16: DS-3 ending. Operator imports B-103 (E-08), analis resolves G-102 and publishes.
  it("G-DEMO-16: Sagara patrol import (B-103/E-08) lets analis resolve G-102 and publish a briefing saying 'bukan ancaman'", () => {
    const draftBefore = repo.getEvent("analis", "G-102");
    expect(draftBefore.success).toBe(true);
    if (draftBefore.success) {
      expect(draftBefore.data.draftSummary.findings).not.toContain("bukan ancaman");
    }

    // Analis may not import
    const forbidden = repo.simulateImport("analis", INITIAL_FIXTURE.demoActions.sagaraImport);
    expect(forbidden.success).toBe(false);
    if (!forbidden.success) {
      expect(forbidden.code).toBe("FORBIDDEN");
    }

    // Operator imports B-103
    const imp = repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.sagaraImport);
    expect(imp.success).toBe(true);
    if (imp.success) {
      expect(imp.isDuplicate).toBe(false);
    }
    const g102 = repo.getState().events.find((e) => e.id === "G-102");
    expect(g102?.evidenceIds).toContain("E-08");

    // Draft now states the conclusion and cites E-08
    const draftAfter = repo.getEvent("analis", "G-102");
    expect(draftAfter.success).toBe(true);
    if (!draftAfter.success) return;
    const draft = draftAfter.data.draftSummary;
    expect(draft.findings).toContain("bukan ancaman");
    expect(draft.findings).toContain("E-08");

    // Resolve with E-08
    const resolveRes = repo.reviewEvent(
      "analis",
      "G-102",
      "resolved",
      "Patroli mengonfirmasi pembakaran lahan terkendali oleh warga",
      ["E-04", "E-08"]
    );
    expect(resolveRes.success).toBe(true);
    if (resolveRes.success) {
      expect(resolveRes.event.status).toBe("resolved");
    }

    // Publish the briefing from the draft
    const briefRes = repo.publishBriefing("analis", "G-102", {
      findings: draft.findings,
      limitations: draft.limitations,
      nextAction: draft.nextAction,
    });
    expect(briefRes.success).toBe(true);
    if (briefRes.success) {
      expect(briefRes.briefing.version).toBe(1);
      expect(briefRes.briefing.snapshot.status).toBe("resolved");
      expect(briefRes.briefing.snapshot.findings).toContain("bukan ancaman");
      expect(briefRes.briefing.snapshot.evidenceIds).toContain("E-08");
    }

    // KPI: G-101 and G-103 active, G-102 resolved
    const kpis = repo.getKpis();
    expect(kpis.activeEvents).toBe(2);
    expect(kpis.resolvedEvents).toBe(1);
  });

  // G-DEMO-17: unknown event reference is rejected and logged
  it("G-DEMO-17: Import with unknown eventId is rejected with INVALID_BATCH, logged as failed, and adds no evidence", () => {
    const evidenceBefore = repo.getState().evidence.length;

    const res = repo.simulateImport("operator", {
      batchId: "B-198",
      evidence: {
        id: "E-98",
        eventId: "G-999",
        sourceId: "SRC-INT",
        kind: "field_report",
        observedAt: "2026-11-17T08:00:00+07:00",
        label: "Uji: kejadian tidak dikenal",
      },
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.code).toBe("INVALID_BATCH");
      expect(res.error).toContain("Kejadian tidak dikenal");
    }

    const state = repo.getState();
    expect(state.evidence.length).toBe(evidenceBefore);
    expect(state.batchLogs[0].batchId).toBe("B-198");
    expect(state.batchLogs[0].status).toBe("failed");
    expect(state.batchLogs[0].reason).toContain("Kejadian tidak dikenal");
    expect(state.processedBatchIds).not.toContain("B-198");
    expect(state.audits[0].success).toBe(false);
  });

  // G-DEMO-18: validation depends on references, never on the batch ID
  it("G-DEMO-18: Import validation rejects unknown AOI, unknown source and empty payload, and accepts a valid batch named B-102", () => {
    const aoiRes = repo.simulateImport("operator", { batchId: "B-199", aoiId: "AOI-99" });
    expect(aoiRes.success).toBe(false);
    if (!aoiRes.success) {
      expect(aoiRes.code).toBe("INVALID_BATCH");
      expect(aoiRes.error).toBe("AOI tidak dikenal");
    }
    // N2: item counts derive from the payload (no evidence item in this batch)
    expect(repo.getState().batchLogs[0].itemCount).toBe(0);

    const sourceRes = repo.simulateImport("operator", {
      batchId: "B-197",
      evidence: {
        id: "E-97",
        eventId: "G-101",
        sourceId: "SRC-XXX",
        kind: "field_report",
        observedAt: "2026-11-17T08:00:00+07:00",
        label: "Uji: sumber tidak dikenal",
      },
    });
    expect(sourceRes.success).toBe(false);
    if (!sourceRes.success) {
      expect(sourceRes.code).toBe("INVALID_BATCH");
      expect(sourceRes.error).toBe("Sumber tidak dikenal");
    }
    // N2: one evidence item in the payload, and it failed
    expect(repo.getState().batchLogs[0].itemCount).toBe(1);
    expect(repo.getState().batchLogs[0].failedCount).toBe(1);

    const emptyRes = repo.simulateImport("operator", { batchId: "B-196" });
    expect(emptyRes.success).toBe(false);
    if (!emptyRes.success) {
      expect(emptyRes.code).toBe("INVALID_BATCH");
      expect(emptyRes.error).toBe("Payload batch tidak valid");
    }
    // N2: an empty batch has nothing to count or fail
    expect(repo.getState().batchLogs[0].itemCount).toBe(0);
    expect(repo.getState().batchLogs[0].failedCount).toBe(0);

    // A valid batch that happens to be named B-102 must succeed
    const validRes = repo.simulateImport("operator", {
      batchId: "B-102",
      evidence: {
        id: "E-96",
        eventId: "G-101",
        sourceId: "SRC-INT",
        kind: "field_report",
        observedAt: "2026-11-17T08:00:00+07:00",
        label: "Uji: ID batch bukan pemicu",
      },
    });
    expect(validRes.success).toBe(true);
  });

  // G-DEMO-19: resolve rule applies to every event (D1)
  it("G-DEMO-19: Resolving G-102 without field_confirmation returns EVIDENCE_REQUIRED and leaves status unchanged", () => {
    const res = repo.reviewEvent("analis", "G-102", "resolved", "Selesai tanpa konfirmasi", [
      "E-04",
    ]);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.code).toBe("EVIDENCE_REQUIRED");
      expect(res.error).toContain("field_confirmation");
    }

    const g102 = repo.getState().events.find((e) => e.id === "G-102");
    expect(g102?.status).toBe("follow_up_required");
  });

  // G-DEMO-20: deterministic audit and review IDs (FIX-009)
  it("G-DEMO-20: Audit and review IDs are counter-based, identical across fresh repos, and restart after reset", () => {
    const runSteps = (r: GeosintRepository) => {
      r.reviewEvent("analis", "G-101", "follow_up_required", "Minta konfirmasi lapangan", ["E-02"]);
      r.simulateImport("operator", INITIAL_FIXTURE.demoActions.validImport);
      r.publishBriefing("analis", "G-101", {
        findings: "Temuan uji.",
        limitations: "Batasan uji.",
        nextAction: "Tindak lanjut uji.",
      });
    };

    const other = new GeosintRepository(INITIAL_FIXTURE);
    runSteps(repo);
    runSteps(other);

    // Three audit writers ran: review, import, publish (newest first)
    const expectedIds = ["AUD-0003", "AUD-0002", "AUD-0001"];
    expect(repo.getState().audits.map((a) => a.id)).toEqual(expectedIds);
    expect(other.getState().audits.map((a) => a.id)).toEqual(expectedIds);
    expect(repo.getState().audits).toEqual(other.getState().audits);

    const g101Reviews = repo.getState().reviews.filter((r) => r.eventId === "G-101");
    expect(g101Reviews[0].id).toBe("REV-0001");

    const resetRes = repo.resetDemo("operator", true);
    expect(resetRes.success).toBe(true);
    const audits = repo.getState().audits;
    expect(audits.length).toBe(1);
    expect(audits[0].id).toBe("AUD-0001");
  });

  // G-DEMO-21: resolve-hint flag is generic, driven by the analis projection (N1)
  it("G-DEMO-21: Analis projection flags missingFieldConfirmation until a field_confirmation is linked; pimpinan projection omits it", () => {
    const flagOf = (eventId: string): boolean | undefined => {
      const res = repo.getEvent("analis", eventId);
      return res.success && res.role === "analis" ? res.data.missingFieldConfirmation : undefined;
    };

    // Seed: G-102 is unresolved and has no field_confirmation evidence
    expect(flagOf("G-102")).toBe(true);

    // pimpinan projection never carries the flag
    const pimpinanView = repo.getEvent("pimpinan", "G-102");
    expect(pimpinanView.success).toBe(true);
    expect(pimpinanView.success && pimpinanView.role).toBe("pimpinan");
    if (pimpinanView.success && pimpinanView.role === "pimpinan") {
      expect("missingFieldConfirmation" in pimpinanView.data).toBe(false);
    }

    // DS-3: B-103 links E-08 (field_confirmation) to G-102
    repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.sagaraImport);
    expect(flagOf("G-102")).toBe(false);

    // DS-1: G-101 is flagged until B-101 is imported, and stays false once resolved
    expect(flagOf("G-101")).toBe(true);
    const followUp = repo.reviewEvent(
      "analis",
      "G-101",
      "follow_up_required",
      "Minta konfirmasi lapangan",
      ["E-02"]
    );
    expect(followUp.success).toBe(true);
    repo.simulateImport("operator", INITIAL_FIXTURE.demoActions.validImport);
    const resolve = repo.reviewEvent(
      "analis",
      "G-101",
      "resolved",
      "Petugas mengonfirmasi genangan.",
      ["E-02", "E-06"]
    );
    expect(resolve.success).toBe(true);
    if (resolve.success) {
      expect(resolve.event.status).toBe("resolved");
    }
    expect(flagOf("G-101")).toBe(false);
  });
});
