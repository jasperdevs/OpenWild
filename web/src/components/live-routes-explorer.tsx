"use client";

import { ArrowUpRight, ChevronLeft, Plane } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

import { SearchControls } from "@/components/search-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FrontierOrigin, FrontierRoute, FrontierSearchResponse } from "@/lib/frontier-types";

const FrontierMap = dynamic(
  () => import("@/components/frontier-map").then((mod) => mod.FrontierMap),
  { ssr: false, loading: () => <div className="h-full w-full" /> },
);

type LiveRoutesExplorerProps = {
  origins: FrontierOrigin[];
};

function priceColor(route: FrontierRoute) {
  if (route.priceBand === "low") return "text-[#46A758]";
  if (route.priceBand === "high") return "text-[#E5484D]";
  return "text-foreground";
}

export function LiveRoutesExplorer({ origins }: LiveRoutesExplorerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrigin = searchParams.get("origin") ?? "";
  const queryDate = searchParams.get("date") ?? "";
  const [draftOrigin, setDraftOrigin] = useState(queryOrigin);
  const [draftDate, setDraftDate] = useState(queryDate);
  const [data, setData] = useState<FrontierSearchResponse | null>(null);
  const [loading, setLoading] = useState(queryOrigin !== "" && queryDate !== "");
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    setDraftOrigin(queryOrigin);
    setDraftDate(queryDate);
  }, [queryDate, queryOrigin]);

  useEffect(() => {
    setSelectedRouteId(null);
    setData(null);
    setError(null);

    if (!queryOrigin || !queryDate) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/frontier/search?origin=${queryOrigin}&date=${queryDate}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const payload = (await response.json()) as FrontierSearchResponse | { error: string };

        if (!response.ok || "error" in payload) {
          throw new Error("error" in payload ? payload.error : "Search failed");
        }

        setData(payload);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Search failed");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [queryDate, queryOrigin]);

  useEffect(() => {
    if (!data?.routes.length) {
      setSelectedRouteId(null);
      return;
    }
    setSelectedRouteId((cur) =>
      cur && data.routes.some((r) => r.id === cur) ? cur : data.routes[0].id,
    );
  }, [data]);

  const selectedRoute =
    data?.routes.find((r) => r.id === selectedRouteId) ?? data?.routes[0] ?? null;
  const originSummary = useMemo(
    () => origins.find((o) => o.slug === (data?.origin.slug ?? draftOrigin)) ?? null,
    [data?.origin.slug, draftOrigin, origins],
  );

  function submitSearch() {
    if (!draftOrigin || !draftDate) return;
    const params = new URLSearchParams({ origin: draftOrigin, date: draftDate });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasSearched = queryOrigin && queryDate;

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Fullscreen map */}
      <div className="flex-1">
        <FrontierMap
          routes={data?.routes ?? []}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
        />

        {loading && (
          <div className="absolute left-3 top-3 z-20 rounded-md border border-border bg-card px-3 py-1.5 text-[13px]">
            <span className="flex items-center gap-2">
              <span className="inline-block size-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
              Searching...
            </span>
          </div>
        )}

        {error && (
          <div className="absolute left-3 top-3 z-20 rounded-md border border-[#E5484D]/30 bg-card px-3 py-1.5 text-[13px] text-[#E5484D]">
            {error}
          </div>
        )}

        {/* Toggle panel button when collapsed */}
        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute right-3 top-3 z-20 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] transition-colors hover:bg-accent"
          >
            Open panel
          </button>
        )}
      </div>

      {/* Right panel */}
      {panelOpen && (
        <div className="flex w-[360px] shrink-0 flex-col border-l border-border bg-background">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              OpenWild
            </Link>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4 rotate-180" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-border p-3">
            <SearchControls
              origins={origins}
              originValue={draftOrigin}
              selectedDate={draftDate}
              onOriginChange={setDraftOrigin}
              onDateChange={setDraftDate}
              onSubmit={submitSearch}
              compact
              searchLabel={hasSearched ? "Update" : "Search"}
              loading={loading}
            />
          </div>

          {/* Results header */}
          {hasSearched && data && (
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[13px] font-medium">
                {originSummary?.code ?? ""} — {data.date ? format(parseISO(data.date), "MMM d") : ""}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {data.routes.length} routes
              </span>
            </div>
          )}

          {/* Route list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {data?.routes.map((route) => {
              const selected = route.id === selectedRouteId;

              return (
                <button
                  key={route.id}
                  type="button"
                  className={cn(
                    "w-full border-b border-border px-3 py-2.5 text-left transition-colors",
                    selected ? "bg-accent" : "hover:bg-accent/50",
                  )}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-medium">{route.destinationCity}</span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[13px] font-semibold",
                        priceColor(route),
                      )}
                    >
                      {route.priceLabel}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono">{route.destinationCode}</span>
                    <span>{route.flightType === "DOMESTIC" ? "Domestic" : route.flightType === "INTERNATIONAL" ? "Intl" : ""}</span>
                  </div>

                  {selected && (
                    <div className="mt-2">
                      <a
                        href={route.routeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-colors hover:bg-foreground/90"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Frontier
                        <ArrowUpRight className="size-3" />
                      </a>
                    </div>
                  )}
                </button>
              );
            })}

            {!loading && !error && hasSearched && (data?.routes.length ?? 0) === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-[13px] text-muted-foreground">No routes found</p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  Try a different date
                </p>
              </div>
            )}

            {!hasSearched && (
              <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                <Plane className="size-5 text-muted-foreground/20" />
                <p className="text-[13px] text-muted-foreground">
                  Select airport and date
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
