import type { PropertyMapElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

export function PropertyMapBlock({ element }: { element: PropertyMapElement }) {
  const { property, theme } = useBlocks();
  const lat = property?.latitude;
  const lng = property?.longitude;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 240,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    background: '#e2e8f0',
    ...elementStyleToCss(element.style),
  };

  if (!lat || !lng) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: 13,
          background:
            'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #f1f5f9 10px, #f1f5f9 20px)',
        }}
      >
        Mapa de localização do imóvel
      </div>
    );
  }

  const delta = 0.008;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik${element.approximateOnly ? '' : `&marker=${lat},${lng}`}`;

  return (
    <div style={containerStyle}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', minHeight: 240, border: 'none' }}
        loading="lazy"
      />
      {element.approximateOnly && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `${theme.primaryColor}22`,
                border: `2px solid ${theme.primaryColor}88`,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              background: 'rgba(255,255,255,0.9)',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              color: '#475569',
              pointerEvents: 'none',
            }}
          >
            Localização aproximada
          </div>
        </>
      )}
    </div>
  );
}
