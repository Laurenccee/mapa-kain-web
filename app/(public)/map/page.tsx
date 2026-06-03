import PublicMapPageClient from "@/features/map/components/PublicMapPageClient";
import MenuSheet from "@/features/store/components/MenuSheet";
import { getClaimedStores } from "@/features/store/utils/claimedBuildings";

interface PageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function MapPage({ searchParams }: PageProps) {
  const { storeId } = await searchParams;

  const claimedStores = await getClaimedStores();
  const claimedBuildingIds = claimedStores.map((store) => store.building_id);

  return (
    <PublicMapPageClient
      claimedBuildingIds={claimedBuildingIds}
      claimedStores={claimedStores}
      storeId={storeId}
    >
      {storeId && <MenuSheet storeId={storeId} />}
    </PublicMapPageClient>
  );
}
