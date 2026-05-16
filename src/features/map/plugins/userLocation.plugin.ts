import maplibregl from 'maplibre-gl';
import type { MapPlugin } from '../types';
import { MAPS } from '@/utils/constants/maps';

interface ExtendedMapPlugin extends MapPlugin {
  initLocation: (map: maplibregl.Map, onLocationResolved: () => void) => void;
}

export const userLocationPlugin: ExtendedMapPlugin = {
  name: 'user-location',

  // 📡 Phase 1: Runs IMMEDIATELY when the map engine starts (Pre-style load execution)
  initLocation(map, onLocationResolved) {
    let coordinatesSet = false;

    // 1. Try to read from cache instantly so the initial frame matches your area right away
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    let backupLng: number | null = null;
    let backupLat: number | null = null;

    if (cached) {
      try {
        const { lng, lat, timestamp } = JSON.parse(cached);
        backupLng = lng;
        backupLat = lat;

        const isExpired = Date.now() - timestamp > MAPS.ONE_DAY;

        if (!isExpired) {
          map.jumpTo({ center: [lng, lat], zoom: 17 });
          coordinatesSet = true;
          onLocationResolved(); // 🟢 Dismiss loader instantly!
        }
      } catch (e) {
        console.error('Failed reading cached coordinates:', e);
      }
    }

    // 2. Request precision coordinates concurrently in the background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          localStorage.setItem(
            MAPS.CACHE_KEY,
            JSON.stringify({
              lng: longitude,
              lat: latitude,
              timestamp: Date.now(),
            }),
          );

          if (!coordinatesSet) {
            map.jumpTo({ center: [longitude, latitude], zoom: 17 });
            onLocationResolved();
          }
        },
        (error) => {
          console.warn(
            'Hardware location retrieval failed. Falling back.',
            error,
          );
          if (!coordinatesSet) {
            if (backupLng && backupLat) {
              map.jumpTo({ center: [backupLng, backupLat], zoom: 17 });
            } else {
              map.jumpTo({ center: MAPS.FALLBACK_PHILIPPINES, zoom: 17 });
            }
            onLocationResolved();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // 🟢 OPTIMIZATION: Pull instant location from system cache if less than 30s old
        },
      );
    } else if (!coordinatesSet) {
      map.jumpTo({ center: MAPS.FALLBACK_PHILIPPINES, zoom: 17 });
      onLocationResolved();
    }
  },

  // 🧭 Phase 2: Runs when style is ready. Mounts UI components and hooks event handlers
  onAdd(map) {
    const geoControl = new maplibregl.GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 17 },
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    });

    map.addControl(geoControl);

    setTimeout(() => {
      if (map.getContainer()) {
        geoControl.trigger();
      }
    }, 0);

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
    });
  },
};
