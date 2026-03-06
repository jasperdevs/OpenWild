"use client";

import { addDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import blackoutDates from "@/data/blackout-dates.json";

import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FrontierOrigin } from "@/lib/frontier-types";

const BLACKOUT_SET = new Set(blackoutDates);

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

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(baseDate, i);
    const value = format(date, "yyyy-MM-dd");
    const blackout = BLACKOUT_SET.has(value);

    return {
      value,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(date, "EEE"),
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
        placeholder="Select airport"
        searchPlaceholder="Search..."
        emptyMessage="No airports"
      />

      <div className="flex flex-wrap gap-1">
        {dateOptions.map((option) => {
          const selected = option.value === selectedDate;

          return (
            <button
              key={option.value}
              type="button"
              disabled={option.blackout}
              onClick={() => onDateChange(option.value)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-all",
                option.blackout
                  ? "cursor-not-allowed border-border/30 text-muted-foreground/30"
                  : "border-border hover:border-muted-foreground/40",
                selected &&
                  !option.blackout &&
                  "border-foreground bg-foreground text-background",
              )}
            >
              <span className="font-medium">{option.label}</span>
              <span className={cn("ml-1", selected ? "text-background/60" : "text-muted-foreground")}>
                {option.dateLabel}
              </span>
            </button>
          );
        })}
      </div>

      <Button className="w-full" size="sm" onClick={onSubmit} disabled={!canSearch}>
        {loading ? "Searching..." : searchLabel}
      </Button>
    </div>
  );
}
