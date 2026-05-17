import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { mapEngine } from '../lib/mapEngine';
import { MAPS } from '@/utils/constants/maps';
import { registerMapPluginsOnce } from '../plugins';

export function useMaplibreMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onLocationReady: () => void,
  onMapLoaded: (map: maplibregl.Map) => void,
) {
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map | null = null;

    const initializeMapComponent = () => {
      if (mapRef.current) return;

      const isDark = document.documentElement.classList.contains('dark');
      const style = isDark ? MAPS.STYLES.dark : MAPS.STYLES.light;

      let initialCenter = MAPS.FALLBACK_PHILIPPINES;

      const cached = localStorage.getItem(MAPS.CACHE_KEY);
      if (cached) {
        try {
          const { lng, lat } = JSON.parse(cached);
          initialCenter = [lng, lat];
        } catch (e) {
          console.error('Error reading cache:', e);
        }
      }

      map = mapEngine.init(containerRef.current!, {
        style,
        center: initialCenter,
        zoom: 17,
        pitch: 55,
        bearing: -15,
        maxPitch: 85,
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

      // Register shared geolocation callback handler
      import('../plugins/userLocation.plugin').then(
        ({ userLocationPlugin }) => {
          if (map) {
            userLocationPlugin.initLocation(map, onLocationReady);
          }
        },
      );

      map.on('load', () => {
        if (!map) return;

        // Base 3D Geometry
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
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                15,
                ['number', ['coalesce', ['get', 'render_height'], 15]],
              ],
              'fill-extrusion-base': [
                'step',
                ['zoom'],
                0,
                15,
                ['number', ['coalesce', ['get', 'render_min_height'], 0]],
              ],
              'fill-extrusion-opacity': 0.85,
            },
          });
        }

        if (!map.getLayer('3d-buildings-highlighted')) {
          map.addLayer({
            id: '3d-buildings-highlighted',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            filter: ['==', ['id'], ''],
            paint: {
              'fill-extrusion-color': '#3b82f6',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                15,
                ['number', ['coalesce', ['get', 'render_height'], 15]],
              ],
              'fill-extrusion-base': [
                'step',
                ['zoom'],
                0,
                15,
                ['number', ['coalesce', ['get', 'render_min_height'], 0]],
              ],
              'fill-extrusion-opacity': 0.95,
            },
          });
        }

        registerMapPluginsOnce();

        // ⚡ Wait until map state is 'idle' (all assets/tiles rendered) to toggle the gate
        map.once('idle', () => {
          if (map) onMapLoaded(map);
        });
      });
    };

    initializeMapComponent();

    return () => {
      if (map) {
        import('../plugins/userLocation.plugin').then(
          ({ userLocationPlugin }) => {
            userLocationPlugin._isControlAdded = false;
          },
        );
        mapEngine.destroy();
        mapRef.current = null;
      }
    };
  }, [containerRef, onLocationReady, onMapLoaded]);

  return mapRef;
}
