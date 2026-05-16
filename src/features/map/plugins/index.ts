import { mapEngine } from '../lib/mapEngine';

import { buildingSelectionPlugin } from './buildingSelection.plugin';
import { hoverPlugin } from './hover.plugin';

let initialized = false;

export function registerMapPluginsOnce() {
  if (initialized) return;

  mapEngine.registerPlugin(buildingSelectionPlugin);
  mapEngine.registerPlugin(hoverPlugin);
  // 🟢 Removed userLocationPlugin from here since it runs directly inside the hook now

  initialized = true;
}
