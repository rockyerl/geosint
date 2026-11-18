"use client";

import React from "react";
import { GeosintShell, WallboardView } from "@/features/geosint";

export default function WallboardPage() {
  return (
    <GeosintShell>
      <WallboardView />
    </GeosintShell>
  );
}
