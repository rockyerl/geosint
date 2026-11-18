"use client";

import React, { useState } from "react";
import { useGeosint } from "../context";
import { INITIAL_FIXTURE } from "../fixtures";
import { getSourceFreshness } from "../repository";
import { Database, UploadCloud, RotateCcw, XCircle, FileCheck, Clock } from "lucide-react";

export function SourcesCatalog() {
  const { state, simulateImport, resetDemo, showToast } = useGeosint();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState("");

  const sourcesWithFreshness = state.sources.map((src) => ({
    ...src,
    freshness: getSourceFreshness(src, state.demoNow),
  }));

  const handleRunValidImport = () => {
    simulateImport(INITIAL_FIXTURE.demoActions.validImport);
  };

  const handleRunSagaraImport = () => {
    simulateImport(INITIAL_FIXTURE.demoActions.sagaraImport);
  };

  const handleRunInvalidImport = () => {
    simulateImport(INITIAL_FIXTURE.demoActions.invalidImport);
  };

  const handleConfirmReset = () => {
    if (resetConfirmationText.toUpperCase() !== "RESET") {
      showToast("Ketik 'RESET' untuk mengonfirmasi pemulihan data", "error");
      return;
    }
    const res = resetDemo(true);
    if (res.success) {
      setIsResetModalOpen(false);
      setResetConfirmationText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-indigo-400 font-semibold">KONSOL OPERATOR SISTEM</span>
            <span>/</span>
            <span className="text-white">Katalog Sumber Data & Simulasi Ingesti</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>Katalog Sumber Data & Kontrol Simulasi Ingesti</span>
          </h1>
        </div>

        {/* System Reset Button */}
        <div>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-rose-950/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Fixture Demo (Seed v1)</span>
          </button>
        </div>
      </div>

      {/* 4 Data Sources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sourcesWithFreshness.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-bold">
                  {src.id}
                </span>

                {src.freshness === "ready" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                    READY (TERSEDIA)
                  </span>
                )}
                {src.freshness === "delayed" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                    DELAYED (TERTUNDA)
                  </span>
                )}
                {src.freshness === "unavailable" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                    UNAVAILABLE
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1">{src.label}</h3>

              <div className="text-xs text-slate-400 space-y-1 mb-4 font-mono">
                <div>
                  Jenis: <span className="text-slate-200">{src.kinds.join(", ")}</span>
                </div>
                <div>
                  Toleransi Umur: <span className="text-slate-200">{src.freshForHours} Jam</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Terakhir Impor:{" "}
              <strong className="text-white block truncate">
                {src.lastSuccessfulImportAt || "Belum ada impor sukses"}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Ingestion Simulation Testing Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Simulator Impor Batch Laporan & Telemetri
          </h2>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Gunakan tombol di bawah ini untuk mensimulasikan alur verifikasi penerimaan data
          operasional secara lokal. Sesuai spesifikasi uji penerimaan demonstrasi (G-DEMO-06),
          sistem menguji validasi referensi AOI, kejadian dan sumber, asosiasi bukti lapangan,
          deteksi duplikat, dan penolakan batch yang tidak valid.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: Valid Import (B-101) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  BATCH B-101 (VALID)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Target: G-101 (Aruna)
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Impor Bukti E-06: Konfirmasi Lapangan Genangan
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Menyisipkan bukti tipe <code>field_confirmation</code> dari petugas terestrial,
                mengaitkannya ke kejadian G-101, dan memperbarui status kesegaran sumber{" "}
                <code>SRC-INT</code>. Jika dijalankan lebih dari 1 kali, sistem mendeteksi duplikat
                dan menolak penambahan ganda.
              </p>
            </div>

            <button
              onClick={handleRunValidImport}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FileCheck className="w-4 h-4" />
              <span>Simulasikan Impor Batch B-101 (Valid E-06)</span>
            </button>
          </div>

          {/* Action 2: Sagara patrol import (B-103) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  BATCH B-103 (VALID)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Target: G-102 (Sagara)
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Impor Bukti E-08: Laporan Patroli Sagara
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Menyisipkan laporan patroli simulasi tipe <code>field_confirmation</code> ke
                kejadian G-102: pembakaran lahan terkendali oleh warga, bukan ancaman. Setelah itu
                analis dapat menyelesaikan G-102.
              </p>
            </div>

            <button
              onClick={handleRunSagaraImport}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FileCheck className="w-4 h-4" />
              <span>Impor laporan patroli Sagara (B-103)</span>
            </button>
          </div>

          {/* Action 3: Invalid Import (B-102) */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-rose-400">
                  BATCH B-102 (INVALID)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                  Penyebab: AOI-99
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Uji Penolakan Batch: AOI Tidak Dikenal
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Mensimulasikan kiriman batch data cacat dengan referensi wilayah yang tidak
                terdaftar (AOI-99). Sistem menolak seluruh isi batch tanpa menambah bukti, mencatat
                kegagalan pada log audit, dan memajukan jam simulasi 1 menit.
              </p>
            </div>

            <button
              onClick={handleRunInvalidImport}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulasikan Impor Batch B-102 (Invalid / Error)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Histori Batch Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Histori Batch Ingesti ({state.batchLogs.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Semua riwayat pemrosesan lokal
          </span>
        </div>

        {state.batchLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Belum ada batch simulasi impor yang dijalankan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Batch ID</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total Item</th>
                  <th className="py-2.5 px-3">Diterima</th>
                  <th className="py-2.5 px-3">Duplikat</th>
                  <th className="py-2.5 px-3">Gagal</th>
                  <th className="py-2.5 px-3">Catatan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.batchLogs.map((log, idx) => (
                  <tr key={`batch-${idx}`} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-indigo-400">{log.batchId}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === "success"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                            : log.status === "duplicate"
                              ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                              : "bg-rose-950 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{log.itemCount}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{log.acceptedCount}</td>
                    <td className="py-2.5 px-3 text-amber-400">{log.duplicateCount}</td>
                    <td className="py-2.5 px-3 text-rose-400">{log.failedCount}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset Demo */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/60 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Konfirmasi Reset Fixture Demo</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh dataset kejadian, bukti, peninjauan, dan
              briefing ke versi seed awal (v1). Jam simulasi operasi akan kembali ke{" "}
              <strong className="text-indigo-400">2026-11-17 09:00 WIB</strong>.
            </p>

            <div className="mb-6">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Ketik <strong className="text-rose-400">RESET</strong> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={resetConfirmationText}
                onChange={(e) => setResetConfirmationText(e.target.value)}
                placeholder="RESET"
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmationText("");
                }}
                className="px-4 py-2 rounded-lg bg-slate-950 text-slate-300 text-xs font-mono hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmationText.toUpperCase() !== "RESET"}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                  resetConfirmationText.toUpperCase() === "RESET"
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Ya, Reset Seluruh Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
