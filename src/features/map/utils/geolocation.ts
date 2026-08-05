// geolocation.ts
import maplibregl from "maplibre-gl";
import { MAPS } from "@/utils/constants/maps";

export function setupGeolocation(
  map: maplibregl.Map,
  hasFreshCache: boolean,
  onLocationReady: () => void,
  onTrackingChange?: (active: boolean) => void,
  onError?: () => void,
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

  // Control is still added so its user-location marker/accuracy circle render;
  // the native button is hidden imperatively and triggered via a custom toggle instead.
  map.addControl(geoControl, "bottom-right");

  const nativeControl = map
    .getContainer()
    .querySelector(".maplibregl-ctrl-bottom-right");
  if (nativeControl instanceof HTMLElement) {
    nativeControl.style.display = "none";
  }

  geoControl.on("trackuserlocationstart", () => onTrackingChange?.(true));
  geoControl.on("trackuserlocationend", () => onTrackingChange?.(false));
  geoControl.on("error", () => onError?.());

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

  return geoControl;
}
