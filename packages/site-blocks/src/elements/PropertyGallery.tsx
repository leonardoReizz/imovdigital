import type { Property, PropertyGalleryElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

const ASPECT_MAP = {
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '1:1': 1,
} as const;

export function PropertyGalleryBlock({ element }: { element: PropertyGalleryElement }) {
  const { property, theme } = useBlocks();
  const aspect = ASPECT_MAP[element.aspectRatio];
  const images = property?.images ?? [];

  const containerStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    ...elementStyleToCss(element.style),
  };

  if (element.layout === 'single') {
    const img = images[0];
    return (
      <div style={{ ...containerStyle, aspectRatio: String(aspect) }}>
        <ImageOrPlaceholder src={img?.url} alt={img?.alt ?? property?.title ?? 'Imóvel'} />
      </div>
    );
  }

  if (element.layout === 'carousel') {
    const items = images.length > 0 ? images : Array.from({ length: 4 }, () => null);
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((img, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 auto',
              width: '75%',
              aspectRatio: String(aspect),
              borderRadius: theme.borderRadius,
              overflow: 'hidden',
              scrollSnapAlign: 'start',
            }}
          >
            <ImageOrPlaceholder
              src={img?.url}
              alt={img?.alt ?? property?.title ?? `Foto ${i + 1}`}
            />
          </div>
        ))}
      </div>
    );
  }

  // grid
  const slots = Math.max(element.columns, images.length || element.columns);
  const items = Array.from({ length: slots }, (_, i) => images[i] ?? null);
  return (
    <div
      style={{
        ...containerStyle,
        display: 'grid',
        gridTemplateColumns: `repeat(${element.columns}, minmax(0, 1fr))`,
        gap: 8,
      }}
    >
      {items.slice(0, element.columns * 2).map((img, i) => (
        <div
          key={i}
          style={{
            aspectRatio: String(aspect),
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
          }}
        >
          <ImageOrPlaceholder
            src={img?.url}
            alt={img?.alt ?? property?.title ?? `Foto ${i + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

function ImageOrPlaceholder({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 10px, #f1f5f9 10px, #f1f5f9 20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 13,
      }}
    >
      Foto do imóvel
    </div>
  );
}

// Explicit re-export for Property type usage in card variants (kept minimal).
export type { Property };
