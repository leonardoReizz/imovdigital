import type { FeaturedListingsSettings, Property } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { PropertyPrice } from '../PropertyPrice';
import { Home, ArrowRight, BedDouble, Bath, Car, MapPin } from 'lucide-react';
import { Img } from '../../../Img';

function EditorialCard({ property, showPrice, showBadge, primaryColor, onClick }: {
  property: Property; showPrice: boolean; showBadge: boolean; primaryColor: string; onClick: () => void;
}) {
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '4/5' }}>
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-stone-300" /></div>
        )}
        <span className="absolute top-3 left-3 uppercase font-semibold px-2 py-1 bg-white/90" style={{ color: primaryColor, fontSize: 10, letterSpacing: '0.2em' }}>
          {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
        </span>
        {showBadge && property.featured && (
          <span className="absolute top-3 right-3 uppercase font-semibold px-2 py-1 bg-amber-400 text-amber-900" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Destaque</span>
        )}
      </div>
      <div className="pt-4 pb-2 space-y-1.5">
        <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{property.neighborhood}, {property.city}</p>
        <p className="text-gray-900 leading-tight" style={{ fontSize: 17, fontFamily: 'Georgia, serif' }}>{property.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        {showPrice && (
          <div className="pt-2" style={{ fontFamily: 'Georgia, serif' }}>
            <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor="#111827" />
          </div>
        )}
      </div>
    </div>
  );
}

function HorizontalEditorialCard({ property, showPrice, showBadge, primaryColor, onClick }: {
  property: Property; showPrice: boolean; showBadge: boolean; primaryColor: string; onClick: () => void;
}) {
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';
  return (
    <div className="flex border-b border-stone-200 cursor-pointer hover:bg-stone-50/50 transition-colors" onClick={onClick}>
      <div className="relative w-56 sm:w-72 shrink-0 bg-stone-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {hasImage ? (
          <Img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-stone-300" /></div>
        )}
        {showBadge && property.featured && (
          <span className="absolute top-3 left-3 uppercase font-semibold px-2 py-1 bg-white/90" style={{ color: primaryColor, fontSize: 10, letterSpacing: '0.2em' }}>Destaque</span>
        )}
      </div>
      <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center gap-1.5">
        <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{isRent ? 'Aluguel' : 'Venda'}</p>
        <p className="text-gray-900 leading-tight" style={{ fontSize: 19, fontFamily: 'Georgia, serif' }}>{property.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{property.neighborhood}, {property.city}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        {showPrice && (
          <div className="mt-2" style={{ fontFamily: 'Georgia, serif' }}>
            <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor="#111827" />
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div>
      <div className="bg-stone-100 flex items-center justify-center" style={{ aspectRatio: '4/5' }}>
        <Home className="w-10 h-10 text-stone-300" />
      </div>
      <div className="pt-4 space-y-2">
        <div className="h-2.5 w-24 bg-stone-100 rounded" />
        <div className="h-4 w-44 bg-stone-100 rounded" />
        <div className="h-3 w-32 bg-stone-50 rounded" />
      </div>
    </div>
  );
}

export function FeaturedListingsPreview({ settings }: { settings: FeaturedListingsSettings }) {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const effectiveColumns = isMobile ? 1 : isTablet ? Math.min(settings.columns, 2) : Math.min(settings.columns, 3);

  const featured = properties.filter((p) => p.featured && p.active);
  const active = properties.filter((p) => p.active);
  const displayProperties = featured.length > 0 ? featured : active;
  const limited = displayProperties.slice(0, settings.maxItems);
  const hasProperties = limited.length > 0;
  const gridCount = hasProperties ? limited.length : Math.min(settings.maxItems, effectiveColumns * 2);

  return (
    <div style={{ padding: isMobile ? '48px 16px' : '80px 32px' }} className="bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div className="max-w-xl">
            <span className="uppercase font-semibold mb-3 inline-block" style={{ color: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}>Seleção</span>
            <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: isMobile ? 28 : 44, fontFamily: 'Georgia, serif' }}>{settings.title}</h2>
            {settings.subtitle && <p className="text-gray-500 mt-3" style={{ fontSize: isMobile ? 14 : 16 }}>{settings.subtitle}</p>}
          </div>
          {!isMobile && (
            <button
              onClick={() => navigatePreview({ type: 'search' })}
              className="flex items-center gap-2 uppercase font-medium hover:opacity-70 transition-opacity"
              style={{ color: primaryColor, fontSize: 12, letterSpacing: '0.15em' }}
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {settings.layout === 'list' ? (
          <div className="flex flex-col">
            {hasProperties
              ? limited.map((p) => (
                  <HorizontalEditorialCard key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => navigatePreview({ type: 'property', propertyId: p.id })} />
                ))
              : Array.from({ length: Math.min(settings.maxItems, 3) }).map((_, i) => <PlaceholderCard key={i} />)}
          </div>
        ) : settings.layout === 'carousel' ? (
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4" style={{ scrollbarWidth: 'thin' }}>
            {hasProperties
              ? limited.map((p) => (
                  <div key={p.id} className="shrink-0 snap-start" style={{ width: isMobile ? 260 : 320 }}>
                    <EditorialCard property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => navigatePreview({ type: 'property', propertyId: p.id })} />
                  </div>
                ))
              : Array.from({ length: Math.min(settings.maxItems, 4) }).map((_, i) => (
                  <div key={i} className="shrink-0 snap-start" style={{ width: isMobile ? 260 : 320 }}>
                    <PlaceholderCard />
                  </div>
                ))}
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
              columnGap: isMobile ? 16 : 32,
              rowGap: isMobile ? 32 : 56,
            }}
          >
            {hasProperties
              ? limited.map((p) => (
                  <EditorialCard key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} primaryColor={primaryColor} onClick={() => navigatePreview({ type: 'property', propertyId: p.id })} />
                ))
              : Array.from({ length: gridCount }).map((_, i) => <PlaceholderCard key={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
