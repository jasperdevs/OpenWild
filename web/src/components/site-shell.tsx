"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";

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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1540px] items-center justify-between gap-5 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="min-w-0">
              <BrandLockup compact />
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jasprcodess/OpenWild"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1540px] min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            OpenWild is not affiliated with Frontier Airlines.
          </p>
          <p className="text-xs text-muted-foreground">
            Open source
          </p>
        </div>
      </footer>
    </div>
  );
}
