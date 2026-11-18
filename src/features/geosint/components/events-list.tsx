"use client";

import React from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { EventKind, EventStatus, GeoEvent, EventSummaryProjection } from "../types";
import {
  ShieldAlert,
  Search,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Flame,
  Droplets,
  Trees,
} from "lucide-react";

export function EventsList() {
  const { role, repo, filter, setFilter, clearFilter } = useGeosint();

  const { events, total } = repo.listEvents(role, filter);

  const getKindIcon = (kind: EventKind) => {
    switch (kind) {
      case "flood":
        return <Droplets className="w-4 h-4 text-indigo-400" />;
      case "hotspot":
        return <Flame className="w-4 h-4 text-amber-400" />;
      case "land_change":
        return <Trees className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "pending_review":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/50 uppercase">
            Menunggu Tinjauan
          </span>
        );
      case "follow_up_required":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600/50 uppercase">
            Perlu Konfirmasi Lapangan
          </span>
        );
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/50 uppercase">
            Selesai (Resolved)
          </span>
        );
    }
  };

  const isFilterActive =
    filter.aoiId !== "all" ||
    filter.kind !== "all" ||
    filter.status !== "all" ||
    (filter.search && filter.search.trim() !== "");

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-indigo-400 font-semibold">KODIKLAT TNI AD</span>
            <span>/</span>
            <span className="text-white">Daftar Kejadian Taktis Terpantau</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Daftar Kejadian & Antrean Triase ({total})</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={clearFilter}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus Filter</span>
            </button>
          )}

          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300">
            Peran: <strong className="uppercase">{role}</strong>
          </span>
        </div>
      </div>

      {/* Multi-facet Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 space-y-3">
        {/* Row 1: Time Window Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rentang Waktu Pengamatan:</span>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setFilter((prev) => ({ ...prev, timeWindowHours: 48 }))}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter.timeWindowHours === 48
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                48 Jam (Demo Skenario)
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, timeWindowHours: 168 }))}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter.timeWindowHours === 168
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, timeWindowHours: undefined }))}
                className={`px-2.5 py-1 rounded transition-colors ${
                  !filter.timeWindowHours
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua Rentang
              </button>
            </div>
          </div>

          <div className="text-[11px] text-indigo-400">
            {filter.timeWindowHours
              ? `Filter aktif: ${filter.timeWindowHours} jam terakhir`
              : "Semua periode aktif"}
          </div>
        </div>

        {/* Row 2: Search and Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search || ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Cari ID, kata kunci..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* AOI Filter */}
          <div>
            <select
              value={filter.aoiId || "all"}
              onChange={(e) => setFilter((prev) => ({ ...prev, aoiId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Sektor Wilayah (3 AOI)</option>
              <option value="AOI-01">AOI-01: Sektor Sungai Aruna</option>
              <option value="AOI-02">AOI-02: Bukit Sagara</option>
              <option value="AOI-03">AOI-03: Dataran Nila</option>
            </select>
          </div>

          {/* Kind Filter */}
          <div>
            <select
              value={filter.kind || "all"}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, kind: e.target.value as EventKind | "all" }))
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Jenis Anomali</option>
              <option value="flood">Genangan / Banjir (flood)</option>
              <option value="hotspot">Titik Panas Termal (hotspot)</option>
              <option value="land_change">Perubahan Lahan (land_change)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filter.status || "all"}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, status: e.target.value as EventStatus | "all" }))
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending_review">pending_review (Menunggu Tinjauan)</option>
              <option value="follow_up_required">follow_up_required (Perlu Konfirmasi)</option>
              <option value="resolved">resolved (Selesai)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List Cards */}
      {events.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            Tidak ada kejadian dalam rentang atau kriteria filter ini
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Kombinasi pencarian atau filter status saat ini tidak menghasilkan data yang cocok.
          </p>
          <button
            onClick={clearFilter}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Hapus Filter & Tampilkan Semua</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev: GeoEvent | EventSummaryProjection) => {
            const hasAreaName = "areaName" in ev && typeof ev.areaName === "string";
            const areaName = hasAreaName
              ? ev.areaName
              : ev.aoiId === "AOI-01"
                ? "Sektor Sungai Aruna"
                : ev.aoiId === "AOI-02"
                  ? "Bukit Sagara"
                  : "Dataran Nila";

            const count =
              "evidenceCount" in ev
                ? ev.evidenceCount
                : "evidenceIds" in ev
                  ? ev.evidenceIds.length
                  : 0;

            return (
              <Link
                key={ev.id}
                href={`/kejadian/${ev.id}`}
                className="block bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 sm:p-5 transition-all shadow-lg group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {getKindIcon(ev.kind)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-xs">
                        <span className="font-bold text-indigo-400">{ev.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300 font-semibold">
                          {areaName} ({ev.aoiId})
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Koordinat: [{ev.point.join(", ")}]</span>
                        {("hasCorrelatedNarrative" in ev
                          ? ev.hasCorrelatedNarrative
                          : ev.id === "G-101") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-bold">
                            GDELT Terkorelasi
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {ev.title}
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
                        <span>
                          Waktu Observasi:{" "}
                          <strong className="text-slate-300">{ev.observedAt}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Bukti Terhubung: <strong className="text-indigo-400">{count}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    {getStatusBadge(ev.status)}
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-400 group-hover:text-indigo-400 transition-colors">
                      <span>Buka detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
