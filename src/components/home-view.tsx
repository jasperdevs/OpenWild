import { LandingView } from "@/components/landing-view";
import type { FrontierOrigin } from "@/lib/frontier-types";

type HomeViewProps = {
  origins: FrontierOrigin[];
};

export function HomeView({ origins }: HomeViewProps) {
  return <LandingView origins={origins} />;
}
