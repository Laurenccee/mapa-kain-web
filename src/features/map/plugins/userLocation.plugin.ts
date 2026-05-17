import maplibregl from 'maplibre-gl';
import type { MapPlugin } from '../types';
import { MAPS } from '@/utils/constants/maps';

interface ExtendedMapPlugin extends MapPlugin {
  _onLocationResolvedCallback: (() => void) | null;
  _hasFreshCache: boolean;
  _isControlAdded: boolean; // 🟢 Prevents duplicate controls from rendering
  initLocation: (map: maplibregl.Map, onLocationResolved: () => void) => void;
}

export const userLocationPlugin: ExtendedMapPlugin = {
  name: 'user-location',
  _onLocationResolvedCallback: null,
  _hasFreshCache: false,
  _isControlAdded: false,

  initLocation(map, onLocationResolved) {
    this._onLocationResolvedCallback = onLocationResolved;

    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { lng, lat, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > MAPS.ONE_DAY;

        if (!isExpired) {
          map.jumpTo({ center: [lng, lat], zoom: 17 });
          this._hasFreshCache = true;
          // Note: We deliberately wait for the map rendering loop
          // to settle completely before dismissing the loading state.
        }
      } catch (e) {
        console.error('Failed reading cached coordinates:', e);
      }
    }
  },

  onAdd(map) {
    // 🟢 Guard clause stops duplication across style updates
    if (this._isControlAdded) return;
    this._isControlAdded = true;

    const geoControl = new maplibregl.GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 17 },
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    });

    map.addControl(geoControl, 'bottom-right');

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

      // ⚡ Lift the loading overlay screen now that the GPS blue dot is active
      if (this._onLocationResolvedCallback) {
        this._onLocationResolvedCallback();
      }
    });

    // 🟢 FIX: Wrap in a timeout execution frame so MapLibre can register
    // the control's internal layout nodes before we trigger it.
    setTimeout(() => {
      if (map.getContainer() && geoControl) {
        try {
          geoControl.trigger();
        } catch (err) {
          console.warn(
            'Geolocation track deferred during initialization:',
            err,
          );
        }
      }
    }, 50);
  },
};
