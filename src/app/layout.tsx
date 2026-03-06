import type { Metadata } from "next";
import { IBM_Plex_Mono, Public_Sans } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenWild",
  description: "Airport-first GoWild route search with a live map and direct Frontier links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${publicSans.variable} ${plexMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <TooltipProvider delayDuration={120}>
          <SiteShell>{children}</SiteShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
