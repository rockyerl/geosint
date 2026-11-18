"use client";

import React from "react";
import Link from "next/link";
import { useGeosint } from "../context";
import { Role } from "../types";
import { ShieldX, ArrowLeft, RefreshCw } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  pageTitle?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  pageTitle = "Halaman Terbatas",
}: RoleGuardProps) {
  const { role, setRole } = useGeosint();

  const isAllowed = allowedRoles.includes(role);

  if (isAllowed) {
    return <>{children}</>;
  }

  const roleLabels: Record<Role, string> = {
    pimpinan: "Pimpinan Kodiklat",
    analis: "Analis Geospasial",
    operator: "Operator Data / Sistem",
  };

  const allowedLabels = allowedRoles.map((r) => roleLabels[r]).join(" atau ");

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-xl p-8 text-center shadow-2xl shadow-rose-950/20">
        <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <ShieldX className="w-8 h-8" />
        </div>

        <span className="inline-block text-[10px] font-mono font-bold tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-500/30 mb-3">
          AKSES DITOLAK (FORBIDDEN · 403)
        </span>

        <h2 className="text-xl font-bold text-white mb-2">{pageTitle}</h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Ruang kerja ini dibatasi hanya untuk peran{" "}
          <strong className="text-indigo-400">{allowedLabels}</strong>. Peran aktif Anda saat ini
          adalah <strong className="text-amber-400">{roleLabels[role]}</strong>.
        </p>

        <div className="space-y-3">
          <p className="text-[11px] text-slate-400 font-mono">
            Ganti peran demo untuk melanjutkan:
          </p>
          <div className="flex items-center justify-center gap-2">
            {allowedRoles.map((targetRole) => (
              <button
                key={targetRole}
                onClick={() => setRole(targetRole)}
                className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Masuk sebagai {roleLabels[targetRole]}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Utama</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
