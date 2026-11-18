import type { Metadata } from "next";
import "./globals.css";
import { GeosintProvider } from "@/features/geosint";

export const metadata: Metadata = {
  title: "GEOSINT KODIKLAT TNI AD · Prototipe Evaluasi Kesiapan Area Latihan",
  description:
    "Sistem Intelijen Geospasial On-Premise C4ISR berbasis Citra Radar Sentinel dan Telemetri Sensor Terestrial untuk Kodiklat TNI AD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <GeosintProvider>{children}</GeosintProvider>
      </body>
    </html>
  );
}
