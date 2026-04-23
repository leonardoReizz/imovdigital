import type { FeaturedListingsSettings, Property } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { PropertyPrice } from './PropertyPrice';
import { Home, MapPin, BedDouble, Bath, Car } from 'lucide-react';
import { Img } from '../../Img';
import { MOCK_PROPERTIES } from '../../../lib/mockProperties';

function RealPropertyCard({ property, showPrice, showBadge, primaryColor, onClick }: {
  property: Property; showPrice: boolean; showBadge: boolean; primaryColor: string; onClick: () => void;
}) {
  const hasImage = property.images && property.images.length > 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-200 transition-all h-full" onClick={onClick}>
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-gray-200" /></div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>
            {property.listingType === 'RENT' ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
          </span>
          {showBadge && property.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-md">Destaque</span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-1.5">
        {showPrice && (
          <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
        )}
        <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {property.neighborhood}, {property.city}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          {property.area > 0 && <span>{property.area}m²</span>}
        </div>
      </div>
    </div>
  );
}

function HorizontalCard({ property, showPrice, showBadge, primaryColor, onClick }: {
  property: Property; showPrice: boolean; showBadge: boolean; primaryColor: string; onClick: () => void;
}) {
  const hasImage = property.images && property.images.length > 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg flex transition-all" onClick={onClick}>
      <div className="relative w-48 sm:w-56 shrink-0 bg-gray-100 overflow-hidden">
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-gray-200" /></div>
        )}
        {showBadge && property.featured && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-md">Destaque</span>
        )}
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center gap-1.5">
        <p className="text-base font-medium text-gray-900">{property.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{property.neighborhood}, {property.city}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          {property.area > 0 && <span>{property.area}m²</span>}
        </div>
        {showPrice && (
          <div className="mt-1">
            <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderCard({ showPrice }: { showPrice: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-60">
      <div className="relative aspect-[16/10] bg-gray-100 flex items-center justify-center">
        <Home className="w-10 h-10 text-gray-200" />
      </div>
      <div className="p-4 space-y-2">
        {showPrice && <div className="h-5 w-28 bg-gray-100 rounded" />}
        <div className="h-4 w-40 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-50 rounded" />
      </div>
    </div>
  );
}

export function FeaturedListingsPreview({ settings }: { settings: FeaturedListingsSettings }) {
  const realProperties = useEditorStore((s) => s.properties);
  const properties = realProperties.length > 0 ? realProperties : MOCK_PROPERTIES;
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  const effectiveColumns = isMobile ? 1 : isTablet ? Math.min(settings.columns, 2) : settings.columns;

  const featured = properties.filter((p) => p.featured && p.active);
  const active = properties.filter((p) => p.active);
  const displayProperties = featured.length > 0 ? featured : active;
  const limited = displayProperties.slice(0, settings.maxItems);

  const hasProperties = limited.length > 0;
  const gridCount = hasProperties ? limited.length : Math.min(settings.maxItems, effectiveColumns * 2);

  const handleClick = (id: string) => navigatePreview({ type: 'property', propertyId: id });

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900">{settings.title}</h2>
          {settings.subtitle && (
            <p className="text-gray-500 mt-2" style={{ fontSize: isMobile ? 14 : 16 }}>{settings.subtitle}</p>
          )}
        </div>

        {settings.layout === 'list' ? (
          <div className="flex flex-col gap-4">
            {hasProperties
              ? limited.map((p) => (
                  <HorizontalCard key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => handleClick(p.id)} />
                ))
              : Array.from({ length: Math.min(settings.maxItems, 3) }).map((_, i) => (
                  <PlaceholderCard key={i} showPrice={settings.showPrice} />
                ))}
          </div>
        ) : settings.layout === 'carousel' ? (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'thin' }}>
            {hasProperties
              ? limited.map((p) => (
                  <div key={p.id} className="shrink-0 snap-start" style={{ width: isMobile ? 240 : 280 }}>
                    <RealPropertyCard property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => handleClick(p.id)} />
                  </div>
                ))
              : Array.from({ length: Math.min(settings.maxItems, 4) }).map((_, i) => (
                  <div key={i} className="shrink-0 snap-start" style={{ width: isMobile ? 240 : 280 }}>
                    <PlaceholderCard showPrice={settings.showPrice} />
                  </div>
                ))}
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
              gap: isMobile ? 16 : 24,
            }}
          >
            {hasProperties
              ? limited.map((p) => (
                  <RealPropertyCard key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => handleClick(p.id)} />
                ))
              : Array.from({ length: gridCount }).map((_, i) => (
                  <PlaceholderCard key={i} showPrice={settings.showPrice} />
                ))}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => navigatePreview({ type: 'search' })}
            className="text-sm font-medium px-6 py-2.5 rounded-lg border-2 transition-colors hover:opacity-80"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Ver todos os imóveis
          </button>
        </div>
      </div>
    </div>
  );
}
