'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  /**
   * Host-provided helper to turn stored image URLs (often API-relative
   * paths like `/api/files/gallery/xxx.png`) into absolute URLs the
   * browser can load. If omitted, URLs are used as-is.
   */
  resolveImageUrl?: (url: string) => string;
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

/**
 * Returns a function that resolves stored image URLs (API-relative paths
 * like `/api/files/gallery/xxx.png`) into absolute URLs the browser can
 * load. Falls back to identity when the host doesn't provide a resolver.
 */
export function useResolveImageUrl(): (url: string | null | undefined) => string {
  const ctx = useContext(Ctx);
  const resolver = ctx?.resolveImageUrl;
  return (url) => {
    if (!url) return '';
    return resolver ? resolver(url) : url;
  };
}

/**
 * Effective breakpoint for responsive blocks.
 * - In the editor (wrapElement present) the canvas owns the viewport and we
 *   honor whatever the BlocksProvider was given (the viewport switcher sets
 *   this), so mobile/tablet/desktop mirror the simulation.
 * - In production the BlocksProvider is rendered SSR with "desktop" as a
 *   safe default; after hydration we switch to the value matching the
 *   actual window width and keep it in sync with resizes.
 */
export function useResponsiveBreakpoint(): Breakpoint {
  const ctx = useContext(Ctx);
  const provided: Breakpoint = ctx?.breakpoint ?? 'desktop';
  const isEdit = !!ctx?.wrapElement;
  const [detected, setDetected] = useState<Breakpoint | null>(null);

  useEffect(() => {
    if (isEdit) {
      setDetected(null);
      return;
    }
    const compute = (): Breakpoint => {
      const w = window.innerWidth;
      if (w < 640) return 'mobile';
      if (w < 1024) return 'tablet';
      return 'desktop';
    };
    setDetected(compute());
    const onResize = () => setDetected(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isEdit]);

  return isEdit ? provided : (detected ?? provided);
}
