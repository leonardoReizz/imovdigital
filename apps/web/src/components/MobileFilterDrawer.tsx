'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { CLIENT_API_URL } from '@/lib/client-api';
import { CustomSelect } from './CustomSelect';
import type { SearchPageConfig } from '@imovdigital/types';
import { PROPERTY_TYPE_LABELS } from '@imovdigital/types';

interface Props {
  primaryColor: string;
  tenantSlug: string;
  sp: SearchPageConfig;
  total: number;
}

export function MobileFilterDrawer({ primaryColor, tenantSlug, sp, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const params = Object.fromEntries(searchParams.entries());
  const [local, setLocal] = useState(params);

  const hasFilters = !!(params.type || params.listingType || params.bedrooms || params.bathrooms || params.parkingSpots || params.city || params.neighborhood || params.minPrice || params.maxPrice);

  useEffect(() => {
    const url = local.city
      ? `${CLIENT_API_URL}/public/${tenantSlug}/filters?city=${encodeURIComponent(local.city)}`
      : `${CLIENT_API_URL}/public/${tenantSlug}/filters`;
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setCities(d.cities || []);
        setNeighborhoods(d.neighborhoods || []);
      })
      .catch(() => {});
  }, [tenantSlug, local.city]);

  const set = (key: string, value: string) => {
    setLocal((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      if (key === 'city') delete next.neighborhood;
      return next;
    });
  };

  const apply = () => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(local)) {
      if (v) qs.set(k, v);
    }
    router.push(`/imoveis?${qs.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setLocal({});
    router.push('/imoveis');
    setOpen(false);
  };

  const toggleChip = (key: string, value: string) => {
    set(key, local[key] === value ? '' : value);
  };

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} {total === 1 ? 'imóvel' : 'imóveis'}</p>
        <button
          onClick={() => { setLocal(Object.fromEntries(searchParams.entries())); setOpen(true); }}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasFilters && (
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              {Object.keys(params).filter((k) => k !== 'sort' && k !== 'page' && params[k]).length}
            </span>
          )}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Filtros</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {sp.showTypeFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Tipo</label>
                  <CustomSelect
                    options={Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                    value={local.type || ''}
                    onChange={(v) => set('type', v)}
                    placeholder="Todos"
                  />
                </div>
              )}

              {sp.showListingFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Modalidade</label>
                  <CustomSelect
                    options={[{ value: 'SALE', label: 'Venda' }, { value: 'RENT', label: 'Aluguel' }]}
                    value={local.listingType || ''}
                    onChange={(v) => set('listingType', v)}
                    placeholder="Todos"
                  />
                </div>
              )}

              {sp.showBedroomsFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Quartos</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['1', '2', '3', '4', '5'].map((v) => (
                      <button key={v} type="button" onClick={() => toggleChip('bedrooms', v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${local.bedrooms === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600'}`}
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${local.bathrooms === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600'}`}
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${local.parkingSpots === v ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]' : 'border-gray-200 text-gray-600'}`}
                      >{v}+</button>
                    ))}
                  </div>
                </div>
              )}

              {sp.showCityFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Cidade</label>
                  <CustomSelect
                    options={cities.map((c) => ({ value: c, label: c }))}
                    value={local.city || ''}
                    onChange={(v) => set('city', v)}
                    placeholder="Todas"
                  />
                </div>
              )}

              {sp.showNeighborhoodFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Bairro</label>
                  <CustomSelect
                    options={neighborhoods.map((n) => ({ value: n, label: n }))}
                    value={local.neighborhood || ''}
                    onChange={(v) => set('neighborhood', v)}
                    placeholder={local.city ? 'Todos' : 'Selecione a cidade'}
                  />
                </div>
              )}

              {sp.showPriceFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Faixa de preço</label>
                  <div className="flex gap-2">
                    <input type="number" value={local.minPrice || ''} onChange={(e) => set('minPrice', e.target.value)} placeholder="Mín" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                    <input type="number" value={local.maxPrice || ''} onChange={(e) => set('maxPrice', e.target.value)} placeholder="Máx" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button onClick={clear} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
                Limpar
              </button>
              <button onClick={apply} className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: primaryColor }}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
