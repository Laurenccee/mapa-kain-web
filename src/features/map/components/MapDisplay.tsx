'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

const CACHE_KEY = 'user_map_location';

interface CachedLocation {
  lng: number;
  lat: number;
  timestamp: number;
}

export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // The map is only "ready" when it exists AND is centered on a correct location
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const style = isDark ? STYLES.dark : STYLES.light;

    // Helper to initialize map once coordinates are secured
    const initMap = (centerCoords: [number, number], precise: boolean) => {
      if (!mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center: centerCoords,
        zoom: 14,
        pitch: 55,
        bearing: -15,
        maxPitch: 85,
      });

      const currentMap = map.current;

      const geolocateControl = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      });

      // Keep cache up to date if user moves around
      geolocateControl.on('geolocate', (e: any) => {
        const { longitude, latitude } = e.coords;
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            lng: longitude,
            lat: latitude,
            timestamp: Date.now(),
          }),
        );
        setIsLocating(false);
      });

      currentMap.addControl(geolocateControl, 'bottom-right');
      currentMap.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      currentMap.on('load', () => {
        add3DBuildings(currentMap);

        // If we only had a rough/cached location, trigger control to refine position
        if (!precise) {
          geolocateControl.trigger();
        } else {
          setIsLocating(false);
        }

        // Reveal the map to the user now that it's sitting on the pin
        setIsMapReady(true);
      });
    };

    // --- Execution flow execution ---
    let cachedData: CachedLocation | null = null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) cachedData = JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (cachedData && Date.now() - cachedData.timestamp < ONE_DAY) {
      // Scenario A: Cache is fresh. Build map instantly at cached location.
      initMap([cachedData.lng, cachedData.lat], false);
    } else {
      // Scenario B: No cache. Force browser to get location BEFORE building map.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              lng: longitude,
              lat: latitude,
              timestamp: Date.now(),
            }),
          );
          initMap([longitude, latitude], true);
        },
        (error) => {
          console.warn(
            'Location blocked or failed. Using London fallback.',
            error,
          );
          const fallbackLondon: [number, number] = [-0.118674, 51.500728];
          initMap(fallbackLondon, true);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const add3DBuildings = (mapInstance: maplibregl.Map) => {
    if (mapInstance.getLayer('3d-buildings')) return;
    mapInstance.addLayer({
      id: '3d-buildings',
      source: 'openmaptiles',
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#3b82f6',
          '#aaa',
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          14.05,
          ['get', 'render_height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          14.05,
          ['get', 'render_min_height'],
        ],
        'fill-extrusion-opacity': 0.6,
      },
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* 1. BLURRED FULL LOADER: Visible until map has finished loading directly on coordinates */}
      {!isMapReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/30 backdrop-blur-md transition-all duration-300">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* 2. RE-CALIBRATING BANNER: Only shows if it mounted via cached coordinates and is silently checking GPS */}
      {isMapReady && isLocating && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border shadow-lg">
            <div className="h-3 w-3 animate-ping rounded-full bg-primary" />
            <span className="text-xs font-medium">
              Updating location accuracy...
            </span>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
