// utils/geo.ts
import type { MapGeoJSONFeature } from 'maplibre-gl';
import type { Feature, Polygon } from 'geojson';

/**
 * Normalizes a MapLibre rendered building feature into a strict GeoJSON Feature<Polygon>.
 * Safely handles MultiPolygon geometry variations gracefully.
 */
export function normalizeBuildingFeature(
  feature: MapGeoJSONFeature,
): Feature<Polygon> | null {
  const { geometry, properties } = feature;

  if (geometry.type === 'Polygon') {
    return {
      type: 'Feature',
      geometry: geometry as Polygon,
      properties: properties ?? {},
    };
  }

  if (geometry.type === 'MultiPolygon') {
    // Instead of heavy point-in-polygon math, map layers extract the clicked visual element.
    // We fall back safely to the primary external polygon ring.
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: geometry.coordinates[0],
      },
      properties: properties ?? {},
    };
  }

  return null;
}
