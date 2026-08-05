const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export const MAPS = {
  STYLES: {
    light: `https://api.maptiler.com/maps/019fcfa6-8108-74a4-bcc6-71c7a8182f4f/style.json?key=${MAPTILER_KEY}`,
    dark: `https://api.maptiler.com/maps/019fcfa6-8108-74a4-bcc6-71c7a8182f4f/style.json?key=${MAPTILER_KEY}`,
  },
  CACHE_KEY: "user_map_location",
  FALLBACK_PHILIPPINES: {
    longitude: 120.984222,
    latitude: 14.599512,
  } as { longitude: number; latitude: number },
  ONE_DAY: 24 * 60 * 60 * 1000,
  PITCH: {
    TILTED: 55,
    FLAT: 0,
  },
};
