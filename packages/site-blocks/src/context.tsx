'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Breakpoint, Element, Property, SectionLayout, ThemeTokens } from '@imovdigital/types';

export interface WrapElementContext {
  sectionId: string;
  layout: SectionLayout;
  /** For grid layouts, the number of columns in the parent. */
  parentCols?: number;
  /** Gap in px between tracks. */
  parentGap?: number;
  /** For stack layouts, whether children flow as a row (inline) or column. */
  parentDirection?: 'row' | 'column';
}

// Injected by the host (dashboard/editor or apps/web).
export interface BlocksContextValue {
  breakpoint: Breakpoint;
  theme: ThemeTokens;
  tenantSlug: string;
  /**
   * Pool of properties available to Listings/Search blocks. Passed by the
   * host (apps/web home fetches them server-side; editor fetches via api).
   */
  properties?: Property[];
  cities?: string[];
  neighborhoods?: string[];
  /**
   * The current property the page is being rendered for — only set on the
   * `property` template (/imoveis/:slug). TextBlocks with a `binding`
   * resolve their content from this object. In the editor, a mock is
   * provided so the layout reflects the final look.
   */
  property?: Property | null;
  /**
   * URL prefix for listing search submissions. Defaults to "/imoveis".
   */
  searchBasePath?: string;
  // Dashboard provides an editable wrapper; apps/web passes nothing.
  wrapElement?: (element: Element, rendered: ReactNode, ctx: WrapElementContext) => ReactNode;
}

const Ctx = createContext<BlocksContextValue | null>(null);

export function BlocksProvider({
  children,
  ...value
}: BlocksContextValue & { children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBlocks(): BlocksContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useBlocks must be used inside <BlocksProvider>');
  }
  return ctx;
}

/**
 * True when the tree is being rendered inside the editor canvas (wrapElement
 * is always injected by the dashboard). Blocks use this to disable navigation.
 */
export function useIsEditMode(): boolean {
  const ctx = useContext(Ctx);
  return !!ctx?.wrapElement;
}
