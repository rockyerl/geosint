"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  GeosintShell,
  RoleGuard,
  EventDetailAnalyst,
  EventDetailPimpinan,
  useGeosint,
} from "@/features/geosint";

export default function KejadianDetailPage() {
  const params = useParams();
  const eventId = (params?.id as string) || "G-101";
  const { role } = useGeosint();

  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["pimpinan", "analis"]} pageTitle="Detail Kejadian & Evaluasi Bukti">
        {role === "pimpinan" ? (
          <EventDetailPimpinan eventId={eventId} />
        ) : (
          <EventDetailAnalyst eventId={eventId} />
        )}
      </RoleGuard>
    </GeosintShell>
  );
}
