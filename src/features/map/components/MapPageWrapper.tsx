"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import StoreSheet from "@/features/store/components/store/StoreSheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClaimedStore } from "@/features/store/types/store";
import { BuildingSelectionResult } from "../types";

// maplibre-gl is ~500KB; only load it on the client once this route renders.
const MapDisplay = dynamic(() => import("./MapDisplay"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface MapPageWrapper {
  claimedBuildingIds: string[];
  claimedStores: ClaimedStore[];
}

export default function MapPageWrapper({
  claimedBuildingIds,
  claimedStores,
}: MapPageWrapper) {
  const [activeStore, setActiveStore] = useState<ClaimedStore | null>(null);

  const storeMap = useMemo(
    () => new Map(claimedStores.map((s) => [s.building_id, s])),
    [claimedStores],
  );

  const handleBuildingSelect = useCallback(
    (result: BuildingSelectionResult | null) => {
      const associatedStore = result ? storeMap.get(result.buildingId) : null;
      setActiveStore(associatedStore || null);
    },
    [storeMap],
  );

  return (
    <section className="relative h-full w-full">
      <MapDisplay
        mode="select"
        claimedBuildingIds={claimedBuildingIds}
        selectClaimedOnly
        onBuildingSelect={handleBuildingSelect}
      />

      <StoreSheet
        store={activeStore}
        onClose={() => handleBuildingSelect(null)}
      />
    </section>
  );
}
