import maplibregl from 'maplibre-gl';
import { MAPS } from '@/utils/constants/maps';

/**
 * Sets up the GeolocateControl on the map.
 * Handles caching the user's position and calling onLocationReady
 * when the position is resolved (immediately from cache, or on first GPS fix).
 */
export function setupGeolocation(
  map: maplibregl.Map,
  hasFreshCache: boolean,
  onLocationReady: () => void,
) {
  let locationResolved = hasFreshCache;

  const geoControl = new maplibregl.GeolocateControl({
    trackUserLocation: true,
    showUserLocation: true,
    fitBoundsOptions: { maxZoom: 17 },
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
  });

  map.addControl(geoControl, 'bottom-right');

  geoControl.on('geolocate', (e: GeolocationPosition) => {
    if (!e?.coords) return;

    localStorage.setItem(
      MAPS.CACHE_KEY,
      JSON.stringify({
        lng: e.coords.longitude,
        lat: e.coords.latitude,
        timestamp: Date.now(),
      }),
    );

    map.easeTo({
      center: [e.coords.longitude, e.coords.latitude],
      zoom: 17,
      duration: 1200,
      essential: true,
    });

    if (!locationResolved) {
      locationResolved = true;
      onLocationReady();
    }
  });

  // Trigger the hardware geolocation loop after map is interactive
  setTimeout(() => {
    if (map.getContainer()) {
      try {
        geoControl.trigger();
      } catch {
        // Control may not be ready yet
      }
    }
  }, 100);
}
