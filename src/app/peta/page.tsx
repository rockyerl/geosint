"use client";

import React from "react";
import { GeosintShell, RoleGuard, TacticalMapView } from "@/features/geosint";

export default function PetaPage() {
  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["analis"]} pageTitle="Peta Taktis & Analisis Sektor">
        <TacticalMapView />
      </RoleGuard>
    </GeosintShell>
  );
}
