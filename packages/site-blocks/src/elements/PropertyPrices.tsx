import type { Property, PropertyPricesElement } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

export function PropertyPricesBlock({ element }: { element: PropertyPricesElement }) {
  const { property, theme } = useBlocks();

  const rows = buildRows(property ?? null, element);

  return (
    <div
      style={{
        padding: 20,
        background: '#f8fafc',
        borderRadius: theme.borderRadius,
        ...elementStyleToCss(element.style),
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 12px' }}>
        {element.title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: row.emphasis ? 0 : 8,
              paddingTop: row.emphasis ? 8 : 0,
              borderBottom: row.emphasis ? undefined : '1px solid #e2e8f0',
              borderTop: row.emphasis ? '2px solid #e2e8f0' : undefined,
              fontSize: 14,
              fontWeight: row.emphasis ? 600 : 400,
              color: row.emphasis ? '#0f172a' : '#64748b',
            }}
          >
            <span>{row.label}</span>
            <span style={{ color: row.emphasis ? theme.primaryColor : undefined }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildRows(
  property: Property | null,
  el: PropertyPricesElement,
): Array<{ label: string; value: string; emphasis?: boolean }> {
  if (!property) {
    // placeholder rows for editor
    return [
      { label: 'Aluguel', value: 'R$ 0,00/mês' },
      ...(el.showCondo ? [{ label: 'Condomínio', value: 'R$ 0,00' }] : []),
      ...(el.showIptu ? [{ label: 'IPTU', value: 'R$ 0,00' }] : []),
      ...(el.showTotal
        ? [{ label: 'Valor total previsto', value: 'R$ 0,00', emphasis: true }]
        : []),
    ];
  }

  const isRent = property.listingType === 'RENT' || property.listingType === 'BOTH';
  const rows: { label: string; value: string; emphasis?: boolean }[] = [];

  if (isRent && property.rentPrice) {
    rows.push({ label: 'Aluguel', value: `${formatPrice(property.rentPrice)}/mês` });
  } else {
    rows.push({ label: 'Preço', value: formatPrice(property.price) });
  }

  if (el.showCondo) {
    rows.push({
      label: 'Condomínio',
      value: property.condoFee ? formatPrice(property.condoFee) : 'Isento',
    });
  }
  if (el.showIptu) {
    rows.push({
      label: 'IPTU',
      value: property.iptuYearly ? `${formatPrice(property.iptuYearly)}/ano` : 'Isento',
    });
  }

  if (el.showTotal && isRent && property.rentPrice) {
    const total = (property.rentPrice ?? 0) + (property.condoFee ?? 0);
    rows.push({
      label: 'Valor total previsto',
      value: formatPrice(total),
      emphasis: true,
    });
  }

  return rows;
}
