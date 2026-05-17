import maplibregl from 'maplibre-gl';
import type { MapPlugin } from '../types';
import { MAPS } from '@/utils/constants/maps';

interface LocationPluginInterface extends MapPlugin {
  _callback: (() => void) | null;
  _isControlAdded: boolean;
  _hasFreshCache: boolean; // 🟢 Track if we bypassed via local storage cache
  initLocation: (onLocationResolved: () => void) => void;
  reset: () => void;
}

export const userLocationPlugin: LocationPluginInterface = {
  name: 'user-location',
  _callback: null,
  _isControlAdded: false,
  _hasFreshCache: false,

  initLocation(onLocationResolved) {
    this._callback = onLocationResolved;

    // 🟢 Step 1: Check cache immediately on application startup
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > MAPS.ONE_DAY;

        if (!isExpired) {
          this._hasFreshCache = true;
          // ⚡ Hot Start: Immediately execute layout unlock callback, dropping the blur shield
          onLocationResolved();
        }
      } catch (e) {
        console.error('Failed reading cached timestamp:', e);
      }
    }
  },

  onAdd(map) {
    if (this._isControlAdded) return;
    this._isControlAdded = true;

    const geoControl = new maplibregl.GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 17 },
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000, // Allow reading internal device system location cache
      },
    });

    map.addControl(geoControl, 'bottom-right');

    geoControl.on('geolocate', (e: any) => {
      if (!e?.coords) return;

      const targetCenter: [number, number] = [
        e.coords.longitude,
        e.coords.latitude,
      ];

      localStorage.setItem(
        MAPS.CACHE_KEY,
        JSON.stringify({
          lng: e.coords.longitude,
          lat: e.coords.latitude,
          timestamp: Date.now(),
        }),
      );

      if (map) {
        map.easeTo({
          center: targetCenter,
          zoom: 17,
          duration: 1200, // Smooth 1.2-second fluid animation slide
          essential: true,
        });
      }

      // 🟢 Step 2: Cold Start Fallback
      // If we DID NOT have a fresh cache, lift the loading shield now that the real GPS position arrived
      if (!this._hasFreshCache && this._callback) {
        this._callback();
        this._callback = null;
      }
    });

    // Fire hardware trace loop cleanly
    setTimeout(() => {
      if (map.getContainer()) {
        try {
          geoControl.trigger();
        } catch (err) {}
      }
    }, 100);
  },

  reset() {
    this._isControlAdded = false;
    this._hasFreshCache = false;
    this._callback = null;
  },
};
