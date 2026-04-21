import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch, resolveFileUrl } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { ImageGallery } from '@/components/ImageGallery';
import { formatPrice } from '@imovdigital/utils';
import type { Property, Section, ThemeTokens } from '@imovdigital/types';
import { DEFAULT_THEME } from '@imovdigital/types';
import type { PropertyDetailConfig } from '@/lib/legacy-config';
import { DEFAULT_PROPERTY_DETAIL_CONFIG } from '@/lib/legacy-config';
import {
  MapPin, BedDouble, Bath, Car, Maximize,
  MessageCircle, Phone, Check, Calendar,
} from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { LeadForm } from '@/components/LeadForm';
import { FloatingContactButton } from '@/components/FloatingContactButton';
import { formatListingDate } from '@/lib/dates';
import { PageChrome } from '@/components/PageChrome';

interface PublicPage {
  sections?: Section[];
  theme?: ThemeTokens;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: propertySlug } = await params;
  try {
    const tenantSlug = await resolveTenantSlug();
    const seo = await apiFetch(`/public/${tenantSlug}/seo/property/${propertySlug}`);
    return {
      title: seo.openGraph['og:title'],
      description: seo.openGraph['og:description'],
      openGraph: {
        title: seo.openGraph['og:title'],
        description: seo.openGraph['og:description'],
        url: seo.canonical,
        images: seo.openGraph['og:image'] ? [seo.openGraph['og:image']] : [],
        locale: 'pt_BR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitter['twitter:title'],
        description: seo.twitter['twitter:description'],
        images: seo.twitter['twitter:image'] ? [seo.twitter['twitter:image']] : [],
      },
      alternates: { canonical: seo.canonical },
    };
  } catch {
    return { title: 'Imóvel' };
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug: propertySlug } = await params;
  const tenantSlug = await resolveTenantSlug();

  let tenant: any;
  let property: Property;
  let seoData: any;

  let propertyPage: PublicPage | null = null;
  try {
    [tenant, property, seoData, propertyPage] = await Promise.all([
      apiFetch(`/public/${tenantSlug}`),
      apiFetch<Property>(`/public/${tenantSlug}/properties/${propertySlug}`),
      apiFetch(`/public/${tenantSlug}/seo/property/${propertySlug}`).catch(() => null),
      apiFetch<PublicPage | null>(`/public/${tenantSlug}/pages/property`).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  const rawChromeSections = propertyPage?.sections ?? [];
  const chromeTheme: ThemeTokens = {
    ...DEFAULT_THEME,
    ...(propertyPage?.theme ?? {}),
    ...(tenant?.primaryColor ? { primaryColor: tenant.primaryColor } : {}),
    ...(tenant?.secondaryColor ? { secondaryColor: tenant.secondaryColor } : {}),
    ...(tenant?.fontFamily ? { fontFamily: tenant.fontFamily } : {}),
    ...(tenant?.borderRadius !== undefined ? { borderRadius: tenant.borderRadius } : {}),
  };
  // SiteHeader covers the chrome on this route, so skip the template's
  // navbar section here (still rendered in the editor and on the home
  // page which has no SiteHeader).
  const chromeSections = rawChromeSections.filter(
    (s) => (s as { type?: string }).type !== 'navbar',
  );
  const chromeHeader = chromeSections.slice(0, 1);
  const chromeFooter = chromeSections.slice(1);

  const pd: PropertyDetailConfig = DEFAULT_PROPERTY_DETAIL_CONFIG;
  const primaryColor = tenant.primaryColor || '#2563eb';
  const logoUrl = tenant.logoUrl;
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;
  const images = property.images || [];
  const hasImages = images.length > 0;

  // Similar properties
  let similar: Property[] = [];
  if (pd.showSimilar) {
    try {
      const res = await apiFetch<{ data: Property[] }>(`/public/${tenantSlug}/properties`);
      similar = res.data
        .filter((p) => p.id !== property.id && p.active && p.city === property.city)
        .sort((a, b) => {
          let sa = 0, sb = 0;
          if (a.neighborhood === property.neighborhood) sa += 3;
          if (a.type === property.type) sa += 2;
          if (a.listingType === property.listingType) sa += 1;
          if (b.neighborhood === property.neighborhood) sb += 3;
          if (b.type === property.type) sb += 2;
          if (b.listingType === property.listingType) sb += 1;
          return sb - sa;
        })
        .slice(0, 6);
    } catch { /* ignore */ }
  }

  return (
    <>
      <SiteHeader logoUrl={logoUrl} siteName={tenant.name} primaryColor={primaryColor} />

      <PageChrome
        sections={chromeHeader}
        theme={chromeTheme}
        tenantSlug={tenantSlug}
        properties={[property]}
        cities={[]}
        neighborhoods={[]}
        property={property}
      />

      {/* JSON-LD */}
      {seoData?.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }} />
      )}

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

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ImageGallery images={images} galleryStyle={pd.galleryStyle || 'grid'} title={property.title} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className={`flex flex-col ${pd.contactPosition === 'sidebar' ? 'lg:flex-row' : ''} gap-8`}>
          {/* Main */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Title */}
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

              {/* Date + Share */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatListingDate(property.createdAt as unknown as string, property.updatedAt as unknown as string)}
                </p>
                <ShareButton title={property.title} primaryColor={primaryColor} />
              </div>
            </div>

            {/* Price */}
            <div>
              <span className="text-3xl font-bold text-[--color-primary]">
                {formatPrice(mainPrice)}
              </span>
              {isRent && <span className="text-gray-500 ml-1">/mês</span>}
              {property.listingType === 'BOTH' && property.rentPrice && (
                <p className="text-sm font-semibold text-[--color-primary] mt-1">{formatPrice(property.rentPrice)}/mês</p>
              )}
            </div>

            {/* Quick actions */}
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

            {/* Features */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2"><Maximize className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.area}m²</p><p className="text-xs text-gray-400">Área</p></div></div>
              {property.bedrooms > 0 && <div className="flex items-center gap-2"><BedDouble className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.bedrooms}</p><p className="text-xs text-gray-400">Quartos</p></div></div>}
              {property.bathrooms > 0 && <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.bathrooms}</p><p className="text-xs text-gray-400">Banheiros</p></div></div>}
              {property.parkingSpots > 0 && <div className="flex items-center gap-2"><Car className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-semibold">{property.parkingSpots}</p><p className="text-xs text-gray-400">Vagas</p></div></div>}
            </div>

            {/* Description */}
            {pd.showDescription && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
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

            {/* Costs */}
            {pd.showCosts && (property.condoFee || property.iptuYearly) && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Custos adicionais</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.condoFee && <div><p className="text-xs text-gray-400">Condomínio</p><p className="text-sm font-medium">{formatPrice(property.condoFee)}/mês</p></div>}
                  {property.iptuYearly && <div><p className="text-xs text-gray-400">IPTU anual</p><p className="text-sm font-medium">{formatPrice(property.iptuYearly)}/ano</p></div>}
                </div>
              </div>
            )}

            {/* Map */}
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

            {/* Similar */}
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

            {/* Contact bottom — explicit bottom OR sidebar on mobile */}
            {(pd.contactPosition === 'bottom' || pd.contactPosition === 'sidebar') && pd.showContactForm && (
              <div className={`border border-gray-200 rounded-xl p-6 space-y-4 ${pd.contactPosition === 'sidebar' ? 'lg:hidden' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Interessado?</h3>
                <LeadForm tenantSlug={tenantSlug} propertyId={property.id} propertyTitle={property.title} primaryColor={primaryColor} />
              </div>
            )}
          </div>

          {/* Sidebar contact — desktop only */}
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

      {/* Floating contact button */}
      {pd.contactPosition === 'floating' && pd.showContactForm && (
        <FloatingContactButton
          tenantSlug={tenantSlug}
          propertyId={property.id}
          propertyTitle={property.title}
          primaryColor={primaryColor}
        />
      )}


      <PageChrome
        sections={chromeFooter}
        theme={chromeTheme}
        tenantSlug={tenantSlug}
        properties={similar}
        cities={[]}
        neighborhoods={[]}
      />
    </>
  );
}
