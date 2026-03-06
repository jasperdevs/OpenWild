"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SearchControls } from "@/components/search-controls";
import type { FrontierOrigin } from "@/lib/frontier-types";

type HomeViewProps = {
  origins: FrontierOrigin[];
};

export function HomeView({ origins }: HomeViewProps) {
  const router = useRouter();
  const [originValue, setOriginValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">OpenWild</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Frontier GoWild fare search
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <SearchControls
            origins={origins}
            originValue={originValue}
            selectedDate={selectedDate}
            onOriginChange={setOriginValue}
            onDateChange={setSelectedDate}
            onSubmit={() =>
              router.push(`/dashboard?origin=${originValue}&date=${selectedDate}`)
            }
          />
        </div>
      </div>
    </div>
  );
}
