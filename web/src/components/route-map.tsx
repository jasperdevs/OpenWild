"use client";

import type { FrontierRoute } from "@/lib/frontier-types";

type RouteMapProps = {
  originLabel: string;
  routes: FrontierRoute[];
};

function nodePosition(index: number, count: number) {
  const ring = Math.floor(index / 12) + 1;
  const ringStart = (ring - 1) * 12;
  const ringCount = Math.min(12, count - ringStart);
  const ringIndex = index - ringStart;
  const angle = -Math.PI / 2 + (ringIndex / ringCount) * Math.PI * 2;
  const radius = 110 + ring * 88;

  return {
    x: 420 + Math.cos(angle) * radius,
    y: 320 + Math.sin(angle) * radius,
  };
}

function tone(route: FrontierRoute) {
  if (route.priceBand === "low") {
    return {
      stroke: "#14532d",
      fill: "#111111",
      label: "#4ade80",
    };
  }

  if (route.priceBand === "high") {
    return {
      stroke: "#7f1d1d",
      fill: "#111111",
      label: "#f87171",
    };
  }

  return {
    stroke: "#52525b",
    fill: "#111111",
    label: "#f4f4f5",
  };
}

export function RouteMap({ originLabel, routes }: RouteMapProps) {
  const visibleRoutes = routes.slice(0, 36);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-xl border border-border bg-card">
      <svg
        viewBox="0 0 840 640"
        className="h-full w-full"
        role="img"
        aria-label={`Live Frontier route map from ${originLabel}`}
      >
        <rect width="840" height="640" fill="transparent" />

        {visibleRoutes.map((route, index) => {
          const point = nodePosition(index, visibleRoutes.length);
          const colors = tone(route);

          return (
            <g key={route.id}>
              <line
                x1="420"
                y1="320"
                x2={point.x}
                y2={point.y}
                stroke="currentColor"
                strokeOpacity="0.18"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="18"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                fill={colors.label}
                className="text-[11px] font-medium"
              >
                {route.destinationCode}
              </text>
              <text
                x={point.x}
                y={point.y + 36}
                textAnchor="middle"
                className="fill-zinc-400 text-[11px]"
              >
                {route.destinationCity.split(",")[0]}
              </text>
            </g>
          );
        })}

        <circle cx="420" cy="320" r="52" className="fill-zinc-100" />
        <circle cx="420" cy="320" r="54" fill="none" className="stroke-zinc-700" />
        <text
          x="420"
          y="314"
          textAnchor="middle"
          className="fill-zinc-950 text-[16px] font-semibold"
        >
          {originLabel}
        </text>
        <text
          x="420"
          y="336"
          textAnchor="middle"
          className="fill-zinc-700 text-[12px]"
        >
          live fares
        </text>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-card/95 px-4 py-3 text-xs text-muted-foreground">
        <span>Showing {visibleRoutes.length} priced destinations in the next 90 days.</span>
        <span>Green = cheaper, red = higher fare.</span>
      </div>
    </div>
  );
}
