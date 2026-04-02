import { headers } from 'next/headers';
import { apiFetch } from './api';
import type { SiteConfig } from '@imovdigital/types';

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'imovdigital.com.br';

export interface TenantData {
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  contact: {
    whatsapp: string | null;
    phone: string | null;
    email: string | null;
  } | null;
}

/**
 * Resolves the tenant slug from the current request hostname.
 * Supports: {slug}.imovdigital.com.br or custom domains.
 * Falls back to query param ?tenant= or env FALLBACK_TENANT for local dev.
 */
export async function resolveTenantSlug(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // Custom domain: look up directly
  if (host && !host.includes(BASE_DOMAIN) && !host.includes('localhost')) {
    // The API will need to resolve custom domain → slug
    // For now we query the public endpoint that accepts custom domain
    try {
      const data = await apiFetch<{ slug: string }>(`/public/resolve-domain?domain=${host}`);
      return data.slug;
    } catch {
      // fallthrough
    }
  }

  // Subdomain: extract from {slug}.imovdigital.com.br
  if (host.includes(BASE_DOMAIN)) {
    const slug = host.replace(`.${BASE_DOMAIN}`, '').split(':')[0];
    if (slug && slug !== 'www') return slug;
  }

  // Localhost: extract from subdomain or use fallback
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const slug = parts[0];
      if (slug !== 'localhost') return slug;
    }
  }

  // Fallback for dev
  return process.env.FALLBACK_TENANT || 'demo';
}

export async function getTenant(): Promise<TenantData> {
  const slug = await resolveTenantSlug();
  return apiFetch<TenantData>(`/public/${slug}`);
}

export async function getSiteConfig(slug: string): Promise<SiteConfig> {
  return apiFetch<SiteConfig>(`/public/${slug}/site-config`);
}
