import { ClaimedStore } from "@/features/store/types/claimedStore";

export interface PublicMapPageClientProps {
  claimedBuildingIds: string[];
  claimedStores: ClaimedStore[];
  children?: React.ReactNode;
  storeId?: string;
}
