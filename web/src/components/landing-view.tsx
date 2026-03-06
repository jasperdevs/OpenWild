"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Globe, MapPin, Plane, Search, Zap } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { SearchControls } from "@/components/search-controls";
import { Card, CardContent } from "@/components/ui/card";
import type { FrontierOrigin } from "@/lib/frontier-types";

type LandingViewProps = {
  origins: FrontierOrigin[];
};

const FEATURES = [
  {
    icon: Search,
    title: "Real Frontier Data",
    description: "Live prices scraped directly from Frontier's route pages. No stale caches or fake estimates.",
  },
  {
    icon: MapPin,
    title: "Interactive Route Map",
    description: "See every destination on a dark-themed map with color-coded price chips.",
  },
  {
    icon: Zap,
    title: "14-Day Window",
    description: "Search up to two weeks out. Find the cheapest days to fly with your GoWild pass.",
  },
  {
    icon: Globe,
    title: "All Frontier Origins",
    description: "Every airport Frontier flies from, searchable and sorted. Pick your home base and go.",
  },
];

export function LandingView({ origins }: LandingViewProps) {
  const router = useRouter();
  const [originValue, setOriginValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100dvh-10rem)] items-center">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[120px]" />
        </div>

        <div className="relative grid w-full gap-8 lg:grid-cols-[1fr_440px] lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <BrandLockup />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Find every GoWild
                <br />
                <span className="text-muted-foreground">flight that exists.</span>
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Search real Frontier fares across all routes from any origin.
                Live prices, interactive maps, 14-day lookahead.
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{origins.length} airports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-foreground/50" />
                <span>Live Frontier data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-foreground/30" />
                <span>Free &amp; open source</span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Card className="w-full border-border/60 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                    <Plane className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Search flights</p>
                    <p className="text-xs text-muted-foreground">One-way from any Frontier origin</p>
                  </div>
                </div>

                <SearchControls
                  origins={origins}
                  originValue={originValue}
                  selectedDate={selectedDate}
                  onOriginChange={setOriginValue}
                  onDateChange={setSelectedDate}
                  compact
                  onSubmit={() =>
                    router.push(`/dashboard?origin=${originValue}&date=${selectedDate}`)
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for GoWild pass holders</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="group border-border/50 bg-card/50 transition-colors hover:border-border hover:bg-card/80">
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-foreground/20">
                  <feature.icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-border/50 bg-card/30 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight">Ready to search?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Pick an airport above, choose a date, and see every available Frontier route with real pricing.
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Start searching
          <ArrowRight className="size-4" />
        </button>
      </section>
    </div>
  );
}
