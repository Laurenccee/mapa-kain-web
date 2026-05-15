'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const initialStyle = isDark ? STYLES.dark : STYLES.light;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [0, 0],
      zoom: 7,
      // Removed 'antialias' from here to satisfy standard MapOptions TypeScript interfaces
      pitch: 55, // Tilts the camera up 55 degrees (perfect for 3D extrusions)
      bearing: -15, // Slightly rotates the map orientation (15 degrees counterclockwise)
      maxPitch: 85, // Allows the camera to tilt up to 85 degrees for a more dramatic 3D effect
    });

    const currentMap = map.current;

    currentMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Fixed Option Parameter for MapLibre Types
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const geolocateControl = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      });

      currentMap.addControl(geolocateControl, 'top-right');
      currentMap.on('load', () => {
        geolocateControl.trigger();
        add3DBuildings(currentMap);
      });
    } else {
      console.warn(
        'Browser environment or device permissions blocked Geolocation initialization.',
      );
    }

    currentMap.on('style.data', () => {
      add3DBuildings(currentMap);
    });

    return () => {
      currentMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const observer = new MutationObserver(() => {
      if (!map.current) return;
      const isDark = document.documentElement.classList.contains('dark');
      const targetStyle = isDark ? STYLES.dark : STYLES.light;

      if (map.current.getStyle()?.name !== (isDark ? 'dark' : 'positron')) {
        map.current.setStyle(targetStyle);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const add3DBuildings = (mapInstance: maplibregl.Map) => {
    if (mapInstance.getLayer('3d-buildings')) return;

    mapInstance.addLayer({
      id: '3d-buildings',
      source: 'openmaptiles',
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#3b82f6',
          '#aaa',
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          14.05,
          ['get', 'render_height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14,
          0,
          14.05,
          ['get', 'render_min_height'],
        ],
        'fill-extrusion-opacity': 0.6,
      },
    });
  };

  return <div ref={mapContainer} className="w-full h-screen" />;
}
