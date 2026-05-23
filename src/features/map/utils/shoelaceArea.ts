import type { Position } from 'geojson';

export function shoelaceArea(ring: Position[]): number {
  if (!ring || ring.length < 3) return Infinity;
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(area / 2);
}
