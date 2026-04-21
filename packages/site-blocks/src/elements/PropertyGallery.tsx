'use client';

import { useState, type CSSProperties } from 'react';
import type { Property, PropertyGalleryElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks, useResolveImageUrl } from '../context';

const ASPECT_MAP = {
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '1:1': 1,
} as const;

export function PropertyGalleryBlock({ element }: { element: PropertyGalleryElement }) {
  const { property, theme } = useBlocks();
  const resolveUrl = useResolveImageUrl();
  const aspect = ASPECT_MAP[element.aspectRatio];
  const images = property?.images ?? [];

  // When the user resized the element (editor n/s handles) we get an
  // explicit numeric height. In that case we fill the wrapper (height
  // 100%) and drop aspectRatio; otherwise we fall back to the aspect
  // ratio sizing so the block has reasonable default proportions.
  const hasExplicitHeight = typeof element.size?.h === 'number';

  const containerStyle: CSSProperties = {
    width: '100%',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    ...elementStyleToCss(element.style),
  };

  const sizingStyle = (): CSSProperties =>
    hasExplicitHeight ? { height: '100%' } : { aspectRatio: String(aspect) };

  // No images at all — collapse the layout into a single placeholder so
  // we don't fill the page with stacked "Foto do imóvel" boxes.
  if (images.length === 0) {
    return (
      <div style={{ ...containerStyle, ...sizingStyle() }}>
        <ImageOrPlaceholder src={null} alt={property?.title ?? 'Imóvel'} />
      </div>
    );
  }

  if (element.layout === 'single') {
    const img = images[0];
    return (
      <div style={{ ...containerStyle, ...sizingStyle() }}>
        <ImageOrPlaceholder
          src={resolveUrl(img?.url)}
          alt={img?.alt ?? property?.title ?? 'Imóvel'}
        />
      </div>
    );
  }

  if (element.layout === 'carousel') {
    return (
      <Carousel
        images={images}
        aspect={aspect}
        hasExplicitHeight={hasExplicitHeight}
        containerStyle={containerStyle}
        propertyTitle={property?.title}
      />
    );
  }

  // Grid mosaic — first image spans the full width (hero), the rest
  // fill the configured columns. Cap at hero + 2 rows of thumbs so a
  // huge gallery doesn't blow up the page; user can switch to carousel
  // for long galleries. Only renders REAL images — empty padding slots
  // would show "Foto do imóvel" placeholders the user doesn't want.
  const cols = element.columns;
  const maxSlots = 1 + cols * 2;
  const items = images.slice(0, maxSlots);

  // With a single image the grid would show just a hero — no need for
  // grid layout, render it like the single mode.
  if (items.length === 1) {
    return (
      <div style={{ ...containerStyle, ...sizingStyle() }}>
        <ImageOrPlaceholder
          src={resolveUrl(items[0]?.url)}
          alt={items[0]?.alt ?? property?.title ?? 'Imóvel'}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...containerStyle,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 8,
        ...(hasExplicitHeight ? { height: '100%' } : {}),
      }}
    >
      {items.map((img, i) => {
        const isHero = i === 0;
        return (
          <div
            key={i}
            style={{
              ...sizingStyle(),
              gridColumn: isHero ? `span ${cols}` : undefined,
              borderRadius: theme.borderRadius,
              overflow: 'hidden',
            }}
          >
            <ImageOrPlaceholder
              src={resolveUrl(img?.url)}
              alt={img?.alt ?? property?.title ?? `Foto ${i + 1}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function Carousel({
  images,
  aspect,
  hasExplicitHeight,
  containerStyle,
  propertyTitle,
}: {
  images: { url: string; alt: string }[];
  aspect: number;
  hasExplicitHeight: boolean;
  containerStyle: CSSProperties;
  propertyTitle?: string;
}) {
  const resolveUrl = useResolveImageUrl();
  const [current, setCurrent] = useState(0);
  const items = images.length > 0 ? images : Array.from({ length: 1 }, () => null);
  const total = items.length;
  const img = items[current];

  const go = (delta: number) => {
    setCurrent((c) => (c + delta + total) % total);
  };

  return (
    <div
      style={{
        ...containerStyle,
        position: 'relative',
        ...(hasExplicitHeight ? { height: '100%' } : { aspectRatio: String(aspect) }),
      }}
    >
      <ImageOrPlaceholder
        src={img ? resolveUrl(img.url) : undefined}
        alt={img?.alt ?? propertyTitle ?? `Foto ${current + 1}`}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }}
            aria-label="Foto anterior"
            style={arrowStyle('left')}
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }}
            aria-label="Próxima foto"
            style={arrowStyle('right')}
          >
            <ArrowIcon dir="right" />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
              padding: '6px 10px',
              background: 'rgba(15, 23, 42, 0.55)',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}
          >
            {items.slice(0, 8).map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.6)',
                  transition: 'width 150ms',
                }}
              />
            ))}
            {items.length > 8 && (
              <span style={{ color: '#fff', fontSize: 10, marginLeft: 4 }}>
                {current + 1}/{total}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function arrowStyle(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 10,
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  };
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
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
