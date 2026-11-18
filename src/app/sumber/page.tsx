"use client";

import React from "react";
import { GeosintShell, RoleGuard, SourcesCatalog } from "@/features/geosint";

export default function SumberPage() {
  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["operator"]} pageTitle="Katalog Sumber Data & Kontrol Ingesti">
        <SourcesCatalog />
      </RoleGuard>
    </GeosintShell>
  );
}
