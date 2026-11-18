"use client";

import React from "react";
import { useParams } from "next/navigation";
import { GeosintShell, RoleGuard, BriefingView } from "@/features/geosint";

export default function BriefingPage() {
  const params = useParams();
  const eventId = (params?.eventId as string) || "G-101";

  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["pimpinan", "analis"]} pageTitle="Lembar Briefing Kesiapan Sektor">
        <BriefingView eventId={eventId} />
      </RoleGuard>
    </GeosintShell>
  );
}
