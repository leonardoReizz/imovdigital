import type { PropertyTagsElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

const MOCK_AMENITIES = ['Piscina', 'Academia', 'Churrasqueira', 'Portaria 24h', 'Playground', 'Salão de festas'];

export function PropertyTagsBlock({ element }: { element: PropertyTagsElement }) {
  const { property, theme } = useBlocks();
  const amenities = property?.amenities && property.amenities.length > 0
    ? property.amenities
    : MOCK_AMENITIES;

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    ...elementStyleToCss(element.style),
  };

  if (element.layout === 'chips') {
    return (
      <div style={{ ...wrapperStyle, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {amenities.map((a) => (
          <span
            key={a}
            style={{
              padding: '6px 12px',
              background: `${theme.primaryColor}14`,
              color: theme.primaryColor,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {a}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        ...wrapperStyle,
        display: 'grid',
        gridTemplateColumns: `repeat(${element.columns}, minmax(0, 1fr))`,
        gap: 8,
      }}
    >
      {amenities.map((a) => (
        <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
          {element.showIcons && (
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: theme.primaryColor,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 11,
              }}
            >
              ✓
            </span>
          )}
          <span>{a}</span>
        </div>
      ))}
    </div>
  );
}
