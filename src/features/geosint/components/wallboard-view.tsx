"use client";

import React from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { MapCanvas } from "./map-canvas";
import { getSourceFreshness } from "../repository";
import {
  Satellite,
  Radio,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Maximize,
  Layers,
} from "lucide-react";

export function WallboardView() {
  const { state, kpis } = useGeosint();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formattedDemoTime = React.useMemo(() => {
    try {
      const d = new Date(state.demoNow);
      return (
        d.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    } catch {
      return state.demoNow;
    }
  }, [state.demoNow]);

  const sources = state.sources.map((src) => {
    const freshness = getSourceFreshness(src, state.demoNow);
    return {
      ...src,
      freshness,
    };
  });

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col font-sans p-3 sm:p-5 select-none overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Top Wallboard HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wider text-white">
                WALLBOARD KODIKLAT TNI AD <span className="text-indigo-400">C4ISR 16:9</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                AUTO-SYNC MULTI-TAB
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Pemantauan Kesiapan Sektor & Umur Data Spasial Real-Time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              JAM SIMULASI OPERASI:
            </span>
            <span
              className="text-base font-mono font-bold text-indigo-400"
              suppressHydrationWarning
            >
              {formattedDemoTime}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition-colors"
            title="Layar Penuh"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold">
            MODE DEMO · DATA FIKTIF
          </span>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* KPI 1: Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              TOTAL SEKTOR LATIHAN
            </span>
            <span className="text-2xl font-black text-white font-mono">{kpis.totalAreas}</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              3.240 + 1.860 + 2.120 km²
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              KEJADIAN AKTIF
            </span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {kpis.activeEvents}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Belum selesai (unresolved)
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Menunggu Tinjauan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
              MENUNGGU TINJAUAN
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono">
              {kpis.pendingReview}
            </span>
            <span className="text-[10px] text-amber-400/80 block font-mono">
              Memerlukan analisis
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Menunggu Konfirmasi */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
              PERLU KONFIRMASI
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              {kpis.followUpRequired}
            </span>
            <span className="text-[10px] text-rose-400/80 block font-mono">
              Petugas lapangan aktif
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Center Stage: Left Tactical Map, Right Sensor Status & Triage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Aggregated Tactical Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-400 font-bold">
              PETA SITUASI TAKTIS AGREGAT (3 AREA PANTAUAN)
            </span>
            <span className="text-slate-400 text-[10px]">
              Tampilan 16:9 Adaptif · 1920x1080 / 3840x2160 (4K)
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center p-2">
            <MapCanvas />
          </div>
        </div>

        {/* Right Telemetry Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Data Freshness Telemetry Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Satellite className="w-4 h-4 text-indigo-400" />
                Status & Umur Data Sumber
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {sources.map((src) => {
                return (
                  <div
                    key={src.id}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{src.label}</div>
                      <div className="text-[10px] text-slate-400">
                        {src.lastSuccessfulImportAt
                          ? `Terakhir: ${src.lastSuccessfulImportAt.slice(11, 16)} WIB`
                          : "Belum pernah impor"}
                      </div>
                    </div>

                    <div>
                      {src.freshness === "ready" && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold">
                          TERSEDIA (READY)
                        </span>
                      )}
                      {src.freshness === "delayed" && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/50 text-[10px] font-bold">
                          TERTUNDA (&gt;{src.freshForHours}H)
                        </span>
                      )}
                      {src.freshness === "unavailable" && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                          BELUM TERSEDIA
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Triage Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Antrean Triase Kejadian ({state.events.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Prioritas Tinggi</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
              {state.events.map((ev) => {
                const area = state.areas.find((a) => a.id === ev.aoiId);
                return (
                  <Link
                    key={ev.id}
                    href={`/kejadian/${ev.id}`}
                    className="block p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-indigo-400">{ev.id}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          ev.status === "pending_review"
                            ? "bg-amber-950 text-amber-300 border border-amber-700/50"
                            : ev.status === "follow_up_required"
                              ? "bg-rose-950 text-rose-300 border border-rose-700/50"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium truncate">{ev.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {area?.name} • Bukti: {ev.evidenceIds.length}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
