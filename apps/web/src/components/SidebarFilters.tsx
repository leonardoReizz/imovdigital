'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { CLIENT_API_URL } from '@/lib/client-api';
import type { SearchPageConfig } from '@imovdigital/types';
import { PROPERTY_TYPE_LABELS } from '@imovdigital/types';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const LISTING_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SALE', label: 'Venda' },
  { value: 'RENT', label: 'Aluguel' },
];

const NUM_OPTIONS = ['1', '2', '3', '4', '5'];

interface Props {
  primaryColor: string;
  tenantSlug: string;
  sp: SearchPageConfig;
}

export function SidebarFilters({ primaryColor, tenantSlug, sp }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const type = searchParams.get('type') || '';
  const listingType = searchParams.get('listingType') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const parkingSpots = searchParams.get('parkingSpots') || '';
  const city = searchParams.get('city') || '';
  const neighborhood = searchParams.get('neighborhood') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const hasFilters = !!(type || listingType || bedrooms || bathrooms || parkingSpots || city || neighborhood || minPrice || maxPrice);

  // Load cities
  useEffect(() => {
    fetch(`${CLIENT_API_URL}/public/${tenantSlug}/filters`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []))
      .catch(() => {});
  }, [tenantSlug]);

  // Load neighborhoods when city changes
  useEffect(() => {
    if (!city) { setNeighborhoods([]); return; }
    fetch(`${CLIENT_API_URL}/public/${tenantSlug}/filters?city=${encodeURIComponent(city)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setNeighborhoods(d.neighborhoods || []))
      .catch(() => setNeighborhoods([]));
  }, [tenantSlug, city]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    router.push(`/imoveis?${params.toString()}`);
  };

  const clearFilters = () => router.push('/imoveis');

  const toggleChip = (key: string, value: string) => {
    const current = searchParams.get(key) || '';
    updateParams({ [key]: current === value ? '' : value });
  };

  return (
    <div className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {sp.showTypeFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Tipo</label>
            <select value={type} onChange={(e) => updateParams({ type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {sp.showListingFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Modalidade</label>
            <select value={listingType} onChange={(e) => updateParams({ listingType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              {LISTING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {sp.showBedroomsFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Quartos</label>
            <div className="flex flex-wrap gap-1.5">
              {NUM_OPTIONS.map((v) => (
                <button key={v} type="button" onClick={() => toggleChip('bedrooms', v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bedrooms === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >{v}+</button>
              ))}
            </div>
          </div>
        )}

        {(sp.showBathroomsFilter ?? true) && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Banheiros</label>
            <div className="flex flex-wrap gap-1.5">
              {['1', '2', '3', '4'].map((v) => (
                <button key={v} type="button" onClick={() => toggleChip('bathrooms', v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bathrooms === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >{v}+</button>
              ))}
            </div>
          </div>
        )}

        {(sp.showParkingFilter ?? true) && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Vagas</label>
            <div className="flex flex-wrap gap-1.5">
              {['1', '2', '3', '4'].map((v) => (
                <button key={v} type="button" onClick={() => toggleChip('parkingSpots', v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${parkingSpots === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >{v}+</button>
              ))}
            </div>
          </div>
        )}

        {sp.showCityFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Cidade</label>
            <select value={city} onChange={(e) => updateParams({ city: e.target.value, neighborhood: '' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option value="">Todas</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {sp.showNeighborhoodFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Bairro</label>
            <select value={neighborhood} onChange={(e) => updateParams({ neighborhood: e.target.value })} disabled={!city} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none disabled:opacity-50">
              <option value="">{city ? 'Todos' : 'Selecione a cidade'}</option>
              {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        {sp.showPriceFilter && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Faixa de preço</label>
            <div className="flex gap-2">
              <input type="number" value={minPrice} onChange={(e) => updateParams({ minPrice: e.target.value })} placeholder="Mín" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none" />
              <input type="number" value={maxPrice} onChange={(e) => updateParams({ maxPrice: e.target.value })} placeholder="Máx" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
