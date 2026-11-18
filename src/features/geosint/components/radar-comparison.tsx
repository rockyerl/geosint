"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import {
  Sliders,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Cloud,
  Radio,
} from "lucide-react";

interface RadarComparisonProps {
  aoiId: string;
  beforeSceneId?: string;
  afterSceneId?: string;
}

export function RadarComparison({
  aoiId,
  beforeSceneId = "SC-01",
  afterSceneId = "SC-02",
}: RadarComparisonProps) {
  const { repo, state } = useGeosint();

  const [sliderPos, setSliderPos] = useState<number>(50); // initial 50%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showIndicationLayer, setShowIndicationLayer] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const aoi = state.areas.find((a) => a.id === aoiId);
  const compResult = repo.getComparison("analis", aoiId, beforeSceneId, afterSceneId);

  // Keyboard navigation for slider
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPos((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      setSliderPos(0);
    } else if (e.key === "End") {
      setSliderPos(100);
    } else if (e.key === " ") {
      setSliderPos(50);
    }
  }, []);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(Math.round(pct));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("pointerup", handleGlobalMouseUp);
    return () => window.removeEventListener("pointerup", handleGlobalMouseUp);
  }, []);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return iso;
    }
  };

  // If comparison pair is not valid (e.g. AOI-03 Dataran Nila which only has SC-03)
  if (!compResult.success) {
    const availableScene = state.scenes.find((s) => s.aoiId === aoiId);

    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
          <Link href="/peta" className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Peta Taktis</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">{aoi?.name || aoiId}</span>
          <span>/</span>
          <span className="text-slate-300">Pembanding Citra</span>
        </div>

        {/* Warning Banner for Missing Pair */}
        <div className="bg-amber-950/70 border border-amber-500/50 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-200">
                Pasangan Citra Belum Tersedia untuk {aoi?.name || aoiId}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50 font-semibold">
                KONTROL PEMBANDING NONAKTIF
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-1">
              {compResult.error}. Sektor ini baru memiliki 1 citra optik tunggal dengan cakupan awan
              38%. Kontrol slider split-screen dinonaktifkan sampai pasangan citra berikutnya
              diperoleh.
            </p>
          </div>
        </div>

        {/* Single Scene Showcase */}
        {availableScene && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{availableScene.sensor}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">ID: {availableScene.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Waktu Akuisisi:{" "}
                  <strong className="text-indigo-400">
                    {formatDate(availableScene.capturedAt)}
                  </strong>
                </span>
                {availableScene.cloudPercent !== null && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1 font-bold">
                    <Cloud className="w-3.5 h-3.5" />
                    Tutupan Awan: {availableScene.cloudPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Satellite Viewer */}
            <div className="relative flex-1 min-h-[420px] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
              <div className="relative w-full max-w-2xl aspect-[16/10] bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                {/* Cloud cover visual overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none"></div>

                <div className="text-center p-6 z-10">
                  <Cloud className="w-16 h-16 text-slate-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-base font-bold text-white mb-1">
                    Citra Optik Tunggal: {availableScene.id}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                    Area Dataran Nila ({aoi?.areaKm2} km²) terpantau dengan tutupan awan parsial
                    38%. Diperlukan citra acuan tambahan untuk mendeteksi perubahan tutupan
                    vegetasi.
                  </p>
                  <span className="inline-block px-3 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-mono">
                    Status Analis: Catat keterbatasan & minta pasangan citra sebelum menyimpulkan
                    perubahan
                  </span>
                </div>

                {/* Corner reticles */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">
                  EXTENT: AOI-03 (24,13 s/d 72,34)
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
                  SENSOR: OPTIK 10M BAND 2-4-8
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
              Kontrol pembanding nonaktif · Memerlukan pasangan akuisisi citra baru
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Pair for AOI-01 Sektor Sungai Aruna
  const { before, after, floodOutline } = compResult;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Link href="/peta" className="hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Peta Taktis</span>
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">{aoi?.name}</span>
            <span>/</span>
            <span className="text-slate-300">Pembanding Citra Radar (SAR)</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Perbandingan Temporal: Sebelum vs Sesudah Hujan</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 font-normal">
              AOI-01
            </span>
          </h1>
        </div>

        {/* Indication Toggle & Quick Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIndicationLayer(!showIndicationLayer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              showIndicationLayer
                ? "bg-indigo-950 border-indigo-500 text-indigo-300 shadow-sm font-semibold"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            {showIndicationLayer ? (
              <Eye className="w-4 h-4 text-indigo-400" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span>Lapisan Indikasi Genangan (Perlu Tinjauan)</span>
          </button>

          <Link
            href="/kejadian/G-101"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/25"
          >
            <span>Buka Detail Kejadian G-101</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Split-Screen Comparison Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        {/* Telemetry metadata bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950 border-b border-slate-800 text-xs font-mono">
          {/* Left Metadata (Before) */}
          <div className="p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                CITRA ACUAN (SEBELUM)
              </span>
              <span className="font-bold text-white">
                {before.sensor} ({before.id})
              </span>
            </div>
            <div className="text-right">
              <span className="text-indigo-400 font-semibold">{formatDate(before.capturedAt)}</span>
              <span className="text-[10px] text-slate-400 block">
                Kualitas: Radar Normal (Kering)
              </span>
            </div>
          </div>

          {/* Right Metadata (After) */}
          <div className="p-3 flex items-center justify-between bg-slate-900/90">
            <div>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
                CITRA PASCA HUJAN (SESUDAH)
              </span>
              <span className="font-bold text-white">
                {after.sensor} ({after.id})
              </span>
            </div>
            <div className="text-right">
              <span className="text-amber-300 font-semibold">{formatDate(after.capturedAt)}</span>
              <span className="text-[10px] text-amber-400/80 block">
                Kualitas: Pantulan Genangan SAR
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Comparison Canvas Area */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[460px] bg-slate-950 select-none cursor-ew-resize overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          tabIndex={0}
          role="slider"
          aria-label="Pembanding Citra Radar Sebelum dan Sesudah"
          aria-valuenow={sliderPos}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
        >
          {/* Background Right Side: AFTER IMAGE (Full width, revealed under curtain) */}
          <div className="absolute inset-0 w-full h-full bg-slate-900">
            {/* SVG Synthetic SAR Radar View (After) */}
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waterFloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#312e81" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Background radar texture */}
              <rect width="100" height="100" fill="#090d16" />

              {/* Radar range rings */}
              <circle
                cx="20"
                cy="32"
                r="15"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              <circle
                cx="20"
                cy="32"
                r="30"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />

              {/* River channel after rain (inundated flooded area) */}
              <path
                d="M 5,20 Q 15,35 25,28 T 35,50"
                fill="none"
                stroke="#4338ca"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Flooded outline specular radar return */}
              {floodOutline && (
                <polygon
                  points={floodOutline.map((p) => `${p[0]},${100 - p[1]}`).join(" ")}
                  fill="url(#waterFloodGrad)"
                  stroke="#818cf8"
                  strokeWidth="0.8"
                />
              )}

              {/* Indication border highlight */}
              {showIndicationLayer && floodOutline && (
                <polygon
                  points={floodOutline.map((p) => `${p[0]},${100 - p[1]}`).join(" ")}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="0.8"
                  strokeDasharray="2,1"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          {/* Foreground Left Side: BEFORE IMAGE (Clipped by sliderPos percentage) */}
          <div
            className="absolute inset-0 h-full overflow-hidden border-r-2 border-indigo-500 bg-slate-950"
            style={{ width: `${sliderPos}%` }}
          >
            {/* SVG Synthetic SAR Radar View (Before) */}
            <div
              className="absolute inset-0"
              style={{
                width: sliderPos > 0 ? `${(100 / sliderPos) * 100}%` : "100%",
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Background radar texture */}
                <rect width="100" height="100" fill="#0b0f19" />

                {/* Radar range rings */}
                <circle
                  cx="20"
                  cy="32"
                  r="15"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />
                <circle
                  cx="20"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />

                {/* Normal dry river channel (narrow, dry riverbed) */}
                <path
                  d="M 5,20 Q 15,35 25,28 T 35,50"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Draggable Vertical Divider Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-indigo-300 font-bold mt-2 border border-slate-800">
              {sliderPos}%
            </div>
          </div>

          {/* Screen Side Labels */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-indigo-300 font-bold">
            ◄ SEBELUM HUJAN (2026-11-12)
          </div>
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-amber-300 font-bold">
            SESUDAH HUJAN (2026-11-17) ►
          </div>
        </div>

        {/* Bottom Control & Instructions Strip */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Navigasi slider: Tarik garis pemisah atau gunakan tombol panah ◄ ► pada keyboard
            </span>
            <span>•</span>
            <span className="text-indigo-400">Spasi / Klik tengah: 50%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Orientasi & Bounding Box Extent Sejajar (AOI-01)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
