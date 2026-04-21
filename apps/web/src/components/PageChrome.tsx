'use client';

import { BlocksProvider, SectionRenderer } from '@imovdigital/site-blocks';
import type { Property, Section, ThemeTokens } from '@imovdigital/types';

interface Props {
  sections: Section[];
  theme: ThemeTokens;
  tenantSlug: string;
  properties: Property[];
  cities: string[];
  neighborhoods: string[];
  /** Current property when rendering chrome for /imoveis/:slug. */
  property?: Property | null;
}

/**
 * Renders a slice of the page schema (typically the header chrome or
 * footer chrome of /imoveis and /imoveis/:slug) inside a BlocksProvider.
 * Dynamic page body (filters/grid, property detail) is rendered by the
 * surrounding server component.
 */
export function PageChrome({
  sections,
  theme,
  tenantSlug,
  properties,
  cities,
  neighborhoods,
  property,
}: Props) {
  if (sections.length === 0) return null;
  return (
    <BlocksProvider
      breakpoint="desktop"
      theme={theme}
      tenantSlug={tenantSlug}
      properties={properties}
      cities={cities}
      neighborhoods={neighborhoods}
      property={property}
    >
      <SectionRenderer sections={sections} />
    </BlocksProvider>
  );
}
