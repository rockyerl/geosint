"use client";

import React, { Suspense } from "react";
import { GeosintShell, RoleGuard, NarrativeWorkspace } from "@/features/geosint";

export default function NarasiPage() {
  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["analis"]} pageTitle="Konsentrasi Narasi & Aktor">
        <Suspense fallback={null}>
          <NarrativeWorkspace />
        </Suspense>
      </RoleGuard>
    </GeosintShell>
  );
}
