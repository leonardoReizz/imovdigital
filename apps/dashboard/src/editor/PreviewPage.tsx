import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
  BlocksProvider,
  SectionRenderer,
  buildMockProperties,
  MOCK_CITIES_LIST,
  MOCK_NEIGHBORHOODS_LIST,
} from '@imovdigital/site-blocks';
import type { Page, Property } from '@imovdigital/types';
import { getPage, getTenantTheme, loadTenantProperties, type TenantTheme } from './api';
import { resolveFileUrl } from '../lib/api';
import { useGoogleFont } from './useGoogleFont';

/**
 * Internal preview renderer — mirrors the production output without any
 * editor chrome. Opens in a new tab from the toolbar's "Preview" button.
 */
export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [tenantTheme, setTenantTheme] = useState<TenantTheme | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getPage(id)
      .then(setPage)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'));
    getTenantTheme()
      .then(setTenantTheme)
      .catch(() => {});
    loadTenantProperties()
      .then((list) => {
        setProperties(list);
        setPropertiesLoaded(true);
      })
      .catch(() => setPropertiesLoaded(true));
  }, [id]);

  const mocks = useMemo(() => buildMockProperties(12), []);
  const useMocks = propertiesLoaded && properties.length === 0;

  const effectiveProperties = useMocks ? mocks : properties;
  const effectiveCities = useMocks
    ? MOCK_CITIES_LIST
    : Array.from(new Set(properties.map((p) => p.city).filter(Boolean))).sort();
  const effectiveNeighborhoods = useMocks
    ? MOCK_NEIGHBORHOODS_LIST
    : Array.from(new Set(properties.map((p) => p.neighborhood).filter(Boolean))).sort();
  const contextProperty = page?.slug === 'property' ? (effectiveProperties[0] ?? null) : null;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-red-600">
        {error}
      </div>
    );
  }
  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-slate-400">
        Carregando…
      </div>
    );
  }

  // Tenant theme overrides per-page theme — same merge the Canvas does.
  // This is why color/font changes saved on the global theme panel show
  // up in the preview tab without the user having to re-save each page.
  const effectiveTheme = {
    ...page.theme,
    ...(tenantTheme ?? {}),
  };

  return (
    <PreviewInner
      effectiveTheme={effectiveTheme}
      page={page}
      effectiveProperties={effectiveProperties}
      contextProperty={contextProperty}
      effectiveCities={effectiveCities}
      effectiveNeighborhoods={effectiveNeighborhoods}
    />
  );
}

function PreviewInner({
  effectiveTheme,
  page,
  effectiveProperties,
  contextProperty,
  effectiveCities,
  effectiveNeighborhoods,
}: {
  effectiveTheme: Page['theme'];
  page: Page;
  effectiveProperties: Property[];
  contextProperty: Property | null;
  effectiveCities: string[];
  effectiveNeighborhoods: string[];
}) {
  useGoogleFont(effectiveTheme.fontFamily);
  return (
    <div style={{ fontFamily: effectiveTheme.fontFamily }}>
      <BlocksProvider
        breakpoint="desktop"
        theme={effectiveTheme}
        tenantSlug=""
        properties={effectiveProperties}
        property={contextProperty}
        cities={effectiveCities}
        neighborhoods={effectiveNeighborhoods}
        resolveImageUrl={resolveFileUrl}
      >
        <SectionRenderer sections={page.sections} />
      </BlocksProvider>
    </div>
  );
}
