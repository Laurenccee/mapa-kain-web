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
    if (this.map) return this.map;

    this.map = new maplibregl.Map({
      container,
      style: options.style,
      center: options.center,
      zoom: options.zoom ?? 17,
      pitch: options.pitch ?? 55,
      bearing: options.bearing ?? -15,
      maxPitch: 85,
      attributionControl: false,
    });

    this.map.on('load', () => {
      this.plugins.forEach((p) => p.onAdd(this.map!));
    });

    return this.map;
  }

  registerPlugin(plugin: MapPlugin) {
    this.plugins.push(plugin);

    // if map already exists, attach immediately
    if (this.map) {
      plugin.onAdd(this.map);
    }
  }

  getMap() {
    return this.map;
  }

  destroy() {
    if (this.map) {
      this.plugins.forEach((p) => p.onRemove?.(this.map!));
      this.map.remove();
    }

    this.map = null;
    this.plugins = [];
  }
}

export const mapEngine = MapEngine.getInstance();
