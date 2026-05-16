import { MAPS } from '@/utils/constants/maps';
import { CachedLocation } from '../types';

export function getCachedLocation(): [number, number] | null {
  try {
    const cached = localStorage.getItem(MAPS.CACHE_KEY);
    if (cached) {
      const data: CachedLocation = JSON.parse(cached);
      if (Date.now() - data.timestamp < MAPS.ONE_DAY) {
        return [data.lng, data.lat];
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function cacheLocation(lng: number, lat: number) {
  localStorage.setItem(
    MAPS.CACHE_KEY,
    JSON.stringify({ lng, lat, timestamp: Date.now() }),
  );
}
