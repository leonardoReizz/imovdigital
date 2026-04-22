import Link from 'next/link';
import type { Property, PropertyDetailConfig } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { ImageGallery } from '@/components/ImageGallery';
import { PropertyCard } from './PropertyCard';
import { LeadForm } from '@/components/LeadForm';
import { ShareButton } from '@/components/ShareButton';
import {
  MapPin, BedDouble, Bath, Car, Maximize,
  MessageCircle, Phone, Check, Calendar,
} from 'lucide-react';
import { formatListingDate } from '@/lib/dates';

interface Props {
  property: Property;
  similar: Property[];
  pd: PropertyDetailConfig;
  primaryColor: string;
  tenantSlug: string;
}

function SectionHeading({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">— {kicker}</span>
      <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 mt-1">{children}</h2>
    </div>
  );
}

export function PropertyDetailLayout({ property, similar, pd, primaryColor, tenantSlug }: Props) {
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;
  const images = property.images || [];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-400">
          <Link href="/" className="hover:text-gray-900">Início</Link>
          <span>·</span>
          <Link href="/imoveis" className="hover:text-gray-900">Imóveis</Link>
          <span>·</span>
          <span className="text-gray-900 truncate">{property.title}</span>
        </div>
      </div>

      {/* Editorial title block + share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-9">
            <span className="inline-block uppercase tracking-[0.2em] text-[11px] font-semibold pb-1 mb-3 border-b-2" style={{ color: primaryColor, borderColor: primaryColor }}>
              {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda · Aluguel' : 'Venda'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05]">{property.title}</h1>
            <p className="flex items-center gap-1.5 mt-4 text-gray-500"><MapPin className="w-4 h-4" />
              {pd.showAddress ? property.fullAddress : `${property.neighborhood}, ${property.city} - ${property.state}`}
            </p>
          </div>
          <div className="lg:col-span-3 flex lg:justify-end items-center gap-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {formatListingDate(property.createdAt as unknown as string, property.updatedAt as unknown as string)}
            </p>
            <ShareButton title={property.title} primaryColor={primaryColor} />
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <ImageGallery images={images} galleryStyle={pd.galleryStyle || 'grid'} title={property.title} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className={`flex flex-col ${pd.contactPosition === 'sidebar' ? 'lg:flex-row' : ''} gap-12`}>
          <div className="flex-1 min-w-0 space-y-14">

            {/* Stats strip */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 py-6 border-y border-stone-200">
              <div className="flex items-baseline gap-2">
                <Maximize className="w-5 h-5 text-gray-300 self-center" />
                <span className="font-serif text-2xl text-gray-900">{property.area}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">m²</span>
              </div>
              {property.bedrooms > 0 && (
                <div className="flex items-baseline gap-2">
                  <BedDouble className="w-5 h-5 text-gray-300 self-center" />
                  <span className="font-serif text-2xl text-gray-900">{property.bedrooms}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Quartos</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-baseline gap-2">
                  <Bath className="w-5 h-5 text-gray-300 self-center" />
                  <span className="font-serif text-2xl text-gray-900">{property.bathrooms}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Banhos</span>
                </div>
              )}
              {property.parkingSpots > 0 && (
                <div className="flex items-baseline gap-2">
                  <Car className="w-5 h-5 text-gray-300 self-center" />
                  <span className="font-serif text-2xl text-gray-900">{property.parkingSpots}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Vagas</span>
                </div>
              )}
            </div>

            {pd.showDescription && (
              <div>
                <SectionHeading kicker="Sobre o imóvel">Descrição</SectionHeading>
                <p className="text-base text-gray-700 leading-[1.85] whitespace-pre-line max-w-3xl">{property.description}</p>
              </div>
            )}

            {pd.showAmenities && property.amenities.length > 0 && (
              <div>
                <SectionHeading kicker="Detalhes">Comodidades</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 text-base text-gray-700 py-2 border-b border-stone-100">
                      <Check className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />{a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pd.showCosts && (property.condoFee || property.iptuYearly) && (
              <div className="bg-stone-50 p-8 max-w-3xl">
                <SectionHeading kicker="Valores">Custos adicionais</SectionHeading>
                <div className="grid grid-cols-2 gap-6">
                  {property.condoFee && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Condomínio</p>
                      <p className="font-serif text-xl text-gray-900">{formatPrice(property.condoFee)}<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    </div>
                  )}
                  {property.iptuYearly && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">IPTU anual</p>
                      <p className="font-serif text-xl text-gray-900">{formatPrice(property.iptuYearly)}<span className="text-sm font-normal text-gray-500">/ano</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pd.showMap && property.latitude && property.longitude && (
              <div>
                <SectionHeading kicker="Onde fica">Localização</SectionHeading>
                <div className="w-full aspect-[16/9] overflow-hidden relative bg-stone-100">
                  <iframe
                    src={`https://maps.google.com/maps?ll=${property.latitude},${property.longitude}&z=${pd.mapRadius <= 500 ? 15 : 14}&t=m&output=embed`}
                    className="absolute inset-0 w-full h-full border-0"
                    style={{ pointerEvents: 'none' }}
                    loading="lazy"
                    title="Localização"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 rounded-full border-[3px]" style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}80` }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-lg" style={{ backgroundColor: primaryColor }} />
                  </div>
                </div>
              </div>
            )}

            {pd.showSimilar && similar.length > 0 && (
              <div>
                <SectionHeading kicker="Exclusivos">Imóveis semelhantes</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {similar.map((p) => (
                    <PropertyCard key={p.id} property={p} primaryColor={primaryColor} />
                  ))}
                </div>
              </div>
            )}

            {(pd.contactPosition === 'bottom' || pd.contactPosition === 'sidebar') && pd.showContactForm && (
              <div className={`bg-stone-50 p-8 space-y-5 ${pd.contactPosition === 'sidebar' ? 'lg:hidden' : ''}`}>
                <SectionHeading kicker="Fale com a gente">Tenho interesse</SectionHeading>
                <LeadForm tenantSlug={tenantSlug} propertyId={property.id} propertyTitle={property.title} primaryColor={primaryColor} />
              </div>
            )}
          </div>

          {/* Editorial sidebar */}
          {pd.contactPosition === 'sidebar' && (
            <div className="hidden lg:block w-96 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Price card */}
                <div className="bg-white border border-stone-200 p-7">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Valor</p>
                  <p className="font-serif text-4xl font-semibold text-gray-900 leading-tight">
                    {formatPrice(mainPrice)}{isRent && <span className="text-base font-normal text-gray-500"> /mês</span>}
                  </p>
                  {property.listingType === 'BOTH' && property.rentPrice && (
                    <p className="text-base font-medium text-gray-700 mt-2">{formatPrice(property.rentPrice)} <span className="text-xs text-gray-500">/mês</span></p>
                  )}
                  {(pd.showWhatsApp || pd.showPhone) && (
                    <div className="flex flex-col gap-2 mt-6">
                      {pd.showWhatsApp && (
                        <a href={`https://wa.me/${(pd.whatsAppNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.title}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors text-sm">
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                      )}
                      {pd.showPhone && (
                        <a href={`tel:${(pd.phoneNumber || '').replace(/\D/g, '')}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-sm">
                          <Phone className="w-4 h-4" /> Ligar agora
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {pd.showContactForm && (
                  <div className="bg-stone-50 p-7 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">— Receba uma proposta</p>
                    <p className="font-serif text-xl text-gray-900">Tenho interesse</p>
                    <LeadForm tenantSlug={tenantSlug} propertyId={property.id} propertyTitle={property.title} primaryColor={primaryColor} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* For non-sidebar contact positions, show a simple price block in main */}
          {pd.contactPosition !== 'sidebar' && (
            <div className="lg:hidden mt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Valor</p>
              <p className="font-serif text-4xl font-semibold text-gray-900">
                {formatPrice(mainPrice)}{isRent && <span className="text-base font-normal text-gray-500"> /mês</span>}
              </p>
            </div>
          )}
        </div>

        {/* Mobile price + actions when sidebar mode (since sidebar is hidden on mobile) */}
        {pd.contactPosition === 'sidebar' && (
          <div className="lg:hidden mt-8 bg-stone-50 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Valor</p>
            <p className="font-serif text-3xl font-semibold text-gray-900 mb-4">
              {formatPrice(mainPrice)}{isRent && <span className="text-base font-normal text-gray-500"> /mês</span>}
            </p>
            {(pd.showWhatsApp || pd.showPhone) && (
              <div className="flex gap-2">
                {pd.showWhatsApp && (
                  <a href={`https://wa.me/${(pd.whatsAppNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.title}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-full text-sm">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {pd.showPhone && (
                  <a href={`tel:${(pd.phoneNumber || '').replace(/\D/g, '')}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-full text-sm">
                    <Phone className="w-4 h-4" /> Ligar
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
