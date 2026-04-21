import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch, resolveFileUrl } from '@/lib/api';
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

  // When the home page has never been published the API returns null.
  // Show a friendly placeholder instead of a blank page so the visitor
  // knows the site is still being prepared.
  if (!page) {
    return <NotPublishedPlaceholder tenantName={tenant?.name} primaryColor={theme.primaryColor} />;
  }

  const sections = page.sections ?? createDefaultPage('', '', '', 'home').sections;

  return (
    <BlocksProvider
      breakpoint="desktop"
      theme={theme}
      tenantSlug={slug}
      properties={propertiesRes.data}
      cities={filters.cities}
      neighborhoods={filters.neighborhoods}
      resolveImageUrl={resolveFileUrl}
    >
      <SectionRenderer sections={sections} />
    </BlocksProvider>
  );
}

function NotPublishedPlaceholder({
  tenantName,
  primaryColor,
}: {
  tenantName?: string;
  primaryColor: string;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          background: '#fff',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 2px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: `${primaryColor}1A`,
            color: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
          aria-hidden
        >
          🚧
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
          Site em preparação
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.55 }}>
          {tenantName
            ? `A equipe da ${tenantName} está finalizando o conteúdo e logo a página estará no ar.`
            : 'A equipe está finalizando o conteúdo e logo a página estará no ar.'}
        </p>
      </div>
    </div>
  );
}

// Reference kept for type narrowing
export type { Page };
