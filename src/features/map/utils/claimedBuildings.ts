import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import type maplibregl from "maplibre-gl";

function normalizeRing(ring: Position[]): Position[] | null {
  const seen = new Set<string>();
  const cleanRing: Position[] = [];

  for (const coord of ring) {
    const key = coord[0].toFixed(7) + "," + coord[1].toFixed(7);
    if (seen.has(key)) continue;
    seen.add(key);
    cleanRing.push(coord);
  }

  if (cleanRing.length < 3) return null;

  const first = cleanRing[0];
  const last = cleanRing[cleanRing.length - 1];

  return first[0] === last[0] && first[1] === last[1]
    ? cleanRing
    : [...cleanRing, first];
}

function buildingIdFromRing(closedRing: Position[]): string | null {
  const points = closedRing.slice(0, -1);
  if (points.length === 0) return null;

  let sumLng = 0;
  let sumLat = 0;

  for (const pt of points) {
    sumLng += pt[0];
    sumLat += pt[1];
  }

  return (
    "bld_" +
    (sumLng / points.length).toFixed(7) +
    "_" +
    (sumLat / points.length).toFixed(7)
  );
}

function getOuterRings(geometry: Polygon | MultiPolygon): Position[][] {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates[0]];
  }

  const rings: Position[][] = [];
  for (const polygonCoords of geometry.coordinates) {
    const ring = polygonCoords[0];
    if (Array.isArray(ring) && ring.length >= 3) {
      rings.push(ring);
    }
  }
  return rings;
}

export function queryClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
): Feature<Polygon>[] {
  if (!map.getLayer("3d-buildings")) return [];
  if (claimedIds.length === 0) return [];

  const rendered = map.queryRenderedFeatures({ layers: ["3d-buildings"] });
  if (!rendered || rendered.length === 0) return [];

  const claimedSet = new Set(claimedIds);
  const seenIds = new Set<string>();
  const matches: Feature<Polygon>[] = [];

  for (const renderedFeature of rendered) {
    const geometry = renderedFeature.geometry;
    if (!geometry) continue;
    if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
      continue;
    }

    const outerRings = getOuterRings(geometry as Polygon | MultiPolygon);

    for (const outerRing of outerRings) {
      const normalized = normalizeRing(outerRing);
      if (!normalized) continue;

      const buildingId = buildingIdFromRing(normalized);
      if (!buildingId) continue;
      if (!claimedSet.has(buildingId)) continue;
      if (seenIds.has(buildingId)) continue;

      seenIds.add(buildingId);

      matches.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [normalized],
        },
        properties: renderedFeature.properties || {},
      });
    }
  }

  return matches;
}

export function updateClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
) {
  const source = map.getSource("claimed-buildings-source") as
    | maplibregl.GeoJSONSource
    | undefined;
  if (!source) return;

  source.setData({
    type: "FeatureCollection",
    features: queryClaimedBuildings(map, claimedIds),
  });
}
