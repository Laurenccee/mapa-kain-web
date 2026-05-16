import type { MapPlugin } from '../types';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Polygon, MultiPolygon } from 'geojson';

export const buildingSelectionPlugin: MapPlugin = {
  name: 'building-selection',

  onAdd(map) {
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['3d-buildings'],
      });

      // Clicked on standard land layout: Clear out building highlight overlay smoothly
      if (!features || features.length === 0) {
        map.setFilter('3d-buildings-highlighted', ['==', ['id'], '']);
        return;
      }

      const feature = features[0];
      const geometry = feature.geometry;
      if (!geometry) return;

      const clicked = point([e.lngLat.lng, e.lngLat.lat]);
      let inside = false;

      // 🟢 POLYGON CASE
      if (geometry.type === 'Polygon') {
        const polyFeature = {
          type: 'Feature' as const,
          properties: {},
          geometry: geometry as Polygon,
        };
        inside = booleanPointInPolygon(clicked, polyFeature);
      }
      // 🟢 MULTIPOLYGON CASE
      else if (geometry.type === 'MultiPolygon') {
        const coords = (geometry as MultiPolygon).coordinates;

        for (const polygonCoords of coords) {
          const polyFeature = {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Polygon' as const,
              coordinates: polygonCoords,
            },
          };

          if (booleanPointInPolygon(clicked, polyFeature)) {
            inside = true;
            break;
          }
        }
      }

      // If the cursor wasn't truly inside this exact building mathematical polygon, stop execution
      if (!inside) return;

      // 🟢 ULTRA-ISOLATION LOGIC:
      // To bypass completely duplicated IDs across separate tiles, filter by a combination
      // of the feature ID and a unique geometry fingerprint characteristic like height properties.
      if (feature.id !== undefined && feature.id !== null) {
        const renderHeight = feature.properties?.render_height ?? 0;

        map.setFilter('3d-buildings-highlighted', [
          'all',
          ['==', ['id'], feature.id],
          ['==', ['get', 'render_height'], renderHeight],
        ]);

        console.log('🏢 Isolated building selected:', feature.properties);
      }
    });
  },
};
