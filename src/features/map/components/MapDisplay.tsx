"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useEffect } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import type { MapRef } from "@vis.gl/react-maplibre";
import { useTheme } from "next-themes";
import type { GeolocateControl } from "maplibre-gl";

import { MAPS } from "@/utils/constants/maps";
import { useMapLayers } from "../hooks/useMapLayers";
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
  const [mounted, setMounted] = useState(false);
  const [initialViewState, setInitialViewState] = useState<any | null>(null);
  const [hasCachedLocation, setHasCachedLocation] = useState(false);
  const [isTilted, setIsTilted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const geoControlRef = useRef<GeolocateControl | null>(null);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const mapStyle = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

  const {
    isLayersReady,
    setIsLayersReady,
    handleMapIdle,
    handleMoveEnd,
    handleMapClick,
    claimedGeoJson,
    selectedGeoJson,
  } = useMapLayers(mapRef, {
    onBuildingSelect,
    canSelect,
    claimedBuildingIds,
    selectClaimedOnly,
  });

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
            pitch: MAPS.PITCH.TILTED,
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
            pitch: MAPS.PITCH.TILTED,
            bearing: -15,
          });
        },
        () => {
          setInitialViewState({
            longitude: MAPS.FALLBACK_PHILIPPINES.longitude,
            latitude: MAPS.FALLBACK_PHILIPPINES.latitude,
            zoom: 17,
            pitch: MAPS.PITCH.TILTED,
            bearing: -15,
          });
        },
      );
    }
  }, []);

  const handleMapLoad = (e: any) => {
    geoControlRef.current = setupGeolocation(
      e.target,
      hasCachedLocation,
      () => setIsLayersReady(true),
      (active) => {
        setIsLocating(active);
        setIsSearchingLocation(false);
      },
      () => setIsSearchingLocation(false),
    );
  };

  const handleTiltToggle = (pressed: boolean) => {
    setIsTilted(pressed);
    mapRef.current?.easeTo({
      pitch: pressed ? MAPS.PITCH.TILTED : MAPS.PITCH.FLAT,
      duration: 500,
    });
  };

  const handleLocateToggle = () => {
    if (!isLocating) setIsSearchingLocation(true);
    geoControlRef.current?.trigger();
  };

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
          onMoveEnd={handleMoveEnd}
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
