"use client";

import React from "react";
import { GeosintShell, RoleGuard, AuditView } from "@/features/geosint";

export default function AuditPage() {
  return (
    <GeosintShell>
      <RoleGuard allowedRoles={["operator"]} pageTitle="Audit Trail Operasional">
        <AuditView />
      </RoleGuard>
    </GeosintShell>
  );
}
