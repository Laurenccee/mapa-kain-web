import maplibregl from 'maplibre-gl';
import { MapPlugin } from '../types';

class MapEngine {
  private static instance: MapEngine;
  private map: maplibregl.Map | null = null;
  private plugins: MapPlugin[] = [];
  private CACHE_NAME = 'maplibre-assets-v1';

  static getInstance() {
    if (!MapEngine.instance) {
      MapEngine.instance = new MapEngine();
    }
    return MapEngine.instance;
  }

  init(container: HTMLDivElement, options: any) {
    // 🟢 FIX: If an instance exists but the container changes, cleanly tear down the stale reference
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
      transformRequest: options.transformRequest, // 🟢 FIXED: Forward interceptor options
    });

    this.map.on('styledata', () => {
      this.plugins.forEach((p) => p.onAdd(this.map!));
    });

    return this.map;
  }

  registerPlugin(plugin: MapPlugin) {
    const exists = this.plugins.some((p) => p.name === plugin.name);
    if (!exists) {
      this.plugins.push(plugin);
    }
    if (this.map) {
      plugin.onAdd(this.map);
    }
  }

  getMap() {
    return this.map;
  }

  destroy() {
    // 🟢 FIXED: Centralized clean-up handler resets internal singleton properties completely
    if (this.map) {
      try {
        this.plugins.forEach((p) => p.onRemove?.(this.map!));
        this.map.remove();
      } catch (e) {
        console.error('Error removing map instance:', e);
      }
    }
    this.map = null;
    this.plugins = [];
  }
}

export const mapEngine = MapEngine.getInstance();
