import PublicMapPageClient from "@/features/map/components/PublicMapPageClient";
import { getClaimedStores } from "@/features/store/utils/claimedBuildings";

export default async function MapPage() {
  const claimedStores = await getClaimedStores();
  const claimedBuildingIds = claimedStores.map((store) => store.building_id);

  return (
    <PublicMapPageClient
      claimedBuildingIds={claimedBuildingIds}
      claimedStores={claimedStores}
    />
  );
}
