"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { Map, Source, Layer, GeolocateControl } from "@vis.gl/react-maplibre";
import type { MapRef } from "@vis.gl/react-maplibre";
import type maplibregl from "maplibre-gl";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { useTheme } from "next-themes";

import { MAPS } from "@/utils/constants/maps";
import { queryBuildingAtPoint } from "../lib/buildingSelection";
import { queryClaimedBuildings } from "../lib/claimedBuildings";

export default function MapDisplay() {
  const mapRef = useRef<MapRef>(null);
  const geolocateControlRef = useRef<maplibregl.GeolocateControl>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // Track both initialization states to lock the screen seamlessly
  const [isLocationResolved, setIsLocationResolved] = useState(false);
  const [isLayersReady, setIsLayersReady] = useState(false);
  const [initialViewState, setInitialViewState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    id: string | number;
    properties: Record<string, any>;
  } | null>(null);

  const [selectedFeature, setSelectedFeature] = useState<Feature<Polygon> | null>(null);
  const [claimedFeatures, setClaimedFeatures] = useState<Feature<Polygon>[]>([]);

  // 🧪 TEST: Mark one building as claimed (remove this once you fetch from DB)
  // using useMemo to provide a stable reference so we don't re-trigger hooks endlessly
  const claimedBuildingIds = useMemo(() => ["bld_122.3600069_11.7147727"], []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const mapStyle = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

  // SERVICE WORKER REGISTRATION
  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/map-sw.js")
        .then((reg) => console.log("🗺️ Map Service Worker active:", reg.scope))
        .catch((err) =>
          console.error("Map Service Worker registration failed:", err),
        );
    }
  }, []);

  // Cache detection on mount
  useEffect(() => {
    let center = MAPS.FALLBACK_PHILIPPINES;
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat, timestamp } = JSON.parse(cached);
        center = [lng, lat];
        if (Date.now() - timestamp <= MAPS.ONE_DAY) {
          setIsLocationResolved(true);
        }
      } catch (e) {
        console.error("Error parsing cached location:", e);
      }
    }

    setInitialViewState({
      longitude: center[0],
      latitude: center[1],
      zoom: 17,
      pitch: 55,
      bearing: -15,
    });
  }, []);

  // Trigger GeolocateControl once initialViewState is ready and mounted
  useEffect(() => {
    if (initialViewState) {
      const timer = setTimeout(() => {
        if (geolocateControlRef.current) {
          try {
            geolocateControlRef.current.trigger();
          } catch (err) {
            console.warn("Geolocate trigger failed:", err);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialViewState]);

  // Sync claimed IDs when list of IDs or map readiness changes
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && isLayersReady) {
      const features = queryClaimedBuildings(map, claimedBuildingIds);
      setClaimedFeatures(features);
    }
  }, [claimedBuildingIds, isLayersReady]);

  // Handle map first idle load
  const handleMapIdle = useCallback((e: any) => {
    setIsLayersReady(true);
    const map = e.target;
    if (map) {
      const features = queryClaimedBuildings(map, claimedBuildingIds);
      setClaimedFeatures(features);
    }
  }, [claimedBuildingIds]);

  // Scan claimed buildings when viewport changes
  const handleMoveEnd = useCallback((e: any) => {
    const map = e.target;
    if (map) {
      const features = queryClaimedBuildings(map, claimedBuildingIds);
      setClaimedFeatures(features);
    }
  }, [claimedBuildingIds]);

  // Handle building selection via map clicks
  const handleMapClick = useCallback((e: any) => {
    const map = e.target;
    if (!map) return;

    const result = queryBuildingAtPoint(map, e.point, e.lngLat);
    if (result) {
      setSelectedBuilding({
        id: result.buildingId,
        properties: result.properties,
      });
      setSelectedFeature(result.feature);
    } else {
      setSelectedBuilding(null);
      setSelectedFeature(null);
    }
  }, []);

  // Memoized GeoJSON datasets for data sources
  const selectedGeoJson = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: selectedFeature ? [selectedFeature] : [],
  }), [selectedFeature]);

  const claimedGeoJson = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: claimedFeatures,
  }), [claimedFeatures]);

  // Memoized layer configurations to prevent unneeded re-rendering
  const buildingsLayer = useMemo(() => ({
    id: "3d-buildings",
    source: "openmaptiles",
    "source-layer": "building",
    type: "fill-extrusion" as const,
    minzoom: 14,
    paint: {
      "fill-extrusion-color": isDark ? "#343a40" : "#cbd5e1",
      "fill-extrusion-height": ["coalesce", ["get", "render_height"], 15] as any,
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
      "fill-extrusion-opacity": 0.85,
    },
  }), [isDark]);

  const claimedLayer = useMemo(() => ({
    id: "3d-buildings-claimed",
    type: "fill-extrusion" as const,
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#10b981",
      "fill-extrusion-height": ["+", ["coalesce", ["get", "render_height"], 15], 0.5] as any,
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
      "fill-extrusion-opacity": 0.85,
    },
  }), []);

  const highlightedLayer = useMemo(() => ({
    id: "3d-buildings-highlighted",
    type: "fill-extrusion" as const,
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#f59e0b",
      "fill-extrusion-height": ["+", ["coalesce", ["get", "render_height"], 15], 0.5] as any,
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
      "fill-extrusion-opacity": 0.95,
    },
  }), []);

  // Hide view behind loading screen until geolocation resolves and layers load
  const showLoader = !isLocationResolved || !isLayersReady || !initialViewState;

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

      {/* MAP CANVAS */}
      {initialViewState && (
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          maxPitch={85}
          attributionControl={false}
          transformRequest={(url) => {
            if (url === "https://tiles.openfreemap.org/planet") {
              return { url: "/api/map-source" };
            }
            return { url };
          }}
          onIdle={handleMapIdle}
          onMoveEnd={handleMoveEnd}
          onClick={handleMapClick}
        >
          <GeolocateControl
            ref={geolocateControlRef}
            position="bottom-right"
            trackUserLocation={true}
            showUserLocation={true}
            fitBoundsOptions={{ maxZoom: 17 }}
            positionOptions={{
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 30000,
            }}
            onGeolocate={(e: any) => {
              const coords = e.coords;
              if (!coords) return;

              localStorage.setItem(
                MAPS.CACHE_KEY,
                JSON.stringify({
                  lng: coords.longitude,
                  lat: coords.latitude,
                  timestamp: Date.now(),
                })
              );

              const map = mapRef.current?.getMap();
              if (map) {
                map.easeTo({
                  center: [coords.longitude, coords.latitude],
                  zoom: 17,
                  duration: 1200,
                  essential: true,
                });
              }

              setIsLocationResolved(true);
            }}
          />

          <Layer {...buildingsLayer} />

          <Source id="claimed-buildings-source" type="geojson" data={claimedGeoJson}>
            <Layer {...claimedLayer} />
          </Source>

          <Source id="selected-building" type="geojson" data={selectedGeoJson}>
            <Layer {...highlightedLayer} />
          </Source>
        </Map>
      )}

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
                onClick={() => {
                  setSelectedBuilding(null);
                  setSelectedFeature(null);
                }}
                className="text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={() => {
                router.push(`/claim?buildingId=${selectedBuilding.id}`);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/95 w-full rounded-xl px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98] cursor-pointer"
            >
              Claim Building to Open Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
