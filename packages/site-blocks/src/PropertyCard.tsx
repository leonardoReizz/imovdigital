import type { ReactNode } from 'react';
import type { Property } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { useBlocks, useIsEditMode } from './context';

export type PropertyCardTemplate = 'compact' | 'standard' | 'highlight';

interface Props {
  property: Property;
  template: PropertyCardTemplate;
  orientation?: 'vertical' | 'horizontal';
}

export function PropertyCard({ property, template, orientation = 'vertical' }: Props) {
  if (orientation === 'horizontal') {
    return <RowCard property={property} />;
  }
  switch (template) {
    case 'compact':
      return <CompactCard property={property} />;
    case 'highlight':
      return <HighlightCard property={property} />;
    default:
      return <StandardCard property={property} />;
  }
}

function coverImage(property: Property): string | null {
  return property.images?.[0]?.url ?? null;
}

function priceLabel(property: Property): string {
  const isRent = property.listingType === 'RENT';
  const amount = isRent ? (property.rentPrice ?? property.price) : property.price;
  return `${formatPrice(amount)}${isRent ? '/mês' : ''}`;
}

function locationLabel(property: Property): string {
  return `${property.neighborhood}, ${property.city}`;
}

function propertyHref(property: Property): string {
  return `/imoveis/${property.slug}`;
}

/** Either <a href> in production or a passive <div> inside the editor. */
function CardShell({
  property,
  style,
  children,
}: {
  property: Property;
  style: React.CSSProperties;
  children: ReactNode;
}) {
  const isEdit = useIsEditMode();
  if (isEdit) {
    return <div style={style}>{children}</div>;
  }
  return (
    <a href={propertyHref(property)} style={style}>
      {children}
    </a>
  );
}

/* ─── Compact ────────────────────────────────────────────────── */

function CompactCard({ property }: { property: Property }) {
  const { theme } = useBlocks();
  const cover = coverImage(property);

  return (
    <CardShell
      property={property}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e2e8f0',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
    >
      <div style={{ aspectRatio: '4 / 3', background: '#f1f5f9', position: 'relative' }}>
        {cover && (
          <img
            src={cover}
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div style={{ padding: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: theme.primaryColor, margin: 0 }}>
          {priceLabel(property)}
        </p>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
          {locationLabel(property)}
        </p>
      </div>
    </CardShell>
  );
}

/* ─── Standard ───────────────────────────────────────────────── */

function StandardCard({ property }: { property: Property }) {
  const { theme } = useBlocks();
  const cover = coverImage(property);

  return (
    <CardShell
      property={property}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ aspectRatio: '16 / 10', background: '#f1f5f9', position: 'relative' }}>
        {cover && (
          <img
            src={cover}
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {property.featured && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: theme.primaryColor,
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            Destaque
          </span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#0f172a' }}>
          {property.title}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 12px' }}>
          {locationLabel(property)}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#475569', marginBottom: 12 }}>
          <span>{property.area}m²</span>
          {property.bedrooms > 0 && <span>{property.bedrooms} quartos</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} banheiros</span>}
          {property.parkingSpots > 0 && <span>{property.parkingSpots} vagas</span>}
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: theme.primaryColor, margin: 0 }}>
          {priceLabel(property)}
        </p>
      </div>
    </CardShell>
  );
}

/* ─── Highlight ──────────────────────────────────────────────── */

function HighlightCard({ property }: { property: Property }) {
  const { theme } = useBlocks();
  const cover = coverImage(property);

  return (
    <CardShell
      property={property}
      style={{
        position: 'relative',
        display: 'block',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        minHeight: 360,
        textDecoration: 'none',
        color: '#fff',
        background: '#0f172a',
      }}
    >
      {cover && (
        <img
          src={cover}
          alt={property.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.75,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1) 60%, transparent)',
        }}
      />
      <div
        style={{
          position: 'relative',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '100%',
          minHeight: 360,
        }}
      >
        <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{property.title}</h3>
        <p style={{ fontSize: 14, opacity: 0.9, margin: '4px 0 12px' }}>
          {locationLabel(property)}
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{priceLabel(property)}</p>
      </div>
    </CardShell>
  );
}

/* ─── Row (list display) ─────────────────────────────────────── */

function RowCard({ property }: { property: Property }) {
  const { theme } = useBlocks();
  const cover = coverImage(property);

  return (
    <CardShell
      property={property}
      style={{
        display: 'flex',
        flexDirection: 'row',
        background: '#fff',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e2e8f0',
        minHeight: 180,
      }}
    >
      <div
        style={{
          width: 260,
          flexShrink: 0,
          background: '#f1f5f9',
          position: 'relative',
        }}
      >
        {cover && (
          <img
            src={cover}
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {property.featured && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: theme.primaryColor,
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            Destaque
          </span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          minWidth: 0,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0f172a' }}>
          {property.title}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          {locationLabel(property)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#475569' }}>
          <span>{property.area}m²</span>
          {property.bedrooms > 0 && <span>{property.bedrooms} quartos</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} banheiros</span>}
          {property.parkingSpots > 0 && <span>{property.parkingSpots} vagas</span>}
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: theme.primaryColor, margin: '4px 0 0' }}>
          {priceLabel(property)}
        </p>
      </div>
    </CardShell>
  );
}
