"use client";

import { addDays, format } from "date-fns";
import blackoutDates from "@/data/blackout-dates.json";

import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FrontierOrigin } from "@/lib/frontier-types";

const BLACKOUT_SET = new Set(blackoutDates);

type SearchControlsProps = {
  className?: string;
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

  return [
    { label: "Today", value: format(baseDate, "yyyy-MM-dd") },
    { label: "Tomorrow", value: format(addDays(baseDate, 1), "yyyy-MM-dd") },
    { label: "Day After", value: format(addDays(baseDate, 2), "yyyy-MM-dd") },
  ].map((option) => ({
    ...option,
    displayDate: format(new Date(`${option.value}T12:00:00`), "MMM d"),
    disabled: BLACKOUT_SET.has(option.value),
  }));
}

export function SearchControls({
  className,
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
        placeholder="Airport"
        searchPlaceholder="Search airport"
        emptyMessage="No airport"
      />

      <div className="grid gap-2 sm:grid-cols-3">
        {dateOptions.map((option) => {
          const selected = option.value === selectedDate;

          return (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => onDateChange(option.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors",
                option.disabled
                  ? "cursor-not-allowed border-border bg-card/50 text-muted-foreground opacity-45"
                  : "border-border bg-card hover:border-foreground/40",
                selected && !option.disabled && "border-foreground bg-accent text-foreground",
              )}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{option.displayDate}</div>
            </button>
          );
        })}
      </div>

      <Button className="w-full" onClick={onSubmit} disabled={!canSearch}>
        {loading ? "Loading..." : searchLabel}
      </Button>
    </div>
  );
}
