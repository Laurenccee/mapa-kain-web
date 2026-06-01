"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useEffect, useMemo } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import type { MapRef } from "@vis.gl/react-maplibre";
import { useTheme } from "next-themes";

import { MAPS } from "@/utils/constants/maps";
import { useMapLayers } from "../hooks/useMapLayers";
import { MapLoader } from "../components/MapLoader";

import { setupGeolocation } from "../utils/geolocation";
import {
  getBuildingsLayerConfig,
  claimedLayerConfig,
  highlightedLayerConfig,
} from "../utils/layerConfigs";
import type { BuildingSelectionResult } from "../utils/buildingSelection";

type MapMode = "view" | "select";

interface MapDisplayProps {
  mode?: MapMode;
  onBuildingSelect?: (result: BuildingSelectionResult | null) => void;
  claimedBuildingIds?: string[];
}

export default function MapDisplay({
  mode = "view",
  onBuildingSelect,
  claimedBuildingIds = [],
}: MapDisplayProps) {
  const canSelect = mode === "select";

  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [initialViewState, setInitialViewState] = useState<any | null>(null);
  const [hasCachedLocation, setHasCachedLocation] = useState(false);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const mapStyle = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

  const {
    isLayersReady,
    setIsLayersReady,
    selectedBuilding,
    handleMapIdle,
    handleMoveEnd,
    handleMapClick,
    clearSelection,
    claimedGeoJson,
    selectedGeoJson,
  } = useMapLayers(mapRef, {
    onBuildingSelect,
    canSelect,
    claimedBuildingIds,
  });

  const buildingsLayer = useMemo(
    () =>
      getBuildingsLayerConfig(isDark, {
        opacity: canSelect ? 0.85 : 0.5,
      }),
    [isDark, canSelect],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

          setInitialViewState({
            longitude,
            latitude,
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

  const handleMapLoad = (e: any) => {
    setupGeolocation(e.target, hasCachedLocation, () => setIsLayersReady(true));
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
          onLoad={handleMapLoad}
          onIdle={handleMapIdle}
          onMoveEnd={handleMoveEnd}
          onClick={canSelect ? handleMapClick : undefined}
        >
          <Layer {...buildingsLayer} />

          <Source
            id="claimed-buildings-source"
            type="geojson"
            data={claimedGeoJson}
          >
            <Layer {...claimedLayerConfig} />
          </Source>

          {canSelect && (
            <Source
              id="selected-building"
              type="geojson"
              data={selectedGeoJson}
            >
              <Layer {...highlightedLayerConfig} />
            </Source>
          )}
        </Map>
      )}
    </div>
  );
}
