"use client";

import React from "react";
import { useParams } from "next/navigation";
import { GeosintShell, RoleGuard, RadarComparison } from "@/features/geosint";

export default function BandingkanPage() {
  const params = useParams();
  const aoiId = (params?.aoiId as string) || "AOI-01";

  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["analis"]} pageTitle="Pembanding Citra Radar & Temporal">
        <RadarComparison aoiId={aoiId} />
      </RoleGuard>
    </GeosintShell>
  );
}
