import { useState } from 'react';
import type { Property, PropertyDetailConfig } from '@imovdigital/types';
import { DEFAULT_PROPERTY_DETAIL_CONFIG } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { formatPrice } from '@imovdigital/utils';
import { ImageLightbox } from '../ImageLightbox';
import { MapCircle } from '../MapCircle';
import { Img } from '../../../Img';
import {
  MapPin, BedDouble, Bath, Car, Maximize,
  MessageCircle, Phone as PhoneIcon, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';

function SectionHeading({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <span className="uppercase font-semibold text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>— {kicker}</span>
      <h2 className="text-gray-900 mt-1" style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{children}</h2>
    </div>
  );
}

function GalleryEditorial({ images, onImageClick, isMobile }: { images: Property['images']; onImageClick: (i: number) => void; isMobile: boolean }) {
  const [current, setCurrent] = useState(0);
  if (isMobile) {
    return (
      <div className="relative" style={{ aspectRatio: '4/3' }}>
        <Img src={images[current].url} alt={images[current].alt} className="w-full h-full object-cover cursor-pointer" onClick={() => onImageClick(current)} />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 font-mono">{current + 1} / {images.length}</div>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: '2fr 1fr', height: 480 }}>
      <div className="overflow-hidden cursor-pointer relative group" onClick={() => onImageClick(0)}>
        <Img src={images[0].url} alt={images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="grid gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="overflow-hidden cursor-pointer bg-stone-100" onClick={() => onImageClick(Math.min(i, images.length - 1))}>
            {images[i] ? (
              <Img src={images[i].url} alt={images[i].alt} className="w-full h-full object-cover" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCardEditorial({ pd, primaryColor }: { pd: PropertyDetailConfig; primaryColor: string }) {
  return (
    <div className="bg-stone-50 p-7 space-y-4">
      <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>— Receba uma proposta</p>
      <p className="text-gray-900" style={{ fontSize: 22, fontFamily: 'Georgia, serif' }}>Tenho interesse</p>
      {pd.showContactForm && (
        <div className="space-y-2">
          <div className="px-3 py-2.5 bg-white border-b border-stone-300 text-sm text-gray-400">Seu nome *</div>
          <div className="px-3 py-2.5 bg-white border-b border-stone-300 text-sm text-gray-400">Seu e-mail</div>
          <div className="px-3 py-2.5 bg-white border-b border-stone-300 text-sm text-gray-400">Seu telefone</div>
          <div className="px-3 py-2.5 bg-white border-b border-stone-300 text-sm text-gray-400 h-16">Mensagem (opcional)</div>
          <button className="w-full py-3 mt-2 uppercase font-semibold text-white" style={{ backgroundColor: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}>
            Enviar mensagem
          </button>
        </div>
      )}
    </div>
  );
}

function SimilarPropertiesEditorial({ currentProperty, isMobile }: { currentProperty: Property; isMobile: boolean }) {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);

  const scored = properties
    .filter((p) => p.id !== currentProperty.id && p.active && p.city === currentProperty.city)
    .slice(0, isMobile ? 4 : 6);
  if (scored.length === 0) return null;

  return (
    <div>
      <SectionHeading kicker="Exclusivos">Imóveis semelhantes</SectionHeading>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${isMobile ? 1 : 3}, 1fr)`, columnGap: 24, rowGap: 40 }}>
        {scored.map((p) => {
          const hasImage = p.images && p.images.length > 0;
          return (
            <div key={p.id} className="cursor-pointer group" onClick={() => navigatePreview({ type: 'property', propertyId: p.id })}>
              <div className="bg-stone-100" style={{ aspectRatio: '4/5' }}>
                {hasImage ? <Img src={p.images[0].url} alt={p.images[0].alt} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="pt-3">
                <p className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{p.neighborhood}</p>
                <p className="text-gray-900 mt-1" style={{ fontSize: 16, fontFamily: 'Georgia, serif' }}>{p.title}</p>
                <p className="text-gray-900 mt-1" style={{ fontSize: 16, fontFamily: 'Georgia, serif' }}>{formatPrice(p.price)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;

  const lightboxImages = hasImages ? property.images.map((img) => ({ url: img.url, alt: img.alt })) : [];

  return (
    <div className="bg-white">
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <ImageLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '20px 16px 0' : '24px 32px 0' }}>
        <div className="flex items-center gap-2 uppercase text-gray-400" style={{ fontSize: 11, letterSpacing: '0.2em' }}>
          <button onClick={() => navigatePreview({ type: 'home' })} className="hover:text-gray-900">Início</button>
          <span>·</span>
          <button onClick={() => navigatePreview({ type: 'search' })} className="hover:text-gray-900">Imóveis</button>
          <span>·</span>
          <span className="text-gray-900 truncate">{property.title}</span>
        </div>
      </div>

      {/* Title block */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '16px 16px 24px' : '24px 32px 32px' }}>
        <span className="inline-block uppercase font-semibold pb-1 mb-3 border-b-2" style={{ color: primaryColor, borderColor: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}>
          {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda · Aluguel' : 'Venda'}
        </span>
        <h1 className="font-bold text-gray-900 leading-[1.05]" style={{ fontSize: isMobile ? 32 : 56, fontFamily: 'Georgia, serif' }}>{property.title}</h1>
        <p className="flex items-center gap-1.5 mt-3 text-gray-500"><MapPin className="w-4 h-4" />
          {pd.showAddress ? property.fullAddress : `${property.neighborhood}, ${property.city} - ${property.state}`}
        </p>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '0 16px' : '0 32px' }}>
        {hasImages ? (
          <GalleryEditorial images={property.images} onImageClick={setLightboxIndex} isMobile={isMobile} />
        ) : (
          <div style={{ height: isCompact ? 250 : 480 }} className="bg-stone-100 flex items-center justify-center">
            <p className="text-stone-300 text-sm">Sem imagens</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'flex', flexDirection: showSidebar ? 'row' : 'column', gap: showSidebar ? 48 : 24 }}>
            <div className="flex-1 min-w-0 space-y-12">
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 py-6 border-y border-stone-200">
                <div className="flex items-baseline gap-2">
                  <Maximize className="w-5 h-5 text-gray-300 self-center" />
                  <span className="text-gray-900" style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{property.area}</span>
                  <span className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>m²</span>
                </div>
                {property.bedrooms > 0 && (
                  <div className="flex items-baseline gap-2">
                    <BedDouble className="w-5 h-5 text-gray-300 self-center" />
                    <span className="text-gray-900" style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{property.bedrooms}</span>
                    <span className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Quartos</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-baseline gap-2">
                    <Bath className="w-5 h-5 text-gray-300 self-center" />
                    <span className="text-gray-900" style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{property.bathrooms}</span>
                    <span className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Banhos</span>
                  </div>
                )}
                {property.parkingSpots > 0 && (
                  <div className="flex items-baseline gap-2">
                    <Car className="w-5 h-5 text-gray-300 self-center" />
                    <span className="text-gray-900" style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}>{property.parkingSpots}</span>
                    <span className="uppercase text-gray-400" style={{ fontSize: 10, letterSpacing: '0.15em' }}>Vagas</span>
                  </div>
                )}
              </div>

              {pd.showDescription && (
                <div>
                  <SectionHeading kicker="Sobre o imóvel">Descrição</SectionHeading>
                  <p className="text-gray-700 whitespace-pre-line" style={{ fontSize: 16, lineHeight: 1.85 }}>{property.description}</p>
                </div>
              )}

              {pd.showAmenities && property.amenities.length > 0 && (
                <div>
                  <SectionHeading kicker="Detalhes">Comodidades</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8" style={{ rowGap: 8 }}>
                    {property.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-3 text-gray-700 py-2 border-b border-stone-100" style={{ fontSize: 15 }}>
                        <Check className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pd.showCosts && (property.condoFee || property.iptuYearly) && (
                <div className="bg-stone-50 p-8">
                  <SectionHeading kicker="Valores">Custos adicionais</SectionHeading>
                  <div className="grid grid-cols-2 gap-6">
                    {property.condoFee && (
                      <div>
                        <p className="uppercase text-gray-400 mb-1" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Condomínio</p>
                        <p className="text-gray-900" style={{ fontSize: 20, fontFamily: 'Georgia, serif' }}>
                          {formatPrice(property.condoFee)}<span className="text-sm font-normal text-gray-500">/mês</span>
                        </p>
                      </div>
                    )}
                    {property.iptuYearly && (
                      <div>
                        <p className="uppercase text-gray-400 mb-1" style={{ fontSize: 10, letterSpacing: '0.2em' }}>IPTU anual</p>
                        <p className="text-gray-900" style={{ fontSize: 20, fontFamily: 'Georgia, serif' }}>
                          {formatPrice(property.iptuYearly)}<span className="text-sm font-normal text-gray-500">/ano</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pd.showMap && (
                <div>
                  <SectionHeading kicker="Onde fica">Localização</SectionHeading>
                  <MapCircle latitude={property.latitude} longitude={property.longitude} radius={pd.mapRadius} primaryColor={primaryColor} />
                </div>
              )}

              {pd.showSimilar && <SimilarPropertiesEditorial currentProperty={property} isMobile={isMobile} />}

              {(pd.contactPosition === 'bottom' || (pd.contactPosition === 'sidebar' && isCompact)) && (
                <ContactCardEditorial pd={pd} primaryColor={primaryColor} />
              )}
            </div>

            {showSidebar && (
              <div style={{ width: 360, flexShrink: 0 }}>
                <div className="sticky space-y-5" style={{ top: 80 }}>
                  <div className="bg-white border border-stone-200 p-7">
                    <p className="uppercase text-gray-400 mb-2" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Valor</p>
                    <p className="font-semibold text-gray-900 leading-tight" style={{ fontSize: 36, fontFamily: 'Georgia, serif' }}>
                      {formatPrice(mainPrice)}{isRent && <span className="text-base font-normal text-gray-500"> /mês</span>}
                    </p>
                    {(pd.showWhatsApp || pd.showPhone) && (
                      <div className="flex flex-col gap-2 mt-5">
                        {pd.showWhatsApp && (
                          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white font-medium rounded-full text-sm">
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                          </button>
                        )}
                        {pd.showPhone && (
                          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white font-medium rounded-full text-sm">
                            <PhoneIcon className="w-4 h-4" /> Ligar agora
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <ContactCardEditorial pd={pd} primaryColor={primaryColor} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
