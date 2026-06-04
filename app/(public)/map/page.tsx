import MapPageWrapper from "@/features/map/components/MapPageWrapper";
import { getClaimedStores } from "@/features/store/utils/claimedBuildings";

export default async function MapPage() {
  const claimedStores = await getClaimedStores();
  const claimedBuildingIds = claimedStores.map((store) => store.building_id);

  return (
    <main className="relative h-full w-full">
      <MapPageWrapper
        claimedBuildingIds={claimedBuildingIds}
        claimedStores={claimedStores}
      />
    </main>
  );
}
