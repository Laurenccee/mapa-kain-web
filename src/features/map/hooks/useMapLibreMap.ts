import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Polygon, Feature } from 'geojson';
import { MAPS } from '@/utils/constants/maps';
import { setupBuildingLayers } from '../lib/setupLayers';
import { setupGeolocation } from '../lib/geolocation';
import { handleBuildingClick, clearBuildingSelection } from '../lib/buildingSelection';
import { updateClaimedBuildings } from '../lib/claimedBuildings';

export interface UseMaplibreMapOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLocationReady: () => void;
  onMapLoaded: (map: maplibregl.Map) => void;
  claimedBuildingIds: string[];
  onBuildingSelected: (
    buildingId: string,
    properties: Record<string, unknown>,
    feature: Feature<Polygon>,
  ) => void;
  onBuildingCleared: () => void;
}

export function useMaplibreMap({
  containerRef,
  onLocationReady,
  onMapLoaded,
  claimedBuildingIds,
  onBuildingSelected,
  onBuildingCleared,
}: UseMaplibreMapOptions) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const claimedIdsRef = useRef(claimedBuildingIds);

  // Sync claimed IDs into map without recreating the map
  useEffect(() => {
    claimedIdsRef.current = claimedBuildingIds;
    if (mapRef.current) {
      updateClaimedBuildings(mapRef.current, claimedBuildingIds);
    }
  }, [claimedBuildingIds]);

  // Main map lifecycle
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const style = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;
    let initialCenter = MAPS.FALLBACK_PHILIPPINES;
    let hasFreshCache = false;

    // Read cached position to avoid map-flicker on mount
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat, timestamp } = JSON.parse(cached);
        initialCenter = [lng, lat];
        if (Date.now() - timestamp <= MAPS.ONE_DAY) {
          hasFreshCache = true;
          onLocationReady();
        }
      } catch (e) {
        console.error('Error parsing cached location:', e);
      }
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: initialCenter,
      zoom: 17,
      pitch: 55,
      bearing: -15,
      maxPitch: 85,
      attributionControl: false,
      transformRequest: (url: string, resourceType?: maplibregl.ResourceType) => {
        if (resourceType === 'Tile' || resourceType === 'Style') {
          return { url, credentials: 'same-origin' as const };
        }
        return { url };
      },
    });

    mapRef.current = map;

    // Geolocation (handles cache vs. cold-start internally)
    setupGeolocation(map, hasFreshCache, onLocationReady);

    map.once('load', () => {
      // Add layers in correct draw order (base → claimed → highlighted)
      setupBuildingLayers(map, isDark);

      map.once('idle', () => {
        onMapLoaded(map);
        updateClaimedBuildings(map, claimedIdsRef.current);
      });
    });

    // Refresh claimed overlays when the viewport changes
    const handleMoveEnd = () => {
      updateClaimedBuildings(map, claimedIdsRef.current);
    };
    map.on('moveend', handleMoveEnd);

    // Building click selection
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const result = handleBuildingClick(map, e);
      if (result) {
        onBuildingSelected(result.buildingId, result.properties, result.feature);
      } else {
        onBuildingCleared();
      }
    };
    map.on('click', handleClick);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mapRef;
}
