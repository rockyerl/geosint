"use client";

import React from "react";
import { GeosintDashboard, RoleGuard } from "@/features/geosint";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["pimpinan", "analis"]} pageTitle="Dashboard Operasional">
      <GeosintDashboard />
    </RoleGuard>
  );
}
