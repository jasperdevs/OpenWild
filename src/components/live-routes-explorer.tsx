"use client";

import { LoaderCircle, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";

import { SearchControls } from "@/components/search-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FrontierOrigin, FrontierRoute, FrontierSearchResponse } from "@/lib/frontier-types";

const FrontierMap = dynamic(
  () => import("@/components/frontier-map").then((module) => module.FrontierMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-card" />,
  },
);

type LiveRoutesExplorerProps = {
  origins: FrontierOrigin[];
};

function priceClass(route: FrontierRoute) {
  if (route.priceBand === "low") {
    return "text-emerald-400";
  }

  if (route.priceBand === "high") {
    return "text-red-400";
  }

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
          {
            signal: controller.signal,
            cache: "no-store",
          },
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
      current && data.routes.some((route) => route.id === current) ? current : data.routes[0].id,
    );
  }, [data]);

  const selectedRoute =
    data?.routes.find((route) => route.id === selectedRouteId) ?? data?.routes[0] ?? null;
  const originSummary = useMemo(
    () => origins.find((origin) => origin.slug === (data?.origin.slug ?? draftOrigin)) ?? null,
    [data?.origin.slug, draftOrigin, origins],
  );

  function submitSearch() {
    if (!draftOrigin || !draftDate) {
      return;
    }

    const params = new URLSearchParams({
      origin: draftOrigin,
      date: draftDate,
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="grid min-h-[calc(100dvh-8.5rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_410px]">
      <Card className="overflow-hidden border-border">
        <CardContent className="relative h-[calc(100dvh-8.5rem)] min-h-[620px] p-0">
          <FrontierMap
            routes={data?.routes ?? []}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />

          {loading ? (
            <div className="absolute left-4 top-4 rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Loading
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="absolute left-4 top-4 rounded-lg border border-red-900/70 bg-background px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="min-w-0">
        <Card className="flex h-[calc(100dvh-8.5rem)] min-h-[620px] flex-col overflow-hidden border-border">
          <CardContent className="border-b border-border p-4">
            <SearchControls
              origins={origins}
              originValue={draftOrigin}
              selectedDate={draftDate}
              onOriginChange={setDraftOrigin}
              onDateChange={setDraftDate}
              onSubmit={submitSearch}
              searchLabel={queryOrigin && queryDate ? "Update" : "Search"}
              loading={loading}
            />
          </CardContent>

          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {originSummary?.airportLabel ?? "Airport"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data?.date ? format(parseISO(data.date), "EEE, MMM d") : " "}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                {data?.routes.length ?? 0}
              </Badge>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {data?.routes.map((route) => {
                const selected = route.id === selectedRouteId;

                return (
                  <div
                    key={route.id}
                    className={
                      selected
                        ? "rounded-lg border border-foreground/40 bg-accent p-3"
                        : "rounded-lg border border-border bg-card p-3"
                    }
                  >
                    <button type="button" className="w-full text-left" onClick={() => setSelectedRouteId(route.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-medium">{route.destinationCity}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {route.destinationCode} · {route.destinationAirport}
                          </div>
                        </div>
                        <div className={`shrink-0 text-right text-xl font-semibold ${priceClass(route)}`}>
                          {route.priceLabel}
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">{route.departureLabel}</div>
                      <Button asChild variant="outline" size="sm">
                        <a href={route.routeUrl} target="_blank" rel="noreferrer">
                          Open
                          <ArrowUpRight className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!loading && !error && (data?.routes.length ?? 0) === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  No routes
                </div>
              ) : null}

              {!queryOrigin || !queryDate ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  Search
                </div>
              ) : null}
            </div>
          </div>

          {selectedRoute ? (
            <div className="border-t border-border px-4 py-3">
              <Button asChild className="w-full">
                <a href={selectedRoute.routeUrl} target="_blank" rel="noreferrer">
                  Open {selectedRoute.destinationCode}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
