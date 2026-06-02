"use client";

import { useCallback, useMemo, useState } from "react";

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

import MapDisplay from "./MapDisplay";

interface PublicMapPageClientProps {
  claimedBuildingIds: string[];
  claimedStores: ClaimedStore[];
}

function formatStoreTime(value: string) {
  const [hours, minutes] = value.split(":");
  if (!hours || !minutes) {
    return value;
  }

  return `${hours}:${minutes}`;
}

export default function PublicMapPageClient({
  claimedBuildingIds,
  claimedStores,
}: PublicMapPageClientProps) {
  const isMobile = useIsMobile();
  const [selectedStore, setSelectedStore] = useState<ClaimedStore | null>(null);

  const storesByBuildingId = useMemo(
    () =>
      new Map(
        claimedStores.map((store) => {
          return [store.building_id, store] as const;
        }),
      ),
    [claimedStores],
  );

  const handleBuildingSelect = useCallback(
    (result: BuildingSelectionResult | null) => {
      if (!result) {
        setSelectedStore(null);
        return;
      }

      setSelectedStore(storesByBuildingId.get(result.buildingId) ?? null);
    },
    [storesByBuildingId],
  );

  const handleSheetOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedStore(null);
    }
  }, []);

  return (
    <section className="relative h-full w-full">
      <MapDisplay
        mode="select"
        claimedBuildingIds={claimedBuildingIds}
        selectClaimedOnly
        onBuildingSelect={handleBuildingSelect}
      />

      <Sheet open={Boolean(selectedStore)} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className={
            isMobile
              ? "overflow-y-auto data-[side=bottom]:h-[92dvh] data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:rounded-t-2xl"
              : "w-[92vw] overflow-y-auto data-[side=left]:sm:max-w-120 data-[side=right]:sm:max-w-120"
          }
        >
          <SheetHeader>
            <SheetTitle>{selectedStore?.name ?? "Building Details"}</SheetTitle>
            <SheetDescription>
              Information about the selected claimed building.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-6">
            {selectedStore ? (
              <>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Building ID
                  </p>
                  <p className="text-sm">{selectedStore.building_id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Hours
                  </p>
                  <p className="text-sm">
                    {formatStoreTime(selectedStore.open_time)} -{" "}
                    {formatStoreTime(selectedStore.close_time)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed">
                    {selectedStore.description?.trim() ||
                      "No description provided yet."}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Select a claimed building to view store details.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
