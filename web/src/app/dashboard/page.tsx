import { Suspense } from "react";

import { LiveRoutesExplorer } from "@/components/live-routes-explorer";
import { getFrontierOrigins } from "@/lib/frontier-server";

export default async function DashboardPage() {
  const origins = await getFrontierOrigins();

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading airports...
        </div>
      }
    >
      <LiveRoutesExplorer origins={origins} />
    </Suspense>
  );
}
