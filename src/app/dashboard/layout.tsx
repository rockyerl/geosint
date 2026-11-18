"use client";

import React from "react";
import { GeosintShell } from "@/features/geosint";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <GeosintShell>{children}</GeosintShell>;
}
