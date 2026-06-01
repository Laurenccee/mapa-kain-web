"use client";

import React, { useState } from "react";

import MapDisplay from "@/features/map/components/MapDisplay";
import { BuildingSelectionResult } from "@/features/map/utils/buildingSelection";
import RegisterStoreForm from "@/features/store/components/RegisterStoreForm";

interface StoreRegisterPageClientProps {
  claimedBuildingIds: string[];
}

export default function StoreRegisterPageClient({
  claimedBuildingIds,
}: StoreRegisterPageClientProps) {
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingSelectionResult | null>(null);

  return (
    <section className="grid min-h-screen flex-1 grid-cols-2 items-center justify-center">
      <div className="col-span-1 flex w-full flex-col items-center justify-center px-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl">Tell us about your kitchen.</h1>
            <p>
              We&apos;ll use this information to create your profile and help
              locals find your best dishes.
            </p>
          </div>
          <RegisterStoreForm selectedBuilding={selectedBuilding} />
        </div>
      </div>
      <div className="col-span-1 h-full w-full">
        <MapDisplay
          mode="select"
          claimedBuildingIds={claimedBuildingIds}
          onBuildingSelect={setSelectedBuilding}
        />
      </div>
    </section>
  );
}
