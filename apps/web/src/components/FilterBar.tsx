import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Home,
  DollarSign,
  MapPin,
  PawPrint,
  Sofa,
  Landmark,
} from 'lucide-react';
import { PROPERTY_TYPE_LABELS, BEDROOM_OPTIONS, SORT_OPTIONS } from '../lib/constants';

export interface Filters {
  q: string;
  type: string;
  listingType: string;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  petFriendly: boolean;
  furnished: boolean;
  financingAvailable: boolean;
  sort: string;
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  type: '',
  listingType: '',
  neighborhood: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  petFriendly: false,
  furnished: false,
  financingAvailable: false,
  sort: 'newest',
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  neighborhoods: string[];
  totalResults: number;
}

export function FilterBar({ filters, onChange, neighborhoods, totalResults }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [field]: value });
  };

  const activeFilterCount = [
    filters.type,
    filters.listingType,
    filters.neighborhood,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.petFriendly,
    filters.furnished,
    filters.financingAvailable,
  ].filter(Boolean).length;

  const clearAll = () => onChange({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main search row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Buscar por bairro, cidade ou palavra-chave..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Quick filters */}
          <div className="flex gap-2">
            <FilterSelect
              value={filters.listingType}
              onChange={(v) => update('listingType', v)}
              placeholder="Comprar / Alugar"
              options={[
                { value: '', label: 'Todos' },
                { value: 'SALE', label: 'Comprar' },
                { value: 'RENT', label: 'Alugar' },
              ]}
            />
            <FilterSelect
              value={filters.type}
              onChange={(v) => update('type', v)}
              placeholder="Tipo"
              options={[
                { value: '', label: 'Todos os tipos' },
                ...Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
              ]}
            />
            <FilterSelect
              value={filters.bedrooms}
              onChange={(v) => update('bedrooms', v)}
              placeholder="Quartos"
              options={BEDROOM_OPTIONS}
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Neighborhood */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <MapPin className="w-3.5 h-3.5" /> Bairro
              </label>
              <FilterSelect
                value={filters.neighborhood}
                onChange={(v) => update('neighborhood', v)}
                placeholder="Todos os bairros"
                options={[
                  { value: '', label: 'Todos os bairros' },
                  ...neighborhoods.map((n) => ({ value: n, label: n })),
                ]}
                fullWidth
              />
            </div>

            {/* Price range */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <DollarSign className="w-3.5 h-3.5" /> Faixa de Preço
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice}
                  onChange={(e) => update('minPrice', e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice}
                  onChange={(e) => update('maxPrice', e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <Home className="w-3.5 h-3.5" /> Características
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  icon={<PawPrint className="w-3.5 h-3.5" />}
                  label="Aceita Pet"
                  active={filters.petFriendly}
                  onClick={() => update('petFriendly', !filters.petFriendly)}
                />
                <FilterChip
                  icon={<Sofa className="w-3.5 h-3.5" />}
                  label="Mobiliado"
                  active={filters.furnished}
                  onClick={() => update('furnished', !filters.furnished)}
                />
                <FilterChip
                  icon={<Landmark className="w-3.5 h-3.5" />}
                  label="Financia"
                  active={filters.financingAvailable}
                  onClick={() => update('financingAvailable', !filters.financingAvailable)}
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                Ordenar por
              </label>
              <FilterSelect
                value={filters.sort}
                onChange={(v) => update('sort', v)}
                placeholder="Ordenar"
                options={SORT_OPTIONS}
                fullWidth
              />
            </div>
          </div>

          {/* Active filters + clear */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{totalResults}</span> imóveis encontrados
              </p>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  fullWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}) {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none px-3 pr-8 py-3 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
          fullWidth ? 'w-full' : ''
        } ${value ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

function FilterChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
