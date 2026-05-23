"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useEffect, useCallback } from "react"; // 🟢 Wrapped useCallback
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader } from "@hugeicons/core-free-icons";

import { useMaplibreMap } from "../hooks/useMapLibreMap";
import type maplibregl from "maplibre-gl";
import { useRouter } from "next/navigation";
import { claimedBuildingsPlugin } from "../plugins/claimedBuildings.plugin";

export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Track both initialization states to lock the screen seamlessly
  const [isLocationResolved, setIsLocationResolved] = useState(false);
  const [isLayersReady, setIsLayersReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<{
    id: string | number;
    properties: Record<string, any>;
  } | null>(null);

  useEffect(() => {
    if (!mapInstance || !isLayersReady) return;
    const handleBuildingSelected = (e: {
      buildingId: string | number;
      properties: Record<string, any>;
    }) => {
      setSelectedBuilding({
        id: e.buildingId,
        properties: e.properties,
      });
    };
    const handleBuildingCleared = () => {
      setSelectedBuilding(null);
    };
    mapInstance.on("building:selected", handleBuildingSelected);
    mapInstance.on("building:cleared", handleBuildingCleared);
    return () => {
      mapInstance.off("building:selected", handleBuildingSelected);
      mapInstance.off("building:cleared", handleBuildingCleared);
    };
  }, [mapInstance, isLayersReady]);

  // 🧪 TEST: Mark one building as claimed (remove this once you fetch from DB)
  useEffect(() => {
    if (!isLayersReady) return;
    claimedBuildingsPlugin.setClaimedBuildings([
      "bld_122.3600069_11.7147727",
    ]);
  }, [isLayersReady]);

  console.log("selectedBuilding", selectedBuilding?.id);

  // SERVICE WORKER REGISTRATION
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/map-sw.js")
        .then((reg) => console.log("🗺️ Map Service Worker active:", reg.scope))
        .catch((err) =>
          console.error("Map Service Worker registration failed:", err),
        );
    }
  }, []);

  // 🟢 FIXED: Stabilize references so they don't recreate on re-renders
  const handleLocationReady = useCallback(() => {
    setIsLocationResolved(true);
  }, []);

  const handleMapLoaded = useCallback((map: maplibregl.Map) => {
    setMapInstance(map);
    setIsLayersReady(true);
  }, []);

  // Initialize hook with stable layout references
  useMaplibreMap(mapContainer, handleLocationReady, handleMapLoaded);

  // The view remains hidden under a blur shield until both conditions evaluate to true
  const showLoader = !isLocationResolved || !isLayersReady;

  return (
    <div className="relative h-full w-full">
      {/* LOADING OVERLAY */}
      {showLoader && (
        <div className="bg-background/40 absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 backdrop-blur-md transition-opacity duration-300">
          <HugeiconsIcon
            icon={Loader}
            className="text-primary animate-spin"
            size={24}
          />
          <span className="text-muted-foreground text-xs font-medium">
            Locating position and rendering assets...
          </span>
        </div>
      )}

      {/* MAP CANVAS CONTAINER */}
      {/* Map Canvas */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* FLOATING BUILDING CLAIM CARD */}
      {selectedBuilding && (
        <div className="animate-in fade-in slide-in-from-bottom-5 absolute bottom-32 left-1/2 z-30 w-full max-w-sm -translate-x-1/2 px-4 duration-300">
          <div className="bg-background/90 border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-md dark:bg-zinc-900/90">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  {selectedBuilding.properties.name || "Unnamed Building"}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  OSM Building ID:{" "}
                  <span className="text-primary font-mono">
                    {selectedBuilding.id}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-medium"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={() => {
                router.push(`/claim?buildingId=${selectedBuilding.id}`);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/95 w-full rounded-xl px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98]"
            >
              Claim Building to Open Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
