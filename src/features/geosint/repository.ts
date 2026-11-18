import { INITIAL_FIXTURE, STORAGE_KEY } from "./fixtures";
import {
  Area,
  AuditEntry,
  BatchLog,
  Briefing,
  BriefingSnapshot,
  DemoState,
  EventFilter,
  EventStatus,
  EventSummaryProjection,
  Evidence,
  GeoEvent,
  ImportDraft,
  Review,
  Role,
  Scene,
  Source,
  SourceFreshness,
  Point,
  PimpinanEventDetail,
  AnalystEventDetail,
  MultiSourceCorrelation,
  NarrativeCluster,
  NarrativeItem,
  TimeWindow,
  CorrelationWorkspaceData,
  CorrelationTrendBucket,
  CorrelationFinding,
} from "./types";

export function getSourceFreshness(source: Source, demoNow: string): SourceFreshness {
  if (!source.lastSuccessfulImportAt) {
    return "unavailable";
  }
  const nowMs = new Date(demoNow).getTime();
  const lastMs = new Date(source.lastSuccessfulImportAt).getTime();
  const diffHours = (nowMs - lastMs) / (1000 * 60 * 60);
  if (diffHours <= source.freshForHours) {
    return "ready";
  }
  return "delayed";
}

export function advanceClockMinutes(isoTime: string, minutes: number = 1): string {
  const d = new Date(isoTime);
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hours}:${mins}:${secs}+07:00`;
}

export function loadStateFromStorage(): { state: DemoState; recoveredFromCorrupt: boolean } {
  if (typeof window === "undefined") {
    return { state: structuredClone(INITIAL_FIXTURE), recoveredFromCorrupt: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = structuredClone(INITIAL_FIXTURE);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return { state: initial, recoveredFromCorrupt: false };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.fixtureVersion !== 2 || !Array.isArray(parsed.events)) {
      throw new Error("Invalid schema structure");
    }
    return { state: parsed as DemoState, recoveredFromCorrupt: false };
  } catch {
    const restored = structuredClone(INITIAL_FIXTURE);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    } catch {
      // Ignore storage write errors
    }
    return { state: restored, recoveredFromCorrupt: true };
  }
}

export function saveStateToStorage(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage write error handling
  }
}

export function getCorrelations(eventId: string, state: DemoState): Evidence[] {
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return [];
  const eventTime = new Date(event.observedAt).getTime();
  const maxDiffMs = 48 * 60 * 60 * 1000;

  return state.evidence.filter((ev) => {
    if (ev.eventId === eventId) return false;
    const evEvent = state.events.find((e) => e.id === ev.eventId);
    if (!evEvent || evEvent.aoiId !== event.aoiId) return false;
    const evTime = new Date(ev.observedAt).getTime();
    return Math.abs(eventTime - evTime) <= maxDiffMs;
  });
}

/** Resolve rule (FIX-010): an event can be resolved only with a linked field_confirmation. */
export function hasFieldConfirmation(evidence: Evidence[]): boolean {
  return evidence.some((ev) => ev.kind === "field_confirmation");
}

export function generateDraftSummary(
  event: GeoEvent,
  evidenceList: Evidence[],
  area?: Area
): { findings: string; limitations: string; nextAction: string } {
  const areaName = area ? area.name : event.aoiId;
  const evLabels = evidenceList.map((e) => e.label).join("; ");

  let findings = `Berdasarkan pengamatan pada ${event.observedAt} di ${areaName}, teridentifikasi indikasi anomali [${event.kind}]. Bukti aktif: ${evLabels || "Belum ada bukti spesifik"}.`;
  let limitations = `Analisis berbasis citra radar/sensor fiktif resolusi menengah dengan dependensi verifikasi terestrial.`;
  let nextAction = `Pengecekan lapangan oleh satuan setempat diperlukan sebelum pimpinan menerbitkan rekomendasi akhir.`;

  if (event.kind === "flood") {
    findings = `Satelit Sentinel (Radar SAR simulasi SC-02) merekam indikasi genangan di alur ${areaName} koordinat [20, 68]. Laporan awal internal (E-03) mencatat satu akses dialihkan. Klaster narasi Akses Aruna Terputus (TOP-01) merekam kenaikan volume dari 2 menjadi 8 konten menyebut Aruna dalam dua periode 24 jam berturut-turut (total 10 konten).`;
    limitations = `Indikasi genangan SAR teramati secara spasial, namun kepastian keterputusan total jembatan dan batas kedalaman air masih memerlukan verifikasi fisik lapangan. Terdapat satu konten tanpa metadata wilayah (NC-11) dan agregat akun di bawah ambang batas minimum RAB (3 < 10 akun).`;
    nextAction = `Pimpinan menginstruksikan petugas lapangan segera mengecek akses jembatan KM 14 di Sektor Aruna dan melaporkan kondisi terkini untuk penilaian kesiapan rute latihan.`;
  } else if (event.kind === "hotspot") {
    // D2: once a field confirmation is linked, the draft states "bukan ancaman" (DS-3); spec 004 replaces the template.
    const fieldConfirmation = evidenceList.find((e) => e.kind === "field_confirmation");
    if (fieldConfirmation) {
      findings = `Sensor termal FIRMS simulasi mendeteksi klaster titik panas pada ${event.observedAt}. Konfirmasi lapangan (${fieldConfirmation.id}): ${fieldConfirmation.label}. Kesimpulan: asap memang ada, namun bukan ancaman.`;
      limitations = `Deteksi awal berasal dari sumber FIRMS yang tertunda (>12 jam); kesimpulan bertumpu pada laporan patroli lapangan.`;
      nextAction = `Tidak diperlukan tindakan lanjutan; titik panas berikutnya dipantau secara rutin.`;
    } else {
      findings = `Sensor termal FIRMS simulasi mendeteksi klaster titik panas pada ${event.observedAt} dengan tingkat kepercayaan awal.`;
      limitations = `Data sumber FIRMS saat ini berstatus tertunda (>12 jam). Belum ada citra optik resolusi tinggi resolusi awan rendah.`;
      nextAction = `Koordinasi petugas patroli Bukit Sagara untuk memastikan ada/tidaknya pembakaran vegetasi.`;
    }
  } else if (event.kind === "land_change") {
    findings = `Citra optik tunggal tertanggal ${event.observedAt} memperlihatkan variasi rona lahan pada koordinat sektor.`;
    limitations = `Tingkat tutupan awan mencapai 38%. Pasangan citra acuan sebelum perubahan belum tersedia untuk analisis differensiasi temporal.`;
    nextAction = `Minta penjadwalan akuisisi pasangan citra optik berikutnya sebelum menyimpulkan pembukaan lahan.`;
  }

  return { findings, limitations, nextAction };
}

// ---------------------------------------------------------------------------
// Pure Repository Implementation
// ---------------------------------------------------------------------------

type ImportValidation =
  | { ok: true; evidence: Evidence; event: GeoEvent; source: Source }
  | { ok: false; reason: string };

export class GeosintRepository {
  private state: DemoState;

  constructor(initialState?: DemoState) {
    this.state = initialState ? structuredClone(initialState) : structuredClone(INITIAL_FIXTURE);
  }

  public getState(): DemoState {
    return structuredClone(this.state);
  }

  public setState(newState: DemoState): void {
    this.state = structuredClone(newState);
  }

  public advanceClock(minutes: number = 1): void {
    this.state.demoNow = advanceClockMinutes(this.state.demoNow, minutes);
  }

  /** Deterministic audit ID derived from state: AUD-0001, AUD-0002, … (FIX-009; reset restarts at 0001). */
  private recordAudit(entry: Omit<AuditEntry, "id">): void {
    const id = `AUD-${String(this.state.audits.length + 1).padStart(4, "0")}`;
    this.state.audits.unshift({ id, ...entry });
  }

  /** Validates references in an import batch (FIX-006). Order matters: area, payload, event, source. */
  private validateImportDraft(draft: ImportDraft): ImportValidation {
    if (draft.aoiId !== undefined && !this.state.areas.some((a) => a.id === draft.aoiId)) {
      return { ok: false, reason: "AOI tidak dikenal" };
    }
    const evidence = draft.evidence;
    if (!evidence) {
      return { ok: false, reason: "Payload batch tidak valid" };
    }
    const event = this.state.events.find((e) => e.id === evidence.eventId);
    if (!event) {
      return { ok: false, reason: "Kejadian tidak dikenal" };
    }
    const source = this.state.sources.find((s) => s.id === evidence.sourceId);
    if (!source) {
      return { ok: false, reason: "Sumber tidak dikenal" };
    }
    return { ok: true, evidence, event, source };
  }

  /** Writes one import outcome: batch log, audit entry, then advances the demo clock 1 minute. */
  private logImportOutcome(
    log: Omit<BatchLog, "timestamp">,
    details: string,
    success: boolean
  ): void {
    this.state.batchLogs.unshift({ ...log, timestamp: this.state.demoNow });
    this.recordAudit({
      timestamp: this.state.demoNow,
      actorId: "operator-01",
      role: "operator",
      action: "import_batch",
      targetId: log.batchId,
      details,
      success,
    });
    this.advanceClock(1);
  }

  public listEvents(
    role: Role,
    filter?: EventFilter
  ): { events: EventSummaryProjection[] | GeoEvent[]; total: number } {
    let result = [...this.state.events];

    if (filter) {
      if (filter.aoiId && filter.aoiId !== "all") {
        result = result.filter((e) => e.aoiId === filter.aoiId);
      }
      if (filter.kind && filter.kind !== "all") {
        result = result.filter((e) => e.kind === filter.kind);
      }
      if (filter.status && filter.status !== "all") {
        result = result.filter((e) => e.status === filter.status);
      }
      if (filter.from) {
        result = result.filter((e) => new Date(e.observedAt) >= new Date(filter.from!));
      }
      if (filter.to) {
        result = result.filter((e) => new Date(e.observedAt) < new Date(filter.to!));
      }
      if (filter.timeWindowHours) {
        const windowMs = filter.timeWindowHours * 60 * 60 * 1000;
        const nowMs = new Date(this.state.demoNow).getTime();
        result = result.filter((e) => {
          const eMs = new Date(e.observedAt).getTime();
          return nowMs - eMs <= windowMs;
        });
      }
      if (filter.search && filter.search.trim() !== "") {
        const query = filter.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.id.toLowerCase().includes(query) ||
            e.aoiId.toLowerCase().includes(query)
        );
      }
    }

    // Sort: observedAt desc, then id asc
    result.sort((a, b) => {
      const timeDiff = new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.id.localeCompare(b.id);
    });

    if (role === "pimpinan") {
      const projected: EventSummaryProjection[] = result.map((e) => {
        const area = this.state.areas.find((a) => a.id === e.aoiId);
        const approvedBriefings = this.state.briefings
          .filter((b) => b.eventId === e.id)
          .sort((a, b) => b.version - a.version);

        const hasNarrative = (this.state.narrativeClusters || []).some(
          (n) => n.targetAoiId === e.aoiId
        );

        return {
          id: e.id,
          aoiId: e.aoiId,
          areaName: area ? area.name : e.aoiId,
          kind: e.kind,
          title: e.title,
          observedAt: e.observedAt,
          status: e.status,
          point: e.point,
          evidenceCount: e.evidenceIds.length,
          latestApprovedBriefing: approvedBriefings[0],
          hasCorrelatedNarrative: hasNarrative,
        };
      });
      return { events: projected, total: projected.length };
    }

    return { events: result, total: result.length };
  }

  public getEvent(
    role: "pimpinan",
    eventId: string
  ):
    | { success: true; data: PimpinanEventDetail; role: "pimpinan" }
    | { success: false; code: "NOT_FOUND" | "FORBIDDEN"; error: string };
  public getEvent(
    role: "analis" | "operator",
    eventId: string
  ):
    | { success: true; data: AnalystEventDetail; role: "analis" }
    | { success: false; code: "NOT_FOUND" | "FORBIDDEN"; error: string };
  public getEvent(
    role: Role,
    eventId: string
  ):
    | { success: true; data: PimpinanEventDetail; role: "pimpinan" }
    | { success: true; data: AnalystEventDetail; role: "analis" }
    | { success: false; code: "NOT_FOUND" | "FORBIDDEN"; error: string };
  public getEvent(
    role: Role,
    eventId: string
  ):
    | { success: true; data: PimpinanEventDetail; role: "pimpinan" }
    | { success: true; data: AnalystEventDetail; role: "analis" }
    | { success: false; code: "NOT_FOUND" | "FORBIDDEN"; error: string } {
    const event = this.state.events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, code: "NOT_FOUND", error: `Kejadian ${eventId} tidak ditemukan` };
    }

    const area = this.state.areas.find((a) => a.id === event.aoiId)!;
    const briefings = this.state.briefings
      .filter((b) => b.eventId === eventId)
      .sort((a, b) => b.version - a.version);
    const latestApprovedBriefing = briefings[0];

    // Check if latest approved briefing is stale (new evidence added after approval)
    const isBriefingStale =
      latestApprovedBriefing &&
      event.evidenceIds.some((id) => !latestApprovedBriefing.snapshot.evidenceIds.includes(id));

    if (role === "pimpinan") {
      // Pimpinan view: concise executive projection, NO raw internal notes, NO raw unapproved drafts
      const corr = (this.state.correlations || []).filter((c) => c.eventId === eventId);
      const narrative = (this.state.narrativeClusters || []).find(
        (n) => n.targetAoiId === event.aoiId
      );

      return {
        success: true,
        role: "pimpinan",
        data: {
          id: event.id,
          aoiId: event.aoiId,
          areaName: area ? area.name : event.aoiId,
          kind: event.kind,
          title: event.title,
          observedAt: event.observedAt,
          status: event.status,
          point: event.point,
          area,
          latestApprovedBriefing,
          isBriefingStale: !!isBriefingStale,
          briefingsCount: briefings.length,
          correlations: corr,
          narrativeSummary: narrative
            ? `${narrative.theme} (${narrative.totalContent} konten terbuka)`
            : undefined,
        },
      };
    }

    // Analis view: full evidence, scenes, reviews, correlations, and draft builder
    const evidence = this.state.evidence.filter((ev) => event.evidenceIds.includes(ev.id));
    const sceneIds = evidence.map((ev) => ev.sceneId).filter((id): id is string => !!id);
    const scenes = this.state.scenes.filter((s) => sceneIds.includes(s.id));
    const reviews = this.state.reviews.filter((r) => r.eventId === eventId);
    const correlations = getCorrelations(eventId, this.state);
    const multiCorrs = (this.state.correlations || []).filter((c) => c.eventId === eventId);
    const narratives = (this.state.narrativeClusters || []).filter(
      (n) => n.targetAoiId === event.aoiId
    );
    const draftSummary = generateDraftSummary(event, evidence, area);
    const missingFieldConfirmation = event.status !== "resolved" && !hasFieldConfirmation(evidence);

    return {
      success: true,
      role: "analis",
      data: {
        event,
        area,
        evidence,
        scenes,
        reviews,
        briefings,
        latestApprovedBriefing,
        isBriefingStale: !!isBriefingStale,
        correlations,
        multiSourceCorrelations: multiCorrs,
        narrativeClusters: narratives,
        draftSummary,
        missingFieldConfirmation,
      },
    };
  }

  public getComparison(
    role: Role,
    aoiId: string,
    beforeId: string,
    afterId: string
  ):
    | {
        success: true;
        aoi: Area;
        before: Scene;
        after: Scene;
        floodOutline?: Point[];
      }
    | { success: false; code: "INVALID_PAIR" | "FORBIDDEN" | "NOT_FOUND"; error: string } {
    if (role === "operator") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Operator tidak memiliki hak akses pembanding citra",
      };
    }

    const aoi = this.state.areas.find((a) => a.id === aoiId);
    if (!aoi) {
      return { success: false, code: "NOT_FOUND", error: `Area ${aoiId} tidak ditemukan` };
    }

    const before = this.state.scenes.find((s) => s.id === beforeId);
    const after = this.state.scenes.find((s) => s.id === afterId);

    if (!before || !after) {
      return {
        success: false,
        code: "INVALID_PAIR",
        error: "Pasangan citra belum tersedia untuk sektor ini",
      };
    }

    if (before.aoiId !== aoiId || after.aoiId !== aoiId) {
      return {
        success: false,
        code: "INVALID_PAIR",
        error: "Kedua citra harus berasal dari AOI yang sama",
      };
    }

    if (new Date(before.capturedAt) >= new Date(after.capturedAt)) {
      return {
        success: false,
        code: "INVALID_PAIR",
        error: "Urutan waktu citra acuan dan pembanding tidak valid",
      };
    }

    return {
      success: true,
      aoi,
      before,
      after,
      floodOutline: aoiId === "AOI-01" ? this.state.demoActions.arunaFloodOutline : undefined,
    };
  }

  public getCorrelationWorkspace(
    role: Role,
    aoiId: string,
    window: TimeWindow,
    topicId: string
  ):
    | { success: true; data: CorrelationWorkspaceData }
    | {
        success: false;
        code: "FORBIDDEN" | "INVALID_WINDOW" | "NOT_FOUND";
        error: string;
      } {
    if (role !== "analis") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Hanya Analis yang berhak mengakses ruang kerja korelasi",
      };
    }

    const fromMs = new Date(window.from).getTime();
    const toMs = new Date(window.to).getTime();

    if (isNaN(fromMs) || isNaN(toMs) || fromMs >= toMs) {
      return {
        success: false,
        code: "INVALID_WINDOW",
        error: "Rentang waktu tidak valid: waktu awal harus lebih awal dari waktu akhir",
      };
    }

    const aoi = this.state.areas.find((a) => a.id === aoiId);
    if (!aoi) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: `Area pantauan ${aoiId} tidak ditemukan`,
      };
    }

    const topic = this.state.topics.find((t) => t.id === topicId) || null;

    // Kejadian dalam rentang [from, to)
    const eventsInPeriod = this.state.events.filter((e) => {
      if (e.aoiId !== aoiId) return false;
      const t = new Date(e.observedAt).getTime();
      return t >= fromMs && t < toMs;
    });

    // Citra dalam rentang
    const scenesInPeriod = this.state.scenes.filter((s) => {
      if (s.aoiId !== aoiId) return false;
      const t = new Date(s.capturedAt).getTime();
      return t >= fromMs && t < toMs;
    });

    // Citra acuan historis di luar periode (capturedAt < fromMs)
    const historicalReferenceScenes = this.state.scenes.filter((s) => {
      if (s.aoiId !== aoiId) return false;
      const t = new Date(s.capturedAt).getTime();
      return t < fromMs;
    });

    // Konten narasi yang cocok dengan topik dan menyebut AOI ini
    const narrativeItemsInWindow = this.state.narrativeItems.filter((n) => {
      if (n.topicId !== topicId) return false;
      if (n.mentionedAoiId !== aoiId) return false;
      const t = new Date(n.publishedAt).getTime();
      return t >= fromMs && t < toMs;
    });

    // Konten narasi topik aktif tanpa wilayah (mentionedAoiId === null) -> Data lokasi belum cukup
    const unlocatedNarrativeItems = this.state.narrativeItems.filter((n) => {
      if (n.topicId !== topicId) return false;
      if (n.mentionedAoiId !== null) return false;
      const t = new Date(n.publishedAt).getTime();
      return t >= fromMs && t < toMs;
    });

    // 24-Hour Trend Buckets
    const durationMs = toMs - fromMs;
    const bucketDurationMs = 24 * 60 * 60 * 1000;
    const numBuckets = Math.max(1, Math.ceil(durationMs / bucketDurationMs));
    const narrativeTrendBuckets: CorrelationTrendBucket[] = [];

    for (let i = 0; i < numBuckets; i++) {
      const bFromMs = fromMs + i * bucketDurationMs;
      const bToMs = Math.min(toMs, bFromMs + bucketDurationMs);
      const bFromIso = new Date(bFromMs).toISOString();
      const bToIso = new Date(bToMs).toISOString();

      const count = narrativeItemsInWindow.filter((item) => {
        const itemMs = new Date(item.publishedAt).getTime();
        return itemMs >= bFromMs && itemMs < bToMs;
      }).length;

      narrativeTrendBuckets.push({
        bucketIndex: i,
        from: bFromIso,
        to: bToIso,
        count,
        label: i === 0 ? "24 Jam Pertama" : i === 1 ? "24 Jam Kedua" : `24 Jam ke-${i + 1}`,
      });
    }

    // Optional Account Aggregate
    const accountAggregate = this.state.optionalAccountAggregates.find(
      (a) => a.aoiId === aoiId && a.window.from === window.from && a.window.to === window.to
    );

    let accountAggregateStatus: "below_threshold" | "valid" | "not_available" = "not_available";
    if (accountAggregate) {
      // Ambang batas RAB: minimum 10 akun unik
      accountAggregateStatus =
        accountAggregate.distinctAccounts >= 10 ? "valid" : "below_threshold";
    }

    // Candidate Correlations
    const candidateCorrelations: CorrelationFinding[] = [];
    for (const ev of eventsInPeriod) {
      const activeEvidence = this.state.evidence.filter((e) => ev.evidenceIds.includes(e.id));
      const hasSceneInPeriod = activeEvidence.some(
        (e) => e.kind === "scene" && scenesInPeriod.some((sc) => sc.id === e.sceneId)
      );
      const hasFieldReport = activeEvidence.some((e) => e.kind === "field_report");
      const hasNarrative = narrativeItemsInWindow.length > 0;

      const missingSources: string[] = [];
      if (!hasSceneInPeriod) missingSources.push("SRC-SAT (Citra dalam periode)");
      if (!hasFieldReport) missingSources.push("SRC-INT (Laporan lapangan internal)");
      if (!hasNarrative) missingSources.push("SRC-GDELT (Narasi terbuka terfilter)");

      const isCandidate = hasSceneInPeriod && hasFieldReport && hasNarrative;

      candidateCorrelations.push({
        eventId: ev.id,
        aoiId,
        window,
        topicId,
        basis: "same_area_and_time",
        status: isCandidate ? "candidate" : "insufficient_evidence",
        evidenceIds: activeEvidence.map((e) => e.id),
        narrativeItemIds: narrativeItemsInWindow.map((n) => n.id),
        missingSources,
      });
    }

    return {
      success: true,
      data: {
        aoi,
        window,
        topic,
        eventsInPeriod,
        scenesInPeriod,
        historicalReferenceScenes,
        sources: this.state.sources,
        narrativeTrendBuckets,
        narrativeItemsInWindow,
        unlocatedNarrativeItems,
        candidateCorrelations,
        accountAggregate,
        accountAggregateStatus,
      },
    };
  }

  public getNarrativeItem(
    role: Role,
    itemId: string
  ):
    | { success: true; item: NarrativeItem }
    | { success: false; code: "FORBIDDEN" | "NOT_FOUND"; error: string } {
    if (role !== "analis") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Hanya Analis yang berhak mengakses rincian item narasi",
      };
    }

    const item = this.state.narrativeItems.find((n) => n.id === itemId);
    if (!item) {
      return {
        success: false,
        code: "NOT_FOUND",
        error: `Konten narasi ${itemId} tidak ditemukan`,
      };
    }

    return {
      success: true,
      item: structuredClone(item),
    };
  }

  public reviewEvent(
    role: Role,
    eventId: string,
    targetStatus: EventStatus,
    note: string,
    evidenceIds: string[]
  ):
    | { success: true; review: Review; event: GeoEvent }
    | {
        success: false;
        code: "FORBIDDEN" | "NOT_FOUND" | "INVALID_TRANSITION" | "EVIDENCE_REQUIRED";
        error: string;
      } {
    if (role !== "analis") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Hanya Analis yang berhak melakukan peninjauan kejadian",
      };
    }

    const eventIndex = this.state.events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return { success: false, code: "NOT_FOUND", error: `Kejadian ${eventId} tidak ditemukan` };
    }

    const event = this.state.events[eventIndex];

    // Status 'resolved' is final in demo
    if (event.status === "resolved") {
      return {
        success: false,
        code: "INVALID_TRANSITION",
        error: "Kejadian berstatus resolved tidak dapat diubah kembali",
      };
    }

    // Validate transition
    if (
      event.status === "pending_review" &&
      targetStatus !== "follow_up_required" &&
      targetStatus !== "resolved"
    ) {
      return {
        success: false,
        code: "INVALID_TRANSITION",
        error: `Transisi dari ${event.status} ke ${targetStatus} tidak diizinkan`,
      };
    }

    if (event.status === "follow_up_required" && targetStatus !== "resolved") {
      return {
        success: false,
        code: "INVALID_TRANSITION",
        error: `Dari follow_up_required hanya dapat berpindah ke resolved`,
      };
    }

    // Minimum evidence & note validation
    if (!evidenceIds || evidenceIds.length === 0) {
      return {
        success: false,
        code: "EVIDENCE_REQUIRED",
        error: "Minimal satu bukti harus dipilih untuk memperbarui status",
      };
    }

    if (!note || note.trim().length === 0) {
      return {
        success: false,
        code: "EVIDENCE_REQUIRED",
        error: "Catatan analis wajib diisi",
      };
    }

    // Rule (FIX-010): resolving any event requires linked field_confirmation evidence
    if (targetStatus === "resolved") {
      const linked = this.state.evidence.filter((ev) => event.evidenceIds.includes(ev.id));
      if (!hasFieldConfirmation(linked)) {
        return {
          success: false,
          code: "EVIDENCE_REQUIRED",
          error: `Penyelesaian kejadian ${eventId} memerlukan bukti konfirmasi lapangan (field_confirmation). Harap impor laporan lapangan terlebih dahulu.`,
        };
      }
    }

    // FIX-009: deterministic ID from state, not the clock
    const reviewId = `REV-${String(this.state.reviews.length + 1).padStart(4, "0")}`;
    const newReview: Review = {
      id: reviewId,
      eventId,
      actorId: "analis-01",
      note: note.trim(),
      evidenceIds: [...evidenceIds],
      toStatus: targetStatus,
      createdAt: this.state.demoNow,
    };

    // Update event
    this.state.events[eventIndex].status = targetStatus;
    this.state.reviews.push(newReview);

    // Audit log
    this.recordAudit({
      timestamp: this.state.demoNow,
      actorId: "analis-01",
      role: "analis",
      action: "review",
      targetId: eventId,
      details: `Status diubah dari ${event.status} ke ${targetStatus}. Catatan: ${note.trim().slice(0, 60)}...`,
      success: true,
    });

    // Advance demo clock by 1 minute
    this.advanceClock(1);

    return {
      success: true,
      review: newReview,
      event: structuredClone(this.state.events[eventIndex]),
    };
  }

  public simulateImport(
    role: Role,
    draft: ImportDraft
  ):
    | {
        success: true;
        isDuplicate: boolean;
        batchId: string;
        message: string;
        evidence?: Evidence;
      }
    | {
        success: false;
        code: "FORBIDDEN" | "INVALID_BATCH";
        batchId: string;
        error: string;
      } {
    if (role !== "operator") {
      return {
        success: false,
        code: "FORBIDDEN",
        batchId: draft.batchId,
        error: "Hanya Operator yang berhak menjalankan simulasi impor",
      };
    }

    // FIX-006: reject on unknown references, never on a hard-coded batch ID.
    const validation = this.validateImportDraft(draft);
    if (!validation.ok) {
      const itemCount = draft.evidence ? 1 : 0;
      this.logImportOutcome(
        {
          batchId: draft.batchId,
          status: "failed",
          itemCount,
          acceptedCount: 0,
          duplicateCount: 0,
          failedCount: itemCount,
          reason: validation.reason,
        },
        `Batch ${draft.batchId} gagal: ${validation.reason}`,
        false
      );
      return {
        success: false,
        code: "INVALID_BATCH",
        batchId: draft.batchId,
        error: validation.reason,
      };
    }

    const { evidence: ev, event, source } = validation;
    const alreadyProcessed =
      this.state.processedBatchIds.includes(draft.batchId) ||
      this.state.evidence.some((e) => e.id === ev.id);

    if (alreadyProcessed) {
      this.logImportOutcome(
        {
          batchId: draft.batchId,
          status: "duplicate",
          itemCount: 1,
          acceptedCount: 0,
          duplicateCount: 1,
          failedCount: 0,
          reason: "Batch duplikat terdeteksi",
        },
        `Batch ${draft.batchId} duplikat: Bukti ${ev.id} sudah ada dalam sistem`,
        true
      );

      return {
        success: true,
        isDuplicate: true,
        batchId: draft.batchId,
        message: `Duplikat: Bukti ${ev.id} sudah terdaftar sebelumnya`,
        evidence: ev,
      };
    }

    // Accept: add evidence, link it to its event (status unchanged), refresh the source
    this.state.evidence.push(ev);
    if (!event.evidenceIds.includes(ev.id)) {
      event.evidenceIds.push(ev.id);
    }
    source.lastSuccessfulImportAt = this.state.demoNow;
    this.state.processedBatchIds.push(draft.batchId);

    this.logImportOutcome(
      {
        batchId: draft.batchId,
        status: "success",
        itemCount: 1,
        acceptedCount: 1,
        duplicateCount: 0,
        failedCount: 0,
      },
      `Batch ${draft.batchId} berhasil diimpor: ${ev.label} (${ev.id}) dikaitkan ke ${ev.eventId}`,
      true
    );

    return {
      success: true,
      isDuplicate: false,
      batchId: draft.batchId,
      message: `Batch ${draft.batchId} berhasil: Bukti ${ev.id} ditambahkan`,
      evidence: ev,
    };
  }

  public publishBriefing(
    role: Role,
    eventId: string,
    bahan: {
      findings: string;
      limitations: string;
      nextAction: string;
      aoiId?: string;
      window?: TimeWindow;
      narrativeItemIds?: string[];
      topicId?: string;
    }
  ):
    | { success: true; briefing: Briefing }
    | {
        success: false;
        code: "FORBIDDEN" | "NOT_FOUND" | "REVIEW_REQUIRED";
        error: string;
      } {
    if (role !== "analis") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Hanya Analis yang berhak menerbitkan dan menyetujui briefing",
      };
    }

    const event = this.state.events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, code: "NOT_FOUND", error: `Kejadian ${eventId} tidak ditemukan` };
    }

    const existingReviews = this.state.reviews.filter((r) => r.eventId === eventId);
    if (existingReviews.length === 0) {
      return {
        success: false,
        code: "REVIEW_REQUIRED",
        error: "Minimal satu catatan peninjauan analis harus tersedia sebelum menyetujui briefing",
      };
    }

    const existingBriefings = this.state.briefings.filter((b) => b.eventId === eventId);
    const nextVersion = existingBriefings.length + 1;

    const snapshot: BriefingSnapshot = {
      title: event.title,
      status: event.status,
      observedAt: event.observedAt,
      findings: bahan.findings,
      limitations: bahan.limitations,
      nextAction: bahan.nextAction,
      evidenceIds: [...event.evidenceIds],
      aoiId: bahan.aoiId || event.aoiId,
      window: bahan.window || this.state.demoPreset.window,
      narrativeItemIds: bahan.narrativeItemIds || [],
      topicId: bahan.topicId || this.state.demoPreset.topicId,
    };

    const newBriefing: Briefing = {
      id: `BRF-${eventId}-v${nextVersion}`,
      eventId,
      version: nextVersion,
      approvedBy: "analis-01",
      approvedAt: this.state.demoNow,
      snapshot,
    };

    this.state.briefings.unshift(newBriefing);

    this.recordAudit({
      timestamp: this.state.demoNow,
      actorId: "analis-01",
      role: "analis",
      action: "publish_brief",
      targetId: newBriefing.id,
      details: `Briefing v${nextVersion} disetujui dan dipublikasikan untuk ${eventId}`,
      success: true,
    });

    this.advanceClock(1);

    return { success: true, briefing: newBriefing };
  }

  public resetDemo(
    role: Role,
    confirmed: boolean
  ):
    | { success: true; message: string; state: DemoState }
    | { success: false; code: "FORBIDDEN" | "CONFIRMATION_REQUIRED"; error: string } {
    if (role !== "operator") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "Hanya Operator yang berhak mereset fixture demo",
      };
    }

    if (!confirmed) {
      return {
        success: false,
        code: "CONFIRMATION_REQUIRED",
        error: "Konfirmasi reset diperlukan",
      };
    }

    this.state = structuredClone(INITIAL_FIXTURE);

    this.recordAudit({
      timestamp: INITIAL_FIXTURE.demoNow,
      actorId: "operator-01",
      role: "operator",
      action: "reset",
      targetId: "SYSTEM",
      details: "Sistem berhasil di-reset kembali ke seed awal fixtureVersion 2",
      success: true,
    });

    return {
      success: true,
      message: "Data demo berhasil dimuat ulang ke seed awal",
      state: structuredClone(this.state),
    };
  }

  public getKpis() {
    const totalAreas = this.state.areas.length;
    const activeEvents = this.state.events.filter((e) => e.status !== "resolved").length;
    const pendingReview = this.state.events.filter((e) => e.status === "pending_review").length;
    const followUpRequired = this.state.events.filter(
      (e) => e.status === "follow_up_required"
    ).length;
    const resolvedEvents = this.state.events.filter((e) => e.status === "resolved").length;

    return {
      totalAreas,
      activeEvents,
      pendingReview,
      followUpRequired,
      resolvedEvents,
    };
  }

  public getMultiSourceCorrelations(eventId: string): MultiSourceCorrelation[] {
    return (this.state.correlations || []).filter((c) => c.eventId === eventId);
  }

  public getNarrativeClusters(aoiId?: string): NarrativeCluster[] {
    return (this.state.narrativeClusters || []).filter(
      (n) => !aoiId || aoiId === "all" || n.targetAoiId === aoiId
    );
  }
}
