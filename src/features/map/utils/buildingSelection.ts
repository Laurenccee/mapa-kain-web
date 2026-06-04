import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Polygon, MultiPolygon, Feature, Position } from "geojson";
import type maplibregl from "maplibre-gl";
import { shoelaceArea } from "./shoelaceArea";
import { BuildingSelectionResult } from "../types";

export function queryBuildingAtPoint(
  map: maplibregl.Map,
  pointCoords: { x: number; y: number },
  lngLat: { lng: number; lat: number },
): BuildingSelectionResult | null {
  const features = map.queryRenderedFeatures([pointCoords.x, pointCoords.y], {
    layers: ["3d-buildings"],
  });

  if (!features || features.length === 0) {
    return null;
  }

  const clicked = point([lngLat.lng, lngLat.lat]);
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
        }
      }
    } else if (geometry.type === "MultiPolygon") {
      for (const polygonCoords of (geometry as MultiPolygon).coordinates) {
        const outerRing = polygonCoords[0];
        const candidate = {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Polygon" as const, coordinates: polygonCoords },
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
    return null;
  }

  const seen = new Set<string>();
  const cleanRing = bestRing.filter((coord) => {
    const key = `${coord[0].toFixed(7)},${coord[1].toFixed(7)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (cleanRing.length < 3) {
    return null;
  }

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

  const points = closedRing.slice(0, -1);
  const len = points.length;
  let buildingId: string;

  if (len > 0) {
    let sumLng = 0;
    let sumLat = 0;
    for (const pt of points) {
      sumLng += pt[0];
      sumLat += pt[1];
    }
    buildingId = `bld_${(sumLng / len).toFixed(7)}_${(sumLat / len).toFixed(7)}`;
  } else {
    buildingId = `bld_unk_${Date.now()}`;
  }

  return { buildingId, properties: bestProperties, feature: selectedFeature };
}
