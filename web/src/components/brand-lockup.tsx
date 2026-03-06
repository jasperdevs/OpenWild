"use client";

import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLockup({ className, compact = false }: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border border-border bg-card",
          compact ? "size-8" : "size-11",
        )}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className={compact ? "size-4.5" : "size-7"}
          fill="none"
        >
          <path
            d="M18 40L27 31L35 35L46 22"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="46" cy="22" r="3" fill="currentColor" />
        </svg>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tracking-tight leading-none",
            compact ? "text-sm" : "text-xl",
          )}
        >
          OpenWild
        </p>
        {!compact && (
          <p className="mt-0.5 truncate text-[11px] tracking-wide text-muted-foreground">
            GoWild Flight Search
          </p>
        )}
      </div>
    </div>
  );
}
