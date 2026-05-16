'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useState } from 'react';
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

  // Initialize hook with dynamic execution context listeners
  useMaplibreMap(
    mapContainer,
    () => setIsLocationResolved(true), // Called instantly when coords resolve (cache or GPS)
    (map: maplibregl.Map) => {
      mapRef.current = map;
      setIsLayersReady(true); // Called when tiles are painted and markers render
    },
  );

  // Keep loader covering screen layout until fully ready
  const showLoader = !isLocationResolved || !isLayersReady;

  return (
    <div className="relative w-full h-full">
      {/* LOADING OVERLAY */}
      {showLoader && (
        <div className="absolute inset-0 z-40 flex flex-col gap-3 items-center justify-center bg-background/40 backdrop-blur-md">
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
