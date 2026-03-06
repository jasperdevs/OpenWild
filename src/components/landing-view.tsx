"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLockup } from "@/components/brand-lockup";
import { SearchControls } from "@/components/search-controls";
import { Card, CardContent } from "@/components/ui/card";
import type { FrontierOrigin } from "@/lib/frontier-types";

type LandingViewProps = {
  origins: FrontierOrigin[];
};

export function LandingView({ origins }: LandingViewProps) {
  const router = useRouter();
  const [originValue, setOriginValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] items-center">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_460px]">
        <section className="flex min-h-[420px] items-end rounded-2xl border border-border bg-card px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-6">
            <BrandLockup />
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">One-way GoWild search.</h1>
          </div>
        </section>

        <Card className="border-border">
          <CardContent className="p-5 sm:p-6">
            <SearchControls
              origins={origins}
              originValue={originValue}
              selectedDate={selectedDate}
              onOriginChange={setOriginValue}
              onDateChange={setSelectedDate}
              onSubmit={() => router.push(`/dashboard?origin=${originValue}&date=${selectedDate}`)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
