"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { formatBriefingNarrativeTotal } from "../analysis";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  AlertTriangle,
  Lock,
  Satellite,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Send,
  Radio,
  FileCheck,
} from "lucide-react";

interface EventDetailPimpinanProps {
  eventId: string;
}

export function EventDetailPimpinan({ eventId }: EventDetailPimpinanProps) {
  const { repo, state, showToast } = useGeosint();
  const [orderSent, setOrderSent] = useState<boolean>(false);

  const eventResult = repo.getEvent("pimpinan", eventId);

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
            <span>Kembali ke Ringkasan Kejadian</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    aoiId,
    areaName,
    title,
    observedAt,
    status,
    latestApprovedBriefing,
    correlations,
    narrativeSummary,
  } = eventResult.data;

  const handleIssueCommand = () => {
    setOrderSent(true);
    showToast(
      `Instruksi Pimpinan terkirim ke Satuan Lapangan: Segera cek akses Sektor ${areaName} & laporkan kondisi terkini`,
      "success"
    );
  };

  const isAruna = id === "G-101" || aoiId === "AOI-01";
  const topicLabel = (id: string) => state.topics.find((t) => t.id === id)?.label ?? id;
  const missingSources = [
    ...new Set(
      correlations
        .filter((c) => c.status === "insufficient_evidence")
        .flatMap((c) => c.missingSources)
    ),
  ];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl w-full mx-auto font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/kejadian" className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ringkasan Kejadian</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">{areaName}</span>
          <span>/</span>
          <span className="text-white font-bold">{id}</span>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
          PROYEKSI PIMPINAN KODIKLAT (DECISION SUPPORT)
        </span>
      </div>

      {/* Main Command Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-bold">
                {id}
              </span>
              <span className="text-slate-300">
                Sektor:{" "}
                <strong>
                  {areaName} ({aoiId})
                </strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Waktu Observasi: {observedAt}</span>
            </div>
            <h1 className="text-2xl font-black text-white">{title}</h1>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                status === "pending_review"
                  ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                  : status === "follow_up_required"
                    ? "bg-rose-950/80 text-rose-300 border border-rose-500/50"
                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
              }`}
            >
              {status === "pending_review" && "Menunggu Tinjauan Analis"}
              {status === "follow_up_required" && "Perlu Konfirmasi Lapangan"}
              {status === "resolved" && "Selesai (Resolved)"}
            </span>
          </div>
        </div>

        {/* Multi-Source Triangulation Snapshot for Commander */}
        <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Triangulasi 3 Pilar Informasi (Satelit SAR · Laporan Petugas · Narasi Terbuka)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
              GEO-19 Triangulated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            {/* Pillar 1: Citra Satelit */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <Satellite className="w-4 h-4" />
                <span>1. Citra Satelit SAR</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {isAruna
                  ? "Sentinel SAR SC-02 mendeteksi genangan di koordinat alur [20, 68] (Fakta Fisik Teramati)."
                  : "Sensor termal FIRMS mendeteksi klaster anomali pada lereng bukit."}
              </p>
            </div>

            {/* Pillar 2: Laporan Petugas */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Radio className="w-4 h-4" />
                <span>2. Laporan Petugas Lapangan</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {isAruna
                  ? "Laporan internal E-03: Akses konvoi dialihkan ke rute selatan karena limpasan air."
                  : "Patroli darat mencatat jarak pandang menurun akibat asap kabut lokal."}
              </p>
            </div>

            {/* Pillar 3: Narasi Terbuka */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>3. Narasi Terbuka (GDELT)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {narrativeSummary ??
                  "Belum ada narasi terbuka yang menyebut sektor ini dalam periode."}
              </p>
              {correlations.map((c) => (
                <p key={c.topicId} className="text-slate-400 text-[10px] mt-1">
                  {topicLabel(c.topicId)}: {c.totalContent} konten · {c.distinctAccounts} akun
                  unik · lokasi unggahan {c.locatedContent}/{c.totalContent}
                </p>
              ))}
            </div>
          </div>

          {/* Insufficient Data Warning if applicable */}
          {missingSources.length > 0 && (
            <div className="mt-3 p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-lg flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Korelasi belum lengkap:</strong> sumber belum tersedia:{" "}
                {missingSources.join("; ")}. Narasi terbuka berstatus dugaan sampai bukti lengkap.
              </span>
            </div>
          )}
        </div>

        {/* Executive Summary Section from Approved Briefing */}
        {latestApprovedBriefing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-emerald-400 font-bold">
                ✓ Briefing Resmi Disetujui (Versi {latestApprovedBriefing.version})
              </span>
              <Link
                href={`/briefing/${id}`}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition-colors shadow-md shadow-indigo-600/30"
              >
                <span>Buka Lembar Briefing Cetak</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-mono font-bold text-slate-300 mb-2 uppercase text-[11px]">
                  1. Bahan yang Teramati
                </h3>
                <p className="text-slate-200 leading-relaxed">
                  {latestApprovedBriefing.snapshot.findings}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-mono font-bold text-slate-300 mb-2 uppercase text-[11px]">
                  2. Keterbatasan Pengamatan
                </h3>
                <p className="text-slate-200 leading-relaxed">
                  {latestApprovedBriefing.snapshot.limitations}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-mono font-bold text-amber-300 mb-2 uppercase text-[11px]">
                  3. Arahan Pengecekan
                </h3>
                <p className="text-amber-100/90 leading-relaxed font-semibold">
                  {latestApprovedBriefing.snapshot.nextAction}
                </p>
              </div>
            </div>

            {latestApprovedBriefing.snapshot.narrativeTotals?.length ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
                <span className="text-slate-300 font-bold block mb-1">
                  Narasi terbuka saat briefing disetujui (jumlah saja):
                </span>
                {latestApprovedBriefing.snapshot.narrativeTotals.map((t) => (
                  <div key={t.topicId} className="text-slate-200">
                    {formatBriefingNarrativeTotal(t, topicLabel(t.topicId))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-6 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white mb-1">
              Briefing Resmi Belum Disetujui Analis
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Analis geospasial sedang memproses korelasi satelit dan narasi terbuka. Anda tetap
              dapat memberikan instruksi pendahuluan di bawah ini.
            </p>
          </div>
        )}

        {/* Concrete Commander Action Button */}
        <div className="mt-6 p-4 bg-gradient-to-r from-slate-900 to-slate-950 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span>Tindakan Konkret Komando:</span>
            </div>
            <p className="text-xs text-slate-300">
              {isAruna
                ? "Minta petugas lapangan segera cek kondisi akses jembatan Sektor Aruna dan laporkan kondisi terkini."
                : `Instruksikan pemeriksaan fisik sektor ${areaName} untuk konfirmasi lapangan.`}
            </p>
          </div>

          <button
            onClick={handleIssueCommand}
            disabled={orderSent}
            className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 ${
              orderSent
                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/60 cursor-default"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:scale-[1.02]"
            }`}
          >
            {orderSent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Instruksi Terkirim (Pukul {new Date().toLocaleTimeString("id-ID")})</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Keluarkan Perintah Pengecekan Lapangan</span>
              </>
            )}
          </button>
        </div>

        {/* Restricted Internal Data Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Jalur impor, catatan teknis analis internal, dan berkas bukti mentah hanya dapat
              diakses oleh Analis / Operator.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
