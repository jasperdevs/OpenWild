import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenWild",
  description: "Open source GoWild flight search. Real Frontier fares, every route, every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <TooltipProvider delayDuration={120}>
          <SiteShell>{children}</SiteShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
