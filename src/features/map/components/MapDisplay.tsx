'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loader } from '@hugeicons/core-free-icons';

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://styles.openfreemap.org/styles/dark',
};

const CACHE_KEY = 'user_map_location';
const FALLBACK_PHILIPPINES: [number, number] = [120.984222, 14.599512]; // Manila [lng, lat]
const ONE_DAY = 24 * 60 * 60 * 1000;

interface CachedLocation {
  lng: number;
  lat: number;
  timestamp: number;
}

export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Core state to hold targeted coordinates before initializing map
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [isPrecise, setIsPrecise] = useState(false);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  // PHASE 1: Resolve the coordinates once on mount
  useEffect(() => {
    let cachedData: CachedLocation | null = null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) cachedData = JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }

    if (cachedData && Date.now() - cachedData.timestamp < ONE_DAY) {
      // Scenario A: Quick load from cache (Map starts here, but stays blurred)
      setCoords([cachedData.lng, cachedData.lat]);
      setIsPrecise(false);
    } else {
      // Scenario B: Cold start location fetch
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
          setCoords([longitude, latitude]);
          setIsPrecise(true);
        },
        (error) => {
          console.warn(
            'Location blocked or failed. Using Manila fallback.',
            error,
          );
          setCoords(FALLBACK_PHILIPPINES);
          setIsPrecise(true);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }, []);

  // PHASE 2: Initialize the map ONLY when container and coords are fully resolved
  useEffect(() => {
    if (!coords || !mapContainer.current || map.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const style = isDark ? STYLES.dark : STYLES.light;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: coords,
      zoom: 17,
      pitch: 55,
      bearing: -15,
      maxPitch: 85,
      attributionControl: false,
    });

    map.current = mapInstance;

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true, // This renders the map pin
      // FIX: Dictates the layout boundary constraints when auto-tracking location
      fitBoundsOptions: { maxZoom: 17 },
    });

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
      // SUCCESS: Pin is locked onto current real position. Safe to reveal the map!
      setIsMapReady(true);
    });

    mapInstance.addControl(geolocateControl, 'bottom-right');
    mapInstance.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    mapInstance.on('load', () => {
      // Add 3D buildings inline safely
      if (!mapInstance.getLayer('3d-buildings')) {
        mapInstance.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 10,
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
      }

      if (!isPrecise) {
        // If we only generated the map using cache, trigger accuracy update.
        // The screen will stay blurred until the 'geolocate' event handler above fires.
        geolocateControl.trigger();
      } else {
        // If we got here via cold start (Scenario B), we ALREADY have precise coordinates
        // and the native pin handles rendering right away. Unblur immediately.
        setIsLocating(false);
        setIsMapReady(true);
      }
    });

    // Cleanup strictly destroys the single map instance on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coords, isPrecise]);

  return (
    <div className="relative w-full h-full">
      {/* Blurred loader overlay: blocks view until pin is definitively tracked */}
      {!isMapReady && (
        <div className="absolute inset-0 z-40 flex flex-col gap-3 items-center justify-center bg-background/40 backdrop-blur-md transition-all duration-500">
          <HugeiconsIcon
            icon={Loader}
            className="animate-spin text-primary"
            size={24}
          />
          <span className="text-xs font-medium text-muted-foreground animate-pulse">
            Locating your map
          </span>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
