import type { FeaturedListingsSettings, Property } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { PropertyPrice } from './PropertyPrice';
import { Home, MapPin, BedDouble, Bath, Car, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Property Card (real data) ───────────────────────────────

function RealPropertyCard({ property, showPrice, showBadge }: { property: Property; showPrice: boolean; showBadge: boolean }) {
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
          <img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-10 h-10 text-gray-200" />
          </div>
        )}
        {showBadge && property.featured && (
          <span className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>
            Destaque
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        {showPrice && (
          <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
        )}
        <p className="text-sm font-medium text-gray-700">{property.title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{property.neighborhood}, {property.city}</span>
        </div>
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

// ─── Horizontal Card (real data, list layout) ────────────────

function RealPropertyCardHorizontal({ property, showPrice, showBadge, isMobile }: { property: Property; showPrice: boolean; showBadge: boolean; isMobile: boolean }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const hasImage = property.images && property.images.length > 0;

  // Mobile: stack vertically (same as card)
  if (isMobile) {
    return <RealPropertyCard property={property} showPrice={showPrice} showBadge={showBadge} />;
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigatePreview({ type: 'property', propertyId: property.id })}
    >
      <div className="relative w-64 shrink-0 bg-gray-100">
        {hasImage ? (
          <img src={property.images[0].url} alt={property.images[0].alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-10 h-10 text-gray-200" />
          </div>
        )}
        {showBadge && property.featured && (
          <span className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>
            Destaque
          </span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center space-y-2">
        <p className="text-base font-medium text-gray-700">{property.title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{property.neighborhood}, {property.city}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        {showPrice && (
          <div className="pt-1">
            <PropertyPrice price={property.price} rentPrice={property.rentPrice} listingType={property.listingType} primaryColor={primaryColor} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder Card (fallback when no properties) ──────────

function PlaceholderCard({ showPrice, showBadge }: { showPrice: boolean; showBadge: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-60">
      <div className="relative aspect-[16/10] bg-gray-100 flex items-center justify-center">
        <Home className="w-10 h-10 text-gray-200" />
        {showBadge && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-md">
            Destaque
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        {showPrice && <div className="h-5 w-28 bg-gray-100 rounded" />}
        <div className="h-4 w-40 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-50 rounded" />
        <div className="flex items-center gap-3 pt-1">
          <div className="h-3 w-12 bg-gray-50 rounded" />
          <div className="h-3 w-12 bg-gray-50 rounded" />
          <div className="h-3 w-12 bg-gray-50 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function FeaturedListingsPreview({ settings }: { settings: FeaturedListingsSettings }) {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  // Responsive columns: mobile=1, tablet=2, desktop=settings
  const effectiveColumns = isMobile ? 1 : isTablet ? Math.min(settings.columns, 2) : settings.columns;

  // Filter featured properties, then fill with regular if needed
  const featured = properties.filter((p) => p.featured && p.active);
  const active = properties.filter((p) => p.active);
  const displayProperties = featured.length > 0 ? featured : active;
  const limited = displayProperties.slice(0, settings.maxItems);

  const hasProperties = limited.length > 0;
  const gridCount = hasProperties ? limited.length : Math.min(settings.maxItems, effectiveColumns * 2);
  const listCount = hasProperties ? limited.length : 3;

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900">{settings.title}</h2>
          <p className="text-gray-500 mt-2" style={{ fontSize: isMobile ? 13 : 16 }}>{settings.subtitle}</p>
        </div>

        {/* Grid layout */}
        {settings.layout === 'grid' && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`, gap: isMobile ? 16 : 24 }}
          >
            {hasProperties
              ? limited.map((p) => (
                  <RealPropertyCard key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} />
                ))
              : Array.from({ length: gridCount }).map((_, i) => (
                  <PlaceholderCard key={i} showPrice={settings.showPrice} showBadge={settings.showBadge} />
                ))}
          </div>
        )}

        {/* Carousel layout */}
        {settings.layout === 'carousel' && (
          <div className="relative">
            <div className="flex gap-4 overflow-hidden" style={{ gap: isMobile ? 12 : 24 }}>
              {hasProperties
                ? limited.slice(0, effectiveColumns).map((p) => (
                    <div key={p.id} className="shrink-0" style={{ width: `calc(${100 / effectiveColumns}% - ${((effectiveColumns - 1) * (isMobile ? 12 : 24)) / effectiveColumns}px)` }}>
                      <RealPropertyCard property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} />
                    </div>
                  ))
                : Array.from({ length: effectiveColumns }).map((_, i) => (
                    <div key={i} className="shrink-0" style={{ width: `calc(${100 / effectiveColumns}% - ${((effectiveColumns - 1) * (isMobile ? 12 : 24)) / effectiveColumns}px)` }}>
                      <PlaceholderCard showPrice={settings.showPrice} showBadge={settings.showBadge} />
                    </div>
                  ))}
            </div>
            {!isMobile && (
              <>
                <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          </div>
        )}

        {/* List layout */}
        {settings.layout === 'list' && (
          <div className="flex flex-col gap-4">
            {hasProperties
              ? limited.map((p) => (
                  <RealPropertyCardHorizontal key={p.id} property={p} showPrice={settings.showPrice} showBadge={settings.showBadge} isMobile={isMobile} />
                ))
              : Array.from({ length: listCount }).map((_, i) => (
                  <PlaceholderCard key={i} showPrice={settings.showPrice} showBadge={settings.showBadge} />
                ))}
          </div>
        )}

        {/* "Ver todos" link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigatePreview({ type: 'search' })}
            className="text-sm font-medium px-6 py-2.5 rounded-lg border-2 transition-colors"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Ver todos os imóveis
          </button>
        </div>
      </div>
    </div>
  );
}
