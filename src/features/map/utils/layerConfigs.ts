import type { LayerProps } from "@vis.gl/react-maplibre";

// From layerConfigs.ts
interface BuildingsLayerOptions {
  opacity?: number;
}

export const getBuildingsLayerConfig = (
  isDark: boolean,
  options: BuildingsLayerOptions = {},
): LayerProps => ({
  id: "3d-buildings",
  source: "openmaptiles",
  "source-layer": "building",
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-color": isDark ? "#343a40" : "#cbd5e1",
    // ❌ CRASH ENGINE LINE
    "fill-extrusion-height": ["coalesce", ["get", "render_height"], 15] as any,
    "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
    "fill-extrusion-opacity": options.opacity ?? 0.85,
  },
});

export const claimedLayerConfig: LayerProps = {
  id: "3d-buildings-claimed",
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-color": "#10b981",
    "fill-extrusion-height": [
      "+",
      ["coalesce", ["get", "render_height"], 15],
      0.5,
    ] as any,
    "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
    "fill-extrusion-opacity": 0.85,
  },
};

export const highlightedLayerConfig: LayerProps = {
  id: "3d-buildings-highlighted",
  type: "fill-extrusion",
  minzoom: 14,
  paint: {
    "fill-extrusion-color": "#f59e0b",
    "fill-extrusion-height": [
      "+",
      ["coalesce", ["get", "render_height"], 15],
      0.5,
    ] as any,
    "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as any,
    "fill-extrusion-opacity": 0.95,
  },
};
