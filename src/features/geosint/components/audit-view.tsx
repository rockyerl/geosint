"use client";

import React, { useState } from "react";
import { useGeosint } from "../context";
import { History, Search, Filter, XCircle, CheckCircle } from "lucide-react";

export function AuditView() {
  const { state } = useGeosint();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredAudits = state.audits.filter((item) => {
    if (actionFilter !== "all" && item.action !== actionFilter) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        item.targetId.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.actorId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-indigo-400 font-semibold">KONSOL OPERATOR SISTEM</span>
            <span>/</span>
            <span className="text-white">Audit Trail Keamanan & Operasional</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Audit Trail Operasional (Immutable Log)</span>
          </h1>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300">
          Total Rekaman: {state.audits.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari target ID, rincian, aktor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Action Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Semua Jenis Aksi</option>
            <option value="review">Peninjauan Kejadian (review)</option>
            <option value="publish_brief">Publikasi Briefing (publish_brief)</option>
            <option value="import_batch">Impor Batch (import_batch)</option>
            <option value="reset">Reset Fixture (reset)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {filteredAudits.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            Tidak ada entri log audit yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aktor / Peran</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Rincian Operasional</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAudits.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{item.timestamp}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-white">{item.actorId}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        [{item.role}]
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 text-[10px] font-bold uppercase">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {item.targetId}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">{item.details}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.success ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> SUKSES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> GAGAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
