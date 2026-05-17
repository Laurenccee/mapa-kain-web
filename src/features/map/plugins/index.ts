import { mapEngine } from '../lib/mapEngine';

import { buildingSelectionPlugin } from './buildingSelection.plugin';
import { hoverPlugin } from './hover.plugin';
import { userLocationPlugin } from './userLocation.plugin';

let initialized = false;

export function registerMapPluginsOnce() {
  if (initialized) return;

  mapEngine.registerPlugin(buildingSelectionPlugin);
  mapEngine.registerPlugin(hoverPlugin);
  mapEngine.registerPlugin(userLocationPlugin);

  initialized = true;
}
