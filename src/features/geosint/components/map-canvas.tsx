"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { GeoEvent, Point } from "../types";
import { useGeosint } from "../context";
import { Crosshair, ChevronRight } from "lucide-react";

interface MapCanvasProps {
  onSelectEvent?: (eventId: string) => void;
  onSelectAoi?: (aoiId: string) => void;
  selectedEventId?: string;
  selectedAoiId?: string;
  isMiniMap?: boolean;
}

export function MapCanvas({
  onSelectEvent,
  onSelectAoi,
  selectedEventId,
  selectedAoiId,
  isMiniMap = false,
}: MapCanvasProps) {
  const { state } = useGeosint();
  const router = useRouter();

  // Layer toggles
  const [showBaseGrid, setShowBaseGrid] = useState(true);
  const [showAoi, setShowAoi] = useState(true);
  const [showIndication, setShowIndication] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // Mouse coordinate tracker
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Collision popover state
  const [collisionGroup, setCollisionGroup] = useState<GeoEvent[] | null>(null);
  const [collisionPos, setCollisionPos] = useState<{ x: number; y: number } | null>(null);

  // Coordinate transform: X remains X, Y increases upwards so svgY = 100 - Y
  const toSvgCoords = (pt: Point): [number, number] => {
    return [pt[0], 100 - pt[1]];
  };

  const toPolygonPointsString = (outline: Point[]): string => {
    return outline.map((p) => `${p[0]},${100 - p[1]}`).join(" ");
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawSvgY = ((e.clientY - rect.top) / rect.height) * 100;
    const cartesianY = 100 - rawSvgY;
    setCursorCoords({
      x: Math.max(0, Math.min(100, Math.round(rawX * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(cartesianY * 10) / 10)),
    });
  };

  const handleMouseLeave = () => {
    setCursorCoords(null);
  };

  // Group events that collide (within distance < 5 units)
  const markerClusters = useMemo(() => {
    const groups: { center: Point; events: GeoEvent[] }[] = [];
    const threshold = 5;

    state.events.forEach((ev) => {
      let added = false;
      for (const group of groups) {
        const dx = group.center[0] - ev.point[0];
        const dy = group.center[1] - ev.point[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= threshold) {
          group.events.push(ev);
          added = true;
          break;
        }
      }
      if (!added) {
        groups.push({ center: ev.point, events: [ev] });
      }
    });

    return groups;
  }, [state.events]);

  const handleClusterClick = (
    cluster: { center: Point; events: GeoEvent[] },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (cluster.events.length === 1) {
      const ev = cluster.events[0];
      if (onSelectEvent) {
        onSelectEvent(ev.id);
      } else {
        router.push(`/kejadian/${ev.id}`);
      }
    } else {
      const [sx, sy] = toSvgCoords(cluster.center);
      setCollisionGroup(cluster.events);
      setCollisionPos({ x: sx, y: sy });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return { fill: "#F59E0B", stroke: "#FDE68A", bg: "bg-amber-500", text: "text-amber-400" };
      case "follow_up_required":
        return { fill: "#EF4444", stroke: "#FECACA", bg: "bg-rose-500", text: "text-rose-400" };
      case "resolved":
        return {
          fill: "#10B981",
          stroke: "#A7F3D0",
          bg: "bg-emerald-500",
          text: "text-emerald-400",
        };
      default:
        return { fill: "#6366F1", stroke: "#C7D2FE", bg: "bg-indigo-500", text: "text-indigo-400" };
    }
  };

  return (
    <div className="relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Map Control Bar (Hidden on mini-map) */}
      {!isMiniMap && (
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-indigo-400 font-bold flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-indigo-400" />
              KANVAS TAKTIS KODIKLAT (GRID 0..100)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Peta ilustratif
            </span>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBaseGrid(!showBaseGrid)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                showBaseGrid
                  ? "bg-indigo-950 border-indigo-500/50 text-indigo-200"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
              title="Toggle Grid Koordinat"
            >
              <span>Grid</span>
            </button>

            <button
              onClick={() => setShowAoi(!showAoi)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                showAoi
                  ? "bg-indigo-950 border-indigo-500/50 text-indigo-200"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
              title="Toggle Batas Area Pantauan (AOI)"
            >
              <span>Sektor AOI</span>
            </button>

            <button
              onClick={() => setShowIndication(!showIndication)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                showIndication
                  ? "bg-indigo-950 border-indigo-500/50 text-indigo-200"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
              title="Toggle Lapisan Indikasi Genangan"
            >
              <span>Lapisan Indikasi</span>
            </button>

            <button
              onClick={() => setShowEvents(!showEvents)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                showEvents
                  ? "bg-indigo-950 border-indigo-500/50 text-indigo-200"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
              title="Toggle Penanda Kejadian"
            >
              <span>Penanda</span>
            </button>
          </div>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 overflow-hidden select-none cursor-crosshair"
        onClick={() => setCollisionGroup(null)}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Radar scan grid pattern */}
            <pattern id="tacticalGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.25"
                strokeDasharray="1,1"
              />
            </pattern>

            {/* Aruna flood water ripple pattern */}
            <pattern
              id="floodHazardPattern"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="2" height="4" fill="#6366F1" fillOpacity="0.25" />
              <rect x="2" width="2" height="4" fill="#818CF8" fillOpacity="0.15" />
            </pattern>

            {/* Glowing filters */}
            <filter id="glowTeal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* LAYER 1: BASE LAYER (Tactical Grid & Coordinate axes) */}
          {showBaseGrid && (
            <g className="base-grid">
              {/* Background fill with pattern */}
              <rect width="100" height="100" fill="url(#tacticalGrid)" />

              {/* Major coordinate grid lines every 20 units */}
              {[20, 40, 60, 80].map((val) => (
                <React.Fragment key={`grid-${val}`}>
                  <line
                    x1={val}
                    y1="0"
                    x2={val}
                    y2="100"
                    stroke="#1e293b"
                    strokeWidth="0.3"
                    strokeDasharray="2,2"
                  />
                  <line
                    x1="0"
                    y1={val}
                    x2="100"
                    y2={val}
                    stroke="#1e293b"
                    strokeWidth="0.3"
                    strokeDasharray="2,2"
                  />
                  {/* Axis labels */}
                  <text
                    x={val}
                    y="98.5"
                    fill="#475569"
                    fontSize="2"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    X:{val}
                  </text>
                  <text
                    x="2"
                    y={val + 0.8}
                    fill="#475569"
                    fontSize="2"
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    Y:{100 - val}
                  </text>
                </React.Fragment>
              ))}

              {/* Military corner crosshairs */}
              <path d="M 3 0 L 3 3 L 0 3" fill="none" stroke="#6366F1" strokeWidth="0.5" />
              <path d="M 97 0 L 97 3 L 100 3" fill="none" stroke="#6366F1" strokeWidth="0.5" />
              <path d="M 3 100 L 3 97 L 0 97" fill="none" stroke="#6366F1" strokeWidth="0.5" />
              <path d="M 97 100 L 97 97 L 100 97" fill="none" stroke="#6366F1" strokeWidth="0.5" />
            </g>
          )}

          {/* LAYER 2: AREA (AOI POLYGONS) */}
          {showAoi && (
            <g className="aoi-layer">
              {state.areas.map((aoi) => {
                const pointsStr = toPolygonPointsString(aoi.outline);
                const isSelected = selectedAoiId === aoi.id;

                // Center point calculation for label
                const avgX = aoi.outline.reduce((acc, p) => acc + p[0], 0) / aoi.outline.length;
                const avgY = aoi.outline.reduce((acc, p) => acc + p[1], 0) / aoi.outline.length;
                const [labelX, labelY] = toSvgCoords([avgX, avgY]);

                return (
                  <g
                    key={aoi.id}
                    className="cursor-pointer transition-all duration-200 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectAoi) onSelectAoi(aoi.id);
                    }}
                  >
                    {/* Polygon boundary */}
                    <polygon
                      points={pointsStr}
                      fill={isSelected ? "#312e81" : "#0f172a"}
                      fillOpacity={isSelected ? 0.7 : 0.45}
                      stroke={isSelected ? "#818cf8" : "#4f46e5"}
                      strokeWidth={isSelected ? 0.8 : 0.45}
                      strokeDasharray={isSelected ? "none" : "2,1"}
                      className="transition-all hover:fill-opacity-60 hover:stroke-[#818cf8]"
                    />

                    {/* AOI Sector Label */}
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      <rect
                        x="-10"
                        y="-3"
                        width="20"
                        height="6"
                        rx="1"
                        fill="#020617"
                        fillOpacity="0.85"
                        stroke="#334155"
                        strokeWidth="0.3"
                      />
                      <text
                        x="0"
                        y="-0.5"
                        fill="#E0F2FE"
                        fontSize="2.2"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {aoi.id}
                      </text>
                      <text
                        x="0"
                        y="1.8"
                        fill="#818cf8"
                        fontSize="1.6"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {aoi.areaKm2.toLocaleString("id-ID")} km²
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* LAYER 3: INDICATION LAYER (Aruna flood polygon) */}
          {showIndication && (
            <g className="indication-layer">
              <polygon
                points={toPolygonPointsString(state.demoActions.arunaFloodOutline)}
                fill="url(#floodHazardPattern)"
                stroke="#818cf8"
                strokeWidth="0.6"
                strokeDasharray="1.5,1"
              />
              {/* Indication Label Tag */}
              <g transform="translate(18, 33)">
                <rect
                  x="-8"
                  y="-2"
                  width="16"
                  height="4"
                  rx="0.8"
                  fill="#1e1b4b"
                  fillOpacity="0.9"
                  stroke="#6366f1"
                  strokeWidth="0.3"
                />
                <text
                  x="0"
                  y="0.8"
                  fill="#c7d2fe"
                  fontSize="1.8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  INDIKASI GENANGAN
                </text>
              </g>
            </g>
          )}

          {/* LAYER 4: EVENT MARKERS */}
          {showEvents && (
            <g className="event-markers">
              {markerClusters.map((cluster, idx) => {
                const [cx, cy] = toSvgCoords(cluster.center);
                const isGroup = cluster.events.length > 1;
                const primaryEvent = cluster.events[0];
                const colors = getStatusColor(primaryEvent.status);
                const isSelected = cluster.events.some((e) => e.id === selectedEventId);

                return (
                  <g
                    key={`marker-${idx}`}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer group"
                    onClick={(e) => handleClusterClick(cluster, e)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Kejadian ${cluster.events.map((e) => e.id).join(", ")}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleClusterClick(cluster, e as unknown as React.MouseEvent);
                      }
                    }}
                  >
                    {/* Pulsing radar ring */}
                    <circle
                      r="4.5"
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth="0.3"
                      className="animate-ping opacity-50"
                    />

                    {/* Outer target ring */}
                    <circle
                      r="3"
                      fill="#020617"
                      stroke={isSelected ? "#FFFFFF" : colors.stroke}
                      strokeWidth={isSelected ? 0.8 : 0.5}
                    />

                    {/* Center marker dot */}
                    <circle r="1.6" fill={colors.fill} />

                    {/* Text badge */}
                    <g transform="translate(3.5, 1)">
                      <rect
                        x="-0.5"
                        y="-2.5"
                        width={isGroup ? 12 : 9}
                        height="4"
                        rx="0.8"
                        fill="#020617"
                        fillOpacity="0.95"
                        stroke={colors.fill}
                        strokeWidth="0.3"
                      />
                      <text
                        x={isGroup ? 5.5 : 4}
                        y="0.2"
                        fill="#FFFFFF"
                        fontSize="2"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isGroup
                          ? `${primaryEvent.id} (+${cluster.events.length - 1})`
                          : primaryEvent.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Marker Collision Menu Popover (Accessible for overlapping markers) */}
        {collisionGroup && collisionPos && (
          <div
            className="absolute z-30 bg-slate-900 border border-indigo-500 rounded-lg shadow-2xl p-2.5 min-w-[200px] text-xs font-mono"
            style={{
              left: `${Math.min(75, Math.max(5, collisionPos.x))}%`,
              top: `${Math.min(70, Math.max(5, collisionPos.y))}%`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Pilih Kejadian Berhimpitan ({collisionGroup.length}):
              </span>
              <button
                onClick={() => setCollisionGroup(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ×
              </button>
            </div>
            <div className="space-y-1">
              {collisionGroup.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setCollisionGroup(null);
                    if (onSelectEvent) onSelectEvent(ev.id);
                    else router.push(`/kejadian/${ev.id}`);
                  }}
                  className="w-full text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-indigo-400">{ev.id}</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{ev.title}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Coordinate Crosshair Indicator */}
        {cursorCoords && !isMiniMap && (
          <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-indigo-300 pointer-events-none flex items-center gap-2">
            <span>
              GRID: X={cursorCoords.x} Y={cursorCoords.y}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              MGRS FIKTIF: 48M-TA-{(cursorCoords.x * 100).toFixed(0)}-
              {(cursorCoords.y * 100).toFixed(0)}
            </span>
          </div>
        )}

        {/* Mini Legend */}
        <div className="absolute bottom-2 right-2 z-10 p-2 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-none hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Menunggu Tinjauan</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Perlu Konfirmasi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Selesai (Resolved)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
