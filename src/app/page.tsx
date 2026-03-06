import { HomeView } from "@/components/home-view";
import { getFrontierOrigins } from "@/lib/frontier-server";

export default async function Home() {
  const origins = await getFrontierOrigins();

  return <HomeView origins={origins} />;
}
