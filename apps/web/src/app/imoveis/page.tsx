import type { Metadata } from 'next';
import { Suspense } from 'react';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyFilters } from '@/components/PropertyFilters';
import type { Property, Section, ThemeTokens } from '@imovdigital/types';
import { DEFAULT_THEME } from '@imovdigital/types';
import type { SearchPageConfig } from '@/lib/legacy-config';
import { DEFAULT_SEARCH_PAGE_CONFIG } from '@/lib/legacy-config';
import { SidebarFilters } from '@/components/SidebarFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import { SortSelect } from '@/components/SortSelect';
import { PageChrome } from '@/components/PageChrome';
import { Home } from 'lucide-react';

interface PublicPage {
  sections?: Section[];
  theme?: ThemeTokens;
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = await resolveTenantSlug();
  const tenant = await apiFetch(`/public/${slug}`);
  return {
    title: `Imóveis - ${tenant.name}`,
    description: `Encontre os melhores imóveis com ${tenant.name}. Apartamentos, casas, terrenos e mais.`,
  };
}

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ImoveisPage({ searchParams }: Props) {
  const params = await searchParams;
  const slug = await resolveTenantSlug();

  const sp: SearchPageConfig = DEFAULT_SEARCH_PAGE_CONFIG;

  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.type) qs.set('type', params.type);
  if (params.listingType) qs.set('listingType', params.listingType);
  if (params.bedrooms) qs.set('bedrooms', params.bedrooms);
  if (params.bathrooms) qs.set('bathrooms', params.bathrooms);
  if (params.parkingSpots) qs.set('parkingSpots', params.parkingSpots);
  if (params.city) qs.set('city', params.city);
  if (params.neighborhood) qs.set('neighborhood', params.neighborhood);
  if (params.minPrice) qs.set('minPrice', params.minPrice);
  if (params.maxPrice) qs.set('maxPrice', params.maxPrice);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', params.page);
  qs.set('limit', String(sp.itemsPerPage));

  const [tenant, res, searchPage, filters] = await Promise.all([
    apiFetch(`/public/${slug}`),
    apiFetch<{ data: Property[]; total: number; page: number; totalPages: number }>(
      `/public/${slug}/properties?${qs.toString()}`
    ),
    apiFetch<PublicPage | null>(`/public/${slug}/pages/search`).catch(() => null),
    apiFetch<{ cities: string[]; neighborhoods: string[] }>(`/public/${slug}/filters`).catch(
      () => ({ cities: [], neighborhoods: [] }),
    ),
  ]);

  const primaryColor = tenant.primaryColor;

  const rawSections = searchPage?.sections ?? [];
  const theme: ThemeTokens = {
    ...DEFAULT_THEME,
    ...(searchPage?.theme ?? {}),
    ...(tenant?.primaryColor ? { primaryColor: tenant.primaryColor } : {}),
    ...(tenant?.secondaryColor ? { secondaryColor: tenant.secondaryColor } : {}),
    ...(tenant?.fontFamily ? { fontFamily: tenant.fontFamily } : {}),
    ...(tenant?.borderRadius !== undefined ? { borderRadius: tenant.borderRadius } : {}),
  };
  // The public page renders its own results grid (with filters, pagination,
  // live data) so the template's `listings` section is skipped — it only
  // exists to give the editor a WYSIWYG preview of the sidebar + grid.
  // Anything authored before the listings becomes header chrome; anything
  // after becomes footer chrome. Navbar stays in so the user's customized
  // header (with theme colors + auto hamburger on mobile) shows.
  const listingsIdx = rawSections.findIndex(
    (s) => (s as { type?: string }).type === 'listings',
  );
  const headerSections = listingsIdx === -1 ? [] : rawSections.slice(0, listingsIdx);
  const footerSections = listingsIdx === -1 ? rawSections : rawSections.slice(listingsIdx + 1);

  return (
    <>
      <PageChrome
        sections={headerSections}
        theme={theme}
        tenantSlug={slug}
        properties={res.data}
        cities={filters.cities}
        neighborhoods={filters.neighborhoods}
      />

      {sp.filterPosition === 'top' && (
        <Suspense>
          <PropertyFilters primaryColor={primaryColor} total={res.total} tenantSlug={slug} searchConfig={sp} />
        </Suspense>
      )}

      {sp.filterPosition === 'sidebar' && (
        <Suspense>
          <MobileFilterDrawer primaryColor={primaryColor} tenantSlug={slug} sp={sp as SearchPageConfig} total={res.total} />
        </Suspense>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar filters */}
          {sp.filterPosition === 'sidebar' && (
            <Suspense>
              <SidebarFilters primaryColor={primaryColor} tenantSlug={slug} sp={sp as SearchPageConfig} />
            </Suspense>
          )}

          <div className="flex-1 min-w-0">
            {/* Count + sort (when sidebar mode) */}
            {sp.filterPosition === 'sidebar' && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{res.total} {res.total === 1 ? 'imóvel' : 'imóveis'}</p>
                <SortSelect currentSort={params.sort || ''} />
              </div>
            )}

            {res.data.length > 0 ? (
              sp.layout === 'list' ? (
                <div className="flex flex-col gap-4">
                  {res.data.map((property) => (
                    <PropertyCard key={property.id} property={property} primaryColor={primaryColor} layout="horizontal" carousel={sp.cardCarousel ?? true} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(sp.columns, 2)}, 1fr)` }}>
                  {res.data.map((property) => (
                    <PropertyCard key={property.id} property={property} primaryColor={primaryColor} carousel={sp.cardCarousel ?? true} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <Home className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum imóvel encontrado.</p>
                <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca.</p>
              </div>
            )}

            {/* Pagination */}
            {sp.pagination === 'paginated' && res.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(res.totalPages, 10) }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === res.page;
                  const pp = new URLSearchParams();
                  if (params.q) pp.set('q', params.q);
                  if (params.type) pp.set('type', params.type);
                  if (params.listingType) pp.set('listingType', params.listingType);
                  if (params.bedrooms) pp.set('bedrooms', params.bedrooms);
                  if (params.city) pp.set('city', params.city);
                  if (params.sort) pp.set('sort', params.sort);
                  pp.set('page', String(pageNum));

                  return (
                    <a
                      key={pageNum}
                      href={`/imoveis?${pp.toString()}`}
                      className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                        isActive ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      {pageNum}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>


      <PageChrome
        sections={footerSections}
        theme={theme}
        tenantSlug={slug}
        properties={res.data}
        cities={filters.cities}
        neighborhoods={filters.neighborhoods}
      />
    </>
  );
}
