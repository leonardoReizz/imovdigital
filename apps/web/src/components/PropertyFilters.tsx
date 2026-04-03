'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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

  // Load cities on mount
  useEffect(() => {
    fetch(`/api/public/${tenantSlug}/filters`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []))
      .catch(() => {});
  }, [tenantSlug]);

  // When city select changes, fetch neighborhoods immediately
  const handleCityChange = (newCity: string) => {
    // Update URL
    updateParams({ city: newCity, neighborhood: '' });

    // Fetch neighborhoods for this city
    if (!newCity) {
      setNeighborhoods([]);
      return;
    }
    fetch(`/api/public/${tenantSlug}/filters?city=${encodeURIComponent(newCity)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setNeighborhoods(data.neighborhoods || []))
      .catch(() => setNeighborhoods([]));
  };

  // On mount, if city is already selected in URL, load its neighborhoods
  useEffect(() => {
    if (city) {
      fetch(`/api/public/${tenantSlug}/filters?city=${encodeURIComponent(city)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => setNeighborhoods(data.neighborhoods || []))
        .catch(() => {});
    }
  }, []);

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
                ? 'bg-blue-50 border-blue-200 text-blue-700'
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
                <select value={type} onChange={(e) => updateParams({ type: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              {sp.showListingFilter && (
                <select value={listingType} onChange={(e) => updateParams({ listingType: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                  {LISTING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              {sp.showCityFilter && (
                <select value={city} onChange={(e) => handleCityChange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                  <option value="">Todas as cidades</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {sp.showNeighborhoodFilter && (
                <select value={neighborhood} onChange={(e) => updateParams({ neighborhood: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                  <option value="">Todos os bairros</option>
                  {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bedrooms === o.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${bathrooms === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${parkingSpots === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
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
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
