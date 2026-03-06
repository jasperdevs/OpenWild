"use client";

import { Fragment, useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { FrontierRoute } from "@/lib/frontier-types";

type FrontierMapProps = {
  onSelectRoute: (routeId: string) => void;
  routes: FrontierRoute[];
  selectedRouteId: string | null;
};

function tone(route: FrontierRoute) {
  if (route.priceBand === "low") {
    return { stroke: "#22c55e", label: "is-low" };
  }

  if (route.priceBand === "high") {
    return { stroke: "#f87171", label: "is-high" };
  }

  return { stroke: "#e4e4e7", label: "is-mid" };
}

function createPriceIcon(route: FrontierRoute, selected: boolean) {
  const toneClass = tone(route).label;

  return L.divIcon({
    className: "",
    html: `<div class="map-price-chip ${toneClass}${selected ? " is-selected" : ""}"><span>${route.priceLabel}</span></div>`,
    iconSize: [64, 28],
    iconAnchor: [32, 30],
  });
}

function FitToRoutes({
  routes,
  selectedRouteId,
}: {
  routes: FrontierRoute[];
  selectedRouteId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? null;
    const activeRoutes = selectedRoute ? [selectedRoute] : routes;
    const points = activeRoutes.flatMap((route) => {
      const nextPoints: [number, number][] = [];

      if (route.originLatitude != null && route.originLongitude != null) {
        nextPoints.push([route.originLatitude, route.originLongitude]);
      }

      if (route.destinationLatitude != null && route.destinationLongitude != null) {
        nextPoints.push([route.destinationLatitude, route.destinationLongitude]);
      }

      return nextPoints;
    });

    if (points.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [100, 100],
      maxZoom: selectedRoute ? 4 : 3,
    });
  }, [map, routes, selectedRouteId]);

  return null;
}

function SyncMapSize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);
    const timer = window.setTimeout(() => map.invalidateSize(), 120);

    return () => {
      window.clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

export function FrontierMap({
  onSelectRoute,
  routes,
  selectedRouteId,
}: FrontierMapProps) {
  const mappableRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          route.originLatitude != null &&
          route.originLongitude != null &&
          route.destinationLatitude != null &&
          route.destinationLongitude != null,
      ),
    [routes],
  );

  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom className="h-full w-full" zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <SyncMapSize />
      <FitToRoutes routes={mappableRoutes} selectedRouteId={selectedRouteId} />

      {mappableRoutes.map((route) => {
        const selected = route.id === selectedRouteId;
        const routeTone = tone(route);

        return (
          <Fragment key={route.id}>
            <Polyline
              positions={[
                [route.originLatitude as number, route.originLongitude as number],
                [route.destinationLatitude as number, route.destinationLongitude as number],
              ]}
              pathOptions={{
                color: routeTone.stroke,
                opacity: selected ? 0.92 : 0.4,
                weight: selected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectRoute(route.id),
              }}
            />
            <Marker
              position={[route.destinationLatitude as number, route.destinationLongitude as number]}
              icon={createPriceIcon(route, selected)}
              eventHandlers={{
                click: () => onSelectRoute(route.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -28]} opacity={1} className="frontier-map-tooltip">
                <div className="space-y-1">
                  <div className="font-medium">{route.destinationCity}</div>
                  <div>{route.priceLabel}</div>
                </div>
              </Tooltip>
            </Marker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
