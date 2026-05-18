import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { mapEngine } from '../lib/mapEngine';
import { MAPS } from '@/utils/constants/maps';
import { buildingSelectionPlugin } from '../plugins/buildingSelection.plugin';
import { userLocationPlugin } from '../plugins/userLocation.plugin';

export function useMaplibreMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onLocationReady: () => void,
  onMapLoaded: (map: maplibregl.Map) => void,
) {
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const style = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;
    let initialCenter = MAPS.FALLBACK_PHILIPPINES;

    // Grab cached coordinates to prevent map framing flicker on initial canvas allocation
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat } = JSON.parse(cached);
        initialCenter = [lng, lat];
      } catch (e) {
        console.error('Error parsing cache fallback positions:', e);
      }
    }

    // 🟢 Register and fire cache validation checks BEFORE mounting engine canvas
    // This allows onLocationReady to trigger synchronously if cache handles the frame match.
    userLocationPlugin.initLocation(onLocationReady);
    mapEngine.registerPlugin(userLocationPlugin);
    mapEngine.registerPlugin(buildingSelectionPlugin);

    const map = mapEngine.init(containerRef.current, {
      style,
      center: initialCenter,
      transformRequest: (
        url: string,
        resourceType?: maplibregl.ResourceType,
      ) => {
        if (resourceType === 'Tile' || resourceType === 'Style') {
          return { url, credentials: 'same-origin' as const };
        }
        return { url };
      },
    });

    mapRef.current = map;

    map.once('load', () => {
      if (!map) return;

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#3b82f6',
              isDark ? '#343a40' : '#cbd5e1',
            ],
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
            'fill-extrusion-base': [
              'coalesce',
              ['get', 'render_min_height'],
              0,
            ],
            'fill-extrusion-opacity': 0.85,
          },
        });
      }

      // Once base configurations and cached layers are ready, lift the vector layer lock state
      map.once('idle', () => {
        onMapLoaded(map);
      });
    });

    return () => {
      userLocationPlugin.reset();
      mapEngine.destroy();
      mapRef.current = null;
    };
  }, [containerRef, onLocationReady, onMapLoaded]);

  return mapRef;
}
