export const MAPS = {
  STYLES: {
    light: "https://tiles.openfreemap.org/styles/positron",
    dark: "https://tiles.openfreemap.org/styles/dark",
  },
  CACHE_KEY: "user_map_location",
  FALLBACK_PHILIPPINES: {
    longitude: 120.984222,
    latitude: 14.599512,
  } as { longitude: number; latitude: number },
  ONE_DAY: 24 * 60 * 60 * 1000,
};
