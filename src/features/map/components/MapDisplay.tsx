'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState, useEffect, useCallback } from 'react'; // 🟢 Wrapped useCallback
import { HugeiconsIcon } from '@hugeicons/react';
import { Loader } from '@hugeicons/core-free-icons';

import { useMaplibreMap } from '../hooks/useMapLibreMap';
import type maplibregl from 'maplibre-gl';

export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Track both initialization states to lock the screen seamlessly
  const [isLocationResolved, setIsLocationResolved] = useState(false);
  const [isLayersReady, setIsLayersReady] = useState(false);

  // SERVICE WORKER REGISTRATION
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/map-sw.js')
        .then((reg) => console.log('🗺️ Map Service Worker active:', reg.scope))
        .catch((err) =>
          console.error('Map Service Worker registration failed:', err),
        );
    }
  }, []);

  // 🟢 FIXED: Stabilize references so they don't recreate on re-renders
  const handleLocationReady = useCallback(() => {
    setIsLocationResolved(true);
  }, []);

  const handleMapLoaded = useCallback((map: maplibregl.Map) => {
    mapRef.current = map;
    setIsLayersReady(true);
  }, []);

  // Initialize hook with stable layout references
  useMaplibreMap(mapContainer, handleLocationReady, handleMapLoaded);

  // The view remains hidden under a blur shield until both conditions evaluate to true
  const showLoader = !isLocationResolved || !isLayersReady;

  return (
    <div className="relative w-full h-full">
      {/* LOADING OVERLAY */}
      {showLoader && (
        <div className="absolute inset-0 z-40 flex flex-col gap-3 items-center justify-center bg-background/40 backdrop-blur-md transition-opacity duration-300">
          <HugeiconsIcon
            icon={Loader}
            className="animate-spin text-primary"
            size={24}
          />
          <span className="text-xs font-medium text-muted-foreground">
            Locating position and rendering assets...
          </span>
        </div>
      )}

      {/* MAP CANVAS CONTAINER */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
