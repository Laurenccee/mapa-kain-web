import type { Polygon, Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';

/**
 * Scans the current viewport for buildings whose centroid ID
 * matches one of the claimed IDs, and returns their geometries.
 */
export function queryClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
): Feature<Polygon>[] {
  if (!map.getLayer('3d-buildings')) return [];
  if (claimedIds.length === 0) return [];

  const features = map.queryRenderedFeatures({ layers: ['3d-buildings'] });
  if (!features || features.length === 0) return [];

  const claimedFeatures: Feature<Polygon>[] = [];
  const seenIds = new Set<string>();
  const claimedSet = new Set(claimedIds);

  for (const feature of features) {
    const { geometry, properties } = feature;
    if (!geometry) continue;

    let ring: number[][] | null = null;
    if (geometry.type === 'Polygon') {
      ring = (geometry as Polygon).coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      ring = (geometry as unknown as { coordinates: number[][][][] }).coordinates[0][0];
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
    const centroidId = `bld_${(sumLng / len).toFixed(7)}_${(sumLat / len).toFixed(7)}`;

    if (claimedSet.has(centroidId) && !seenIds.has(centroidId)) {
      seenIds.add(centroidId);
      claimedFeatures.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ring] },
        properties: properties || {},
      });
    }
  }

  return claimedFeatures;
}

/**
 * Legacy imperative updater: finds claimed buildings, writes to map source.
 */
export function updateClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
) {
  const source = map.getSource('claimed-buildings-source') as
    | maplibregl.GeoJSONSource
    | undefined;
  if (!source) return;

  const features = queryClaimedBuildings(map, claimedIds);
  source.setData({ type: 'FeatureCollection', features });
}
