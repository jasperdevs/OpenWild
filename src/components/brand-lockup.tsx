"use client";

import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLockup({ className, compact = false }: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground",
          compact ? "size-10" : "size-14",
        )}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className={compact ? "size-6" : "size-9"}
          fill="none"
        >
          <rect x="9" y="9" width="46" height="46" rx="12" stroke="currentColor" strokeWidth="3" />
          <path
            d="M18 40L27 31L35 35L46 22"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 46H46"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="18" cy="40" r="3.5" fill="currentColor" />
          <circle cx="27" cy="31" r="3.5" fill="currentColor" />
          <circle cx="35" cy="35" r="3.5" fill="currentColor" />
          <circle cx="46" cy="22" r="3.5" fill="currentColor" />
        </svg>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-medium uppercase text-muted-foreground",
            compact ? "text-[10px] tracking-[0.32em]" : "text-[11px] tracking-[0.34em]",
          )}
        >
          Open
        </p>
        <p
          className={cn(
            "truncate font-semibold tracking-tight",
            compact ? "text-base" : "text-2xl",
          )}
        >
          Wild
        </p>
      </div>
    </div>
  );
}
