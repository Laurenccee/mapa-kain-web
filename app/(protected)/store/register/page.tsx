import StoreRegisterPageClient from "@/features/store/components/StoreRegisterPageClient";
import { getClaimedBuildingIds } from "@/features/store/utils/claimedBuildings";

export default async function StoreRegisterPage() {
  const claimedBuildingIds = await getClaimedBuildingIds();

  return <StoreRegisterPageClient claimedBuildingIds={claimedBuildingIds} />;
}
