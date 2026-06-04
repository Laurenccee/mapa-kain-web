"use client";

import { useCallback, useMemo, useState } from "react";
import MapDisplay from "./MapDisplay";
import StoreSheet from "@/features/store/components/store/StoreSheet";
import type { ClaimedStore } from "@/features/store/types/store";
import { BuildingSelectionResult } from "../types";

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
