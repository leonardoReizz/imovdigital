import type { ListingsElement, Property } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';
import { PropertyCard } from '../PropertyCard';

export function ListingsBlock({ element }: { element: ListingsElement }) {
  const { theme, properties } = useBlocks();

  // No properties loaded → show skeleton (editor placeholder state).
  if (!properties) {
    return <SkeletonGrid columns={element.columns} count={element.count} theme={theme} style={elementStyleToCss(element.style)} />;
  }

  const filtered = selectProperties(properties, element);
  const items = sortProperties(filtered, element.sortBy).slice(0, element.count);

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          color: '#94a3b8',
          background: '#f8fafc',
          borderRadius: theme.borderRadius,
          ...elementStyleToCss(element.style),
        }}
      >
        Nenhum imóvel encontrado para esta configuração.
      </div>
    );
  }

  const gridStyle: React.CSSProperties =
    element.display === 'list'
      ? { display: 'flex', flexDirection: 'column', gap: 16 }
      : element.display === 'carousel'
        ? {
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: 8,
          }
        : {
            display: 'grid',
            gridTemplateColumns: `repeat(${element.columns}, minmax(0, 1fr))`,
            gap: 24,
          };

  return (
    <div style={{ width: '100%', ...gridStyle, ...elementStyleToCss(element.style) }}>
      {items.map((property) => (
        <div
          key={property.id}
          style={element.display === 'carousel' ? { minWidth: 280, scrollSnapAlign: 'start' } : undefined}
        >
          <PropertyCard
            property={property}
            template={element.cardTemplate}
            orientation={element.display === 'list' ? 'horizontal' : 'vertical'}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── selectors ──────────────────────────────────────────────── */

function selectProperties(pool: Property[], el: ListingsElement): Property[] {
  const active = pool.filter((p) => p.active);

  if (el.source === 'featured') {
    return active.filter((p) => p.featured);
  }
  if (el.source === 'manual') {
    const ids = new Set(el.manualIds ?? []);
    return active.filter((p) => ids.has(p.id));
  }
  if (el.source === 'filter' && el.filter) {
    const f = el.filter;
    return active.filter((p) => {
      if (f.type && p.type !== f.type) return false;
      if (f.listingType && p.listingType !== f.listingType) return false;
      if (f.city && p.city.toLowerCase() !== f.city.toLowerCase()) return false;
      if (f.neighborhood && p.neighborhood.toLowerCase() !== f.neighborhood.toLowerCase()) return false;
      if (f.minPrice !== undefined && p.price < f.minPrice) return false;
      if (f.maxPrice !== undefined && p.price > f.maxPrice) return false;
      if (f.minBedrooms !== undefined && p.bedrooms < f.minBedrooms) return false;
      return true;
    });
  }
  return active;
}

function sortProperties(list: Property[], sort: ListingsElement['sortBy']): Property[] {
  const copy = [...list];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'area_desc':
      return copy.sort((a, b) => b.area - a.area);
    case 'manual':
      return copy;
    case 'recent':
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/* ─── skeleton (editor placeholder) ──────────────────────────── */

function SkeletonGrid({
  columns,
  count,
  theme,
  style,
}: {
  columns: number;
  count: number;
  theme: { borderRadius: number };
  style: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 24,
        width: '100%',
        ...style,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
            background: '#fff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ aspectRatio: '4 / 3', background: '#e2e8f0' }} />
          <div style={{ padding: 16 }}>
            <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
