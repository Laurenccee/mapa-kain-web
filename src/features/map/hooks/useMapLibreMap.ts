import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { mapEngine } from '../lib/mapEngine';
import { MAPS } from '@/utils/constants/maps';

// Direct, clean imports for your interactions
import { buildingSelectionPlugin } from '../plugins/buildingSelection.plugin';
import { hoverPlugin } from '../plugins/hover.plugin';

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

    // 1. Instantly parse coordinates from localStorage for zero fallback layout flashes
    let initialCenter = MAPS.FALLBACK_PHILIPPINES;
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < MAPS.ONE_DAY) {
          initialCenter = [lng, lat];
        }
      } catch (e) {
        console.error('Error reading early map cache:', e);
      }
    }

    // 2. Initialize the Map instance directly on top of the target coordinates
    const map = mapEngine.init(containerRef.current, {
      style,
      center: initialCenter,
      zoom: 17,
      pitch: 55,
      bearing: -15,
      maxPitch: 85,
    });

    mapRef.current = map;
    onLocationReady(); // Coordinates are instantly mapped onto canvas container layout safely

    map.on('load', () => {
      // 🏢 Inject 3D Buildings Layer
      // 🏢 Inject 3D Buildings Layer inside useMaplibreMap.ts
      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            // 🟢 FIXED: Use a match/case rule checking properties rather than raw feature-state IDs
            'fill-extrusion-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#3b82f6', // Highlight color
              isDark ? '#343a40' : '#cbd5e1', // Base colors
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              15,
              ['get', 'render_height'],
            ],
            'fill-extrusion-base': [
              'step',
              ['zoom'],
              0,
              15,
              ['get', 'render_min_height'],
            ],
            'fill-extrusion-opacity': 0.85,
          },
        });
      }

      // 🔌 Initialize standard interactions manually
      buildingSelectionPlugin.onAdd(map);
      hoverPlugin.onAdd(map);

      // 🧭 Set up Geolocate Control directly inside hook workflow
      const geoControl = new maplibregl.GeolocateControl({
        trackUserLocation: true,
        showUserLocation: true, // Native map blue pin indicator
        fitBoundsOptions: { maxZoom: 17 }, // 🪙 FIX: Stops map zooming out on subsequent ticks
        positionOptions: { enableHighAccuracy: true, timeout: 15000 },
      });

      map.addControl(geoControl, 'bottom-right');

      // Hook pinpoint listener to clear the loading wall ONLY after the location pin drops
      geoControl.on('geolocate', (e: any) => {
        if (!e?.coords) return;

        localStorage.setItem(
          MAPS.CACHE_KEY,
          JSON.stringify({
            lng: e.coords.longitude,
            lat: e.coords.latitude,
            timestamp: Date.now(),
          }),
        );

        // 🟢 SUCCESS: The blue tracking pin is loaded. Unblur the screen seamlessly.
        onMapLoaded(map);
      });

      // Fire tracking search immediately on load
      setTimeout(() => {
        if (map.getContainer()) {
          geoControl.trigger();
        }
      }, 0);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return mapRef;
}
