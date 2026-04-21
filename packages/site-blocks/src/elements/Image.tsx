import type { ImageElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useIsEditMode } from '../context';

export function ImageBlock({ element }: { element: ImageElement }) {
  const isEdit = useIsEditMode();
  const style = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: element.objectFit,
    ...elementStyleToCss(element.style),
  } as const;

  if (!element.src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          color: '#94a3b8',
          fontSize: 12,
          borderRadius: element.style.borderRadius,
          overflow: 'hidden',
        }}
      >
        Imagem
      </div>
    );
  }

  const img = <img src={element.src} alt={element.alt} style={style} />;

  if (element.href && !isEdit) {
    return (
      <a href={element.href} style={{ display: 'block', width: '100%', height: '100%' }}>
        {img}
      </a>
    );
  }

  return img;
}
