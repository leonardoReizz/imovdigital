import type { Property } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
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

function PropertyCard({ property }: { property: Property }) {
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
          <img
            src={property.images[0].url}
            alt={property.images[0].alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-10 h-10 text-gray-200" />
          </div>
        )}
        <span
          className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5 rounded-md"
          style={{ backgroundColor: primaryColor }}
        >
          {property.listingType === 'RENT' ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
        <p className="text-sm font-medium text-gray-700">{property.title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{property.neighborhood}, {property.city}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>
          )}
          {property.parkingSpots > 0 && (
            <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>
          )}
          <span>{property.area}m²</span>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsPreview() {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const columns = isMobile ? 1 : isTablet ? 2 : 3;

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
            {!isMobile && (
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shrink-0">
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
          <div className="flex items-center justify-between mb-6 gap-2">
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

          {properties.length > 0 ? (
            <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: isMobile ? 16 : 24 }}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Home className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Nenhum imóvel cadastrado ainda.</p>
              <p className="text-gray-400 text-xs mt-1">
                Cadastre imóveis no painel para vê-los aqui.
              </p>
            </div>
          )}
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
