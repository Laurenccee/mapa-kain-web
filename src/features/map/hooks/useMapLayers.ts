import { useState, useMemo, useCallback, RefObject, useEffect } from "react";
import type { MapRef } from "@vis.gl/react-maplibre";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { queryBuildingAtPoint } from "../utils/buildingSelection";
import { queryClaimedBuildings } from "../utils/claimedBuildings";

interface SelectedBuilding {
  id: string | number;
  properties: Record<string, any>;
}

export function useMapLayers(mapRef: RefObject<MapRef | null>) {
  const [isLayersReady, setIsLayersReady] = useState(false);
  const [selectedBuilding, setSelectedBuilding] =
    useState<SelectedBuilding | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Polygon> | null>(null);
  const [claimedFeatures, setClaimedFeatures] = useState<Feature<Polygon>[]>(
    [],
  );

  const claimedBuildingIds = useMemo(() => ["bld_122.3600069_11.7147727"], []);

  const syncClaimedLayers = useCallback(
    (map: any) => {
      if (map) {
        const features = queryClaimedBuildings(map, claimedBuildingIds);
        setClaimedFeatures(features);
      }
    },
    [claimedBuildingIds],
  );

  // useMapLayers.ts
  const handleMapIdle = useCallback(
    (e: any) => {
      setIsLayersReady(true);

      try {
        syncClaimedLayers(e.target);
      } catch (err) {
        console.warn("Layers compiling baseline metadata:", err);
      }
    },
    [syncClaimedLayers],
  );

  const handleMoveEnd = useCallback(
    (e: any) => {
      syncClaimedLayers(e.target);
    },
    [syncClaimedLayers],
  );

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

  const clearSelection = useCallback(() => {
    setSelectedBuilding(null);
    setSelectedFeature(null);
  }, []);

  const selectedGeoJson = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: selectedFeature ? [selectedFeature] : [],
    }),
    [selectedFeature],
  );

  const claimedGeoJson = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: claimedFeatures,
    }),
    [claimedFeatures],
  );

  return {
    isLayersReady,
    setIsLayersReady,
    selectedBuilding,
    selectedGeoJson,
    claimedGeoJson,
    handleMapIdle,
    handleMoveEnd,
    handleMapClick,
    clearSelection,
  };
}
