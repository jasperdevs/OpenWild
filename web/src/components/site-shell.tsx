"use client";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
