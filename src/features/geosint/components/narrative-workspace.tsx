"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGeosint } from "../context";
import { WINDOW_PRESETS, parseWindowPreset, presetWindow, type WindowPreset } from "../analysis";
import { ConcentrationMap } from "./concentration-map";
import { AccountTimeline, formatWib } from "./account-timeline";

const card = "rounded-lg border border-slate-800 bg-slate-900 p-4";
const chip = (active: boolean) =>
  `px-3 py-1 rounded text-xs border ${
    active
      ? "bg-amber-500 text-slate-950 border-amber-400"
      : "bg-slate-950 text-slate-300 border-slate-700"
  }`;

/** /narasi: concentration, ranked clusters, cross-event actors, account movement (spec 002 FR-212..214). */
export function NarrativeWorkspace() {
  const { role, state, repo } = useGeosint();
  const params = useSearchParams();
  const router = useRouter();
  const topicId = params.get("topic") ?? state.demoPreset.topicId;
  const preset = parseWindowPreset(params.get("window"));
  const timeWindow = useMemo(
    () => presetWindow(preset, state.demoPreset.window.to),
    [preset, state.demoPreset.window.to]
  );
  const [selectedAoiId, setSelectedAoiId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const res = repo.getNarrativeWorkspace(role, topicId, timeWindow);

  const go = (next: { topic?: string; window?: WindowPreset }) => {
    router.replace(`/narasi?topic=${next.topic ?? topicId}&window=${next.window ?? preset}`);
    setSelectedAoiId(null);
    setSelectedAccount(null);
  };
  const areaName = (id: string) => state.areas.find((a) => a.id === id)?.name ?? id;
  const titleOf = (id: string) => state.narrativeItems.find((i) => i.id === id);

  const data = res.success ? res.data : null;
  const activeAoiId = data ? (selectedAoiId ?? data.clusters[0]?.aoiId ?? null) : null;
  const active = data ? (data.clusters.find((c) => c.aoiId === activeAoiId) ?? null) : null;

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-100">Konsentrasi Narasi & Aktor</h1>
        <p className="text-sm text-slate-400">
          Akun yang menyebarkan narasi yang sama, per area, waktu dan aktor
        </p>
        <span className="inline-block px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Data narasi simulasi · angka dihitung dari unggahan
        </span>
      </div>

      <div className={`${card} flex flex-wrap items-center gap-2`}>
        {state.topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={chip(topic.id === topicId)}
            onClick={() => go({ topic: topic.id })}
          >
            {topic.label}
          </button>
        ))}
        <span className="mx-2 text-slate-600">|</span>
        {WINDOW_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={chip(p.id === preset)}
            onClick={() => go({ window: p.id })}
          >
            {p.label}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">
          {formatWib(timeWindow.from)} – {formatWib(timeWindow.to)}
        </span>
      </div>

      {!res.success && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {res.error}
        </div>
      )}

      {data && (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <ConcentrationMap
                areas={state.areas}
                concentration={data.areas}
                selectedAoiId={activeAoiId}
                onSelectAoi={setSelectedAoiId}
              />
              <div className={`${card} text-xs text-slate-300 space-y-2`}>
                <div className="font-semibold text-slate-100">Lokasi tidak diketahui</div>
                {data.unlocated ? (
                  <>
                    <div>
                      {data.unlocated.totalContent} unggahan dari {data.unlocated.distinctAccounts}{" "}
                      akun tanpa area yang disebut
                    </div>
                    <ul className="space-y-0.5">
                      {data.unlocated.itemIds.map((id) => (
                        <li key={id}>
                          {id} · {titleOf(id)?.authorAccount} · {titleOf(id)?.title}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div>Tidak ada unggahan tanpa lokasi.</div>
                )}
              </div>
            </div>

            <div className={`${card} space-y-2`}>
              <div className="text-sm font-semibold text-slate-100">Peringkat konsentrasi</div>
              {data.clusters.length === 0 ? (
                <div className="text-xs text-slate-400">
                  Tidak ada unggahan topik ini dalam jendela waktu.
                </div>
              ) : (
                data.clusters.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedAoiId(c.aoiId)}
                    className={`w-full text-left text-xs px-3 py-2 rounded border ${
                      c.aoiId === activeAoiId
                        ? "border-amber-400 bg-amber-500/10 text-amber-200"
                        : "border-slate-700 text-slate-300"
                    }`}
                  >
                    #{i + 1} {c.aoiId ? areaName(c.aoiId) : ""} — {c.distinctAccounts} akun ·{" "}
                    {c.totalContent} unggahan
                  </button>
                ))
              )}
            </div>
          </div>

          {activeAoiId && (
            <div className={`${card} space-y-3`}>
              <h2 className="text-sm font-bold text-slate-100">
                Klaster {data.topic.label} — {areaName(activeAoiId)}
              </h2>
              {!active ? (
                <div className="text-xs text-slate-400">
                  Tidak ada unggahan topik ini di area ini dalam jendela waktu.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      ["Unggahan", String(active.totalContent)],
                      ["Akun unik", String(active.distinctAccounts)],
                      ["Unggahan per akun", active.itemsPerAccount.toFixed(1)],
                      [
                        "Cakupan lokasi unggah",
                        `${Math.round(active.publishLocationCoverage * 100)}%`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded border border-slate-700 p-2">
                        <div className="text-slate-400">{label}</div>
                        <div className="text-lg font-bold text-slate-100">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-300">
                    {formatWib(active.firstObservedAt)} – {formatWib(active.lastObservedAt)}
                  </div>
                  <div className="text-xs text-slate-300">
                    {active.trendBuckets.map((b) => `${b.label}: ${b.count}`).join(" · ")}
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-100">
                      Unggahan di balik angka ini
                    </div>
                    <ul className="space-y-0.5">
                      {active.itemIds.map((id) => {
                        const item = titleOf(id);
                        return (
                          <li key={id}>
                            {item ? formatWib(item.publishedAt) : ""} · {item?.authorAccount} ·{" "}
                            {item?.title}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          <div className={`${card} space-y-2`}>
            <h2 className="text-sm font-bold text-slate-100">Aktor lintas kejadian</h2>
            <p className="text-xs text-slate-400">
              Akun yang menyebut ≥ 2 area atau terkait ≥ 2 kejadian dalam jendela (semua topik)
            </p>
            {data.crossEventActors.length === 0 ? (
              <div className="text-xs text-slate-400">
                Tidak ada akun lintas kejadian dalam jendela ini.
              </div>
            ) : (
              data.crossEventActors.map((a) => (
                <div
                  key={a.account}
                  className="flex flex-wrap items-center gap-3 text-xs text-slate-300 border border-slate-700 rounded p-2"
                >
                  <span className="font-semibold text-slate-100">{a.account}</span>
                  <span>{a.aoiIds.map(areaName).join(", ")}</span>
                  <span>{a.eventIds.join(", ")}</span>
                  <span>{a.itemIds.length} unggahan</span>
                  <button
                    type="button"
                    className={`${chip(false)} ml-auto`}
                    onClick={() => setSelectedAccount(a.account)}
                  >
                    Lihat pergerakan
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedAccount && (
            <AccountTimeline
              account={selectedAccount}
              timeWindow={timeWindow}
              onClose={() => setSelectedAccount(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
