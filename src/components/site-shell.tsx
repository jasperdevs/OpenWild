"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/brand-lockup";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1540px] items-center justify-between gap-5 px-4 sm:px-6">
          <Link href="/" className="min-w-0">
            <BrandLockup compact />
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-card text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1540px] min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
