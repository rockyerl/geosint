"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useGeosint } from "../context";
import type { TimeWindow } from "../types";

export function formatWib(iso: string): string {
  return (
    new Date(iso).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

interface AccountTimelineProps {
  account: string;
  timeWindow: TimeWindow;
  onClose: () => void;
}

/** Movement timeline of one account: stops by mentioned area (spec 002 FR-214). */
export function AccountTimeline({ account, timeWindow, onClose }: AccountTimelineProps) {
  const { role, repo, state } = useGeosint();
  const res = repo.getAccountProfile(role, account, timeWindow);

  if (!res.success) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300 flex justify-between gap-3">
        <span>{res.error}</span>
        <button type="button" onClick={onClose} aria-label="Tutup" className="text-red-300">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { profile } = res;
  const areaName = (id: string) => state.areas.find((a) => a.id === id)?.name ?? id;
  const titleOf = (id: string) => state.narrativeItems.find((i) => i.id === id)?.title ?? "";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pergerakan {account}</h3>
          <p className="text-xs text-slate-400">
            {profile.items.length} unggahan · {profile.aoiIds.length} area
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Urutan menurut waktu unggah. Area = area yang disebut dalam unggahan (bukan lokasi akun).
      </p>
      <ol className="space-y-3">
        {profile.stops.map((stop, index) => (
          <li key={`${stop.aoiId}-${stop.firstPostAt}`} className="flex gap-3">
            <span className="flex-none w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-100">{areaName(stop.aoiId)}</div>
              <div>
                {formatWib(stop.firstPostAt)}
                {stop.lastPostAt !== stop.firstPostAt ? ` – ${formatWib(stop.lastPostAt)}` : ""}
              </div>
              <ul className="space-y-0.5">
                {stop.itemIds.map((id) => (
                  <li key={id}>
                    {id} · {titleOf(id)}
                  </li>
                ))}
              </ul>
              <div>
                {stop.eventIds.length === 0 ? (
                  "Tidak ada kejadian terkait di area ini"
                ) : (
                  <span className="flex gap-2 flex-wrap">
                    {stop.eventIds.map((id) => (
                      <Link key={id} href={`/kejadian/${id}`} className="text-amber-400 underline">
                        {id}
                      </Link>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
