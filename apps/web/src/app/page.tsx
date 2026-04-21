import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { BlocksProvider, SectionRenderer } from '@imovdigital/site-blocks';
import type { Page, Property, Section, ThemeTokens } from '@imovdigital/types';
import { DEFAULT_THEME, createDefaultPage } from '@imovdigital/types';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  status: string;
  sections?: Section[];
  theme?: ThemeTokens;
  seo?: { title: string; description: string };
}

interface PublicTenant {
  name: string;
  slug: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
}

export default async function HomePage() {
  const slug = await resolveTenantSlug();

  const [tenant, page, propertiesRes, filters] = await Promise.all([
    apiFetch<PublicTenant>(`/public/${slug}`).catch(() => null),
    apiFetch<PublicPage | null>(`/public/${slug}/pages/home`).catch(() => null),
    apiFetch<{ data: Property[] }>(`/public/${slug}/properties?limit=50`).catch(() => ({ data: [] })),
    apiFetch<{ cities: string[]; neighborhoods: string[] }>(
      `/public/${slug}/filters`,
    ).catch(() => ({ cities: [], neighborhoods: [] })),
  ]);

  const sections = page?.sections ?? createDefaultPage('', '', '', 'home').sections;
  // Tenant theme (global) overrides the per-page theme so colors/fonts are
  // consistent across every page of the site.
  const theme: ThemeTokens = {
    ...DEFAULT_THEME,
    ...(page?.theme ?? {}),
    ...(tenant?.primaryColor ? { primaryColor: tenant.primaryColor } : {}),
    ...(tenant?.secondaryColor ? { secondaryColor: tenant.secondaryColor } : {}),
    ...(tenant?.fontFamily ? { fontFamily: tenant.fontFamily } : {}),
    ...(tenant?.borderRadius !== undefined ? { borderRadius: tenant.borderRadius } : {}),
  };

  return (
    <BlocksProvider
      breakpoint="desktop"
      theme={theme}
      tenantSlug={slug}
      properties={propertiesRes.data}
      cities={filters.cities}
      neighborhoods={filters.neighborhoods}
    >
      <SectionRenderer sections={sections} />
    </BlocksProvider>
  );
}

// Reference kept for type narrowing
export type { Page };
