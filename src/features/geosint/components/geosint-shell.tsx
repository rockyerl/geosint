"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGeosint } from "../context";
import { Role } from "../types";
import {
  Satellite,
  Crosshair,
  Sliders,
  Link2,
  FileText,
  Radio,
  ShieldAlert,
  Monitor,
  Database,
  History,
  Clock,
  Menu,
  X,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Layers,
} from "lucide-react";

interface NavItem {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: string;
  badgeVariant?: "indigo" | "amber" | "emerald" | "default";
}

interface NavGroup {
  category: string;
  description?: string;
  items: NavItem[];
}

function getBreadcrumb(pathname: string): { category: string; title: string } {
  if (pathname === "/peta")
    return { category: "Alur Demo Aruna (P0)", title: "1. Peta Taktis & Filter 48h" };
  if (pathname.includes("/bandingkan"))
    return { category: "Alur Demo Aruna (P0)", title: "2. Pembanding Radar SAR" };
  if (pathname === "/kejadian/G-101")
    return { category: "Alur Demo Aruna (P0)", title: "3. Triase & Korelasi Multi-Pilar" };
  if (pathname.startsWith("/briefing"))
    return { category: "Alur Demo Aruna (P0)", title: "4. Lembar Briefing Resmi" };
  if (pathname === "/dashboard")
    return { category: "Posko Komando", title: "Dashboard Operasional" };
  if (pathname === "/kejadian")
    return { category: "Posko Komando", title: "Daftar Seluruh Kejadian" };
  if (pathname === "/wallboard")
    return { category: "Posko Komando", title: "Monitoring Wallboard (16:9)" };
  if (pathname === "/sumber")
    return { category: "Data & Tata Kelola", title: "Katalog Sensor & Impor" };
  if (pathname === "/audit")
    return { category: "Data & Tata Kelola", title: "Jejak Audit Keamanan" };
  if (pathname.startsWith("/kejadian/"))
    return { category: "Posko Komando", title: "Detail Kejadian Taktis" };
  return { category: "Pusat Komando", title: "GEOSINT Kodiklat TNI AD" };
}

export function GeosintShell({ children }: { children: React.ReactNode }) {
  const { role, setRole, state, toasts, dismissToast, kpis } = useGeosint();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Flow-Aligned Navigation Menu (Skenario Demo Aruna -> Posko Komando -> Data)
  const navGroups: NavGroup[] = [
    {
      category: "Alur Demo Aruna (P0)",
      description: "Skenario evaluasi akses terputus & genangan alur",
      items: [
        {
          href: "/peta",
          title: "1. Peta Taktis & Filter 48h",
          subtitle: "Filter sinkron citra, kejadian & narasi",
          icon: Crosshair,
          roles: ["analis", "pimpinan"],
          badge: "P0",
          badgeVariant: "indigo",
        },
        {
          href: "/peta/AOI-01/bandingkan",
          title: "2. Pembanding Radar SAR",
          subtitle: "Slider temporal SC-01 vs SC-02",
          icon: Sliders,
          roles: ["analis"],
          badge: "Radar",
          badgeVariant: "indigo",
        },
        {
          href: "/kejadian/G-101",
          title: "3. Triase & Korelasi Multi-Pilar",
          subtitle: "Triangulasi SAR + Petugas + GDELT",
          icon: Link2,
          roles: ["analis", "pimpinan"],
          badge: "GEO-19",
          badgeVariant: "emerald",
        },
        {
          href: "/briefing/G-101",
          title: "4. Lembar Briefing Resmi",
          subtitle: "Keputusan & arahan komando",
          icon: FileText,
          roles: ["analis", "pimpinan"],
          badge: "Cetak",
          badgeVariant: "amber",
        },
      ],
    },
    {
      category: "Posko Komando (C4ISR)",
      description: "Monitoring operasional seluruh sektor",
      items: [
        {
          href: "/dashboard",
          title: "Dashboard Operasional",
          subtitle: "Status kesiapan latihan & indikator KPI",
          icon: Radio,
          roles: ["pimpinan", "analis"],
        },
        {
          href: "/kejadian",
          title: "Daftar Seluruh Kejadian",
          subtitle: "Antrean triase kejadian aktif",
          icon: ShieldAlert,
          roles: ["pimpinan", "analis"],
          badge: `${kpis.activeEvents} Aktif`,
          badgeVariant: "amber",
        },
        {
          href: "/wallboard",
          title: "Monitoring Wallboard (16:9)",
          subtitle: "Layar posko kendali video-wall",
          icon: Monitor,
          roles: ["pimpinan", "analis", "operator"],
          badge: "Live",
          badgeVariant: "emerald",
        },
      ],
    },
    {
      category: "Data & Tata Kelola",
      description: "Ingesti sensor & jejak audit militer",
      items: [
        {
          href: "/sumber",
          title: "Katalog Sensor & Impor",
          subtitle: "Ingesti batch telemetri Sentinel & FIRMS",
          icon: Database,
          roles: ["operator", "analis"],
        },
        {
          href: "/audit",
          title: "Jejak Audit Keamanan",
          subtitle: "Log mutasi tak terhapuskan (Immutable)",
          icon: History,
          roles: ["operator", "pimpinan"],
        },
      ],
    },
  ];

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === "operator" && (pathname === "/peta" || pathname.startsWith("/peta/"))) {
      router.push("/sumber");
    } else if (
      newRole === "pimpinan" &&
      (pathname === "/peta" || pathname === "/sumber" || pathname === "/audit")
    ) {
      router.push("/dashboard");
    }
  };

  const formattedDemoTime = React.useMemo(() => {
    try {
      const d = new Date(state.demoNow);
      return (
        d.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          dateStyle: "medium",
          timeStyle: "medium",
        }) + " WIB"
      );
    } catch {
      return state.demoNow;
    }
  }, [state.demoNow]);

  const currentBreadcrumb = getBreadcrumb(pathname);

  const isItemActive = (targetHref: string) => {
    if (targetHref === "/dashboard") return pathname === "/dashboard";
    if (targetHref === "/peta") return pathname === "/peta";
    if (targetHref === "/kejadian") return pathname === "/kejadian";
    if (targetHref === "/kejadian/G-101") return pathname === "/kejadian/G-101";
    if (targetHref === "/briefing/G-101") return pathname.startsWith("/briefing");
    if (targetHref === "/peta/AOI-01/bandingkan") return pathname.includes("/bandingkan");
    return pathname === targetHref || pathname.startsWith(targetHref);
  };

  // User profile metadata according to active role
  const userProfile = {
    analis: {
      rank: "Kapten Czi",
      name: "Analis Geospasial",
      id: "analis-01",
      unit: "Pusdikarhanud Kodiklat",
    },
    pimpinan: {
      rank: "Mayjen TNI",
      name: "Dankodiklat AD",
      id: "pimpinan-01",
      unit: "Markas Komando Kodiklat",
    },
    operator: {
      rank: "Sertu",
      name: "Operator Sensor",
      id: "operator-01",
      unit: "Puskodal Satelit Taktis",
    },
  }[role];

  // Sundawa-standard navigation content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform text-white">
            <Satellite className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-sm tracking-wider">GEOSINT</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/40">
                TNI AD
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight block">
              Posko Kendali Kodiklat
            </span>
          </div>
        </Link>

        <button
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Switcher Toolbar */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] text-slate-400">
          <span className="font-bold uppercase tracking-wider">PERAN PENGGUNA DEMO:</span>
          <span className="text-indigo-400 font-bold uppercase" suppressHydrationWarning>
            {role}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(["pimpinan", "analis", "operator"] as Role[]).map((r) => {
            const isActive = role === r;
            const labels: Record<Role, string> = {
              pimpinan: "Pimpinan",
              analis: "Analis",
              operator: "Operator",
            };
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`py-1 text-[11px] font-mono font-bold rounded transition-all text-center ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Nav Groups with Flow Alignment */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => {
          // Filter items accessible by the current role
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.category} className="space-y-1">
              <div className="px-2 mb-1.5">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {group.category}
                </h4>
                {group.description && (
                  <p className="text-[10px] text-slate-500 font-sans">{group.description}</p>
                )}
              </div>

              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpenMobile(false)}
                      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group border ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border-indigo-500"
                          : "border-transparent text-slate-300 hover:text-white hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-950 border border-slate-800 shrink-0 mt-0.5 group-hover:border-indigo-500 transition-colors">
                        <Icon
                          className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-100 group-hover:text-white truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                                item.badgeVariant === "indigo"
                                  ? isActive
                                    ? "bg-indigo-800 text-indigo-100 border border-indigo-400/40"
                                    : "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
                                  : item.badgeVariant === "amber"
                                    ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                                    : item.badgeVariant === "emerald"
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                      : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] font-sans truncate ${
                            isActive ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User Session Profile & Military Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
            {userProfile.rank.split(" ")[0]}
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {userProfile.rank} {userProfile.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{userProfile.unit}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] font-mono border-t border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>AKSES:</span>
            <strong className="text-indigo-400 uppercase" suppressHydrationWarning>
              {role}
            </strong>
          </span>

          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AIR-GAPPED</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Desktop Persistent Sidebar (Sundawa Standard) */}
      <aside className="hidden lg:flex w-72 shrink-0 h-screen sticky top-0 flex-col border-r border-slate-800 z-30">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer (Sundawa Mobile Support) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative w-80 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Military HUD Classification Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs font-mono tracking-wider">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SISTEM AKTIF ON-PREMISE
            </span>
            <span className="text-slate-400 hidden sm:inline">
              KLASIFIKASI: <span className="text-amber-300 font-bold">RAHASIA / DEMO TACTICAL</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 hidden md:inline">WAKTU OPERASI:</span>
              <span className="text-indigo-400 font-bold" suppressHydrationWarning>
                {formattedDemoTime}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 rounded text-[9px] font-bold tracking-widest hidden sm:inline">
              DATA FIKTIF
            </span>
          </div>
        </div>

        {/* Top Header / View Breadcrumbs */}
        <header className="h-14 sm:h-16 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              title="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="text-indigo-400 font-bold">{currentBreadcrumb.category}</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
                  {currentBreadcrumb.title}
                </span>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-[11px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Sektor:</span>
              <strong className="text-white">{kpis.totalAreas} AOI</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
              <span className="text-slate-400 hidden sm:inline">Peran:</span>
              <strong className="text-indigo-400 uppercase font-bold" suppressHydrationWarning>
                {role}
              </strong>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Military Technical Footer */}
        <footer className="bg-slate-950 border-t border-slate-800 py-3 px-4 sm:px-6 text-xs font-mono text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>GEOSINT KODIKLAT TNI AD · SISTEM C4ISR AIR-GAPPED ON-PREMISE</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>CAKUPAN: 7.220 KM²</span>
              <span>•</span>
              <span className="text-amber-400">MODE DEMO · DATA FIKTIF</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Tactical Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-100"
                : t.type === "error"
                  ? "bg-rose-950/90 border-rose-500/60 text-rose-100"
                  : t.type === "warning"
                    ? "bg-amber-950/90 border-amber-500/60 text-amber-100"
                    : "bg-indigo-950/95 border-indigo-500/60 text-indigo-100"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {t.type === "error" && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === "warning" && (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {t.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs">
              <p className="font-semibold">{t.message}</p>
              <p className="text-[10px] opacity-70 font-mono mt-0.5">{t.timestamp}</p>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-white text-sm px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
