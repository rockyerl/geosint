"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGeosint } from "../context";
import { MapCanvas } from "./map-canvas";
import { buildNarrativeClusterViews } from "../analysis";
import { Crosshair, Sliders, MapPin, MessageSquare, Link2, Calendar } from "lucide-react";

export function TacticalMapView() {
  const { state } = useGeosint();
  const router = useRouter();

  const [selectedAoiId, setSelectedAoiId] = useState<string>("AOI-01");
  const [timeWindowHours, setTimeWindowHours] = useState<number>(48);

  const selectedAoi = state.areas.find((a) => a.id === selectedAoiId) || state.areas[0];

  const aoiEvents = state.events.filter((e) => e.aoiId === selectedAoiId);
  const aoiScenes = state.scenes.filter((s) => s.aoiId === selectedAoiId);
  const aoiNarratives = buildNarrativeClusterViews(
    state.narrativeThemes,
    state.narrativeItems,
    state.demoPreset.window
  ).filter((n) => n.targetAoiId === selectedAoiId);
  const aoiCorrelations = (state.correlations || []).filter((c) => c.aoiId === selectedAoiId);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-indigo-400 font-semibold">KODIKLAT TNI AD</span>
            <span>/</span>
            <span className="text-white">Ruang Kerja Analis Geospasial</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-indigo-400" />
            <span>Peta Taktis & Analisis Sektor Latihan</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {selectedAoiId === "AOI-01" && (
            <Link
              href="/peta/AOI-01/bandingkan"
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
            >
              <Sliders className="w-4 h-4" />
              <span>Buka Pembanding Radar Aruna</span>
            </Link>
          )}
          {selectedAoiId === "AOI-03" && (
            <Link
              href="/peta/AOI-03/bandingkan"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>Buka Citra Nila (38% Awan)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Shared Temporal Filter Bar (P0) */}
      <div className="mb-6 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-300 font-bold uppercase">Filter Waktu Bersama:</span>
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setTimeWindowHours(48)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeWindowHours === 48
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              48 Jam (Skenario Utama)
            </button>
            <button
              onClick={() => setTimeWindowHours(168)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeWindowHours === 168
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeWindowHours(0)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeWindowHours === 0
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Periode
            </button>
          </div>
        </div>

        <span className="text-[11px] text-indigo-300">
          Sektor: <strong>{selectedAoi.name}</strong> • Citra, Kejadian & Narasi Tersinkron
        </span>
      </div>

      {/* Main Grid: Interactive Map Canvas (8 cols) & Sector Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <MapCanvas
            selectedAoiId={selectedAoiId}
            onSelectAoi={(id) => setSelectedAoiId(id)}
            onSelectEvent={(eventId) => router.push(`/kejadian/${eventId}`)}
          />
        </div>

        {/* Sector Detail Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AOI Selector Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              PILIH SEKTOR AOI:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {state.areas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAoiId(a.id)}
                  className={`p-2 rounded-lg text-xs font-mono font-bold text-center border transition-all ${
                    selectedAoiId === a.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="block">{a.id}</span>
                  <span className="text-[10px] font-normal text-slate-400 truncate block">
                    {a.name.split(" ")[1] || a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected AOI Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Profil Sektor: {selectedAoi.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-300 font-bold">
                {selectedAoi.id}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono mb-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Luas Wilayah:</span>
                <span className="font-bold text-white">
                  {selectedAoi.areaKm2.toLocaleString("id-ID")} km²
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Citra Tersimpan:</span>
                <span className="font-bold text-white">{aoiScenes.length} Scene</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Kejadian Terpantau:</span>
                <span className="font-bold text-indigo-400">{aoiEvents.length} Anomali</span>
              </div>
            </div>

            {/* Citra Scenes in this AOI */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Aset Citra Sektor ({aoiScenes.length}):
              </span>
              <div className="space-y-2">
                {aoiScenes.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="font-bold text-indigo-400">{sc.id}</span>
                      <span className="text-slate-400">{sc.sensor}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">
                      Waktu: {sc.capturedAt}
                    </div>
                    {sc.cloudPercent !== null && (
                      <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                        Tutupan Awan: {sc.cloudPercent}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* P0: Kelompok Narasi & Korelasi Sektor Ini */}
            {aoiNarratives.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    Klaster Narasi Terbuka (GEO-18):
                  </span>
                </div>
                <div className="space-y-2">
                  {aoiNarratives.map((nar) => (
                    <div
                      key={nar.id}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className="font-bold text-white truncate">{nar.theme}</span>
                        <span className="text-indigo-400 font-bold shrink-0">
                          {nar.totalContent} Konten
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>
                          {nar.uniqueAccountsCount >= 10
                            ? `Akun Unik: ${nar.uniqueAccountsCount}`
                            : "Status: Di Bawah Ambang RAB"}
                        </span>
                        <span>•</span>
                        <span
                          className={
                            nar.uniqueAccountsCount >= 10 ? "text-emerald-400" : "text-amber-400"
                          }
                        >
                          {nar.uniqueAccountsCount >= 10 ? "≥10 Valid RAB" : "<10 Data Terbatas"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* P0: Multi-source Correlation Rationale */}
            {aoiCorrelations.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5 mb-2">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    Temuan Korelasi Wilayah–Waktu (GEO-19):
                  </span>
                </div>
                <div className="space-y-2">
                  {aoiCorrelations.map((corr) => (
                    <div
                      key={corr.id}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className="font-bold text-indigo-400">{corr.id}</span>
                        <span className="text-slate-400 text-[10px]">{corr.timeWindow}</span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed mb-1.5">
                        {corr.rationale}
                      </p>
                      <Link
                        href={`/kejadian/${corr.eventId}`}
                        className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Buka Lembar Analis {corr.eventId}</span>
                        <span>→</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
