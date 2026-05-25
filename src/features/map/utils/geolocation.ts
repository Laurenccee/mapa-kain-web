// geolocation.ts
import maplibregl from "maplibre-gl";
import { MAPS } from "@/utils/constants/maps";

export function setupGeolocation(
  map: maplibregl.Map,
  hasFreshCache: boolean,
  onLocationReady: () => void,
) {
  let locationResolved = hasFreshCache;

  const geoControl = new maplibregl.GeolocateControl({
    trackUserLocation: true,
    showUserLocation: true,
    showAccuracyCircle: true,
    // ✅ Native animation configuration for cinematic tracking flight
    fitBoundsOptions: {
      maxZoom: 17,
      linear: false, // Parabolic arc fly curve
      duration: 2000, // Smooth 2 second animation
    },
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
  });

  map.addControl(geoControl, "bottom-right");

  // Trigger tracking state natively right away if location was cached
  if (hasFreshCache) {
    map.on("load", () => {
      geoControl.trigger();
    });
  }

  geoControl.on("geolocate", (e: any) => {
    if (!e?.coords) return;

    localStorage.setItem(
      MAPS.CACHE_KEY,
      JSON.stringify({
        lng: e.coords.longitude,
        lat: e.coords.latitude,
        timestamp: Date.now(),
      }),
    );

    // ❌ REMOVED: manual map.easeTo() / map.flyTo() here
    // Leaving this empty allows MapLibre's internal tracking loop to handle
    // the movement smoothly, turning and keeping the button blue natively.

    if (!locationResolved) {
      locationResolved = true;
      onLocationReady();
    }
  });
}
