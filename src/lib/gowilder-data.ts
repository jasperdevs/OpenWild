import { addDays, format, parseISO } from "date-fns";

import airportsData from "@/data/airports.json";
import blackoutDates from "@/data/blackout-dates.json";

export const APP_VERSION = "3.1";

export const RELEASE_NOTES = [
  {
    title: "New Feature: Inbound Flight Search",
    body: "Find every flight arriving at a destination airport on a selected date.",
  },
  {
    title: "Limited Time Offer",
    body: "Premium is discounted to $5 when yearly billing is selected.",
  },
  {
    title: "Weather + Route Context",
    body: "Trip summaries now include weather hints, route notes, and seat visibility.",
  },
  {
    title: "Rental Car Search",
    body: "Day-trip and planner views include local transport guidance for your destination.",
  },
];

type AirportRecord = {
  cityAndCode: string;
  country: string;
  countryCode: string;
  state: string;
  stationCode: string;
};

export type SearchMode = "outbound" | "inbound";

export type Metro = {
  id: string;
  city: string;
  codes: string[];
  distanceMiles: number;
  note: string;
};

export type Airport = {
  code: string;
  label: string;
  city: string;
  country: string;
  countryCode: string;
  state: string;
};

export type DateOption = {
  value: string;
  label: string;
  dateLabel: string;
  tags: string[];
  blackout: boolean;
};

export type FlightResult = {
  id: string;
  mode: SearchMode;
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  originCountryCode: string;
  destinationCountryCode: string;
  departTime: string;
  arrivalTime: string;
  departDateLabel: string;
  arrivalDateLabel: string;
  duration: string;
  passFare: string;
  cashFare: string;
  seatsRemaining: number;
  tags: string[];
  status: "available" | "blackout";
  note: string;
};

export type RouteSummary = {
  destinationCode: string;
  destinationCity: string;
  destinationCountryCode: string;
  availability: "available" | "blackout";
  nextWindow: string;
  avgFare: string;
  seatsRemaining: number;
  tags: string[];
};

export type DayTripResult = {
  id: string;
  destinationCity: string;
  destinationCode: string;
  outboundTime: string;
  returnTime: string;
  timeOnGround: string;
  allInFare: string;
  note: string;
  tags: string[];
};

export type PlannerSuggestion = {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  flights: FlightResult[];
};

const rawAirports = (airportsData.airports as AirportRecord[]).map((airport) => {
  const city = airport.cityAndCode.replace(/\s+\([A-Z]{3}\)$/, "");
  return {
    code: airport.stationCode,
    label: airport.cityAndCode,
    city,
    country: airport.country,
    countryCode: airport.countryCode,
    state: airport.state,
  } satisfies Airport;
});

export const AIRPORTS = rawAirports;
export const BLACKOUT_DATE_SET = new Set(blackoutDates as string[]);

const AIRPORT_BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

const FEATURED_METROS_RAW: Metro[] = [
  { id: "washington-dc", city: "Washington D.C.", codes: ["DCA", "IAD", "BWI"], distanceMiles: 23, note: "DCA, IAD, BWI" },
  { id: "new-york-city", city: "New York City", codes: ["JFK", "LGA", "EWR"], distanceMiles: 221, note: "JFK, LGA, EWR" },
  { id: "detroit", city: "Detroit", codes: ["DTW"], distanceMiles: 393, note: "DTW" },
  { id: "boston", city: "Boston", codes: ["BOS", "PWM"], distanceMiles: 452, note: "BOS, PWM" },
  { id: "chicago", city: "Chicago", codes: ["ORD", "MDW"], distanceMiles: 591, note: "ORD, MDW" },
  { id: "atlanta", city: "Atlanta", codes: ["ATL"], distanceMiles: 533, note: "ATL" },
  { id: "orlando", city: "Orlando", codes: ["MCO"], distanceMiles: 758, note: "MCO" },
  { id: "nashville", city: "Nashville", codes: ["BNA"], distanceMiles: 541, note: "BNA" },
  { id: "dallas", city: "Dallas/Ft. Worth", codes: ["DFW"], distanceMiles: 1178, note: "DFW" },
  { id: "denver", city: "Denver", codes: ["DEN"], distanceMiles: 1473, note: "DEN" },
  { id: "las-vegas", city: "Las Vegas", codes: ["LAS"], distanceMiles: 2091, note: "LAS" },
  { id: "los-angeles", city: "Los Angeles", codes: ["LAX", "BUR", "ONT", "SNA"], distanceMiles: 2293, note: "LAX, BUR, ONT, SNA" },
  { id: "miami", city: "Miami", codes: ["MIA", "FLL"], distanceMiles: 922, note: "MIA, FLL" },
  { id: "houston", city: "Houston", codes: ["HOU", "IAH"], distanceMiles: 1215, note: "HOU, IAH" },
  { id: "minneapolis", city: "Minneapolis/St. Paul", codes: ["MSP"], distanceMiles: 932, note: "MSP" },
  { id: "seattle", city: "Seattle", codes: ["SEA"], distanceMiles: 2327, note: "SEA" },
  { id: "phoenix", city: "Phoenix", codes: ["PHX"], distanceMiles: 1978, note: "PHX" },
  { id: "san-juan", city: "San Juan", codes: ["SJU"], distanceMiles: 1555, note: "SJU" },
];

export const FEATURED_METROS = FEATURED_METROS_RAW.map((metro) => ({
  ...metro,
  codes: metro.codes.filter((code) => AIRPORT_BY_CODE.has(code)),
})).filter((metro) => metro.codes.length > 0);

export function getMetroById(metroId: string | null | undefined) {
  return FEATURED_METROS.find((metro) => metro.id === metroId) ?? FEATURED_METROS[0];
}

export function getAirportByCode(code: string) {
  return AIRPORT_BY_CODE.get(code);
}

export function formatMetroCodes(metro: Metro) {
  return metro.codes.join(", ");
}

export function buildDateOptions(count = 10) {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index);
    const value = format(date, "yyyy-MM-dd");
    const blackout = BLACKOUT_DATE_SET.has(value);
    const label = index === 0 ? "Today" : index === 1 ? "Tomorrow" : format(date, "EEEE");
    const distanceLabel = index > 1 ? ` (${index} day${index === 1 ? "" : "s"})` : "";

    return {
      value,
      label,
      dateLabel: `${format(date, "MMM do")}${distanceLabel}`,
      tags: blackout
        ? ["blackout"]
        : index < 2
          ? ["available", "gowild", "international"]
          : index % 3 === 0
            ? ["available", "international"]
            : ["available", "gowild"],
      blackout,
    } satisfies DateOption;
  });
}

export function getDestinationOptions(metro: Metro) {
  return AIRPORTS.filter((airport) => !metro.codes.includes(airport.code)).sort((left, right) =>
    left.city.localeCompare(right.city),
  );
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function minutesToClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${normalizedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function pickMetroOriginCode(metro: Metro, seed: number) {
  return metro.codes[seed % metro.codes.length] ?? metro.codes[0];
}

function uniqueAirports(candidates: Airport[]) {
  const seenCities = new Set<string>();

  return candidates.filter((airport) => {
    if (seenCities.has(airport.city)) {
      return false;
    }

    seenCities.add(airport.city);
    return true;
  });
}

export function generateFlightResults(input: {
  metroId: string;
  date: string;
  mode: SearchMode;
  destinationCode?: string;
}) {
  const metro = getMetroById(input.metroId);
  const searchDate = parseISO(input.date);
  const blackout = BLACKOUT_DATE_SET.has(input.date);
  const targetPool = uniqueAirports(getDestinationOptions(metro))
    .filter((airport) => (input.destinationCode ? airport.code === input.destinationCode : true))
    .sort((left, right) => {
      const leftSeed = hashString(`${input.date}:${input.mode}:${left.code}`);
      const rightSeed = hashString(`${input.date}:${input.mode}:${right.code}`);

      return leftSeed - rightSeed;
    })
    .slice(0, input.destinationCode ? 1 : 8);

  return targetPool.map((airport, index) => {
    const routeSeed = hashString(`${metro.id}:${airport.code}:${input.date}:${input.mode}:${index}`);
    const metroOriginCode = pickMetroOriginCode(metro, routeSeed);
    const metroOrigin = getAirportByCode(metroOriginCode);
    const origin = input.mode === "outbound" ? metroOrigin ?? airport : airport;
    const destination = input.mode === "outbound" ? airport : metroOrigin ?? airport;
    const departureMinutes = 330 + (routeSeed % 720);
    const durationMinutes = 85 + (routeSeed % 285);
    const arrivalMinutes = departureMinutes + durationMinutes;
    const goWildEligible = !blackout && routeSeed % 5 !== 0;
    const international =
      origin.countryCode !== "US" || destination.countryCode !== "US";

    return {
      id: `${origin.code}-${destination.code}-${input.date}-${input.mode}`,
      mode: input.mode,
      originCode: origin.code,
      destinationCode: destination.code,
      originCity: origin.city,
      destinationCity: destination.city,
      originCountryCode: origin.countryCode,
      destinationCountryCode: destination.countryCode,
      departTime: minutesToClock(departureMinutes),
      arrivalTime: minutesToClock(arrivalMinutes),
      departDateLabel: format(searchDate, "EEE, MMM d"),
      arrivalDateLabel:
        arrivalMinutes >= 1440 ? format(addDays(searchDate, 1), "EEE, MMM d") : format(searchDate, "EEE, MMM d"),
      duration: formatDuration(durationMinutes),
      passFare: blackout
        ? "Unavailable on blackout dates"
        : goWildEligible
          ? `$${15 + (routeSeed % 8)}.00 GoWild`
          : "Cash fare only",
      cashFare: `$${79 + (routeSeed % 141)}.00`,
      seatsRemaining: 4 + (routeSeed % 24),
      tags: [
        blackout ? "blackout" : "available",
        goWildEligible ? "gowild" : "cash only",
        ...(international ? ["international"] : []),
      ],
      status: blackout ? "blackout" : "available",
      note:
        blackout
          ? "Frontier blocks GoWild redemptions on this date."
          : routeSeed % 2 === 0
            ? "Works well as a same-day or overnight hop."
            : "Usually the cleanest route for a weekend run.",
    } satisfies FlightResult;
  });
}

export function buildRouteSummaries(metroId: string, date: string) {
  return generateFlightResults({ metroId, date, mode: "outbound" }).map((flight) => ({
    destinationCode: flight.destinationCode,
    destinationCity: flight.destinationCity,
    destinationCountryCode: flight.destinationCountryCode,
    availability: flight.status,
    nextWindow: `${flight.departTime} - ${flight.arrivalTime}`,
    avgFare: flight.passFare.startsWith("$") ? flight.passFare : flight.cashFare,
    seatsRemaining: flight.seatsRemaining,
    tags: flight.tags,
  })) satisfies RouteSummary[];
}

export function buildDayTrips(input: { metroId: string; date: string; overnight: boolean }) {
  const outboundFlights = generateFlightResults({
    metroId: input.metroId,
    date: input.date,
    mode: "outbound",
  }).slice(0, 6);

  return outboundFlights.map((flight, index) => {
    const seed = hashString(`${flight.id}:${input.overnight ? "night" : "same"}`);
    const returnDate = input.overnight ? addDays(parseISO(input.date), 1) : parseISO(input.date);
    const groundMinutes = 240 + (seed % 420);
    const returnDeparture = 660 + (seed % 540);

    return {
      id: `${flight.id}-day-trip-${index}`,
      destinationCity: flight.destinationCity,
      destinationCode: flight.destinationCode,
      outboundTime: `${flight.departTime} - ${flight.arrivalTime}`,
      returnTime: `${minutesToClock(returnDeparture)} - ${minutesToClock(returnDeparture + 95 + (seed % 185))} ${format(returnDate, "MMM d")}`,
      timeOnGround: formatDuration(groundMinutes),
      allInFare: flight.passFare.startsWith("$") ? `${flight.passFare} + return` : flight.cashFare,
      note: input.overnight
        ? "Good if you want a little more time on the ground."
        : "Tight turnaround, but efficient for a same-day run.",
      tags: [
        flight.status === "blackout" ? "blackout" : "available",
        input.overnight ? "next-day return" : "same-day return",
        ...flight.tags.filter((tag) => tag === "international"),
      ],
    } satisfies DayTripResult;
  });
}

function matchAirportKeywords(prompt: string) {
  const lowered = prompt.toLowerCase();

  return AIRPORTS.filter((airport) => {
    return lowered.includes(airport.city.toLowerCase()) || lowered.includes(airport.code.toLowerCase());
  });
}

export function buildPlannerSuggestions(prompt: string, defaultMetroId: string): PlannerSuggestion[] {
  const lowered = prompt.toLowerCase();
  const matchedAirports = matchAirportKeywords(prompt);
  const metro = getMetroById(defaultMetroId);
  const targetDate = format(addDays(new Date(), lowered.includes("weekend") ? 2 : 1), "yyyy-MM-dd");
  const warmWeather = /(warm|sun|beach|miami|florida|palm)/.test(lowered);
  const mountains = /(ski|mountain|hike|denver|salt lake|snow)/.test(lowered);
  const international = /(international|passport|cancun|mexico|caribbean|jamaica)/.test(lowered);

  const baseFlights = generateFlightResults({ metroId: metro.id, date: targetDate, mode: "outbound" });

  const filteredFlights = baseFlights.filter((flight) => {
    if (matchedAirports.length > 0) {
      return matchedAirports.some(
        (airport) =>
          airport.code === flight.destinationCode || airport.city === flight.destinationCity,
      );
    }

    if (warmWeather) {
      return (
        ["FL", "PR", "MX", "JM", "CR"].includes(flight.destinationCountryCode) ||
        ["Miami", "Orlando", "Fort. Lauderdale", "San Juan"].includes(flight.destinationCity)
      );
    }

    if (mountains) {
      return ["Denver", "Boise", "Missoula", "Salt Lake City"].some((city) =>
        flight.destinationCity.includes(city),
      );
    }

    if (international) {
      return flight.destinationCountryCode !== "US";
    }

    return true;
  });

  const suggestionPool = (filteredFlights.length > 0 ? filteredFlights : baseFlights).slice(0, 3);

  return suggestionPool.map((flight, index) => ({
    id: `${flight.id}-planner-${index}`,
    title:
      index === 0
        ? `Best fit: ${flight.destinationCity}`
        : index === 1
          ? `Lower-friction option: ${flight.destinationCity}`
          : `Stretch option: ${flight.destinationCity}`,
    summary: `Leaves ${metro.city} on ${flight.departDateLabel} and gets you into ${flight.destinationCity} with ${flight.seatsRemaining} seats showing.`,
    rationale:
      matchedAirports.length > 0
        ? "Matched your destination language directly and kept the connection simple."
        : warmWeather
          ? "Skews toward warmer destinations with reliable GoWild-style pricing."
          : mountains
            ? "Keeps the flight short enough for an outdoor-focused trip."
            : international
              ? "Surfaces international options first so the passport part is handled."
              : "Balances price, seat visibility, and overall trip simplicity.",
    flights: [flight],
  }));
}
