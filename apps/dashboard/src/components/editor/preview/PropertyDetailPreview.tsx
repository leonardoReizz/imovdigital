import { useState } from 'react';
import type { Property, PropertyDetailConfig } from '@imovdigital/types';
import { DEFAULT_PROPERTY_DETAIL_CONFIG } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { formatPrice } from '@imovdigital/utils';
import { PropertyPrice } from './PropertyPrice';
import { ImageLightbox } from './ImageLightbox';
import { MapCircle } from './MapCircle';
import { Img } from '../../Img';
import {
  ArrowLeft,
  Building2,
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
        <Img src={images[0].url} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
      </div>
      {images.slice(1, 5).map((img, i) => (
        <div key={i} className="overflow-hidden cursor-pointer relative group" onClick={() => onImageClick(i + 1)}>
          <Img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
      <Img
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
      <Img src={images[0].url} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
      <Img src={images[current].url} alt={images[current].alt} className="w-full h-full object-cover cursor-pointer" onClick={() => onImageClick(current)} />
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

// ─── Contact Card (form only — for sidebar/bottom) ──────────

function ContactCard({ pd, primaryColor }: { pd: PropertyDetailConfig; primaryColor: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Interessado?</h3>

      {pd.showContactForm && (
        <div className="space-y-2">
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Seu nome *</div>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Seu e-mail</div>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Seu telefone</div>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 h-16">Mensagem (opcional)</div>
          <button className="w-full py-2 text-white font-medium rounded-lg text-sm" style={{ backgroundColor: primaryColor }}>
            Enviar mensagem
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Floating Chat Bubble (form only) ────────────────────────

function FloatingChatBubble({ pd, primaryColor }: { pd: PropertyDetailConfig; primaryColor: string }) {
  const [open, setOpen] = useState(false);
  const tooltip = pd.chatTooltip || 'Precisa de ajuda?';

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Expanded panel */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
            <span className="text-sm font-semibold">Fale conosco</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
          </div>

          {/* Body — contact form only */}
          {pd.showContactForm && (
            <div className="p-4 space-y-2">
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Seu nome *</div>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Seu e-mail</div>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 h-14">Mensagem</div>
              <button className="w-full py-2 text-white font-medium rounded-lg text-sm" style={{ backgroundColor: primaryColor }}>
                Enviar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className="relative">
        {!open && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {tooltip}
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          {open ? (
            <span className="text-xl leading-none">&times;</span>
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Quick Action Buttons (WhatsApp + Phone on page) ─────────

function QuickActionButtons({ pd, isMobile }: { pd: PropertyDetailConfig; isMobile: boolean }) {
  if (!pd.showWhatsApp && !pd.showPhone) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
      {pd.showWhatsApp && (
        <button className="flex-1 py-2.5 bg-green-500 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
      )}
      {pd.showPhone && (
        <button className="flex-1 py-2.5 bg-gray-900 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <PhoneIcon className="w-4 h-4" />
          Ligar
        </button>
      )}
    </div>
  );
}

// ─── Similar Properties ──────────────────────────────────────

function SimilarProperties({ currentProperty, isMobile }: { currentProperty: Property; isMobile: boolean }) {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');

  // Only same city, then rank by neighborhood/type/listingType
  const scored = properties
    .filter((p) => p.id !== currentProperty.id && p.active && p.city === currentProperty.city)
    .map((p) => {
      let score = 0;
      if (p.neighborhood === currentProperty.neighborhood) score += 3;
      if (p.type === currentProperty.type) score += 2;
      if (p.listingType === currentProperty.listingType) score += 1;
      return { property: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, isMobile ? 4 : 6);

  if (scored.length === 0) return null;

  const columns = isMobile ? 1 : 3;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Imóveis Semelhantes</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {scored.map(({ property: p }) => {
          const hasImage = p.images && p.images.length > 0;
          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigatePreview({ type: 'property', propertyId: p.id })}
            >
              <div className="relative aspect-[16/10] bg-gray-100">
                {hasImage ? (
                  <Img src={p.images[0].url} alt={p.images[0].alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-200" />
                  </div>
                )}
                <span
                  className="absolute top-2 left-2 text-white text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: primaryColor }}
                >
                  {p.listingType === 'RENT' ? 'Aluguel' : p.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <PropertyPrice price={p.price} rentPrice={p.rentPrice} listingType={p.listingType} primaryColor={primaryColor} />
                <p className="text-sm font-medium text-gray-700 truncate">{p.title}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {p.neighborhood}, {p.city}
                </p>
              </div>
            </div>
          );
        })}
      </div>
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

              {/* Date + Share */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Anúncio criado em {new Date(property.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Price */}
            <PropertyPrice
              price={property.price}
              rentPrice={property.rentPrice}
              listingType={property.listingType}
              size={isMobile ? 'sm' : 'lg'}
              primaryColor={primaryColor}
            />

            {/* WhatsApp + Phone buttons (always on page) */}
            <QuickActionButtons pd={pd} isMobile={isMobile} />

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

            {/* Similar properties */}
            {pd.showSimilar && (
              <SimilarProperties currentProperty={property} isMobile={isMobile} />
            )}

            {/* Contact bottom position — explicit bottom OR sidebar on mobile */}
            {(pd.contactPosition === 'bottom' || (pd.contactPosition === 'sidebar' && isCompact)) && (
              <ContactCard pd={pd} primaryColor={primaryColor} />
            )}
          </div>

          {/* Sidebar contact — desktop only */}
          {showSidebar && (
            <div style={{ width: 320, flexShrink: 0 }}>
              <div className="sticky" style={{ top: 80 }}>
                <ContactCard pd={pd} primaryColor={primaryColor} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating chat bubble */}
      {pd.contactPosition === 'floating' && (
        <FloatingChatBubble pd={pd} primaryColor={primaryColor} />
      )}
    </div>
  );
}
