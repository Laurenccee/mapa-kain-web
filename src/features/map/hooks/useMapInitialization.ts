"use client";

import { useEffect, useState } from "react";
import { MAPS } from "@/utils/constants/maps";

interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

/** Resolves the map's initial camera position: cached location, live geolocation, then a fallback. */
export function useMapInitialization() {
  const [mounted, setMounted] = useState(false);
  const [initialViewState, setInitialViewState] =
    useState<MapViewState | null>(null);
  const [hasCachedLocation, setHasCachedLocation] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat } = JSON.parse(cached);
        if (typeof lng === "number" && typeof lat === "number") {
          setHasCachedLocation(true);
          setInitialViewState({
            longitude: lng,
            latitude: lat,
            zoom: 17,
            pitch: MAPS.PITCH.TILTED,
            bearing: -15,
          });
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setHasCachedLocation(false);

          setInitialViewState({
            longitude,
            latitude,
            zoom: 16.5,
            pitch: MAPS.PITCH.TILTED,
            bearing: -15,
          });
        },
        () => {
          setInitialViewState({
            longitude: MAPS.FALLBACK_PHILIPPINES.longitude,
            latitude: MAPS.FALLBACK_PHILIPPINES.latitude,
            zoom: 17,
            pitch: MAPS.PITCH.TILTED,
            bearing: -15,
          });
        },
      );
    }
  }, []);

  return { mounted, initialViewState, hasCachedLocation };
}
