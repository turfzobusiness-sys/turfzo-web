import ExploreClient from "@/components/explore/explore-client";
import { convexClient } from "@/lib/convex";
import type { Turf } from "@/lib/types";

export const revalidate = 300;

export default async function ExplorePage() {
  let initialTurfs: Turf[] | undefined;

  if (process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL) {
    try {
      const data = await convexClient.query<Turf[]>("turfs:getAvailable", {});
      initialTurfs = data ?? [];
    } catch {
      initialTurfs = undefined;
    }
  }

  return <ExploreClient initialTurfs={initialTurfs} />;
}
