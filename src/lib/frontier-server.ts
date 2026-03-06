import "server-only";

import { format, parseISO } from "date-fns";

import airportCoordinates from "@/data/airport-coordinates.json";
import blackoutDates from "@/data/blackout-dates.json";
import type {
  FrontierOrigin,
  FrontierRoute,
  FrontierSearchResponse,
} from "@/lib/frontier-types";

type SputnikFare = {
  emptyFare?: boolean;
  priceSpecification?: {
    totalPrice?: number;
    soldOut?: boolean;
  };
  outboundFlight?: {
    fareClass?: string;
    departureAirportIataCode?: string;
    arrivalAirportIataCode?: string;
    origin?: {
      city?: { name?: string };
    };
    destination?: {
      city?: { name?: string; image?: string };
      airport?: { name?: string };
    };
  };
  departureDate?: string;
  journeyType?: string;
  flightType?: string;
};

type RoutePageEntry = {
  keys: Set<string>;
  url: string;
};

const FRONTIER_HEADERS = {
  "accept-language": "en-US,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
};

const SITEMAP_URL = "https://flights.flyfrontier.com/en/sitemap/flights-from-city/page-1";
const BLACKOUT_SET = new Set(blackoutDates);
let originsPromise: Promise<FrontierOrigin[]> | null = null;
const AIRPORT_POSITION_BY_IATA = new Map<
  string,
  { latitude: number; longitude: number }
>(
  Object.entries(
    airportCoordinates as Record<string, { latitude: number; longitude: number }>,
  )
    .filter(
      ([, airport]) =>
        typeof airport.latitude === "number" &&
        typeof airport.longitude === "number",
    )
    .map(([code, airport]) => [
      code,
      {
        latitude: airport.latitude,
        longitude: airport.longitude,
      },
    ]),
);
const AIRPORT_NAME_BY_IATA = new Map<string, string>(
  Object.entries(
    airportCoordinates as Record<string, { name?: string }>,
  )
    .filter(([, airport]) => typeof airport.name === "string" && airport.name.length > 0)
    .map(([code, airport]) => [code, airport.name as string]),
);

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

function normalizeLookupKey(value: string) {
  return decodeHtml(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildLookupKeys(value: string) {
  const decoded = decodeHtml(value).trim();
  const firstSegment = decoded.split(",")[0]?.trim() || decoded;
  const withoutCity = firstSegment.replace(/\bcity\b/gi, " ").trim();
  const candidates = [
    decoded,
    firstSegment,
    withoutCity,
    withoutCity.replace(/^st\.?\s+/i, "saint "),
    withoutCity.replace(/^saint\s+/i, "st "),
  ];

  return Array.from(
    new Set(candidates.map((candidate) => normalizeLookupKey(candidate)).filter(Boolean)),
  );
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: FRONTIER_HEADERS,
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Failed Frontier request: ${response.status} ${url}`);
  }

  return response.text();
}

function priceBand(price: number) {
  if (price <= 35) {
    return "low";
  }

  if (price >= 90) {
    return "high";
  }

  return "mid";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function originUrl(origin: Pick<FrontierOrigin, "pagePath">) {
  return `https://flights.flyfrontier.com${origin.pagePath}`;
}

function parseRoutePageEntries(origin: Pick<FrontierOrigin, "slug" | "pagePath">, html: string) {
  const prefix = `${origin.slug}-to-`;
  const matches = html.matchAll(
    new RegExp(
      `href="([^"]*${prefix}[a-z0-9\\-]+)"[^>]*aria-label="([^"]*)"[^>]*>([^<]+)</a>`,
      "gi",
    ),
  );
  const entries: RoutePageEntry[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const slug = decodeHtml(match[1]).replace(/^\/+/, "").replace(/^en\//, "");

    if (!slug.startsWith(prefix) || seen.has(slug)) {
      continue;
    }

    seen.add(slug);

    const linkText = decodeHtml(match[3]);
    const destinationText = linkText.split(/\s+-\s+/).at(-1) ?? linkText;
    const ariaDestination = decodeHtml(match[2]).split(/\bto\b/i).at(-1) ?? "";
    const slugDestination = slug.replace(prefix, "").replace(/-\d+$/, "").replace(/-/g, " ");
    const keys = new Set([
      ...buildLookupKeys(destinationText),
      ...buildLookupKeys(ariaDestination),
      ...buildLookupKeys(slugDestination),
    ]);

    entries.push({
      keys,
      url: `https://flights.flyfrontier.com/en/${slug}`,
    });
  }

  return entries;
}

function parseOriginMeta(origin: Pick<FrontierOrigin, "slug">, html: string) {
  const match = html.match(
    /"originCity":\{"name":"([^"]+)","cityCode":"([A-Z]{3})"/,
  );

  if (!match) {
    throw new Error(`Failed to parse origin metadata for ${origin.slug}`);
  }

  return {
    label: decodeHtml(match[1]),
    code: match[2],
  };
}

function parseRouteMeta(html: string) {
  const originMatch = html.match(/"originCity":\{"name":"([^"]+)","cityCode":"([A-Z]{3})"/);
  const destinationMatch = html.match(
    /"destinationCity":\{"name":"([^"]+)","cityCode":"([A-Z]{3})"/,
  );

  if (!originMatch || !destinationMatch) {
    throw new Error("Failed to parse route metadata");
  }

  return {
    originCity: decodeHtml(originMatch[1]),
    originCode: originMatch[2],
    destinationCity: decodeHtml(destinationMatch[1]),
    destinationCode: destinationMatch[2],
  };
}

function extractJsonArray(html: string, key: string) {
  const keyIndex = html.indexOf(`"${key}":[`);

  if (keyIndex < 0) {
    throw new Error(`Missing ${key} payload`);
  }

  const startIndex = html.indexOf("[", keyIndex);

  if (startIndex < 0) {
    throw new Error(`Missing ${key} array start`);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const character = html[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "[") {
      depth += 1;
      continue;
    }

    if (character === "]") {
      depth -= 1;

      if (depth === 0) {
        return html.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error(`Unterminated ${key} payload`);
}

function parseDailyHistogram(html: string) {
  return JSON.parse(extractJsonArray(html, "dailyHistogram")) as SputnikFare[];
}

async function mapWithConcurrency<T, TResult>(
  items: T[],
  concurrency: number,
  iteratee: (item: T, index: number) => Promise<TResult>,
) {
  const results = new Array<TResult>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export async function getFrontierOrigins(): Promise<FrontierOrigin[]> {
  if (!originsPromise) {
    originsPromise = (async () => {
      const html = await fetchText(SITEMAP_URL);
      const matches = html.matchAll(/href="(\/en\/flights-from-[^"]+)"[^>]*>([^<]+)<\/a>/g);
      const seen = new Set<string>();
      const baseOrigins: Array<Pick<FrontierOrigin, "slug" | "label" | "pagePath">> = [];

      for (const match of matches) {
        const pagePath = match[1];
        const slug = pagePath.replace("/en/", "");

        if (seen.has(slug)) {
          continue;
        }

        seen.add(slug);
        baseOrigins.push({
          slug,
          label: decodeHtml(match[2]).replace(/^From\s+/i, ""),
          pagePath,
        });
      }

      const enrichedOrigins = await Promise.all(
        baseOrigins.map(async (origin) => {
          const originHtml = await fetchText(originUrl(origin));
          const meta = parseOriginMeta(origin, originHtml);
          const airportName = AIRPORT_NAME_BY_IATA.get(meta.code) ?? meta.label;

          return {
            ...origin,
            label: meta.label,
            code: meta.code,
            airportName,
            airportLabel: `${meta.code} · ${airportName}`,
          } satisfies FrontierOrigin;
        }),
      );

      return enrichedOrigins.sort((left, right) =>
        left.airportLabel.localeCompare(right.airportLabel),
      );
    })();
  }

  return originsPromise;
}

export async function searchFrontierRoutes(
  origin: FrontierOrigin,
  departureDate: string,
): Promise<FrontierSearchResponse> {
  if (BLACKOUT_SET.has(departureDate)) {
    throw new Error("Selected date is a GoWild blackout date");
  }

  const html = await fetchText(originUrl(origin));
  const meta = parseOriginMeta(origin, html);
  const routePages = parseRoutePageEntries(origin, html);
  const routes = (
    await mapWithConcurrency(routePages, 10, async (routePage) => {
      const routeHtml = await fetchText(routePage.url);
      const routeMeta = parseRouteMeta(routeHtml);
      const matchingFare = parseDailyHistogram(routeHtml).find(
        (fare) =>
          fare.departureDate === departureDate &&
          fare.journeyType === "ONE_WAY" &&
          !fare.emptyFare &&
          typeof fare.priceSpecification?.totalPrice === "number" &&
          fare.priceSpecification.totalPrice > 0,
      );

      if (!matchingFare) {
        return null;
      }

      const price = matchingFare.priceSpecification?.totalPrice;
      const destinationCode =
        matchingFare.outboundFlight?.arrivalAirportIataCode ?? routeMeta.destinationCode;
      const originCode =
        matchingFare.outboundFlight?.departureAirportIataCode ?? routeMeta.originCode;

      if (price == null || !destinationCode || !originCode) {
        return null;
      }

      const route: FrontierRoute = {
        id: `${originCode}-${destinationCode}`,
        originCity: routeMeta.originCity,
        originCode,
        originLatitude: AIRPORT_POSITION_BY_IATA.get(originCode)?.latitude ?? null,
        originLongitude: AIRPORT_POSITION_BY_IATA.get(originCode)?.longitude ?? null,
        destinationCity: routeMeta.destinationCity,
        destinationCode,
        destinationLatitude: AIRPORT_POSITION_BY_IATA.get(destinationCode)?.latitude ?? null,
        destinationLongitude: AIRPORT_POSITION_BY_IATA.get(destinationCode)?.longitude ?? null,
        destinationAirport:
          AIRPORT_NAME_BY_IATA.get(destinationCode) ?? routeMeta.destinationCity,
        departureDate,
        departureLabel: format(parseISO(departureDate), "MMM d"),
        price,
        priceLabel: formatPrice(price),
        priceBand: priceBand(price),
        soldOut: Boolean(matchingFare.priceSpecification?.soldOut),
        flightType: matchingFare.flightType || "UNKNOWN",
        image: null,
        gowildBlackout: false,
        routeUrl: routePage.url,
      };

      return route;
    })
  )
    .filter((route): route is FrontierRoute => route !== null)
    .sort((left, right) => {
      if (left.price !== right.price) {
        return left.price - right.price;
      }

      return left.destinationCity.localeCompare(right.destinationCity);
    });

  return {
    origin: {
      slug: origin.slug,
      label: meta.label,
      code: meta.code,
    },
    date: departureDate,
    searchedAt: new Date().toISOString(),
    routes,
  };
}
