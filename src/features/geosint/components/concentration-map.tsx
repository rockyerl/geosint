"use client";

import React from "react";
import type { Area, AreaConcentration } from "../types";

interface ConcentrationMapProps {
  areas: Area[];
  concentration: AreaConcentration[];
  selectedAoiId: string | null;
  onSelectAoi: (aoiId: string) => void;
}

/** Choropleth of distinct accounts per area (spec 002 FR-213). Same Y flip as map-canvas. */
export function ConcentrationMap({
  areas,
  concentration,
  selectedAoiId,
  onSelectAoi,
}: ConcentrationMapProps) {
  const max = Math.max(1, ...concentration.map((c) => c.distinctAccounts));

  return (
    <div>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-auto bg-slate-950 rounded-lg border border-slate-800"
      >
        {areas.map((area) => {
          const entry = concentration.find((c) => c.aoiId === area.id);
          const count = entry?.distinctAccounts ?? 0;
          const total = entry?.totalContent ?? 0;
          const selected = area.id === selectedAoiId;
          const points = area.outline.map(([x, y]) => `${x},${100 - y}`).join(" ");
          const cx = area.outline.reduce((s, p) => s + p[0], 0) / Math.max(1, area.outline.length);
          const cy =
            100 - area.outline.reduce((s, p) => s + p[1], 0) / Math.max(1, area.outline.length);
          return (
            <g key={area.id}>
              <polygon
                points={points}
                fill="#f59e0b"
                fillOpacity={count === 0 ? 0.08 : 0.2 + 0.6 * (count / max)}
                stroke={selected ? "#fbbf24" : "#475569"}
                strokeWidth={selected ? 0.8 : 0.4}
                className="cursor-pointer"
                onClick={() => onSelectAoi(area.id)}
              />
              <text x={cx} y={cy} textAnchor="middle" fontSize={2.6} fill="#e2e8f0">
                {area.name}
              </text>
              <text x={cx} y={cy + 3} textAnchor="middle" fontSize={2.2} fill="#fbbf24">
                {`${count} akun · ${total} unggahan`}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-slate-400 mt-2">
        Intensitas warna = jumlah akun unik yang menyebut area (dihitung dari unggahan, tanpa batas
        minimum).
      </p>
    </div>
  );
}
