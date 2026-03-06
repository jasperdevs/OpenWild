export type FrontierOrigin = {
  slug: string;
  label: string;
  pagePath: string;
  code: string;
  airportName: string;
  airportLabel: string;
};

export type FrontierRoute = {
  id: string;
  originCity: string;
  originCode: string;
  originLatitude: number | null;
  originLongitude: number | null;
  destinationCity: string;
  destinationCode: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAirport: string;
  departureDate: string;
  departureLabel: string;
  price: number;
  priceLabel: string;
  priceBand: "low" | "mid" | "high";
  soldOut: boolean;
  flightType: string;
  image: string | null;
  gowildBlackout: boolean;
  routeUrl: string;
};

export type FrontierSearchResponse = {
  origin: {
    slug: string;
    label: string;
    code: string;
  };
  date: string;
  searchedAt: string;
  routes: FrontierRoute[];
};
