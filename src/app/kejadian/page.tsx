"use client";

import React from "react";
import { GeosintShell, RoleGuard, EventsList } from "@/features/geosint";

export default function KejadianPage() {
  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["pimpinan", "analis"]} pageTitle="Daftar Kejadian Taktis">
        <EventsList />
      </RoleGuard>
    </GeosintShell>
  );
}
