import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import type { Property, PropertyDetailConfig, SiteTemplate } from '@imovdigital/types';
import { DEFAULT_PROPERTY_DETAIL_CONFIG } from '@imovdigital/types';
import { FloatingContactButton } from '@/components/FloatingContactButton';
import { getTemplate } from '@/templates';

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
  let siteConfig: any;

  try {
    [tenant, property, seoData, siteConfig] = await Promise.all([
      apiFetch(`/public/${tenantSlug}`),
      apiFetch<Property>(`/public/${tenantSlug}/properties/${propertySlug}`),
      apiFetch(`/public/${tenantSlug}/seo/property/${propertySlug}`).catch(() => null),
      apiFetch(`/public/${tenantSlug}/site-config`).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  const pd: PropertyDetailConfig = siteConfig?.propertyDetail || DEFAULT_PROPERTY_DETAIL_CONFIG;
  const primaryColor = siteConfig?.primaryColor || tenant.primaryColor || '#2563eb';
  const logoUrl = siteConfig?.logoUrl ?? tenant.logoUrl;
  const template = (siteConfig?.template || 'classic') as SiteTemplate;
  const T = getTemplate(template);

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
      <T.SiteHeader logoUrl={logoUrl} logoSize={(siteConfig as any)?.logoSize} siteName={tenant.name} primaryColor={primaryColor} />

      {seoData?.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }} />
      )}

      <T.PropertyDetailLayout
        property={property}
        similar={similar}
        pd={pd}
        primaryColor={primaryColor}
        tenantSlug={tenantSlug}
      />

      {pd.contactPosition === 'floating' && pd.showContactForm && (
        <FloatingContactButton
          tenantSlug={tenantSlug}
          propertyId={property.id}
          propertyTitle={property.title}
          primaryColor={primaryColor}
        />
      )}

      {siteConfig?.sections && (() => {
        const footerSection = (siteConfig as any).sections.find((s: any) => s.type === 'footer' && s.visible);
        return footerSection ? <T.Footer settings={footerSection.settings} contactData={{ ...(tenant as any).contact }} /> : null;
      })()}
    </>
  );
}
