"use client";
import * as React from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map, Source, Layer, FullscreenControl } from "@vis.gl/react-maplibre";
import type { CircleLayerSpecification } from "@vis.gl/react-maplibre";
import type { FeatureCollection } from "geojson";

const geojson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.4, 37.8] },
      properties: {
        title: "Test",
      },
    },
  ],
};

const layerStyle = {
  id: "point",
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
  },
} as const;

export default function MapPage() {
  return (
    <section className="h-full w-full">
      <Map
        initialViewState={{
          longitude: -122.45,
          latitude: 37.78,
          zoom: 14,
        }}
      >
        <Source id="my-data" type="geojson" data={geojson}>
          <Layer {...layerStyle} />
        </Source>
        <FullscreenControl />
      </Map>
    </section>
  );
}
