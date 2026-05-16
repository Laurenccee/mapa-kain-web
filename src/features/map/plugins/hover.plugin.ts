import type { MapPlugin } from '../types';

export const hoverPlugin: MapPlugin = {
  name: 'hover',

  onAdd(map) {
    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', '3d-buildings', onEnter);
    map.on('mouseleave', '3d-buildings', onLeave);

    // optional cleanup hook if your engine supports it
    return () => {
      map.off('mouseenter', '3d-buildings', onEnter);
      map.off('mouseleave', '3d-buildings', onLeave);
    };
  },
};
