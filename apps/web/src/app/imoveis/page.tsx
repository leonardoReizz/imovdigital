import type { Metadata } from 'next';
import { Suspense } from 'react';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyFilters } from '@/components/PropertyFilters';
import type { Property, SearchPageConfig } from '@imovdigital/types';
import { DEFAULT_SEARCH_PAGE_CONFIG } from '@imovdigital/types';
import { SidebarFilters } from '@/components/SidebarFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import { Footer } from '@/components/sections/Footer';
import { Home } from 'lucide-react';

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

  const siteConfig = await apiFetch(`/public/${slug}/site-config`).catch(() => null) as any;
  const sp: SearchPageConfig = siteConfig?.searchPage || DEFAULT_SEARCH_PAGE_CONFIG;

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

  const [tenant, res] = await Promise.all([
    apiFetch(`/public/${slug}`),
    apiFetch<{ data: Property[]; total: number; page: number; totalPages: number }>(
      `/public/${slug}/properties?${qs.toString()}`
    ),
  ]);

  const logoUrl = siteConfig?.logoUrl ?? tenant.logoUrl;
  const primaryColor = siteConfig?.primaryColor || tenant.primaryColor;

  return (
    <>
      <SiteHeader logoUrl={logoUrl} logoSize={(siteConfig as any)?.logoSize} siteName={tenant.name} primaryColor={primaryColor} />

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
                <select className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600">
                  <option>Mais recentes</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                </select>
              </div>
            )}

            {res.data.length > 0 ? (
              sp.layout === 'list' ? (
                <div className="flex flex-col gap-4">
                  {res.data.map((property) => (
                    <PropertyCard key={property.id} property={property} primaryColor={primaryColor} layout="horizontal" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(sp.columns, 2)}, 1fr)` }}>
                  {res.data.map((property) => (
                    <PropertyCard key={property.id} property={property} primaryColor={primaryColor} />
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

      {/* Footer */}
      {siteConfig?.sections && (() => {
        const footerSection = (siteConfig as any).sections.find((s: any) => s.type === 'footer' && s.visible);
        return footerSection ? <Footer settings={footerSection.settings} contactData={{ ...(tenant as any).contact }} /> : null;
      })()}
    </>
  );
}
