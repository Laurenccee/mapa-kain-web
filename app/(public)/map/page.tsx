import MapDisplay from "@/features/map/components/MapDisplay";
import { getClaimedBuildingIds } from "@/features/store/utils/claimedBuildings";

export default async function MapPage() {
  const claimedBuildingIds = await getClaimedBuildingIds();

  return (
    <section className="h-full w-full">
      <MapDisplay mode="view" claimedBuildingIds={claimedBuildingIds} />
    </section>
  );
}
