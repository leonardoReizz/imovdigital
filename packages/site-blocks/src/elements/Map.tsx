import type { MapElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';

export function MapBlock({ element }: { element: MapElement }) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${element.longitude - 0.01},${element.latitude - 0.01},${element.longitude + 0.01},${element.latitude + 0.01}&layer=mapnik&marker=${element.latitude},${element.longitude}`;

  return (
    <iframe
      src={src}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 240,
        border: 'none',
        ...elementStyleToCss(element.style),
      }}
      loading="lazy"
    />
  );
}
