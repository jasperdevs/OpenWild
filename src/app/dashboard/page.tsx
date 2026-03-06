import { Suspense } from "react";

import { LiveRoutesExplorer } from "@/components/live-routes-explorer";
import { getFrontierOrigins } from "@/lib/frontier-server";

export default async function DashboardPage() {
  const origins = await getFrontierOrigins();

  return (
    <Suspense fallback={<div className="h-[calc(100dvh-8.5rem)] rounded-2xl border border-border bg-card" />}>
      <LiveRoutesExplorer origins={origins} />
    </Suspense>
  );
}
