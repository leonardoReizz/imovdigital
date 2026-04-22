import Link from 'next/link';
import type { Property, PropertyDetailConfig } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { ImageGallery } from '@/components/ImageGallery';
import { PropertyCard } from '@/components/PropertyCard';
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

export function PropertyDetailLayout({ property, similar, pd, primaryColor, tenantSlug }: Props) {
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;
  const images = property.images || [];

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[--color-primary]">Início</Link>
          <span>/</span>
          <Link href="/imoveis" className="hover:text-[--color-primary]">Imóveis</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ImageGallery images={images} galleryStyle={pd.galleryStyle || 'grid'} title={property.title} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className={`flex flex-col ${pd.contactPosition === 'sidebar' ? 'lg:flex-row' : ''} gap-8`}>
          <div className="flex-1 min-w-0 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded text-white" style={{ backgroundColor: primaryColor }}>
                  {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              {pd.showAddress ? (
                <p className="flex items-center gap-1.5 mt-2 text-sm text-gray-500"><MapPin className="w-4 h-4" />{property.fullAddress}</p>
              ) : (
                <p className="flex items-center gap-1.5 mt-2 text-sm text-gray-500"><MapPin className="w-4 h-4" />{property.neighborhood}, {property.city} - {property.state}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatListingDate(property.createdAt as unknown as string, property.updatedAt as unknown as string)}
                </p>
                <ShareButton title={property.title} primaryColor={primaryColor} />
              </div>
            </div>

            <div>
              <span className="text-3xl font-bold text-[--color-primary]">{formatPrice(mainPrice)}</span>
              {isRent && <span className="text-gray-500 ml-1">/mês</span>}
              {property.listingType === 'BOTH' && property.rentPrice && (
                <p className="text-sm font-semibold text-[--color-primary] mt-1">{formatPrice(property.rentPrice)}/mês</p>
              )}
            </div>

            {(pd.showWhatsApp || pd.showPhone) && (
              <div className="flex gap-3">
                {pd.showWhatsApp && (
                  <a href={`https://wa.me/${(pd.whatsAppNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.title}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {pd.showPhone && (
                  <a href={`tel:${(pd.phoneNumber || '').replace(/\D/g, '')}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    <Phone className="w-4 h-4" /> Ligar
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2"><Maximize className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.area}m²</p><p className="text-xs text-gray-400">Área</p></div></div>
              {property.bedrooms > 0 && <div className="flex items-center gap-2"><BedDouble className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.bedrooms}</p><p className="text-xs text-gray-400">Quartos</p></div></div>}
              {property.bathrooms > 0 && <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.bathrooms}</p><p className="text-xs text-gray-400">Banheiros</p></div></div>}
              {property.parkingSpots > 0 && <div className="flex items-center gap-2"><Car className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.parkingSpots}</p><p className="text-xs text-gray-400">Vagas</p></div></div>}
            </div>

            {pd.showDescription && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {pd.showAmenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Comodidades</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />{a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pd.showCosts && (property.condoFee || property.iptuYearly) && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Custos adicionais</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.condoFee && <div><p className="text-xs text-gray-400">Condomínio</p><p className="text-sm font-medium">{formatPrice(property.condoFee)}/mês</p></div>}
                  {property.iptuYearly && <div><p className="text-xs text-gray-400">IPTU anual</p><p className="text-sm font-medium">{formatPrice(property.iptuYearly)}/ano</p></div>}
                </div>
              </div>
            )}

            {pd.showMap && property.latitude && property.longitude && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Localização</h2>
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative bg-gray-100">
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
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                    <p className="text-xs text-gray-600 font-medium">Localização aproximada</p>
                  </div>
                </div>
              </div>
            )}

            {pd.showSimilar && similar.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Imóveis Semelhantes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similar.map((p) => (
                    <PropertyCard key={p.id} property={p} primaryColor={primaryColor} />
                  ))}
                </div>
              </div>
            )}

            {(pd.contactPosition === 'bottom' || pd.contactPosition === 'sidebar') && pd.showContactForm && (
              <div className={`border border-gray-200 rounded-xl p-6 space-y-4 ${pd.contactPosition === 'sidebar' ? 'lg:hidden' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Interessado?</h3>
                <LeadForm tenantSlug={tenantSlug} propertyId={property.id} propertyTitle={property.title} primaryColor={primaryColor} />
              </div>
            )}
          </div>

          {pd.contactPosition === 'sidebar' && pd.showContactForm && (
            <div className="hidden lg:block w-80 xl:w-96 shrink-0">
              <div className="sticky top-20 border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Interessado?</h3>
                <LeadForm tenantSlug={tenantSlug} propertyId={property.id} propertyTitle={property.title} primaryColor={primaryColor} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
