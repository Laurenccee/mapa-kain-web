import type { LayerProps } from "@vis.gl/react-maplibre";

export const claimedLayerConfig: LayerProps = {
  id: "3d-buildings-claimed",
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-pattern": "blue",
    "fill-extrusion-height": [
      "+",
      ["coalesce", ["get", "height"], 5],
      0.5,
    ] as any,
    "fill-extrusion-base": ["coalesce", ["get", "height_min"], 0] as any,
    "fill-extrusion-opacity": 0.85,
  },
};

export const highlightedLayerConfig: LayerProps = {
  id: "3d-buildings-highlighted",
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-pattern": "yellow",
    "fill-extrusion-height": [
      "+",
      ["coalesce", ["get", "height"], 5],
      0.5,
    ] as any,
    "fill-extrusion-base": ["coalesce", ["get", "height_min"], 0] as any,
    "fill-extrusion-opacity": 0.95,
  },
};
