"use client";

import { addDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import blackoutDates from "@/data/blackout-dates.json";

import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FrontierOrigin } from "@/lib/frontier-types";

const BLACKOUT_SET = new Set(blackoutDates);
const DATE_COUNT = 14;

type SearchControlsProps = {
  className?: string;
  compact?: boolean;
  loading?: boolean;
  onDateChange: (value: string) => void;
  onOriginChange: (value: string) => void;
  onSubmit: () => void;
  originValue: string;
  origins: FrontierOrigin[];
  searchLabel?: string;
  selectedDate: string;
};

function buildDateOptions() {
  const baseDate = new Date();

  return Array.from({ length: DATE_COUNT }, (_, i) => {
    const date = addDays(baseDate, i);
    const value = format(date, "yyyy-MM-dd");
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const blackout = BLACKOUT_SET.has(value);

    return {
      value,
      dayLabel: isToday ? "Today" : isTomorrow ? "Tmrw" : format(date, "EEE"),
      dateLabel: format(date, "MMM d"),
      blackout,
    };
  });
}

export function SearchControls({
  className,
  compact = false,
  loading = false,
  onDateChange,
  onOriginChange,
  onSubmit,
  originValue,
  origins,
  searchLabel = "Search",
  selectedDate,
}: SearchControlsProps) {
  const dateOptions = buildDateOptions();
  const canSearch = originValue !== "" && selectedDate !== "" && !loading;
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <SearchableSelect
        value={originValue}
        onValueChange={onOriginChange}
        options={origins.map((origin) => ({
          value: origin.slug,
          label: origin.airportLabel,
          hint: origin.label,
        }))}
        placeholder="Select departure airport"
        searchPlaceholder="Search airports..."
        emptyMessage="No airports found"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-1 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <div
          ref={scrollRef}
          className="scrollbar-none flex gap-1.5 overflow-x-auto px-5"
          style={{ scrollbarWidth: "none" }}
        >
          {dateOptions.map((option) => {
            const selected = option.value === selectedDate;

            return (
              <button
                key={option.value}
                type="button"
                disabled={option.blackout}
                onClick={() => onDateChange(option.value)}
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 transition-all",
                  compact ? "min-w-[56px]" : "min-w-[64px]",
                  option.blackout
                    ? "cursor-not-allowed border-border/50 bg-card/30 text-muted-foreground/40"
                    : "border-border bg-card hover:border-foreground/30 hover:bg-accent",
                  selected &&
                    !option.blackout &&
                    "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:border-foreground",
                )}
              >
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", selected && !option.blackout ? "text-background/70" : "text-muted-foreground")}>
                  {option.dayLabel}
                </span>
                <span className={cn("mt-0.5 text-sm font-semibold", selected && !option.blackout ? "text-background" : "")}>
                  {option.dateLabel}
                </span>
                {option.blackout && (
                  <span className="mt-0.5 text-[8px] uppercase tracking-wider text-red-400/70">Blackout</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background/90 p-1 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <Button className="w-full" onClick={onSubmit} disabled={!canSearch}>
        {loading ? "Searching Frontier..." : searchLabel}
      </Button>
    </div>
  );
}
