import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import type maplibregl from "maplibre-gl";

// Matching tolerance for vector-tile centroid drift between renders (meters).
const MATCH_TOLERANCE_METERS = 5;

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

function centroidOfRing(
  closedRing: Position[],
): { lng: number; lat: number } | null {
  const points = closedRing.slice(0, -1);
  if (points.length === 0) return null;

  let sumLng = 0;
  let sumLat = 0;

  for (const pt of points) {
    sumLng += pt[0];
    sumLat += pt[1];
  }

  return { lng: sumLng / points.length, lat: sumLat / points.length };
}

function parseBuildingId(id: string): { lng: number; lat: number } | null {
  const match = /^bld_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/.exec(id);
  if (!match) return null;
  return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

function haversineMeters(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
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

// Finds the claimed building id whose centroid is within tolerance of a
// freshly computed id, since re-rendered tile geometry can drift slightly.
export function matchClaimedBuildingId(
  candidateId: string,
  claimedIds: string[],
): string | null {
  const candidate = parseBuildingId(candidateId);
  if (!candidate) return null;

  let bestId: string | null = null;
  let bestDistance = Infinity;

  for (const claimedId of claimedIds) {
    const claimedCoord = parseBuildingId(claimedId);
    if (!claimedCoord) continue;

    const distance = haversineMeters(candidate, claimedCoord);
    if (distance <= MATCH_TOLERANCE_METERS && distance < bestDistance) {
      bestDistance = distance;
      bestId = claimedId;
    }
  }

  return bestId;
}

export function queryClaimedBuildings(
  map: maplibregl.Map,
  claimedIds: string[],
): Feature<Polygon>[] {
  if (!map.getLayer("3d-building")) return [];
  if (claimedIds.length === 0) return [];

  const claimedCoords = claimedIds
    .map((id) => parseBuildingId(id))
    .filter((coord): coord is { lng: number; lat: number } => coord !== null);
  if (claimedCoords.length === 0) return [];

  const rendered = map.queryRenderedFeatures({ layers: ["3d-building"] });
  if (!rendered || rendered.length === 0) return [];

  const matchedClaimedIndexes = new Set<number>();
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

      const centroid = centroidOfRing(normalized);
      if (!centroid) continue;

      const claimedIndex = claimedCoords.findIndex(
        (coord, index) =>
          !matchedClaimedIndexes.has(index) &&
          haversineMeters(centroid, coord) <= MATCH_TOLERANCE_METERS,
      );
      if (claimedIndex === -1) continue;

      matchedClaimedIndexes.add(claimedIndex);

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
