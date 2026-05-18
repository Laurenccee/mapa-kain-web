import type { Polygon, Feature } from 'geojson';

export interface MapPlugin {
  name: string;

  onAdd: (map: maplibregl.Map) => void;
  onRemove?: (map: maplibregl.Map) => void;
}

export interface LocationPluginInterface extends MapPlugin {
  _callback: (() => void) | null;
  _isControlAdded: boolean;
  _hasFreshCache: boolean; // 🟢 Track if we bypassed via local storage cache
  initLocation: (onLocationResolved: () => void) => void;
  reset: () => void;
}
