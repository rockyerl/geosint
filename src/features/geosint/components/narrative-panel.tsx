"use client";

import React, { useState } from "react";
import { NarrativeCluster } from "../types";
import {
  MessageSquare,
  TrendingUp,
  MapPin,
  Tag,
  Radio,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface NarrativePanelProps {
  clusters: NarrativeCluster[];
  selectedClusterId?: string;
  onSelectCluster?: (clusterId: string) => void;
}

export function NarrativePanel({
  clusters,
  selectedClusterId,
  onSelectCluster,
}: NarrativePanelProps) {
  const [activeId, setActiveId] = useState<string>(
    selectedClusterId || (clusters.length > 0 ? clusters[0].id : "")
  );

  const activeCluster = clusters.find((c) => c.id === activeId) || clusters[0];

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onSelectCluster) onSelectCluster(id);
  };

  if (!activeCluster) {
    return (
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs font-mono text-slate-400">
        Tidak ada klaster narasi terbuka untuk filter wilayah ini.
      </div>
    );
  }

  // Account threshold check (RAB spec: minimum 10 accounts)
  const meetsAccountThreshold = activeCluster.uniqueAccountsCount >= 10;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Kelompok Narasi Terbuka (GEO-18 · OSINT / GDELT)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
          Simulasi Feed Terbuka
        </span>
      </div>

      {/* Cluster Tabs if multiple */}
      {clusters.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {clusters.map((c) => {
            const isTabActive = c.id === activeCluster.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                  isTabActive
                    ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{c.id}: </span>
                <span className="truncate max-w-[180px] inline-block align-bottom">{c.theme}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Cluster Summary Card */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40 text-[10px] font-mono font-bold">
                {activeCluster.id}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Target: <strong className="text-white">{activeCluster.targetAoiId}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                Sumber: {activeCluster.sourceId}
              </span>
            </div>
            <h4 className="text-base font-bold text-white leading-snug">{activeCluster.theme}</h4>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              VOLUME KONTEN:
            </span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {activeCluster.totalContent}{" "}
              <span className="text-xs font-normal text-slate-400">Post / Berita</span>
            </span>
          </div>
        </div>

        {/* Volume Trend Sparkline Visualization */}
        <div className="pt-3 border-t border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Tren Volume Konten Terbuka (48 Jam Terakhir):
            </span>
            <span>Lonjakan seiring curah hujan</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            {activeCluster.volumeTrend.map((point, idx) => (
              <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 mb-1">{point.time}</div>
                <div className="text-base font-black text-indigo-400">{point.count}</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, point.count * 11)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Account Aggregation Widget (RAB Threshold: min 10 accounts) */}
        <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-300 font-bold">Agregat Akun Unik per Wilayah: </span>
              {meetsAccountThreshold ? (
                <strong className="text-white">{activeCluster.uniqueAccountsCount} Akun</strong>
              ) : (
                <span className="text-amber-300 font-bold">
                  Status Cakupan: Di Bawah Ambang Batas (Angka Disembunyikan Sesuai Standar RAB)
                </span>
              )}
              <span className="text-[10px] text-slate-400 ml-1.5">
                (Ambang Batas RAB: $\ge$ 10 Akun)
              </span>
            </div>
          </div>

          <div>
            {meetsAccountThreshold ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                AMBANG TERPENUHI (DATA VALID)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                STATUS: CAKUPAN TERBATAS (&lt; 10 AKUN)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Distinction of 3 Locations Guide Banner */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg mb-4 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-400 font-bold uppercase text-[10px]">
          DIFERENSIASI METADATA LOKASI (P0):
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-indigo-300">
            <MapPin className="w-3.5 h-3.5" /> 1. Lokasi Kejadian (Satelit)
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Tag className="w-3.5 h-3.5" /> 2. Wilayah Disebut dalam Konten
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <Radio className="w-3.5 h-3.5" /> 3. Lokasi Akun Unggahan (Geotag)
          </span>
        </div>
      </div>

      {/* Narrative Items Sample Feed */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">
          Sampel Bukti Konten Terbuka ({activeCluster.items.length}):
        </span>

        {activeCluster.items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-all text-xs"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span className="font-bold text-indigo-400">
                {item.id} • {item.authorAccount}
              </span>
              <span>{item.publishedAt}</span>
            </div>

            <h5 className="font-bold text-white text-sm mb-1">{item.headline}</h5>
            <p className="text-slate-300 leading-relaxed mb-3">{item.snippet}</p>

            {/* Three Location Breakdown Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-slate-800 text-[11px] font-mono">
              {/* 2. Mentioned Location */}
              <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-400">Disebut:</span>
                <strong className="truncate">{item.mentionedLocation}</strong>
              </div>

              {/* 3. Author Geolocation Metadata */}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                  item.authorLocation
                    ? "text-emerald-300 bg-emerald-950/40 border-emerald-500/40"
                    : "text-slate-400 bg-slate-900 border-slate-700"
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-400">Unggahan:</span>
                <strong className="truncate">
                  {item.authorLocation || "Tanpa Geotag (Anonim / Tidak Ada Koordinat)"}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
