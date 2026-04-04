'use client';

import { useState, useEffect } from 'react';
import type { SearchBarSettings } from '@imovdigital/types';
import { PROPERTY_TYPE_LABELS } from '@imovdigital/types';
import { Search } from 'lucide-react';
import { CLIENT_API_URL } from '@/lib/client-api';
import { CustomSelect } from '../CustomSelect';

const RADIUS_MAP = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' };
const FIELD_LABELS: Record<string, string> = { tipo: 'Tipo', cidade: 'Cidade', bairro: 'Bairro', preco: 'Modalidade', quartos: 'Quartos' };

const TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const LISTING_OPTIONS = [{ value: 'SALE', label: 'Venda' }, { value: 'RENT', label: 'Aluguel' }];
const BEDROOM_OPTIONS = [{ value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' }, { value: '4', label: '4+' }];

interface Props {
  settings: SearchBarSettings;
  primaryColor: string;
  embedded?: boolean;
  cities?: string[];
  tenantSlug?: string;
}

export function SearchBar({ settings, primaryColor, embedded, cities = [], tenantSlug }: Props) {
  const [selectedCity, setSelectedCity] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedCity || !tenantSlug) {
      setNeighborhoods([]);
      return;
    }
    fetch(`${CLIENT_API_URL}/public/${tenantSlug}/filters?city=${encodeURIComponent(selectedCity)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setNeighborhoods(data.neighborhoods || []))
      .catch(() => setNeighborhoods([]));
  }, [selectedCity, tenantSlug]);

  const set = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));

  function renderField(field: string) {
    switch (field) {
      case 'tipo':
        return (
          <>
            <input type="hidden" name="type" value={values.type || ''} />
            <CustomSelect options={TYPE_OPTIONS} value={values.type || ''} onChange={(v) => set('type', v)} placeholder="Todos" />
          </>
        );
      case 'cidade':
        return (
          <>
            <input type="hidden" name="city" value={selectedCity} />
            <CustomSelect
              options={cities.map((c) => ({ value: c, label: c }))}
              value={selectedCity}
              onChange={(v) => { setSelectedCity(v); set('city', v); }}
              placeholder="Todas"
            />
          </>
        );
      case 'bairro':
        return (
          <>
            <input type="hidden" name="neighborhood" value={values.neighborhood || ''} />
            <CustomSelect
              options={neighborhoods.map((n) => ({ value: n, label: n }))}
              value={values.neighborhood || ''}
              onChange={(v) => set('neighborhood', v)}
              placeholder={selectedCity ? 'Todos' : 'Selecione a cidade'}
            />
          </>
        );
      case 'preco':
        return (
          <>
            <input type="hidden" name="listingType" value={values.listingType || ''} />
            <CustomSelect options={LISTING_OPTIONS} value={values.listingType || ''} onChange={(v) => set('listingType', v)} placeholder="Venda/Aluguel" />
          </>
        );
      case 'quartos':
        return (
          <>
            <input type="hidden" name="bedrooms" value={values.bedrooms || ''} />
            <CustomSelect options={BEDROOM_OPTIONS} value={values.bedrooms || ''} onChange={(v) => set('bedrooms', v)} placeholder="Qualquer" />
          </>
        );
      default:
        return null;
    }
  }

  const bar = (
    <form action="/imoveis" className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 p-3 shadow-lg" style={{ backgroundColor: settings.backgroundColor, borderRadius: RADIUS_MAP[settings.borderRadius] }}>
      {settings.fields.map((field) => (
        <div key={field} className="flex-1 px-3 py-2 sm:border-r border-gray-100 last:border-0">
          <label className="text-xs text-gray-400 block mb-0.5">{FIELD_LABELS[field]}</label>
          {renderField(field)}
        </div>
      ))}
      <button type="submit" className="p-3 text-white rounded-lg shrink-0 ml-2" style={{ backgroundColor: primaryColor }}>
        <Search className="w-5 h-5" />
      </button>
    </form>
  );

  if (embedded) return bar;
  if (settings.position !== 'standalone') return null;
  return <section className="px-4 sm:px-8 py-6 bg-gray-50">{bar}</section>;
}
