"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { formatBriefingNarrativeTotal } from "../analysis";
import { Printer, ArrowLeft, FileCheck, AlertTriangle, History } from "lucide-react";

interface BriefingViewProps {
  eventId: string;
}

export function BriefingView({ eventId }: BriefingViewProps) {
  const { state } = useGeosint();

  const event = state.events.find((e) => e.id === eventId);
  const area = event ? state.areas.find((a) => a.id === event.aoiId) : null;
  const eventBriefings = state.briefings
    .filter((b) => b.eventId === eventId)
    .sort((a, b) => b.version - a.version);

  // null = no version picked yet: always show the newest. A fixed initial value would be
  // computed before the stored state loads and stick to v1.
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const currentBriefing =
    eventBriefings.find((b) => b.version === selectedVersion) ?? eventBriefings[0];

  const isStale =
    event &&
    currentBriefing &&
    event.evidenceIds.some((id) => !currentBriefing.snapshot.evidenceIds.includes(id));

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!event || !area) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Kejadian Tidak Ditemukan</h2>
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

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-4xl w-full mx-auto font-sans">
      {/* Screen Navigation & Controls (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href={`/kejadian/${eventId}`} className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Detail {eventId}</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Dokumen Briefing Resmi</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Version Selector if multiple versions exist */}
          {eventBriefings.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-xs font-mono">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Arsip Versi:</span>
              <select
                value={currentBriefing?.version}
                onChange={(e) => setSelectedVersion(Number(e.target.value))}
                className="bg-transparent text-indigo-400 font-bold focus:outline-none"
              >
                {eventBriefings.map((b) => (
                  <option key={b.version} value={b.version} className="bg-slate-900 text-white">
                    v{b.version} {b.version === eventBriefings[0].version ? "(Terkini)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Warning banner if current version is stale (Hidden during print) */}
      {isStale && (
        <div className="print:hidden mb-6 p-4 bg-amber-950/70 border border-amber-500/50 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">Status: Perlu Ditinjau Ulang</strong>
            Bukti sumber baru telah diimpor setelah briefing v{currentBriefing?.version} ini
            disetujui. Analis disarankan untuk meninjau ulang dan menyetujui versi snapshot baru.
          </div>
        </div>
      )}

      {/* If no approved briefing exists yet */}
      {!currentBriefing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <FileCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Briefing Belum Disetujui</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Belum ada snapshot briefing yang diterbitkan dan disetujui oleh analis untuk kejadian{" "}
            {eventId}.
          </p>
          <Link
            href={`/kejadian/${eventId}`}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Buka Lembar Kerja Analis</span>
          </Link>
        </div>
      ) : (
        /* PRINTABLE OFFICIAL MILITARY BRIEFING DOCUMENT */
        <div className="bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 border border-slate-300 print:border-none font-sans">
          {/* Official Letterhead */}
          <div className="text-center pb-6 mb-6 border-b-2 border-slate-900">
            <div className="text-[11px] font-mono tracking-widest font-bold text-slate-700 uppercase mb-1">
              KOMANDO PEMBINAAN DOKTRIN, PENDIDIKAN DAN LATIHAN TNI AD
            </div>
            <div className="text-[10px] font-mono tracking-wider text-slate-500 mb-2">
              SISTEM INTELIJEN GEOSPASIAL (GEOSINT) ON-PREMISE · POSKO KENDALI OPERASI
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
              LEMBAR BRIEFING KESIAPAN SEKTOR LATIHAN
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-700">
              <span>
                NOMOR: BRF/KODIKLAT/{area.id}/{currentBriefing.version}
              </span>
              <span>•</span>
              <span className="font-bold text-rose-700">KLASIFIKASI: RAHASIA / DEMO TACTICAL</span>
              <span>•</span>
              <span className="font-bold text-amber-700">MODE DEMO · DATA FIKTIF</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono mb-8">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">SEKTOR / AREA:</span>
              <strong className="text-slate-900">{area.name}</strong>
              <span className="text-[10px] text-slate-500 block">
                ({area.areaKm2.toLocaleString("id-ID")} km²)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">WAKTU OBSERVASI:</span>
              <strong className="text-slate-900">{currentBriefing.snapshot.observedAt}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">STATUS PENINJAUAN:</span>
              <strong className="text-slate-900 uppercase">
                {currentBriefing.snapshot.status}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">PENINJAU & VERSI:</span>
              <strong className="text-slate-900">
                {currentBriefing.approvedBy} (v{currentBriefing.version})
              </strong>
            </div>
          </div>

          {/* Section 1: Bahan yang Teramati */}
          <div className="mb-6">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                I
              </span>
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Bahan yang Teramati (Observed Facts & Telemetri Sensor)
              </h2>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed text-justify">
              {currentBriefing.snapshot.findings}
            </p>
          </div>

          {/* Section 2: Indikasi Analis & Keterbatasan */}
          <div className="mb-6">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                II
              </span>
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Indikasi Analis & Keterbatasan Pengamatan
              </h2>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed text-justify">
              {currentBriefing.snapshot.limitations}
            </p>
          </div>

          {/* Section 3: Konfirmasi atau Arahan Pengecekan Berikutnya */}
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-600 rounded-r-lg">
            <div className="flex items-center gap-2 pb-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-mono text-xs flex items-center justify-center font-bold">
                III
              </span>
              <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Konfirmasi atau Arahan Pengecekan Berikutnya (Untuk Pimpinan)
              </h2>
            </div>
            <p className="text-sm text-amber-950 leading-relaxed font-semibold text-justify">
              {currentBriefing.snapshot.nextAction}
            </p>
          </div>

          {/* Narrative totals frozen at approval: counts only, no handles (spec 002 US-5, T212) */}
          {currentBriefing.snapshot.narrativeTotals && (
            <div className="mb-8 pt-4 border-t border-slate-200 text-xs">
              <span className="font-mono font-bold text-slate-700 uppercase block mb-2">
                Ringkasan Narasi Terbuka saat Disetujui (simulasi, jumlah saja):
              </span>
              {currentBriefing.snapshot.narrativeTotals.length === 0 ? (
                <p className="font-mono text-[11px] text-slate-600">
                  Tidak ada narasi terbuka yang menyebut sektor ini dalam periode.
                </p>
              ) : (
                <ul className="space-y-1 font-mono text-[11px] text-slate-600 list-disc list-inside">
                  {currentBriefing.snapshot.narrativeTotals.map((t) => (
                    <li key={t.topicId}>
                      {formatBriefingNarrativeTotal(
                        t,
                        state.topics.find((x) => x.id === t.topicId)?.label ?? t.topicId
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Evidence Reference Index */}
          <div className="mb-8 pt-4 border-t border-slate-200 text-xs">
            <span className="font-mono font-bold text-slate-700 uppercase block mb-2">
              Rujukan Bukti yang Diverifikasi ({currentBriefing.snapshot.evidenceIds.length}):
            </span>
            <ul className="space-y-1 font-mono text-[11px] text-slate-600 list-disc list-inside">
              {currentBriefing.snapshot.evidenceIds.map((evId) => {
                const evObj = state.evidence.find((e) => e.id === evId);
                return (
                  <li key={evId}>
                    <strong>[{evId}]</strong>{" "}
                    {evObj
                      ? `${evObj.label} (${evObj.kind} · ${evObj.sourceId})`
                      : "Bukti terlampir"}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Signature & Authentication Stamp */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 text-xs font-mono">
            <div>
              <p className="text-slate-500">DISAHKAN PADA WAKTU:</p>
              <p className="font-bold text-slate-900">{currentBriefing.approvedAt}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                HASH INTEGRITAS: GEOSINT-SHA256-{currentBriefing.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">PEJABAT PENINJAU:</p>
              <p className="font-bold text-slate-900 uppercase">ANALIS GEOSPASIAL KODIKLAT</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                ✓ TERVERIFIKASI SISTEM ELEKTRONIK
              </p>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center mt-8 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            HANYA UNTUK KEPERLUAN DEMONSTRASI PROTOTIPE · DATA FIKTIF KODIKLAT TNI AD
          </div>
        </div>
      )}
    </div>
  );
}
