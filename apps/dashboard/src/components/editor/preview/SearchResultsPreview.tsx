import type { Property, SearchPageConfig } from '@imovdigital/types';
import { DEFAULT_SEARCH_PAGE_CONFIG } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { MOCK_PROPERTIES } from '../../../lib/mockProperties';
import { PropertyPrice } from './PropertyPrice';
import {
  MapPin,
  BedDouble,
  Bath,
  Car,
  Search,
  SlidersHorizontal,
  Home,
} from 'lucide-react';
import { Img } from '../../Img';

// ─── Card vertical ───────────────────────────────────────────

function PropertyCardVertical({ property }: { property: Property }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const hasImage = property.images && property.images.length > 0;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigatePreview({ type: 'property', propertyId: property.id })}
    >
      <div className="relative aspect-[16/10] bg-gray-100">
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-gray-200" /></div>
        )}
        <span className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>
          {property.listingType === 'RENT' ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
        <p className="text-sm font-medium text-gray-700">{property.title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{property.neighborhood}, {property.city}</div>
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
      </div>
    </div>
  );
}

// ─── Card horizontal ─────────────────────────────────────────

function PropertyCardHorizontal({ property }: { property: Property }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const hasImage = property.images && property.images.length > 0;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigatePreview({ type: 'property', propertyId: property.id })}
    >
      <div className="relative w-48 shrink-0 bg-gray-100">
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-gray-200" /></div>
        )}
      </div>
      <div className="p-4 flex-1 space-y-1.5">
        <p className="text-sm font-medium text-gray-700">{property.title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{property.neighborhood}, {property.city}</div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
      </div>
    </div>
  );
}

// ─── Sidebar filter block ────────────────────────────────────

function CheckboxGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <span key={opt} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
            {opt}
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterSidebar({ sp, primaryColor }: { sp: SearchPageConfig; primaryColor: string }) {
  return (
    <div className="w-56 shrink-0 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
      {sp.showTypeFilter && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Tipo</label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg" />
        </div>
      )}
      {sp.showListingFilter && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Modalidade</label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg" />
        </div>
      )}
      {sp.showBedroomsFilter && (
        <CheckboxGroup label="Quartos" options={['1+', '2+', '3+', '4+', '5+']} />
      )}
      {(sp.showBathroomsFilter ?? true) && (
        <CheckboxGroup label="Banheiros" options={['1+', '2+', '3+', '4+']} />
      )}
      {(sp.showParkingFilter ?? true) && (
        <CheckboxGroup label="Vagas" options={['1+', '2+', '3+', '4+']} />
      )}
      {sp.showCityFilter && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Cidade</label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg" />
        </div>
      )}
      {sp.showNeighborhoodFilter && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Bairro</label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg" />
        </div>
      )}
      {sp.showPriceFilter && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Faixa de preço</label>
          <div className="flex gap-2">
            <div className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-400">Mín</div>
            <div className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-400">Máx</div>
          </div>
        </div>
      )}
      <button className="w-full py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: primaryColor }}>
        Buscar
      </button>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export function SearchResultsPreview() {
  const realProperties = useEditorStore((s) => s.properties);
  const properties = realProperties.length > 0 ? realProperties : MOCK_PROPERTIES;
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const sp = useEditorStore((s) => s.config?.searchPage) || DEFAULT_SEARCH_PAGE_CONFIG;

  const isMobile = breakpoint === 'mobile';
  const effectiveColumns = isMobile ? 1 : Math.min(sp.columns, breakpoint === 'tablet' ? 2 : sp.columns);
  const useSidebar = sp.filterPosition === 'sidebar' && !isMobile;
  const hasActiveFilters = sp.showTypeFilter || sp.showListingFilter || sp.showBedroomsFilter || sp.showCityFilter || sp.showNeighborhoodFilter || sp.showPriceFilter;

  // Pagination preview
  const displayProperties = sp.pagination === 'paginated'
    ? properties.slice(0, sp.itemsPerPage)
    : properties;
  const totalPages = sp.pagination === 'paginated'
    ? Math.ceil(properties.length / sp.itemsPerPage)
    : 0;

  return (
    <div>
      {/* Search header */}
      <div className="bg-gray-50 border-b border-gray-200" style={{ padding: isMobile ? '16px' : '24px 32px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400 truncate">Buscar por cidade, bairro, tipo...</span>
            </div>
            {sp.filterPosition === 'top' && hasActiveFilters && !isMobile && (
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: isMobile ? '16px' : '32px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 gap-2">
            <p className="text-sm text-gray-500 truncate">
              {properties.length > 0
                ? `${properties.length} ${properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`
                : 'Nenhum imóvel encontrado'}
            </p>
            <select className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 shrink-0">
              <option>Mais recentes</option>
              <option>Menor preço</option>
              <option>Maior preço</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {/* Sidebar filters */}
            {useSidebar && hasActiveFilters && (
              <FilterSidebar sp={sp} primaryColor={primaryColor} />
            )}

            {/* Property grid/list */}
            <div className="flex-1 min-w-0">
              {displayProperties.length > 0 ? (
                sp.layout === 'list' ? (
                  <div className="flex flex-col gap-4">
                    {displayProperties.map((p) => (
                      <PropertyCardHorizontal key={p.id} property={p} />
                    ))}
                  </div>
                ) : (
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`, gap: isMobile ? 16 : 24 }}>
                    {displayProperties.map((p) => (
                      <PropertyCardVertical key={p.id} property={p} />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <Home className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Nenhum imóvel cadastrado ainda.</p>
                </div>
              )}

              {/* Pagination */}
              {sp.pagination === 'paginated' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center ${
                        i === 0 ? 'text-white' : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                      style={i === 0 ? { backgroundColor: primaryColor } : {}}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              )}

              {/* Scroll indicator */}
              {sp.pagination === 'infinite_scroll' && properties.length > 0 && (
                <div className="text-center mt-8">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    Carregando mais imóveis...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to home */}
      <div style={{ padding: isMobile ? '0 16px 16px' : '0 32px 32px' }}>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigatePreview({ type: 'home' })}
            className="text-sm font-medium transition-colors"
            style={{ color: primaryColor }}
          >
            &larr; Voltar à página inicial
          </button>
        </div>
      </div>
    </div>
  );
}
