import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import type { Property, Section, ThemeTokens } from '@imovdigital/types';
import { DEFAULT_THEME } from '@imovdigital/types';
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
  // Navbar is pulled out so it sits at the very top; the rest of the
  // template (gallery, details, similar, footer, or whatever the user
  // authored) renders as the body with the current property bound to the
  // BlocksProvider so `property_*` blocks data-bind.
  const navbarSection = rawChromeSections.find(
    (s) => (s as { type?: string }).type === 'navbar',
  );
  const bodySections = rawChromeSections.filter(
    (s) => (s as { type?: string }).type !== 'navbar',
  );

  // Pool for listings blocks inside the template (e.g. "Imóveis
  // semelhantes"). We skip the current property itself and prioritize the
  // same neighborhood/city, then pass it as `properties` context.
  let similar: Property[] = [];
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

  return (
    <>
      {navbarSection && (
        <PageChrome
          sections={[navbarSection]}
          theme={chromeTheme}
          tenantSlug={tenantSlug}
          properties={[property, ...similar]}
          cities={[]}
          neighborhoods={[]}
          property={property}
        />
      )}

      {/* JSON-LD */}
      {seoData?.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.jsonLd) }} />
      )}

      {/* Breadcrumb — always-on navigation aid, independent of template */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[--color-primary]">Início</Link>
          <span>/</span>
          <Link href="/imoveis" className="hover:text-[--color-primary]">Imóveis</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{property.title}</span>
        </div>
      </div>

      {/* Template body — gallery, specs, prices, contact form, similar,
           footer, and anything else the user authored all render here with
           the current property bound via BlocksProvider so property_* blocks
           pull their content from it. */}
      <PageChrome
        sections={bodySections}
        theme={chromeTheme}
        tenantSlug={tenantSlug}
        properties={similar}
        cities={[]}
        neighborhoods={[]}
        property={property}
      />
    </>
  );
}
