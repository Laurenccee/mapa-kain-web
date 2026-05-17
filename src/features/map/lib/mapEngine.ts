import maplibregl from 'maplibre-gl';
import { MapPlugin } from '../types';

class MapEngine {
  private static instance: MapEngine;
  private map: maplibregl.Map | null = null;
  private plugins: MapPlugin[] = [];

  static getInstance() {
    if (!MapEngine.instance) {
      MapEngine.instance = new MapEngine();
    }
    return MapEngine.instance;
  }

  init(container: HTMLDivElement, options: any) {
    if (this.map) {
      if (this.map.getContainer() === container) {
        return this.map;
      } else {
        this.destroy();
      }
    }

    this.map = new maplibregl.Map({
      container,
      style: options.style,
      center: options.center,
      zoom: options.zoom ?? 17,
      pitch: options.pitch ?? 55,
      bearing: options.bearing ?? -15,
      maxPitch: 85,
      attributionControl: false,
      transformRequest: options.transformRequest,
    });

    // 🟢 FIX: Listen to 'load' once instead of 'styledata' repeatedly
    // to stop stacking multiple event listeners on plugins.
    this.map.once('load', () => {
      this.applyPlugins();
    });

    return this.map;
  }

  registerPlugin(plugin: MapPlugin) {
    const exists = this.plugins.some((p) => p.name === plugin.name);
    if (!exists) {
      this.plugins.push(plugin);
    }
    // If map style is already live, hook it immediately
    if (this.map && this.map.isStyleLoaded()) {
      plugin.onAdd(this.map);
    }
  }

  applyPlugins() {
    if (!this.map) return;
    this.plugins.forEach((plugin) => {
      try {
        plugin.onAdd(this.map!);
      } catch (err) {
        console.error(`Error mounting plugin [${plugin.name}]:`, err);
      }
    });
  }

  // 🟢 CLEANUP FIX: Expose proper plugin unmounting pipelines
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // Keep registered plugins intact in the registry array for subsequent mounts,
    // just allow them to re-hook cleanly on future allocations.
  }
}

export const mapEngine = MapEngine.getInstance();
