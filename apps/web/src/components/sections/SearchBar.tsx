'use client';

import { useState, useEffect } from 'react';
import type { SearchBarSettings } from '@imovdigital/types';
import { PROPERTY_TYPE_LABELS } from '@imovdigital/types';
import { Search } from 'lucide-react';
import { CLIENT_API_URL } from '@/lib/client-api';

const RADIUS_MAP = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' };
const FIELD_LABELS: Record<string, string> = { tipo: 'Tipo', cidade: 'Cidade', bairro: 'Bairro', preco: 'Modalidade', quartos: 'Quartos' };

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

  function renderField(field: string) {
    switch (field) {
      case 'tipo':
        return (
          <select name="type" className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer" defaultValue="">
            <option value="">Todos</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        );
      case 'cidade':
        return (
          <select
            name="city"
            className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Todas</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        );
      case 'bairro':
        return (
          <select name="neighborhood" className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer" defaultValue="" disabled={!selectedCity}>
            <option value="">{selectedCity ? 'Todos' : 'Selecione a cidade'}</option>
            {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        );
      case 'preco':
        return (
          <select name="listingType" className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer" defaultValue="">
            <option value="">Venda/Aluguel</option>
            <option value="SALE">Venda</option>
            <option value="RENT">Aluguel</option>
          </select>
        );
      case 'quartos':
        return (
          <select name="bedrooms" className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer" defaultValue="">
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
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
