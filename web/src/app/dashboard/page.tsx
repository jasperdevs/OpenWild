import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

import { LiveRoutesExplorer } from "@/components/live-routes-explorer";
import { getFrontierOrigins } from "@/lib/frontier-server";

export default async function DashboardPage() {
  const origins = await getFrontierOrigins();

  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-9rem)] items-center justify-center rounded-xl border border-border/60 bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading airports...
          </div>
        </div>
      }
    >
      <LiveRoutesExplorer origins={origins} />
    </Suspense>
  );
}
