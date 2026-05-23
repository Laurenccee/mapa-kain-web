import type { MapPlugin } from "../types";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Polygon, MultiPolygon, Feature, Position } from "geojson";
import type maplibregl from "maplibre-gl";
import { shoelaceArea } from "../utils/shoulaceArea";

export const buildingSelectionPlugin: MapPlugin = {
  name: "building-selection",

  onAdd(map) {
    if (!map.getSource("selected-building")) {
      map.addSource("selected-building", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer("3d-buildings-highlighted")) {
      map.addLayer({
        id: "3d-buildings-highlighted",
        source: "selected-building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#f59e0b",
          "fill-extrusion-height": ["coalesce", ["get", "render_height"], 15],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.95,
        },
      });
    }

    // ── Click handler ────────────────────────────────────────────────────────
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const selectionSource = map.getSource("selected-building") as
        | maplibregl.GeoJSONSource
        | undefined;

      const clearSelection = () => {
        selectionSource?.setData({ type: "FeatureCollection", features: [] });
        map.fire("building:cleared");
      };

      if (!selectionSource) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: ["3d-buildings"],
      });

      if (!features || features.length === 0) {
        clearSelection();
        return;
      }

      const clicked = point([e.lngLat.lng, e.lngLat.lat]);
      let bestFeature: any = null;
      let bestRing: Position[] | null = null;
      let bestProperties: Record<string, unknown> | null = null;
      let bestArea = Infinity;

      for (const feature of features) {
        const { geometry, properties } = feature;
        if (!geometry) continue;

        if (geometry.type === "Polygon") {
          const outerRing = (geometry as Polygon).coordinates[0];
          const candidate = {
            type: "Feature" as const,
            properties: {},
            geometry: geometry as Polygon,
          };
          if (booleanPointInPolygon(clicked, candidate)) {
            const area = shoelaceArea(outerRing);
            if (area < bestArea) {
              bestArea = area;
              bestRing = outerRing;
              bestProperties = properties;
              bestFeature = feature;
            }
          }
        } else if (geometry.type === "MultiPolygon") {
          for (const polygonCoords of (geometry as MultiPolygon).coordinates) {
            const outerRing = polygonCoords[0];
            const candidate = {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "Polygon" as const,
                coordinates: polygonCoords,
              },
            };
            if (booleanPointInPolygon(clicked, candidate)) {
              const area = shoelaceArea(outerRing);
              if (area < bestArea) {
                bestArea = area;
                bestRing = outerRing;
                bestProperties = properties;
                bestFeature = feature;
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
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [closedRing] },
        properties: bestProperties,
      };

      selectionSource.setData({
        type: "FeatureCollection",
        features: [selectedFeature],
      });

      let buildingId = "";
      const points = closedRing.slice(0, -1);
      const len = points.length;
      if (len > 0) {
        let sumLng = 0;
        let sumLat = 0;
        for (const pt of points) {
          sumLng += pt[0];
          sumLat += pt[1];
        }
        const avgLng = sumLng / len;
        const avgLat = sumLat / len;
        buildingId = `bld_${avgLng.toFixed(7)}_${avgLat.toFixed(7)}`;
      } else {
        buildingId = `bld_unk_${Date.now()}`;
      }

      console.log("🏢 Building selected:", bestProperties);
      console.log("🆔 Building ID:", buildingId);

      map.fire("building:selected", {
        buildingId,
        properties: bestProperties,
        feature: selectedFeature,
      });
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  },
};
