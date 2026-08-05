import { useState, useMemo, useCallback, useEffect, RefObject } from "react";
import type { MapRef } from "@vis.gl/react-maplibre";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { queryBuildingAtPoint } from "../utils/buildingSelection";
import {
  matchClaimedBuildingId,
  queryClaimedBuildings,
} from "../utils/claimedBuildings";
import { SelectedBuilding, UseMapLayersOptions } from "../types";

export function useMapLayers(
  mapRef: RefObject<MapRef | null>,
  options: UseMapLayersOptions = {},
) {
  const {
    onBuildingSelect,
    canSelect = false,
    claimedBuildingIds = [],
    selectClaimedOnly = false,
  } = options;

  const [isLayersReady, setIsLayersReady] = useState(false);
  const [selectedBuilding, setSelectedBuilding] =
    useState<SelectedBuilding | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<Polygon> | null>(null);
  const [claimedFeatures, setClaimedFeatures] = useState<Feature<Polygon>[]>(
    [],
  );

  const effectiveClaimedIds = useMemo(
    () => claimedBuildingIds,
    [claimedBuildingIds],
  );

  const syncClaimedLayers = useCallback(
    (map: any) => {
      if (!map) return;
      const features = queryClaimedBuildings(map, effectiveClaimedIds);
      setClaimedFeatures(features);
    },
    [effectiveClaimedIds],
  );

  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map) return;
    syncClaimedLayers(map);
  }, [mapRef, syncClaimedLayers]);

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

  const handleMapClick = useCallback(
    (e: any) => {
      if (!canSelect) return;

      const map = e.target;
      if (!map) return;

      const result = queryBuildingAtPoint(map, e.point, e.lngLat);
      if (result) {
        const matchedClaimedId = matchClaimedBuildingId(
          result.buildingId,
          effectiveClaimedIds,
        );

        if (selectClaimedOnly && !matchedClaimedId) {
          setSelectedBuilding(null);
          setSelectedFeature(null);
          onBuildingSelect?.(null);
          return;
        }

        // Normalize to the canonical claimed id so lookups by DB id succeed.
        const normalizedResult = matchedClaimedId
          ? { ...result, buildingId: matchedClaimedId }
          : result;

        setSelectedBuilding({
          id: normalizedResult.buildingId,
          properties: normalizedResult.properties,
        });
        setSelectedFeature(normalizedResult.feature);
        onBuildingSelect?.(normalizedResult);
      } else {
        setSelectedBuilding(null);
        setSelectedFeature(null);
        onBuildingSelect?.(null);
      }
    },
    [canSelect, onBuildingSelect, selectClaimedOnly, effectiveClaimedIds],
  );

  const clearSelection = useCallback(() => {
    if (!canSelect) return;
    setSelectedBuilding(null);
    setSelectedFeature(null);
    onBuildingSelect?.(null);
  }, [canSelect, onBuildingSelect]);

  const selectedGeoJson = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: canSelect && selectedFeature ? [selectedFeature] : [],
    }),
    [canSelect, selectedFeature],
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
