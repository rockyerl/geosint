"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MultiSourceCorrelation, Evidence, NarrativeCluster } from "../types";
import {
  Link2,
  Satellite,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sliders,
} from "lucide-react";

interface CorrelationMatrixProps {
  correlations: MultiSourceCorrelation[];
  evidenceList: Evidence[];
  narrativeClusters: NarrativeCluster[];
  onOpenRadar?: () => void;
}

export function CorrelationMatrix({
  correlations,
  evidenceList,
  narrativeClusters,
  onOpenRadar,
}: CorrelationMatrixProps) {
  const [selectedCorrId, setSelectedCorrId] = useState<string>(
    correlations.length > 0 ? correlations[0].id : ""
  );

  const activeCorr = correlations.find((c) => c.id === selectedCorrId) || correlations[0];

  if (!activeCorr) {
    return (
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs font-mono text-slate-400">
        Belum ada korelasi wilayah-waktu yang terdaftar untuk kejadian ini.
      </div>
    );
  }

  const satEvidence = evidenceList.find((e) => e.id === activeCorr.satelliteEvidenceId);
  const fieldEvidence = evidenceList.find((e) => e.id === activeCorr.fieldReportEvidenceId);
  const narrative = narrativeClusters.find((n) => n.id === activeCorr.narrativeClusterId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Korelasi Wilayah–Waktu Terpadu (GEO-19 · Multi-Source Triangulation)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
          P0 Prioritas Demo
        </span>
      </div>

      {/* Selector Tabs if multiple correlations */}
      {correlations.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {correlations.map((c) => {
            const isTabActive = c.id === activeCorr.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCorrId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isTabActive
                    ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{c.id}: </span>
                <span className="truncate max-w-[200px]">{c.title.split(":")[0] || c.title}</span>
                {!c.hasSufficientGeoData && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                    title="Data lokasi belum cukup"
                  ></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Correlation Card */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40 text-[10px] font-mono font-bold">
                {activeCorr.id}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Sektor: <strong className="text-white">{activeCorr.aoiId}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeCorr.timeWindow}
              </span>
            </div>
            <h4 className="text-base font-bold text-white leading-snug">{activeCorr.title}</h4>
          </div>

          <div>
            {activeCorr.hasSufficientGeoData ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                DATA SPASIAL VALID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                LOKASI BELUM CUKUP
              </span>
            )}
          </div>
        </div>

        {/* Rationale explanation */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed mb-4">
          <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">
            DASAR KETERKAITAN WILAYAH & WAKTU (RATIONALE):
          </span>
          {activeCorr.rationale}
        </div>

        {/* Limitation warning if location data is insufficient */}
        {!activeCorr.hasSufficientGeoData && activeCorr.limitationNote && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-lg text-xs text-amber-200 flex items-start gap-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Catatan Keterbatasan Analis:</strong>
              {activeCorr.limitationNote}
            </div>
          </div>
        )}

        {/* 3 Pillars of Triangulated Evidence (Visual Linking from 1 Screen) */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-2.5">
            Tiga Sumber Bukti yang Ditelusuri dalam Satu Layar:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pillar 1: Citra Radar SAR */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                  <Satellite className="w-4 h-4" />
                  <span>1. Citra Radar SAR</span>
                </div>
                <div className="text-white font-bold text-xs mb-1">
                  {satEvidence ? satEvidence.label : "Citra Sentinel-1 SAR (SC-02)"}
                </div>
                <p className="text-[11px] text-slate-300 leading-normal mb-2">
                  Lonjakan pantulan specular hamburan balik air pada alur sungai koordinat [20, 68].
                </p>
              </div>

              {onOpenRadar ? (
                <button
                  type="button"
                  onClick={onOpenRadar}
                  className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-bold text-left"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Buka Slider Pembanding</span>
                </button>
              ) : activeCorr.aoiId === "AOI-01" ? (
                <Link
                  href="/peta/AOI-01/bandingkan"
                  className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-bold"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Buka Slider Pembanding</span>
                </Link>
              ) : null}
            </div>

            {/* Pillar 2: Laporan Internal Terestrial */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>2. Laporan Terestrial</span>
                </div>
                <div className="text-white font-bold text-xs mb-1">
                  {fieldEvidence ? fieldEvidence.label : "Laporan Lapangan Internal (E-03)"}
                </div>
                <p className="text-[11px] text-slate-300 leading-normal mb-2">
                  Petugas patroli internal mencatat pengalihan rute gerak akibat air meluap ke badan
                  jalan.
                </p>
              </div>

              <span className="text-[10px] text-emerald-400/80 font-bold">
                ✓ Terverifikasi Sumber Internal
              </span>
            </div>

            {/* Pillar 3: Klaster Narasi Terbuka (GDELT) */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>3. Narasi Terbuka (OSINT)</span>
                </div>
                <div className="text-white font-bold text-xs mb-1">
                  {narrative ? narrative.theme : "Feed GDELT Terbuka (NAR-01)"}
                </div>
                <p className="text-[11px] text-slate-300 leading-normal mb-2">
                  Masyarakat dan media lokal ramai menyebut isu &quot;akses jembatan terputus
                  total&quot;.
                </p>
              </div>

              <span className="text-[10px] text-amber-300 font-bold">
                {narrative ? `${narrative.totalContent} Post / Berita` : "Feed Terkorelasikan"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
