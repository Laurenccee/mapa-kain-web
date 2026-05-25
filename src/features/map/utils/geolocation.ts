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
    fitBoundsOptions: {
      maxZoom: 17,
      linear: false,
      duration: 2000,
    },
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
  });

  map.addControl(geoControl, "bottom-right");

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

    if (!locationResolved) {
      locationResolved = true;
      onLocationReady();
    }
  });
}
