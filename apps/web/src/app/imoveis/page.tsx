import type { Metadata } from 'next';
import { Suspense } from 'react';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { PropertyFilters } from '@/components/PropertyFilters';
import type { Property, SearchPageConfig, SiteTemplate } from '@imovdigital/types';
import { DEFAULT_SEARCH_PAGE_CONFIG } from '@imovdigital/types';
import { SidebarFilters } from '@/components/SidebarFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import { SortSelect } from '@/components/SortSelect';
import { Home } from 'lucide-react';
import { getTemplate } from '@/templates';

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
  const template = (siteConfig?.template || 'classic') as SiteTemplate;
  const T = getTemplate(template);
  const isEditorial = template === 'editorial';

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
  const containerClass = isEditorial ? 'max-w-7xl mx-auto px-4 sm:px-8 py-12' : 'max-w-6xl mx-auto px-4 sm:px-8 py-8';
  const gridGap = isEditorial ? 'gap-x-8 gap-y-14' : 'gap-6';
  const wrapperBg = isEditorial ? 'bg-white' : '';

  return (
    <div className={wrapperBg}>
      <T.SiteHeader logoUrl={logoUrl} logoSize={(siteConfig as any)?.logoSize} siteName={tenant.name} primaryColor={primaryColor} />

      {/* Editorial page heading */}
      {isEditorial && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-6">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: primaryColor }}>— Catálogo</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mt-2">Imóveis disponíveis</h1>
          <p className="text-gray-500 mt-2">{res.total} {res.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>
        </div>
      )}

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

      <div className={containerClass}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar filters */}
          {sp.filterPosition === 'sidebar' && (
            <Suspense>
              <SidebarFilters primaryColor={primaryColor} tenantSlug={slug} sp={sp as SearchPageConfig} />
            </Suspense>
          )}

          <div className="flex-1 min-w-0">
            {/* Count + sort (when sidebar mode) */}
            {sp.filterPosition === 'sidebar' && !isEditorial && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{res.total} {res.total === 1 ? 'imóvel' : 'imóveis'}</p>
                <SortSelect currentSort={params.sort || ''} />
              </div>
            )}
            {sp.filterPosition === 'sidebar' && isEditorial && (
              <div className="flex items-center justify-end mb-8 pb-4 border-b border-stone-200">
                <SortSelect currentSort={params.sort || ''} />
              </div>
            )}

            {res.data.length > 0 ? (
              sp.layout === 'list' ? (
                <div className={isEditorial ? 'flex flex-col' : 'flex flex-col gap-4'}>
                  {res.data.map((property) => (
                    <T.PropertyCard key={property.id} property={property} primaryColor={primaryColor} layout="horizontal" carousel={sp.cardCarousel ?? true} />
                  ))}
                </div>
              ) : (
                <div className={`grid ${gridGap}`} style={{ gridTemplateColumns: `repeat(${Math.min(sp.columns, isEditorial ? 3 : 2)}, 1fr)` }}>
                  {res.data.map((property) => (
                    <T.PropertyCard key={property.id} property={property} primaryColor={primaryColor} carousel={sp.cardCarousel ?? true} />
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

                  const baseClass = isEditorial
                    ? `w-10 h-10 text-sm font-mono flex items-center justify-center transition-colors ${
                        isActive ? 'text-white' : 'border border-stone-300 text-gray-600 hover:bg-stone-50'
                      }`
                    : `w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                        isActive ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`;

                  return (
                    <a
                      key={pageNum}
                      href={`/imoveis?${pp.toString()}`}
                      className={baseClass}
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
        return footerSection ? <T.Footer settings={footerSection.settings} contactData={{ ...(tenant as any).contact }} /> : null;
      })()}
    </div>
  );
}
