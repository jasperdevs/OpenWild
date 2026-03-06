"use client";

import { LoaderCircle, ArrowUpRight, Plane, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";

import { SearchControls } from "@/components/search-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FrontierOrigin, FrontierRoute, FrontierSearchResponse } from "@/lib/frontier-types";

const FrontierMap = dynamic(
  () => import("@/components/frontier-map").then((module) => module.FrontierMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

type LiveRoutesExplorerProps = {
  origins: FrontierOrigin[];
};

function priceClass(route: FrontierRoute) {
  if (route.priceBand === "low") return "text-emerald-400";
  if (route.priceBand === "high") return "text-red-400";
  return "text-foreground";
}

function priceBg(route: FrontierRoute) {
  if (route.priceBand === "low") return "bg-emerald-500/10";
  if (route.priceBand === "high") return "bg-red-500/10";
  return "bg-muted";
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

    setSelectedRouteId((current) =>
      current && data.routes.some((r) => r.id === current) ? current : data.routes[0].id,
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

  const lowCount = data?.routes.filter((r) => r.priceBand === "low").length ?? 0;
  const hasSearched = queryOrigin && queryDate;

  return (
    <div className="grid min-h-[calc(100dvh-9rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      {/* Map */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="relative h-[calc(100dvh-9rem)] min-h-[500px] p-0">
          <FrontierMap
            routes={data?.routes ?? []}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />

          {loading && (
            <div className="absolute left-4 top-4 flex items-center gap-2.5 rounded-lg border border-border bg-background/95 px-3.5 py-2.5 text-sm backdrop-blur-sm">
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              <span>Searching Frontier routes...</span>
            </div>
          )}

          {error && (
            <div className="absolute left-4 top-4 flex items-center gap-2.5 rounded-lg border border-red-900/50 bg-background/95 px-3.5 py-2.5 text-sm text-red-400 backdrop-blur-sm">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          {!loading && data && (
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-border bg-background/95 px-3.5 py-2 text-xs backdrop-blur-sm">
              <span className="font-medium">{data.routes.length} routes</span>
              {lowCount > 0 && (
                <span className="text-emerald-400">{lowCount} under $35</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Panel */}
      <div className="min-w-0">
        <Card className="flex h-[calc(100dvh-9rem)] min-h-[500px] flex-col overflow-hidden border-border/60">
          {/* Search */}
          <CardContent className="border-b border-border/60 p-4">
            <SearchControls
              origins={origins}
              originValue={draftOrigin}
              selectedDate={draftDate}
              onOriginChange={setDraftOrigin}
              onDateChange={setDraftDate}
              onSubmit={submitSearch}
              compact
              searchLabel={hasSearched ? "Update search" : "Search routes"}
              loading={loading}
            />
          </CardContent>

          {/* Header */}
          {hasSearched && (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {originSummary?.airportLabel ?? "Airport"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data?.date ? format(parseISO(data.date), "EEEE, MMMM d") : "Loading..."}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {data?.routes.length ?? 0} routes
              </Badge>
            </div>
          )}

          {/* Route List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-1.5 p-3">
              {data?.routes.map((route) => {
                const selected = route.id === selectedRouteId;

                return (
                  <button
                    key={route.id}
                    type="button"
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all",
                      selected
                        ? "border-foreground/30 bg-accent"
                        : "border-transparent bg-card/50 hover:bg-card",
                    )}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {route.destinationCity}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {route.destinationCode}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {route.destinationAirport}
                        </p>
                      </div>
                      <div className={cn("shrink-0 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums", priceBg(route), priceClass(route))}>
                        {route.priceLabel}
                      </div>
                    </div>

                    {selected && (
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                        <span className="text-xs text-muted-foreground">{route.departureLabel}</span>
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                          <a href={route.routeUrl} target="_blank" rel="noreferrer">
                            Book on Frontier
                            <ArrowUpRight className="ml-1 size-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </button>
                );
              })}

              {!loading && !error && hasSearched && (data?.routes.length ?? 0) === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-12 text-center">
                  <Plane className="size-8 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No routes found</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Try a different date or origin airport
                    </p>
                  </div>
                </div>
              )}

              {!hasSearched && (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-12 text-center">
                  <Plane className="size-8 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Search for routes</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Select an airport and date above
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          {selectedRoute && (
            <div className="border-t border-border/60 p-3">
              <Button asChild className="w-full">
                <a href={selectedRoute.routeUrl} target="_blank" rel="noreferrer">
                  Open {selectedRoute.destinationCity} on Frontier
                  <ArrowUpRight className="ml-1.5 size-4" />
                </a>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

