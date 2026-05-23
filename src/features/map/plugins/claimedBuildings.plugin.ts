import type { MapPlugin } from '../types';
import type { Polygon, Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';

let claimedIds: string[] = [];
let mapInstance: maplibregl.Map | null = null;
let isUpdating = false;

const updateClaimedBuildings = () => {
  if (!mapInstance || isUpdating) return;
  if (!mapInstance.getLayer('3d-buildings')) return;

  const source = mapInstance.getSource('claimed-buildings-source') as
    | maplibregl.GeoJSONSource
    | undefined;
  if (!source) return;

  // No claimed IDs? Clear and bail early.
  if (claimedIds.length === 0) {
    isUpdating = true;
    source.setData({ type: 'FeatureCollection', features: [] });
    isUpdating = false;
    return;
  }

  const features = mapInstance.queryRenderedFeatures({
    layers: ['3d-buildings'],
  });

  if (!features || features.length === 0) return;

  const claimedFeatures: Feature<Polygon>[] = [];
  const seenIds = new Set<string>();
  const claimedSet = new Set(claimedIds);

  for (const feature of features) {
    const { geometry, properties } = feature;
    if (!geometry) continue;

    let ring: any = null;
    if (geometry.type === 'Polygon') {
      ring = (geometry as Polygon).coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      ring = (geometry as any).coordinates[0][0];
    }

    if (!ring || ring.length < 3) continue;

    const points = ring.slice(0, -1);
    const len = points.length;
    if (len === 0) continue;

    let sumLng = 0;
    let sumLat = 0;
    for (const pt of points) {
      sumLng += pt[0];
      sumLat += pt[1];
    }
    const avgLng = sumLng / len;
    const avgLat = sumLat / len;
    const centroidId = `bld_${avgLng.toFixed(7)}_${avgLat.toFixed(7)}`;

    if (claimedSet.has(centroidId) && !seenIds.has(centroidId)) {
      seenIds.add(centroidId);
      claimedFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
        properties: properties || {},
      });
    }
  }

  // Guard: prevent setData from re-triggering this function
  isUpdating = true;
  source.setData({
    type: 'FeatureCollection',
    features: claimedFeatures,
  });
  isUpdating = false;
};

export const claimedBuildingsPlugin: MapPlugin & {
  setClaimedBuildings: (ids: string[]) => void;
} = {
  name: 'claimed-buildings',

  onAdd(map) {
    mapInstance = map;

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
          'fill-extrusion-color': '#10b981', // Emerald green for claimed stores
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.85,
        },
      });
    }

    // Only update when the viewport changes — no sourcedata listener to avoid infinite loops
    map.on('moveend', updateClaimedBuildings);
  },

  onRemove(map) {
    map.off('moveend', updateClaimedBuildings);
    mapInstance = null;
  },

  setClaimedBuildings(ids) {
    claimedIds = ids;
    updateClaimedBuildings();
  },
};
