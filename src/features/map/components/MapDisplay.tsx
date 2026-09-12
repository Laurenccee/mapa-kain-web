"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useCallback } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import type { MapRef, MapEvent } from "@vis.gl/react-maplibre";
import { useTheme } from "next-themes";
import type { GeolocateControl } from "maplibre-gl";

import { MAPS } from "@/utils/constants/maps";
import { useMapLayers } from "../hooks/useMapLayers";
import { useMapInitialization } from "../hooks/useMapInitialization";
import { MapLoader } from "../components/MapLoader";
import { MapControls } from "./MapControls";

import { setupGeolocation } from "../utils/geolocation";
import {
  claimedLayerConfig,
  highlightedLayerConfig,
} from "../utils/layerConfigs";
import { MapDisplayProps } from "../types";

export default function MapDisplay({
  mode = "view",
  onBuildingSelect,
  claimedBuildingIds = [],
  selectClaimedOnly = false,
}: MapDisplayProps) {
  const canSelect = mode === "select";

  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const { mounted, initialViewState, hasCachedLocation } =
    useMapInitialization();
  // Map always starts tilted (see useMapInitialization), so match that state.
  const [isTilted, setIsTilted] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const geoControlRef = useRef<GeolocateControl | null>(null);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const mapStyle = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

  const {
    isLayersReady,
    setIsLayersReady,
    handleMapIdle,
    handleMapClick,
    claimedGeoJson,
    selectedGeoJson,
  } = useMapLayers(mapRef, {
    onBuildingSelect,
    canSelect,
    claimedBuildingIds,
    selectClaimedOnly,
  });

  const handleMapLoad = useCallback(
    (e: MapEvent) => {
      // The map has rendered its first frame here, so it's safe to reveal it.
      setIsLayersReady(true);
      geoControlRef.current = setupGeolocation(
        e.target,
        hasCachedLocation,
        (active) => {
          setIsLocating(active);
          setIsSearchingLocation(false);
        },
        () => setIsSearchingLocation(false),
      );
    },
    [hasCachedLocation, setIsLayersReady],
  );

  const handleTiltToggle = useCallback((pressed: boolean) => {
    setIsTilted(pressed);
    mapRef.current?.easeTo({
      pitch: pressed ? MAPS.PITCH.TILTED : MAPS.PITCH.FLAT,
      duration: 500,
    });
  }, []);

  const handleLocateToggle = useCallback(() => {
    if (!isLocating) setIsSearchingLocation(true);
    geoControlRef.current?.trigger();
  }, [isLocating]);

  const showLoader = !initialViewState || !isLayersReady;

  return (
    <div className="relative h-full w-full">
      <MapLoader show={showLoader} />

      {initialViewState && (
        <MapControls
          isTilted={isTilted}
          onTiltToggle={handleTiltToggle}
          isLocating={isLocating}
          isSearchingLocation={isSearchingLocation}
          onLocateToggle={handleLocateToggle}
        />
      )}

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
          onClick={canSelect ? handleMapClick : undefined}
        >
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
