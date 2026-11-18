"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGeosint } from "../context";
import { MapCanvas } from "./map-canvas";
import { getSourceFreshness } from "../repository";
import {
  Satellite,
  ShieldAlert,
  Clock,
  Layers,
  AlertTriangle,
  ChevronRight,
  Radio,
  Sliders,
  ExternalLink,
  MessageSquare,
  Link2,
  Calendar,
} from "lucide-react";

export function GeosintDashboard() {
  const { role, state, kpis, setFilter, clearFilter } = useGeosint();
  const router = useRouter();

  // Active temporal window state for demo
  const [activeWindowHours, setActiveWindowHours] = useState<number>(48);
  const [selectedDashboardAoi, setSelectedDashboardAoi] = useState<string>("AOI-01");

  // Click on KPI card navigates/filters
  const handleKpiFilter = (status?: "pending_review" | "follow_up_required" | "resolved") => {
    if (!status) {
      clearFilter();
      router.push("/kejadian");
    } else {
      setFilter((prev) => ({ ...prev, status }));
      router.push("/kejadian");
    }
  };

  const sourcesWithFreshness = state.sources.map((src) => ({
    ...src,
    freshness: getSourceFreshness(src, state.demoNow),
  }));

  // Narrative cluster for selected sector
  const narrativeClusters = (state.narrativeClusters || []).filter(
    (n) => n.targetAoiId === selectedDashboardAoi
  );
  const activeCluster = narrativeClusters[0];

  // Correlation for selected sector
  const sectorCorrelations = (state.correlations || []).filter(
    (c) => c.aoiId === selectedDashboardAoi
  );
  const activeCorr = sectorCorrelations[0];

  const handleWindowChange = (hours: number) => {
    setActiveWindowHours(hours);
    setFilter((prev) => ({
      ...prev,
      timeWindowHours: hours > 0 ? hours : undefined,
    }));
  };

  const handleAoiChange = (aoiId: string) => {
    setSelectedDashboardAoi(aoiId);
    setFilter((prev) => ({
      ...prev,
      aoiId: aoiId === "all" ? undefined : aoiId,
    }));
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Top Welcome & Mission Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-indigo-400 font-semibold">KODIKLAT TNI AD</span>
            <span>/</span>
            <span className="text-white">Pusat Komando & Analisis Kesiapan Latihan</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <span>DASHBOARD OPERASIONAL GEOSINT</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 font-normal uppercase">
              Peran: {role}
            </span>
          </h1>
        </div>

        {/* Quick Launchers for Scenarios */}
        <div className="flex items-center gap-2">
          <Link
            href="/peta/AOI-01/bandingkan"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alur Utama: Genangan Aruna</span>
          </Link>
          <Link
            href="/wallboard"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/25"
          >
            <span>Buka Wallboard 16:9</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* P0: Shared Multi-source Filter Bar (Synchronous Filter: Wilayah + Periode) */}
      <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              Filter Bersama (P0):
            </span>
          </div>

          {/* Sektor Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            {state.areas.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAoiChange(a.id)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedDashboardAoi === a.id
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {a.id} ({a.name.split(" ")[1] || a.name})
              </button>
            ))}
          </div>

          {/* Temporal Window Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <button
              onClick={() => handleWindowChange(48)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeWindowHours === 48
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rentang 48 Jam (Demo)
            </button>
            <button
              onClick={() => handleWindowChange(168)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeWindowHours === 168
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => handleWindowChange(0)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeWindowHours === 0
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-indigo-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sinkronisasi Citra, Kejadian & Narasi Aktif</span>
        </div>
      </div>

      {/* 4 Interactive KPI Cards (Clicking opens /kejadian with corresponding filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Total Area */}
        <div
          onClick={() => router.push("/peta")}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-xl group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              TOTAL AREA PANTAUAN
            </span>
            <div className="p-2 rounded-lg bg-slate-950 text-indigo-400 border border-slate-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mb-1">
            {kpis.totalAreas} Sektor
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Luas: 7.220 km²</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        {/* KPI 2: Aktif */}
        <div
          onClick={() => handleKpiFilter()}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-xl group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              KEJADIAN AKTIF
            </span>
            <div className="p-2 rounded-lg bg-slate-950 text-indigo-400 border border-slate-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-400 font-mono mb-1">
            {kpis.activeEvents}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Belum Selesai (Unresolved)</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        {/* KPI 3: Menunggu Tinjauan */}
        <div
          onClick={() => handleKpiFilter("pending_review")}
          className="bg-slate-900 hover:bg-slate-800/80 border border-amber-600/40 hover:border-amber-400 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-xl group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              MENUNGGU TINJAUAN
            </span>
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-600/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono mb-1">
            {kpis.pendingReview}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Klik untuk filter tinjauan</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* KPI 4: Menunggu Konfirmasi */}
        <div
          onClick={() => handleKpiFilter("follow_up_required")}
          className="bg-slate-900 hover:bg-slate-800/80 border border-rose-600/40 hover:border-rose-400 rounded-xl p-4 sm:p-5 transition-all cursor-pointer shadow-xl group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              MENUNGGU KONFIRMASI
            </span>
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-600/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono mb-1">
            {kpis.followUpRequired}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Klik untuk filter konfirmasi</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Mini Map (Left 7 cols) & Telemetry / Queue (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tactical Mini Map */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Peta Taktis Sektor Latihan (Filter: {selectedDashboardAoi})
              </h2>
            </div>
            {role === "analis" && (
              <Link
                href="/peta"
                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Buka Peta Penuh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="flex-1">
            <MapCanvas
              isMiniMap={false}
              selectedAoiId={selectedDashboardAoi}
              onSelectEvent={(id) => router.push(`/kejadian/${id}`)}
              onSelectAoi={(id) => handleAoiChange(id)}
            />
          </div>

          <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Klik sektor untuk sinkronisasi citra dan narasi</span>
            <span className="text-indigo-400">Sektor Aktif: {selectedDashboardAoi}</span>
          </div>
        </div>

        {/* Right Side: Sensor Status & Event Triage Queue & Narrative Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          {/* P0: Narrative & Correlation Snapshot Card */}
          {activeCluster && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Tren Narasi Terbuka (48 Jam)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  {selectedDashboardAoi}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1 font-mono">
                    <span className="text-white font-bold">{activeCluster.theme}</span>
                    <span className="text-indigo-400 font-bold">
                      {activeCluster.totalContent} Konten
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Akun: {activeCluster.uniqueAccountsCount}</span>
                    <span>•</span>
                    <span
                      className={
                        activeCluster.uniqueAccountsCount >= 10
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {activeCluster.uniqueAccountsCount >= 10
                        ? "✓ Memenuhi Ambang RAB (≥10 Akun)"
                        : "⚠ Di Bawah Ambang RAB (<10 Akun)"}
                    </span>
                  </div>
                </div>

                {activeCorr && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 font-mono text-indigo-400 font-bold mb-1">
                      <Link2 className="w-4 h-4" />
                      <span>Korelasi 3-Pilar: {activeCorr.title}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                      {activeCorr.rationale}
                    </p>
                    <Link
                      href={`/kejadian/${activeCorr.eventId}`}
                      className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Lembar Kerja Analisis Korelasi</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sensor Freshness Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Status & Umur Data Sumber
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                4 Sumber
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {sourcesWithFreshness.map((src) => (
                <div
                  key={src.id}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{src.label}</div>
                    <div className="text-[10px] text-slate-400">
                      {src.lastSuccessfulImportAt
                        ? `Terakhir: ${src.lastSuccessfulImportAt.slice(11, 16)} WIB`
                        : "Belum pernah impor"}
                    </div>
                  </div>

                  <div>
                    {src.freshness === "ready" && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold">
                        READY
                      </span>
                    )}
                    {src.freshness === "delayed" && (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/50 text-[10px] font-bold">
                        TERTUNDA (&gt;{src.freshForHours}H)
                      </span>
                    )}
                    {src.freshness === "unavailable" && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                        UNAVAILABLE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Triage Queue Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Antrean Kejadian ({state.events.length})
                </h3>
              </div>
              <Link
                href="/kejadian"
                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {state.events.map((ev) => {
                const area = state.areas.find((a) => a.id === ev.aoiId);
                return (
                  <Link
                    key={ev.id}
                    href={`/kejadian/${ev.id}`}
                    className="block p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-indigo-400">{ev.id}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          ev.status === "pending_review"
                            ? "bg-amber-950 text-amber-300 border border-amber-600/50"
                            : ev.status === "follow_up_required"
                              ? "bg-rose-950 text-rose-300 border border-rose-600/50"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                        }`}
                      >
                        {ev.status === "pending_review" && "Tinjauan"}
                        {ev.status === "follow_up_required" && "Konfirmasi"}
                        {ev.status === "resolved" && "Selesai"}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                      <span>{area?.name}</span>
                      <span>Bukti: {ev.evidenceIds.length}</span>
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
