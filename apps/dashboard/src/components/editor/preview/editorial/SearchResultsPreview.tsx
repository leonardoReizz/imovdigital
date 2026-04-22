import type { Property, SearchPageConfig } from '@imovdigital/types';
import { DEFAULT_SEARCH_PAGE_CONFIG } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { PropertyPrice } from '../PropertyPrice';
import { Search, Home, BedDouble, Bath, Car } from 'lucide-react';
import { Img } from '../../../Img';

function EditorialCardVertical({ property }: { property: Property }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';

  return (
    <div className="cursor-pointer group" onClick={() => navigatePreview({ type: 'property', propertyId: property.id })}>
      <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '4/5' }}>
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-stone-300" /></div>
        )}
        <span className="absolute top-3 left-3 uppercase font-semibold px-2 py-1 bg-white/90" style={{ color: primaryColor, fontSize: 10, letterSpacing: '0.2em' }}>
          {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
        </span>
      </div>
      <div className="pt-4 space-y-1.5">
        <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{property.neighborhood}, {property.city}</p>
        <p className="text-gray-900 leading-tight" style={{ fontSize: 17, fontFamily: 'Georgia, serif' }}>{property.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        <div className="pt-2" style={{ fontFamily: 'Georgia, serif' }}>
          <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor="#111827" />
        </div>
      </div>
    </div>
  );
}

function EditorialCardHorizontal({ property }: { property: Property }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';

  return (
    <div className="flex border-b border-stone-200 cursor-pointer" onClick={() => navigatePreview({ type: 'property', propertyId: property.id })}>
      <div className="relative w-56 shrink-0 bg-stone-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-stone-300" /></div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-center gap-1.5">
        <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{isRent ? 'Aluguel' : 'Venda'}</p>
        <p className="text-gray-900 leading-tight" style={{ fontSize: 19, fontFamily: 'Georgia, serif' }}>{property.title}</p>
        <p className="text-xs text-gray-500">{property.neighborhood}, {property.city}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        <div className="mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ sp, primaryColor }: { sp: SearchPageConfig; primaryColor: string }) {
  return (
    <div className="w-56 shrink-0 space-y-5 pr-6 border-r border-stone-200">
      <h3 className="uppercase font-semibold text-gray-700" style={{ fontSize: 11, letterSpacing: '0.2em' }}>Filtros</h3>
      {sp.showTypeFilter && (
        <div className="space-y-1.5">
          <label className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Tipo</label>
          <div className="h-9 border-b border-stone-300" />
        </div>
      )}
      {sp.showListingFilter && (
        <div className="space-y-1.5">
          <label className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Modalidade</label>
          <div className="h-9 border-b border-stone-300" />
        </div>
      )}
      {sp.showBedroomsFilter && (
        <div className="space-y-1.5">
          <label className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Quartos</label>
          <div className="flex gap-1.5">
            {['1+', '2+', '3+', '4+'].map((opt) => (
              <span key={opt} className="px-2.5 py-1 border border-stone-300 text-xs text-gray-600">{opt}</span>
            ))}
          </div>
        </div>
      )}
      {sp.showCityFilter && (
        <div className="space-y-1.5">
          <label className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Cidade</label>
          <div className="h-9 border-b border-stone-300" />
        </div>
      )}
      {sp.showPriceFilter && (
        <div className="space-y-1.5">
          <label className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Faixa de preço</label>
          <div className="flex gap-2">
            <div className="flex-1 px-2 py-1.5 border-b border-stone-300 text-xs text-gray-400">Mín</div>
            <div className="flex-1 px-2 py-1.5 border-b border-stone-300 text-xs text-gray-400">Máx</div>
          </div>
        </div>
      )}
      <button className="w-full py-2.5 uppercase font-semibold text-white" style={{ backgroundColor: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}>
        Buscar
      </button>
    </div>
  );
}

export function SearchResultsPreview() {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const sp = useEditorStore((s) => s.config?.searchPage) || DEFAULT_SEARCH_PAGE_CONFIG;

  const isMobile = breakpoint === 'mobile';
  const effectiveColumns = isMobile ? 1 : Math.min(sp.columns, breakpoint === 'tablet' ? 2 : 3);
  const useSidebar = sp.filterPosition === 'sidebar' && !isMobile;

  const displayProperties = sp.pagination === 'paginated' ? properties.slice(0, sp.itemsPerPage) : properties;
  const totalPages = sp.pagination === 'paginated' ? Math.ceil(properties.length / sp.itemsPerPage) : 0;

  return (
    <div className="bg-white">
      {/* Editorial heading */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '32px 16px 16px' : '48px 32px 24px' }}>
        <span className="uppercase font-semibold" style={{ color: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}>— Catálogo</span>
        <h1 className="font-bold text-gray-900 mt-2" style={{ fontSize: isMobile ? 30 : 44, fontFamily: 'Georgia, serif' }}>Imóveis disponíveis</h1>
        <p className="text-gray-500 mt-2 text-sm">{properties.length} {properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>
      </div>

      {/* Search bar */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '0 16px' : '0 32px' }}>
        <div className="flex items-center gap-2 bg-stone-50 px-4 py-3 mb-6">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400 truncate">Buscar por cidade, bairro, tipo...</span>
        </div>
      </div>

      <div style={{ padding: isMobile ? '0 16px 32px' : '0 32px 64px' }}>
        <div className="max-w-7xl mx-auto">
          {sp.filterPosition === 'sidebar' && !useSidebar && (
            <div className="flex items-center justify-end mb-6 pb-4 border-b border-stone-200">
              <select className="text-sm bg-transparent text-gray-600 border-none">
                <option>Mais recentes</option>
                <option>Menor preço</option>
              </select>
            </div>
          )}
          {useSidebar && (
            <div className="flex items-center justify-end mb-6 pb-4 border-b border-stone-200">
              <select className="text-sm bg-transparent text-gray-600 border-none">
                <option>Mais recentes</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 24 }}>
            {useSidebar && <FilterSidebar sp={sp} primaryColor={primaryColor} />}

            <div className="flex-1 min-w-0">
              {displayProperties.length > 0 ? (
                sp.layout === 'list' ? (
                  <div className="flex flex-col">
                    {displayProperties.map((p) => <EditorialCardHorizontal key={p.id} property={p} />)}
                  </div>
                ) : (
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`, columnGap: 32, rowGap: 56 }}>
                    {displayProperties.map((p) => <EditorialCardVertical key={p.id} property={p} />)}
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <Home className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Nenhum imóvel cadastrado ainda.</p>
                </div>
              )}

              {sp.pagination === 'paginated' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-10 h-10 text-sm font-mono flex items-center justify-center ${
                        i === 0 ? 'text-white' : 'border border-stone-300 text-gray-600'
                      }`}
                      style={i === 0 ? { backgroundColor: primaryColor } : {}}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '0 16px 24px' : '0 32px 32px' }}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigatePreview({ type: 'home' })}
            className="text-xs uppercase font-semibold transition-colors"
            style={{ color: primaryColor, letterSpacing: '0.2em' }}
          >
            ← Voltar à página inicial
          </button>
        </div>
      </div>
    </div>
  );
}
