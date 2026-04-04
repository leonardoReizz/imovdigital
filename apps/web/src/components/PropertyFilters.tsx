'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CLIENT_API_URL } from '@/lib/client-api';
import { CustomSelect } from './CustomSelect';
import type { SearchPageConfig } from '@imovdigital/types';
import { DEFAULT_SEARCH_PAGE_CONFIG, PROPERTY_TYPE_LABELS } from '@imovdigital/types';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const LISTING_OPTIONS = [
  { value: '', label: 'Venda e Aluguel' },
  { value: 'SALE', label: 'Venda' },
  { value: 'RENT', label: 'Aluguel' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'featured', label: 'Destaques' },
];

interface Props {
  primaryColor: string;
  total: number;
  tenantSlug: string;
  searchConfig?: SearchPageConfig;
}

export function PropertyFilters({ primaryColor, total, tenantSlug, searchConfig }: Props) {
  const sp = searchConfig || DEFAULT_SEARCH_PAGE_CONFIG;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const listingType = searchParams.get('listingType') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const parkingSpots = searchParams.get('parkingSpots') || '';
  const city = searchParams.get('city') || '';
  const neighborhood = searchParams.get('neighborhood') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';

  const hasFilters = !!(type || listingType || bedrooms || bathrooms || parkingSpots || city || neighborhood || minPrice || maxPrice);

  // Load cities + neighborhoods
  const loadFilters = (filterCity?: string) => {
    const url = filterCity
      ? `${CLIENT_API_URL}/public/${tenantSlug}/filters?city=${encodeURIComponent(filterCity)}`
      : `${CLIENT_API_URL}/public/${tenantSlug}/filters`;
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setCities(data.cities || []);
        setNeighborhoods(data.neighborhoods || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadFilters(city || undefined);
  }, [tenantSlug]);

  const handleCityChange = (newCity: string) => {
    updateParams({ city: newCity, neighborhood: '' });
    loadFilters(newCity || undefined);
  };

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    router.push(`/imoveis?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/imoveis');
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      {/* Search bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateParams({ q: fd.get('q') as string });
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              name="q"
              type="text"
              defaultValue={q}
              placeholder="Buscar por cidade, bairro, tipo..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasFilters
                ? 'bg-[--color-primary]/10 border-[--color-primary]/30 text-[--color-primary]'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                {[type, listingType, bedrooms, bathrooms, parkingSpots, city, neighborhood, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            {/* Row 1: selects */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sp.showTypeFilter && (
                <CustomSelect options={TYPE_OPTIONS} value={type} onChange={(v) => updateParams({ type: v })} placeholder="Todos os tipos" />
              )}
              {sp.showListingFilter && (
                <CustomSelect options={LISTING_OPTIONS} value={listingType} onChange={(v) => updateParams({ listingType: v })} placeholder="Venda e Aluguel" />
              )}
              {sp.showCityFilter && (
                <CustomSelect
                  options={cities.map((c) => ({ value: c, label: c }))}
                  value={city}
                  onChange={handleCityChange}
                  placeholder="Todas as cidades"
                />
              )}
              {sp.showNeighborhoodFilter && (
                <CustomSelect
                  options={neighborhoods.map((n) => ({ value: n, label: n }))}
                  value={neighborhood}
                  onChange={(v) => updateParams({ neighborhood: v })}
                  placeholder="Todos os bairros"
                />
              )}
            </div>

            {/* Row 2: checkboxes for bedrooms, bathrooms, parking */}
            {(sp.showBedroomsFilter || (sp.showBathroomsFilter ?? true) || (sp.showParkingFilter ?? true)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sp.showBedroomsFilter && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Quartos</label>
                    <div className="flex gap-1.5">
                      {BEDROOM_OPTIONS.filter((o) => o.value).map((o) => (
                        <button key={o.value} onClick={() => updateParams({ bedrooms: bedrooms === o.value ? '' : o.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bedrooms === o.value ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                {(sp.showBathroomsFilter ?? true) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Banheiros</label>
                    <div className="flex gap-1.5">
                      {['1', '2', '3', '4'].map((v) => (
                        <button key={v} onClick={() => updateParams({ bathrooms: bathrooms === v ? '' : v })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bathrooms === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                        >{v}+</button>
                      ))}
                    </div>
                  </div>
                )}
                {(sp.showParkingFilter ?? true) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Vagas</label>
                    <div className="flex gap-1.5">
                      {['1', '2', '3', '4'].map((v) => (
                        <button key={v} onClick={() => updateParams({ parkingSpots: parkingSpots === v ? '' : v })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${parkingSpots === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                        >{v}+</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Row 3: price range */}
            {sp.showPriceFilter && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Faixa de preço (R$)</label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    placeholder="Mínimo"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  />
                  <span className="text-gray-400 self-center">—</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    placeholder="Máximo"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count + sort */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </p>
          <CustomSelect options={SORT_OPTIONS} value={sort} onChange={(v) => updateParams({ sort: v })} placeholder="Ordenar" className="w-44" />
        </div>
      </div>
    </div>
  );
}
