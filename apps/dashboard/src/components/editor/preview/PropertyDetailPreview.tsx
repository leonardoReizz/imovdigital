import { useState } from 'react';
import type { Property, PropertyDetailConfig } from '@imovdigital/types';
import { DEFAULT_PROPERTY_DETAIL_CONFIG } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { formatPrice } from '@imovdigital/utils';
import { PropertyPrice } from './PropertyPrice';
import { ImageLightbox } from './ImageLightbox';
import { MapCircle } from './MapCircle';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize,
  Heart,
  Share2,
  MessageCircle,
  Phone as PhoneIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Expand,
} from 'lucide-react';

// ─── Gallery Components ──────────────────────────────────────

function GalleryGrid({ images, onImageClick }: { images: Property['images']; onImageClick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[420px]">
      <div className="col-span-2 row-span-2 overflow-hidden cursor-pointer relative group" onClick={() => onImageClick(0)}>
        <img src={images[0].url} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
      </div>
      {images.slice(1, 5).map((img, i) => (
        <div key={i} className="overflow-hidden cursor-pointer relative group" onClick={() => onImageClick(i + 1)}>
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      ))}
      {images.length < 5 &&
        Array.from({ length: 4 - Math.min(images.length - 1, 4) }).map((_, i) => (
          <div key={`ph-${i}`} className="bg-gray-100" />
        ))}
    </div>
  );
}

function GalleryCarousel({ images, onImageClick }: { images: Property['images']; onImageClick: (i: number) => void }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative h-[420px] overflow-hidden">
      <img
        src={images[current].url}
        alt={images[current].alt}
        className="w-full h-full object-cover cursor-pointer"
        onClick={() => onImageClick(current)}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Expand className="w-8 h-8 text-white/50" />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GallerySingle({ images, onImageClick }: { images: Property['images']; onImageClick: (i: number) => void }) {
  return (
    <div className="relative h-[350px] overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
      <img src={images[0].url} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          +{images.length - 1} fotos
        </div>
      )}
    </div>
  );
}

// ─── Mobile Gallery (always carousel) ────────────────────────

function GalleryMobile({ images, onImageClick }: { images: Property['images']; onImageClick: (i: number) => void }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative h-[250px] overflow-hidden">
      <img src={images[current].url} alt={images[current].alt} className="w-full h-full object-cover cursor-pointer" onClick={() => onImageClick(current)} />
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Contact Card ────────────────────────────────────────────

function ContactCard({ pd, primaryColor, floating }: { pd: PropertyDetailConfig; primaryColor: string; floating?: boolean }) {
  const baseClass = floating
    ? 'fixed bottom-4 right-4 z-40 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-3'
    : 'border border-gray-200 rounded-xl p-5 space-y-4';

  return (
    <div className={baseClass}>
      <h3 className="text-base font-semibold text-gray-900">Interessado?</h3>

      {pd.showContactForm && (
        <div className="space-y-2">
          <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
          <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
          <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
          <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg" />
          <button className="w-full py-2 text-white font-medium rounded-lg text-sm" style={{ backgroundColor: primaryColor }}>
            Enviar mensagem
          </button>
        </div>
      )}

      {pd.showWhatsApp && (
        <button className="w-full py-2 border-2 border-green-500 text-green-600 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
      )}

      {pd.showPhone && (
        <button className="w-full py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
          <PhoneIcon className="w-4 h-4" />
          Ligar
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function PropertyDetailPreview({ property }: { property: Property }) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const pd = useEditorStore((s) => s.config?.propertyDetail) || DEFAULT_PROPERTY_DETAIL_CONFIG;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasImages = property.images && property.images.length > 0;
  const isMobile = breakpoint === 'mobile';
  const isCompact = breakpoint === 'mobile' || breakpoint === 'tablet';
  const showSidebar = pd.contactPosition === 'sidebar' && !isCompact;

  const lightboxImages = hasImages
    ? property.images.map((img) => ({ url: img.url, alt: img.alt }))
    : [];

  return (
    <div>
      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Back button */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => navigatePreview({ type: 'home' })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>

      {/* Gallery */}
      <div className="relative">
        {hasImages ? (
          isMobile ? (
            <GalleryMobile images={property.images} onImageClick={setLightboxIndex} />
          ) : pd.galleryStyle === 'carousel' ? (
            <GalleryCarousel images={property.images} onImageClick={setLightboxIndex} />
          ) : pd.galleryStyle === 'single' ? (
            <GallerySingle images={property.images} onImageClick={setLightboxIndex} />
          ) : (
            <GalleryGrid images={property.images} onImageClick={setLightboxIndex} />
          )
        ) : (
          <div style={{ height: isCompact ? 250 : 420 }} className="bg-gray-100 flex items-center justify-center">
            <p className="text-gray-300 text-sm">Sem imagens</p>
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button className="p-2 bg-white/90 rounded-full shadow"><Heart className="w-4 h-4 text-gray-600" /></button>
          <button className="p-2 bg-white/90 rounded-full shadow"><Share2 className="w-4 h-4 text-gray-600" /></button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '24px 16px' : '32px' }}>
        <div style={{ display: 'flex', flexDirection: showSidebar ? 'row' : 'column', gap: showSidebar ? 40 : 24 }}>
          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title & badges */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded text-white" style={{ backgroundColor: primaryColor }}>
                  {property.listingType === 'RENT' ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {property.type === 'APARTMENT' ? 'Apartamento' : property.type === 'HOUSE' ? 'Casa' : property.type === 'COMMERCIAL' ? 'Comercial' : property.type === 'LAND' ? 'Terreno' : 'Rural'}
                </span>
              </div>
              <h1 style={{ fontSize: isMobile ? 20 : 24 }} className="font-bold text-gray-900">{property.title}</h1>

              {/* Address - configurable */}
              {pd.showAddress ? (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{property.fullAddress}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{property.neighborhood}, {property.city} - {property.state}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <PropertyPrice
              price={property.price}
              rentPrice={property.rentPrice}
              listingType={property.listingType}
              size={isMobile ? 'sm' : 'lg'}
              primaryColor={primaryColor}
            />

            {/* Quick action buttons (mobile/floating) */}
            {isCompact && (pd.showWhatsApp || pd.showPhone) && (
              <div className="flex gap-2">
                {pd.showWhatsApp && (
                  <button className="flex-1 py-2.5 bg-green-500 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
                {pd.showPhone && (
                  <button className="flex-1 py-2.5 bg-gray-900 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    Ligar
                  </button>
                )}
              </div>
            )}

            {/* Features */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Maximize className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">{property.area}m²</p>
                  <p className="text-xs text-gray-400">Área</p>
                </div>
              </div>
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BedDouble className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-semibold">{property.bedrooms}</p>
                    <p className="text-xs text-gray-400">Quartos</p>
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Bath className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-semibold">{property.bathrooms}</p>
                    <p className="text-xs text-gray-400">Banheiros</p>
                  </div>
                </div>
              )}
              {property.parkingSpots > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Car className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-semibold">{property.parkingSpots}</p>
                    <p className="text-xs text-gray-400">Vagas</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {pd.showDescription && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {pd.showAmenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Comodidades</h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional costs */}
            {pd.showCosts && (property.condoFee || property.iptuYearly) && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Custos adicionais</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  {property.condoFee && (
                    <div>
                      <p className="text-xs text-gray-400">Condomínio</p>
                      <p className="text-sm font-medium text-gray-700">{formatPrice(property.condoFee)}/mês</p>
                    </div>
                  )}
                  {property.iptuYearly && (
                    <div>
                      <p className="text-xs text-gray-400">IPTU anual</p>
                      <p className="text-sm font-medium text-gray-700">{formatPrice(property.iptuYearly)}/ano</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {pd.showMap && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Localização</h2>
                <MapCircle
                  latitude={property.latitude}
                  longitude={property.longitude}
                  radius={pd.mapRadius}
                  primaryColor={primaryColor}
                />
              </div>
            )}

            {/* Contact bottom position */}
            {pd.contactPosition === 'bottom' && (
              <ContactCard pd={pd} primaryColor={primaryColor} />
            )}
          </div>

          {/* Sidebar contact */}
          {showSidebar && (
            <div style={{ width: 280, flexShrink: 0 }}>
              <div className="sticky" style={{ top: 80 }}>
                <ContactCard pd={pd} primaryColor={primaryColor} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating contact */}
      {pd.contactPosition === 'floating' && !isCompact && (
        <ContactCard pd={pd} primaryColor={primaryColor} floating />
      )}

      {/* Mobile floating quick actions */}
      {pd.contactPosition === 'floating' && isCompact && (pd.showWhatsApp || pd.showPhone) && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-30">
          {pd.showWhatsApp && (
            <button className="flex-1 py-2.5 bg-green-500 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          )}
          {pd.showPhone && (
            <button className="flex-1 py-2.5 bg-gray-900 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Ligar
            </button>
          )}
          {pd.showContactForm && (
            <button className="flex-1 py-2.5 text-white font-medium rounded-lg text-sm" style={{ backgroundColor: primaryColor }}>
              Contato
            </button>
          )}
        </div>
      )}
    </div>
  );
}
