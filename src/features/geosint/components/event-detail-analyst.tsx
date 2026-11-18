"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGeosint } from "../context";
import { EventStatus, Evidence, Review } from "../types";
import { CorrelationMatrix } from "./correlation-matrix";
import { NarrativePanel } from "./narrative-panel";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Send,
  Sparkles,
  History,
  FileCheck,
  ExternalLink,
} from "lucide-react";

interface EventDetailAnalystProps {
  eventId: string;
}

export function EventDetailAnalyst({ eventId }: EventDetailAnalystProps) {
  const { repo, reviewEvent, publishBriefing, showToast } = useGeosint();
  const router = useRouter();

  const eventResult = repo.getEvent("analis", eventId);

  // Review form state
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [analystNote, setAnalystNote] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<EventStatus>("follow_up_required");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Editable briefing draft fields
  const [briefingFindings, setBriefingFindings] = useState<string>("");
  const [briefingLimitations, setBriefingLimitations] = useState<string>("");
  const [briefingNextAction, setBriefingNextAction] = useState<string>("");
  const [draftInitialized, setDraftInitialized] = useState<boolean>(false);

  if (!eventResult.success) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Kejadian Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 mb-6">{eventResult.error}</p>
          <Link
            href="/kejadian"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Kejadian</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    event,
    area,
    evidence,
    reviews,
    latestApprovedBriefing,
    isBriefingStale,
    multiSourceCorrelations,
    narrativeClusters,
    draftSummary,
  } = eventResult.data;

  // Initialize draft summary fields once
  if (!draftInitialized && draftSummary) {
    setBriefingFindings(draftSummary.findings);
    setBriefingLimitations(draftSummary.limitations);
    setBriefingNextAction(draftSummary.nextAction);
    setDraftInitialized(true);
  }

  const toggleEvidenceSelection = (id: string) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvidenceIds.length === 0) {
      showToast("Minimal satu bukti harus dipilih untuk memperbarui status", "error");
      return;
    }
    if (!analystNote.trim()) {
      showToast("Catatan analis wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    const res = reviewEvent(eventId, targetStatus, analystNote, selectedEvidenceIds);
    setIsSubmitting(false);

    if (res.success) {
      setAnalystNote("");
    }
  };

  const handleApproveBriefing = () => {
    if (reviews.length === 0) {
      showToast(
        "Minimal satu catatan peninjauan analis harus tersedia sebelum menyetujui briefing",
        "error"
      );
      return;
    }

    const res = publishBriefing(eventId, {
      findings: briefingFindings,
      limitations: briefingLimitations,
      nextAction: briefingNextAction,
    });

    if (res.success) {
      router.push(`/briefing/${eventId}`);
    }
  };

  const hasFieldConfirmation = evidence.some((ev: Evidence) => ev.kind === "field_confirmation");

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/kejadian" className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar Kejadian</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">{area.name}</span>
          <span>/</span>
          <span className="text-white font-bold">{event.id}</span>
        </div>

        {/* Action Link to Comparison Tool */}
        {area.id === "AOI-01" && (
          <Link
            href="/peta/AOI-01/bandingkan"
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Buka Pembanding Radar (SC-01 vs SC-02)</span>
          </Link>
        )}
      </div>

      {/* Top Event Headline Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs font-bold">
                {event.id}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Sektor:{" "}
                <strong className="text-white">
                  {area.name} ({area.id})
                </strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                Waktu Observasi: <strong className="text-indigo-400">{event.observedAt}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{event.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                STATUS ANTREAN TINJAUAN:
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mt-1 ${
                  event.status === "pending_review"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                    : event.status === "follow_up_required"
                      ? "bg-rose-950/80 text-rose-300 border border-rose-500/50"
                      : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                }`}
              >
                {event.status === "pending_review" && "Menunggu Tinjauan"}
                {event.status === "follow_up_required" && "Perlu Konfirmasi Lapangan"}
                {event.status === "resolved" && "Selesai (Resolved)"}
              </span>
            </div>
          </div>
        </div>

        {/* Warning if briefing is stale */}
        {isBriefingStale && (
          <div className="mt-4 p-3 bg-amber-950/50 border border-amber-500/40 rounded-lg flex items-center gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Perlu ditinjau ulang:</strong> Bukti baru telah ditambahkan ke kejadian ini
              sejak briefing versi terakhir disetujui. Silakan perbarui dan setujui briefing
              kembali.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Left side Evidence & Correlation, Right side Review & Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EVIDENCE & TELEMETRY (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Evidence Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Daftar Bukti & Sumber Pengamatan ({evidence.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Pilih minimal 1 bukti untuk peninjauan
              </span>
            </div>

            <div className="space-y-3">
              {evidence.map((ev: Evidence) => {
                const isChecked = selectedEvidenceIds.includes(ev.id);
                const isConfirmation = ev.kind === "field_confirmation";

                return (
                  <label
                    key={ev.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-indigo-950/70 border-indigo-500"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    } ${isConfirmation ? "ring-1 ring-emerald-500/50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEvidenceSelection(ev.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-bold text-indigo-400">{ev.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-slate-300">
                            {ev.kind}
                          </span>
                          {isConfirmation && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                              KONFIRMASI LAPANGAN
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-200 font-semibold">{ev.label}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                        <span>
                          Sumber: <strong className="text-slate-300">{ev.sourceId}</strong>
                        </span>
                        <span>•</span>
                        <span>Waktu: {ev.observedAt}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Special Guidance if G-101 and no field confirmation yet */}
            {event.id === "G-101" && !hasFieldConfirmation && (
              <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block mb-1">
                      Petunjuk Penyelesaian Kasus Aruna:
                    </strong>
                    Status genangan Sektor Aruna memerlukan bukti tipe{" "}
                    <code>field_confirmation</code> (E-06) sebelum dapat diselesaikan (resolved).
                    Silakan buka menu <strong>Katalog & Impor</strong> (sebagai Operator) untuk
                    mengimpor batch laporan konfirmasi petugas.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* P0: Multi-Source Triangulated Correlation Matrix (GEO-19) */}
          <CorrelationMatrix
            correlations={multiSourceCorrelations}
            evidenceList={evidence}
            narrativeClusters={narrativeClusters}
            onOpenRadar={
              area.id === "AOI-01" ? () => router.push(`/peta/${area.id}/bandingkan`) : undefined
            }
          />

          {/* P0: Open Source Narrative Clustering & 3-Location Breakdown (GEO-18) */}
          <NarrativePanel clusters={narrativeClusters} />

          {/* Review History Trail */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Riwayat Catatan Peninjauan ({reviews.length})
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada peninjauan yang dicatat untuk kejadian ini.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev: Review) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                      <span className="text-slate-300 font-bold">Oleh: {rev.actorId}</span>
                      <span className="text-indigo-400">{rev.createdAt}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{rev.note}</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                      <span>
                        Status Dituju: <strong className="text-white">{rev.toStatus}</strong>
                      </span>
                      <span>•</span>
                      <span>Bukti Terpilih: {rev.evidenceIds.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & BRIEFING APPROVAL (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Panel: Update Review Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <Send className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tindakan Peninjauan Analis
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  STATUS TARGET BERIKUTNYA:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as EventStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option value="follow_up_required">
                    follow_up_required (Minta Konfirmasi Lapangan)
                  </option>
                  <option value="resolved">resolved (Selesaikan Kejadian)</option>
                </select>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  * Status resolved bersifat final dalam simulasi demonstrasi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  CATATAN ANALIS (WAJIB):
                </label>
                <textarea
                  value={analystNote}
                  onChange={(e) => setAnalystNote(e.target.value)}
                  placeholder="Tuliskan arahan pengecekan atau dasar analisis citra..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || event.status === "resolved"}
                className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono tracking-wide flex items-center justify-center gap-2 transition-all ${
                  event.status === "resolved"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Peninjauan & Perbarui Status</span>
              </button>
            </form>
          </div>

          {/* AI Synthesis Briefing Drafter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Draf Ringkasan Briefing
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                Ringkasan simulasi
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-slate-300 mb-1">
                  1. BAHAN YANG TERAMATI:
                </label>
                <textarea
                  value={briefingFindings}
                  onChange={(e) => setBriefingFindings(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-300 mb-1">
                  2. KETERBATASAN PENGAMATAN:
                </label>
                <textarea
                  value={briefingLimitations}
                  onChange={(e) => setBriefingLimitations(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-300 mb-1">
                  3. ARAHAN PENGECEKAN / KONFIRMASI:
                </label>
                <textarea
                  value={briefingNextAction}
                  onChange={(e) => setBriefingNextAction(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApproveBriefing}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Setujui & Publikasikan Briefing (Versi Baru)</span>
                </button>
              </div>

              {latestApprovedBriefing && (
                <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold block">
                      Versi Aktif: v{latestApprovedBriefing.version}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disetujui: {latestApprovedBriefing.approvedAt}
                    </span>
                  </div>
                  <Link
                    href={`/briefing/${eventId}`}
                    className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-mono flex items-center gap-1 transition-colors border border-indigo-800/40"
                  >
                    <span>Buka Lembar Cetak</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
