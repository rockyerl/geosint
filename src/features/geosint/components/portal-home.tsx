"use client";

import React from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { Role } from "../types";
import { ChevronRight, Radio, Monitor, Flame, Droplets, Trees, CheckCircle2 } from "lucide-react";

export function PortalHome() {
  const { role, setRole } = useGeosint();

  const rolesList: { id: Role; title: string; desc: string; access: string }[] = [
    {
      id: "analis",
      title: "Analis Geospasial",
      desc: "Akses penuh peta kanvas taktis, pembanding citra radar sebelum/sesudah, antrean triase bukti, catatan analis, penyusunan draf serta persetujuan briefing.",
      access: "Dashboard, Peta, Pembanding Citra, Bukti Lengkap, Draf Briefing",
    },
    {
      id: "pimpinan",
      title: "Pimpinan Kodiklat",
      desc: "Menerima briefing resmi yang telah disetujui, membaca ringkasan status operasional sektor latihan, arahan pengecekan konvoi, dan memantau wallboard.",
      access: "Dashboard Eksekutif, Briefing Resmi Cetak, Wallboard 16:9",
    },
    {
      id: "operator",
      title: "Operator Sistem / Data",
      desc: "Mengelola katalog 4 sumber telemetri, mensimulasikan ingesti batch laporan lapangan (valid & invalid), memeriksa audit trail, dan reset data fixture.",
      access: "Katalog Sumber, Simulator Ingesti, Log Audit, Reset Fixture",
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl w-full mx-auto font-sans">
      {/* Hero Mission Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 mb-8 overflow-hidden shadow-2xl">
        {/* Radar background grid decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#6366F1" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#6366F1" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#6366F1" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#6366F1" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            PROTOTIPE GEOSINT ON-PREMISE v0.1 · KODIKLAT TNI AD
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Intelijen Geospasial Kesiapan Sektor Latihan
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            Membantu pimpinan Kodiklat menetapkan sektor yang perlu diperiksa sebelum menilai
            kesiapan area latihan militer, dengan memverifikasi umur data sensor, bukti citra radar
            (SAR), dan status peninjauan terintegrasi.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/peta/AOI-01/bandingkan"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold font-mono flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/30"
            >
              <span>Mulai dari Skenario Genangan Aruna</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold font-mono flex items-center gap-2 transition-colors"
            >
              <Radio className="w-4 h-4" />
              <span>Buka Dashboard Operasional</span>
            </Link>

            <Link
              href="/wallboard"
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs sm:text-sm font-mono flex items-center gap-2 transition-colors"
            >
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span>Layar Wallboard 16:9</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role Selection Interactive Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Pilih Peran Demonstrasi (Demo Role Switcher)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Proyeksi layar dan hak mutasi dibangun ulang seketika berdasarkan peran yang aktif
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Peran Aktif: <strong className="text-indigo-400 uppercase">{role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rolesList.map((r) => {
            const isActive = role === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`p-6 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-indigo-950/50 border-indigo-500 shadow-xl shadow-indigo-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-bold uppercase">
                      {r.id}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SEDANG AKTIF
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        Klik untuk beralih
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{r.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{r.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500 block uppercase text-[10px]">Cakupan Akses:</span>
                  <span className="text-slate-200">{r.access}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Demonstration Scenarios Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Tiga Skenario Pengambilan Keputusan
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Alur demonstrasi lengkap yang siap dievaluasi oleh Tim Kodiklat
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scenario 1: Genangan Aruna */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Droplets className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase">
                  Skenario 1 · Alur Utama
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Genangan di Sektor Sungai Aruna (AOI-01)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Dua citra radar Sentinel SAR (sebelum & sesudah hujan), lapisan indikasi genangan,
                laporan akses lapangan, dan simulasi impor bukti konfirmasi terestrial (E-06).
              </p>
            </div>

            <Link
              href="/peta/AOI-01/bandingkan"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
            >
              <span>Jalankan Skenario 1</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scenario 2: Titik Panas Sagara */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase">
                  Skenario 2 · Titik Panas
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Titik Panas Bukit Sagara (AOI-02)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Sensor FIRMS simulasi berstatus tertunda (&gt;12 jam). Analis meminta konfirmasi
                petugas patroli lapangan sebelum menyimpulkan potensi bahaya kebakaran area latihan.
              </p>
            </div>

            <Link
              href="/kejadian/G-102"
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Periksa Kejadian G-102</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scenario 3: Citra Tunggal Nila */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Trees className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase">
                  Skenario 3 · Tutupan Lahan
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Perubahan Lahan Dataran Nila (AOI-03)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Citra optik tunggal dengan cakupan awan 38%. Sistem menonaktifkan slider pembanding
                secara elegan dengan pesan &quot;Pasangan citra belum tersedia&quot;.
              </p>
            </div>

            <Link
              href="/peta/AOI-03/bandingkan"
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Periksa Sektor AOI-03</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
