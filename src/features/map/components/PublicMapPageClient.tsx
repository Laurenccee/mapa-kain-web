"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 🚀 Import Next.js hooks

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BuildingSelectionResult } from "@/features/map/utils/buildingSelection";
import type { ClaimedStore } from "@/features/store/types/claimedStore";
import Image from "next/image";

import MapDisplay from "./MapDisplay";
import { PublicMapPageClientProps } from "../types/building";
import StoreSheet from "@/features/store/components/StoreSheet";

// Add new type support for props forwarded down from server page wrapper

export default function PublicMapPageClient({
  claimedBuildingIds,
  claimedStores,
  storeId,
  children,
}: PublicMapPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storesByBuildingId = useMemo(
    () =>
      new Map(
        claimedStores.map((store) => {
          return [store.building_id, store] as const;
        }),
      ),
    [claimedStores],
  );

  const currentStoreData = useMemo(() => {
    if (!storeId) return null;
    return claimedStores.find((s) => s.id === storeId) || null;
  }, [storeId, claimedStores]);

  const handleBuildingSelect = useCallback(
    (result: BuildingSelectionResult | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!result) {
        params.delete("storeId");
      } else {
        const store = storesByBuildingId.get(result.buildingId);
        if (store) {
          params.set("storeId", store.id);
        } else {
          params.delete("storeId");
        }
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, storesByBuildingId],
  );

  return (
    <section className="relative h-full w-full">
      <MapDisplay
        mode="select"
        claimedBuildingIds={claimedBuildingIds}
        selectClaimedOnly
        onBuildingSelect={handleBuildingSelect}
      />
      <StoreSheet storeId={storeId} currentStoreData={currentStoreData}>
        {children}
      </StoreSheet>
    </section>
  );
}
