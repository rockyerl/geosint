"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { EventCorrelation, Evidence, NarrativeItem, Topic } from "../types";
import { DEFAULT_WINDOW_PRESET } from "../analysis";
import { formatWib } from "./account-timeline";
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
  correlations: EventCorrelation[];
  evidenceList: Evidence[];
  topics: Topic[];
  items: NarrativeItem[];
  onOpenRadar?: () => void;
}

/** Computed same-area-and-time correlation of one event, one tab per topic (spec 002 T218). */
export function CorrelationMatrix({
  correlations,
  evidenceList,
  topics,
  items,
  onOpenRadar,
}: CorrelationMatrixProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showPosts, setShowPosts] = useState(false);
  const active = correlations.find((c) => c.topicId === selectedTopicId) ?? correlations[0];

  if (!active) {
    return (
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs font-mono text-slate-400">
        Belum ada narasi terbuka yang menyebut sektor ini dalam periode.{" "}
        <Link href="/narasi" className="text-indigo-400 hover:underline">
          Buka Konsentrasi Narasi →
        </Link>
      </div>
    );
  }

  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;
  const evidenceLines = (ids: string[]) =>
    ids.map((id) => `${id}: ${evidenceList.find((e) => e.id === id)?.label ?? id}`);
  const isCandidate = active.status === "candidate";
  const sceneLines = evidenceLines(active.sceneEvidenceIds);
  const fieldLines = evidenceLines(active.fieldEvidenceIds);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Korelasi Wilayah–Waktu Terpadu
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
          Dihitung dari data sintetis (simulasi)
        </span>
      </div>

      {/* One tab per topic */}
      {correlations.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {correlations.map((c) => {
            const isTabActive = c.topicId === active.topicId;
            return (
              <button
                key={c.topicId}
                onClick={() => {
                  setSelectedTopicId(c.topicId);
                  setShowPosts(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isTabActive
                    ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className="truncate max-w-[200px]">
                  {c.topicId}: {topicLabel(c.topicId)}
                </span>
                {c.status === "insufficient_evidence" && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                    title="Bukti belum lengkap"
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
                {active.topicId}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Sektor: <strong className="text-white">{active.aoiId}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatWib(active.window.from)} – {formatWib(active.window.to)}
              </span>
            </div>
            <h4 className="text-base font-bold text-white leading-snug">
              {topicLabel(active.topicId)}
            </h4>
          </div>

          <div>
            {isCandidate ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                KANDIDAT KORELASI
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                BUKTI BELUM LENGKAP
              </span>
            )}
          </div>
        </div>

        {/* Computed rationale */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed mb-4">
          <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">
            DASAR KETERKAITAN WILAYAH & WAKTU (DIHITUNG):
          </span>
          <ul className="space-y-1">
            {active.rationale.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Missing sources */}
        {active.missingSources.length > 0 && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-lg text-xs text-amber-200 flex items-start gap-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Sumber belum tersedia:</strong>{" "}
              {active.missingSources.join("; ")}
            </div>
          </div>
        )}

        {/* 3 Pillars of Triangulated Evidence */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-2.5">
            Tiga Sumber Bukti yang Ditelusuri dalam Satu Layar:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pillar 1: scenes in the window */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                  <Satellite className="w-4 h-4" />
                  <span>1. Citra dalam Periode</span>
                </div>
                {sceneLines.length > 0 ? (
                  sceneLines.map((line) => (
                    <div key={line} className="text-white font-bold text-xs mb-1">
                      {line}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-300 leading-normal mb-2">
                    Belum ada citra dalam periode.
                  </p>
                )}
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
              ) : active.aoiId === "AOI-01" ? (
                <Link
                  href="/peta/AOI-01/bandingkan"
                  className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-bold"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Buka Slider Pembanding</span>
                </Link>
              ) : null}
            </div>

            {/* Pillar 2: field evidence (report or confirmation, D4) */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>2. Laporan Lapangan</span>
                </div>
                {fieldLines.length > 0 ? (
                  fieldLines.map((line) => (
                    <div key={line} className="text-white font-bold text-xs mb-1">
                      {line}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-300 leading-normal mb-2">
                    Belum ada laporan lapangan.
                  </p>
                )}
              </div>
            </div>

            {/* Pillar 3: open narrative (computed counts) */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col justify-between text-xs font-mono">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>3. Narasi Terbuka (simulasi)</span>
                </div>
                <div className="text-white font-bold text-xs mb-1">
                  {topicLabel(active.topicId)}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPosts((v) => !v)}
                  className="block text-left text-[11px] text-slate-300 leading-normal mb-1 hover:underline"
                >
                  {active.totalContent} konten · {active.distinctAccounts} akun unik
                </button>
                <button
                  type="button"
                  onClick={() => setShowPosts((v) => !v)}
                  className="block text-left text-[11px] text-slate-300 leading-normal mb-2 hover:underline"
                >
                  Lokasi unggahan: {active.locatedContent}/{active.totalContent} konten
                </button>
                {showPosts && (
                  <ul className="mb-2 space-y-1">
                    {active.narrativeItemIds.map((id) => {
                      const item = items.find((i) => i.id === id);
                      return (
                        <li key={id} className="text-[10px] text-slate-300">
                          {id} · {item?.authorAccount ?? "—"} ·{" "}
                          {item?.publishedAoiId ?? "tanpa lokasi unggahan"} · {item?.title}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <Link
                href={`/narasi?topic=${active.topicId}&window=${DEFAULT_WINDOW_PRESET}`}
                className="text-[10px] text-amber-300 font-bold hover:underline"
              >
                Buka di Konsentrasi Narasi →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
