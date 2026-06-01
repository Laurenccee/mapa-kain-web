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
    <section className="grid min-h-dvh flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="order-2 flex w-full flex-col justify-center px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:order-1 lg:px-8 lg:pt-10 lg:pb-10">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 sm:gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl leading-tight sm:text-4xl">
              Tell us about your kitchen.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              We&apos;ll use this information to create your profile and help
              locals find your best dishes.
            </p>
          </div>
          <RegisterStoreForm selectedBuilding={selectedBuilding} />
        </div>
      </div>
      <div className="order-1 h-[42dvh] min-h-80 w-full lg:order-2 lg:h-auto lg:min-h-0">
        <MapDisplay
          mode="select"
          claimedBuildingIds={claimedBuildingIds}
          onBuildingSelect={setSelectedBuilding}
        />
      </div>
    </section>
  );
}
