import type { Polygon, Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';

/**
 * Scans the current viewport for buildings whose centroid ID
 * matches one of the claimed IDs, and writes their geometry
 * into the 'claimed-buildings-source' GeoJSON source.
 */
export function updateClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
) {
  if (!map.getLayer('3d-buildings')) return;

  const source = map.getSource('claimed-buildings-source') as
    | maplibregl.GeoJSONSource
    | undefined;
  if (!source) return;

  if (claimedIds.length === 0) {
    source.setData({ type: 'FeatureCollection', features: [] });
    return;
  }

  const features = map.queryRenderedFeatures({ layers: ['3d-buildings'] });
  if (!features || features.length === 0) return;

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

  source.setData({ type: 'FeatureCollection', features: claimedFeatures });
}
