import type { MapPlugin } from '../types';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Polygon, MultiPolygon, Feature, Position } from 'geojson';
import type maplibregl from 'maplibre-gl';
import { shoelaceArea } from '../utils/shoulaceArea';

/**
 * Building Selection Plugin
 *
 * Owns its own source + layer setup so initialization order is guaranteed:
 * mapEngine calls onAdd(map) after 'load', so sources/layers are added here
 * in the same synchronous call — no race condition with the hook's load listener.
 */
export const buildingSelectionPlugin: MapPlugin = {
  name: 'building-selection',

  onAdd(map) {
    // ── Own source & layer setup ─────────────────────────────────────────────
    // These MUST live here, not in useMapLibreMap, because mapEngine.applyPlugins()
    // and the hook's map.once('load') race each other. The plugin's onAdd wins,
    // so we set up everything we need right here, synchronously.

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
          'fill-extrusion-color': '#3b82f6',
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 15],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.95,
        },
      });
    }

    // ── Click handler ────────────────────────────────────────────────────────
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const selectionSource = map.getSource('selected-building') as
        | maplibregl.GeoJSONSource
        | undefined;

      const clearSelection = () => {
        selectionSource?.setData({ type: 'FeatureCollection', features: [] });
      };

      if (!selectionSource) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['3d-buildings'],
      });

      if (!features || features.length === 0) {
        clearSelection();
        return;
      }

      const clicked = point([e.lngLat.lng, e.lngLat.lat]);
      let bestRing: Position[] | null = null;
      let bestProperties: Record<string, unknown> | null = null;
      let bestArea = Infinity;

      for (const feature of features) {
        const { geometry, properties } = feature;
        if (!geometry) continue;

        if (geometry.type === 'Polygon') {
          const outerRing = (geometry as Polygon).coordinates[0];
          const candidate = {
            type: 'Feature' as const,
            properties: {},
            geometry: geometry as Polygon,
          };
          if (booleanPointInPolygon(clicked, candidate)) {
            const area = shoelaceArea(outerRing);
            if (area < bestArea) {
              bestArea = area;
              bestRing = outerRing;
              bestProperties = properties;
            }
          }
        } else if (geometry.type === 'MultiPolygon') {
          for (const polygonCoords of (geometry as MultiPolygon).coordinates) {
            const outerRing = polygonCoords[0];
            const candidate = {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon' as const,
                coordinates: polygonCoords,
              },
            };
            if (booleanPointInPolygon(clicked, candidate)) {
              const area = shoelaceArea(outerRing);
              if (area < bestArea) {
                bestArea = area;
                bestRing = outerRing;
                bestProperties = properties;
              }
            }
          }
        }
      }

      if (!bestRing || !bestProperties) {
        clearSelection();
        return;
      }

      // Deduplicate tile seam floating-point duplicates (~1cm precision)
      const seen = new Set<string>();
      const cleanRing = bestRing.filter((coord) => {
        const key = `${coord[0].toFixed(7)},${coord[1].toFixed(7)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (cleanRing.length < 3) {
        clearSelection();
        return;
      }

      // Ensure ring is closed
      const first = cleanRing[0];
      const last = cleanRing[cleanRing.length - 1];
      const closedRing =
        first[0] === last[0] && first[1] === last[1]
          ? cleanRing
          : [...cleanRing, first];

      const selectedFeature: Feature<Polygon> = {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [closedRing] },
        properties: bestProperties,
      };

      selectionSource.setData({
        type: 'FeatureCollection',
        features: [selectedFeature],
      });

      console.log('🏢 Building selected:', bestProperties);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  },
};
