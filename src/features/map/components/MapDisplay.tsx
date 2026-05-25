// MapDisplay.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useEffect } from "react";
import { Map } from "@vis.gl/react-maplibre";
import type { MapRef } from "@vis.gl/react-maplibre";
import { useTheme } from "next-themes";

import { MAPS } from "@/utils/constants/maps";
import { useMapLayers } from "../hooks/useMapLayers";
import { MapLoader } from "../components/MapLoader";
import { BuildingClaimCard } from "../components/BuildingClaimCard";

// Your refactored separate files
import { setupBuildingLayers } from "../utils/setupLayers";
import { setupGeolocation } from "../utils/geolocation";

export default function MapDisplay() {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [initialViewState, setInitialViewState] = useState<any | null>(null);
  const [hasCachedLocation, setHasCachedLocation] = useState(false);

  const {
    isLayersReady,
    setIsLayersReady,
    selectedBuilding,
    handleMapIdle,
    handleMoveEnd,
    handleMapClick,
    clearSelection,
  } = useMapLayers(mapRef);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const mapStyle = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Pre-fetch location BEFORE rendering the canvas
  useEffect(() => {
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat } = JSON.parse(cached);
        if (typeof lng === "number" && typeof lat === "number") {
          setHasCachedLocation(true);
          setInitialViewState({
            longitude: lng,
            latitude: lat,
            zoom: 17,
            pitch: 55,
            bearing: -15,
          });
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setHasCachedLocation(false);

          // ✅ CRITICAL BLUE BUTTON FIX: Apply micro-offset ONLY on cold starts
          // to force a vector difference that activates the tracking button state
          setInitialViewState({
            longitude: longitude,
            latitude: latitude - 0.005,
            zoom: 16.5,
            pitch: 55,
            bearing: -15,
          });
        },
        () => {
          setInitialViewState({
            longitude: MAPS.FALLBACK_PHILIPPINES.longitude,
            latitude: MAPS.FALLBACK_PHILIPPINES.latitude,
            zoom: 17,
            pitch: 55,
            bearing: -15,
          });
        },
      );
    }
  }, []);

  // ✅ 2. Execute external refactored logic ONLY when the map core is ready
  const handleMapLoad = (e: any) => {
    const mapInstance = e.target;

    // Setup your split-file assets safely
    setupBuildingLayers(mapInstance, isDark);

    setupGeolocation(mapInstance, hasCachedLocation, () => {
      setIsLayersReady(true);
    });
  };

  const showLoader = !initialViewState || !isLayersReady;

  return (
    <div className="relative h-full w-full">
      <MapLoader show={showLoader} />

      {initialViewState && (
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          maxPitch={85}
          attributionControl={false}
          onLoad={handleMapLoad} // 👈 Handshake event with split files
          onIdle={handleMapIdle}
          onMoveEnd={handleMoveEnd}
          onClick={handleMapClick}
        />
      )}

      <BuildingClaimCard building={selectedBuilding} onClose={clearSelection} />
    </div>
  );
}
