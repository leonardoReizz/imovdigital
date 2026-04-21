'use client';

import { useState, type FormEvent } from 'react';
import type { SearchElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks, useIsEditMode, useResponsiveBreakpoint } from '../context';

const FIELD_LABELS: Record<string, string> = {
  type: 'Tipo',
  operation: 'Operação',
  city: 'Cidade',
  neighborhood: 'Bairro',
  priceRange: 'Preço',
  bedrooms: 'Quartos',
  bathrooms: 'Banheiros',
  parking: 'Vagas',
  areaRange: 'Área',
};

type FieldKey = SearchElement['fields'][number];

const TYPE_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: 'APARTMENT', label: 'Apartamento' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'LAND', label: 'Terreno' },
];

const OPERATION_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: 'SALE', label: 'Venda' },
  { value: 'RENT', label: 'Aluguel' },
];

const BEDROOMS_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const PARKING_OPTIONS = BEDROOMS_OPTIONS;
const BATHROOMS_OPTIONS = BEDROOMS_OPTIONS;

const CHIP_VALUES = ['1', '2', '3', '4', '5'];

export function SearchBlock({ element }: { element: SearchElement }) {
  const { theme, cities, neighborhoods, searchBasePath = '/imoveis' } = useBlocks();
  const isEdit = useIsEditMode();
  const breakpoint = useResponsiveBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [values, setValues] = useState<Record<FieldKey, string>>(() =>
    element.fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {} as Record<FieldKey, string>),
  );

  const setValue = (field: FieldKey, value: string) =>
    setValues((v) => ({ ...v, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) return; // Don't navigate while editing the layout.
    if (element.submitMode !== 'redirect') return;
    const params = new URLSearchParams();
    for (const field of element.fields) {
      const v = values[field];
      if (!v) continue;
      params.set(mapFieldToParam(field), v);
    }
    const href = `${searchBasePath}${params.size > 0 ? `?${params.toString()}` : ''}`;
    if (typeof window !== 'undefined') window.location.href = href;
  };

  const isStacked = element.layout === 'stacked';
  const isSidebar = element.layout === 'sidebar';

  if (isSidebar) {
    return (
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: '#fff',
          padding: 20,
          borderRadius: theme.borderRadius,
          border: '1px solid #e2e8f0',
          width: '100%',
          ...elementStyleToCss(element.style),
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#0f172a',
            paddingBottom: 8,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          Filtros
        </div>
        {element.fields.map((field) => (
          <div key={field} style={{ width: '100%' }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {FIELD_LABELS[field] ?? field}
            </label>
            <FieldInput
              field={field}
              value={values[field] ?? ''}
              onChange={(v) => setValue(field, v)}
              cities={cities ?? []}
              neighborhoods={neighborhoods ?? []}
              borderRadius={theme.borderRadius}
              primaryColor={theme.primaryColor}
              isSidebar
            />
          </div>
        ))}
        <button
          type="submit"
          style={{
            height: 40,
            width: '100%',
            marginTop: 4,
            background: theme.primaryColor,
            color: '#fff',
            border: 'none',
            borderRadius: theme.borderRadius,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {element.submitLabel}
        </button>
      </form>
    );
  }

  const stackLayout = isStacked || isMobile;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: stackLayout ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: 12,
        background: '#fff',
        padding: 16,
        borderRadius: theme.borderRadius,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        width: '100%',
        alignItems: stackLayout ? 'stretch' : 'flex-end',
        ...elementStyleToCss(element.style),
      }}
    >
      {element.fields.map((field) => (
        <div key={field} style={{ flex: '1 1 140px', minWidth: 120, width: stackLayout ? '100%' : undefined }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: '#475569',
              marginBottom: 4,
            }}
          >
            {FIELD_LABELS[field] ?? field}
          </label>
          <FieldInput
            field={field}
            value={values[field] ?? ''}
            onChange={(v) => setValue(field, v)}
            cities={cities ?? []}
            neighborhoods={neighborhoods ?? []}
            borderRadius={theme.borderRadius}
            primaryColor={theme.primaryColor}
          />
        </div>
      ))}
      <button
        type="submit"
        style={{
          height: 40,
          paddingLeft: 20,
          paddingRight: 20,
          width: stackLayout ? '100%' : undefined,
          background: theme.primaryColor,
          color: '#fff',
          border: 'none',
          borderRadius: theme.borderRadius,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {element.submitLabel}
      </button>
    </form>
  );
}

function mapFieldToParam(field: FieldKey): string {
  switch (field) {
    case 'operation':
      return 'listingType';
    case 'priceRange':
      return 'minPrice';
    case 'areaRange':
      return 'minArea';
    default:
      return field;
  }
}

function FieldInput({
  field,
  value,
  onChange,
  cities,
  neighborhoods,
  borderRadius,
  primaryColor,
  isSidebar = false,
}: {
  field: FieldKey;
  value: string;
  onChange: (value: string) => void;
  cities: string[];
  neighborhoods: string[];
  borderRadius: number;
  primaryColor: string;
  isSidebar?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 14,
    color: '#0f172a',
  };

  if (isSidebar && (field === 'bedrooms' || field === 'bathrooms' || field === 'parking')) {
    return (
      <ChipGroup
        values={CHIP_VALUES}
        value={value}
        onChange={onChange}
        suffix="+"
        borderRadius={borderRadius}
        primaryColor={primaryColor}
      />
    );
  }

  if (field === 'type') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field === 'operation') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        {OPERATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field === 'city') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        <option value="">Todas</option>
        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    );
  }
  if (field === 'neighborhood') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        <option value="">Todos</option>
        {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    );
  }
  if (field === 'bedrooms') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        {BEDROOMS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field === 'bathrooms') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        {BATHROOMS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field === 'parking') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle}>
        {PARKING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field === 'priceRange') {
    return (
      <input
        type="number"
        placeholder="Mínimo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={baseStyle}
      />
    );
  }
  if (field === 'areaRange') {
    return (
      <input
        type="number"
        placeholder="m² mín"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={baseStyle}
      />
    );
  }
  return null;
}

function ChipGroup({
  values,
  value,
  onChange,
  suffix = '',
  borderRadius,
  primaryColor,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  borderRadius: number;
  primaryColor: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {values.map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(active ? '' : v)}
            style={{
              minWidth: 40,
              height: 32,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius,
              border: `1px solid ${active ? primaryColor : '#e2e8f0'}`,
              background: active ? `${primaryColor}1A` : '#fff',
              color: active ? primaryColor : '#475569',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 120ms, background 120ms',
            }}
          >
            {v}{suffix}
          </button>
        );
      })}
    </div>
  );
}
