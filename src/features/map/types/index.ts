import type { Polygon, Feature } from 'geojson';

export interface CachedLocation {
  lng: number;
  lat: number;
  timestamp: number;
}

export interface BuildingSelection {
  featureId: string | number | null;
  building: Feature<Polygon>;
}

export interface MapPlugin {
  name: string;

  onAdd: (map: maplibregl.Map) => void;
  onRemove?: (map: maplibregl.Map) => void;
}

export type GeoEvent = {
  coords?: {
    longitude: number;
    latitude: number;
  };
};
