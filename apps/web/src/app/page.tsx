import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { SectionRenderer } from '@/components/SectionRenderer';
import type { SiteConfig, Property } from '@imovdigital/types';
import { DEFAULT_SECTION_SETTINGS } from '@imovdigital/types';

export default async function HomePage() {
  const slug = await resolveTenantSlug();

  const [tenant, siteConfig, propertiesRes, filters] = await Promise.all([
    apiFetch(`/public/${slug}`),
    apiFetch<SiteConfig | null>(`/public/${slug}/site-config`).catch(() => null),
    apiFetch<{ data: Property[] }>(`/public/${slug}/properties`).catch(() => ({ data: [] })),
    apiFetch<{ cities: string[] }>(`/public/${slug}/filters`).catch(() => ({ cities: [] })),
  ]);

  const sections = siteConfig?.sections || Object.entries(DEFAULT_SECTION_SETTINGS).map(([type, settings], i) => ({
    id: type,
    type: type as any,
    order: i,
    visible: true,
    settings,
  }));

  const primaryColor = siteConfig?.primaryColor || tenant.primaryColor;

  return (
    <SectionRenderer
      sections={sections}
      primaryColor={primaryColor}
      properties={propertiesRes.data}
      cities={filters.cities}
      tenantSlug={slug}
    />
  );
}
