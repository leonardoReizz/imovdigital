import type { PropertySpecsElement } from '@imovdigital/types';
import { Bath, BedDouble, Car, Ruler, Star, type LucideIcon } from 'lucide-react';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

type Spec = PropertySpecsElement['items'][number];

const SPEC_LABELS: Record<Spec, string> = {
  area: 'm²',
  bedrooms: 'quartos',
  bathrooms: 'banheiros',
  parkingSpots: 'vagas',
  suites: 'suítes',
};

const SPEC_ICONS: Record<Spec, LucideIcon> = {
  area: Ruler,
  bedrooms: BedDouble,
  bathrooms: Bath,
  parkingSpots: Car,
  suites: Star,
};

export function PropertySpecsBlock({ element }: { element: PropertySpecsElement }) {
  const { property, theme } = useBlocks();

  const entries = element.items
    .map((spec) => {
      if (!property) return { spec, value: specPlaceholder(spec) };
      const raw = property[spec] as number;
      if (!raw) return null;
      return { spec, value: spec === 'area' ? `${raw}` : String(raw) };
    })
    .filter((e): e is { spec: Spec; value: string } => e !== null);

  if (entries.length === 0) return null;

  const wrapperStyle: React.CSSProperties = {
    ...elementStyleToCss(element.style),
  };

  if (element.layout === 'row') {
    return (
      <div
        style={{
          ...wrapperStyle,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          padding: '16px 0',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {entries.map(({ spec, value }) => {
          const Icon = SPEC_ICONS[spec];
          return (
            <div key={spec} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={20} color={theme.primaryColor} strokeWidth={1.75} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.1 }}>
                  {value}
                  {spec === 'area' ? ' m²' : ''}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'lowercase' }}>
                  {SPEC_LABELS[spec]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        ...wrapperStyle,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 16,
      }}
    >
      {entries.map(({ spec, value }) => {
        const Icon = SPEC_ICONS[spec];
        return (
          <div
            key={spec}
            style={{
              padding: 12,
              background: '#f8fafc',
              borderRadius: theme.borderRadius,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <Icon size={24} color={theme.primaryColor} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {value}
              {spec === 'area' ? ' m²' : ''}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'lowercase' }}>
              {SPEC_LABELS[spec]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function specPlaceholder(spec: Spec): string {
  return spec === 'area' ? '65' : spec === 'bedrooms' ? '2' : spec === 'bathrooms' ? '1' : '1';
}
