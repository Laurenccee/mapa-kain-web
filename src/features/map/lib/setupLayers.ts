import type maplibregl from 'maplibre-gl';

/**
 * Adds the 3D building layers in the correct draw order:
 * 1. Base buildings (from vector tiles)
 * 2. Claimed buildings overlay (GeoJSON)
 * 3. Selected/highlighted building overlay (GeoJSON)
 */
export function setupBuildingLayers(map: maplibregl.Map, isDark: boolean) {
  // 1. Base 3D Buildings
  if (!map.getLayer('3d-buildings')) {
    map.addLayer({
      id: '3d-buildings',
      source: 'openmaptiles',
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': isDark ? '#343a40' : '#cbd5e1',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.85,
      },
    });
  }

  // 2. Claimed Buildings (emerald overlay)
  if (!map.getSource('claimed-buildings-source')) {
    map.addSource('claimed-buildings-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer('3d-buildings-claimed')) {
    map.addLayer({
      id: '3d-buildings-claimed',
      source: 'claimed-buildings-source',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#10b981',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.85,
      },
    });
  }

  // 3. Selected/Highlighted Building (amber overlay — drawn last, always on top)
  if (!map.getSource('selected-building')) {
    map.addSource('selected-building', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer('3d-buildings-highlighted')) {
    map.addLayer({
      id: '3d-buildings-highlighted',
      source: 'selected-building',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#f59e0b',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.95,
      },
    });
  }
}
