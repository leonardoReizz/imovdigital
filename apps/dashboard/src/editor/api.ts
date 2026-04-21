import { api } from '../lib/api';
import type { Page, Property } from '@imovdigital/types';

export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt: string;
  reserved: boolean;
}

export async function listPages(): Promise<PageListItem[]> {
  const { data } = await api.get<PageListItem[]>('/pages');
  return data;
}

export async function getPage(id: string): Promise<Page> {
  const { data } = await api.get<Page>(`/pages/${id}`);
  return data;
}

export async function createPage(slug: string, title: string): Promise<Page> {
  const { data } = await api.post<Page>('/pages', { slug, title });
  return data;
}

export async function updatePage(
  id: string,
  payload: {
    slug?: string;
    title?: string;
    data?: { seo: Page['seo']; theme: Page['theme']; sections: Page['sections'] };
  },
): Promise<Page> {
  const { data } = await api.patch<Page>(`/pages/${id}`, payload);
  return data;
}

export async function publishPage(id: string): Promise<Page> {
  const { data } = await api.post<Page>(`/pages/${id}/publish`);
  return data;
}

export async function resetPageToTemplate(id: string): Promise<Page> {
  const { data } = await api.post<Page>(`/pages/${id}/reset-template`);
  return data;
}

export async function deletePage(id: string): Promise<void> {
  await api.delete(`/pages/${id}`);
}

export async function loadTenantProperties(): Promise<Property[]> {
  const { data } = await api.get<{ data?: Property[] } | Property[]>('/properties?limit=50');
  if (Array.isArray(data)) return data;
  return data.data ?? [];
}

export async function loadTenantFilters(): Promise<{ cities: string[]; neighborhoods: string[] }> {
  // Reuse the public filters endpoint via the current tenant slug is painful;
  // instead derive from loaded properties to avoid an extra request.
  return { cities: [], neighborhoods: [] };
}

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
  faviconUrl: string | null;
}

export async function getTenantTheme(): Promise<TenantTheme> {
  const { data } = await api.get('/tenant');
  return {
    primaryColor: data.primaryColor ?? '#2563eb',
    secondaryColor: data.secondaryColor ?? '#1e40af',
    fontFamily: data.fontFamily ?? 'Inter',
    borderRadius: data.borderRadius ?? 8,
    faviconUrl: data.faviconUrl ?? null,
  };
}

export async function updateTenantTheme(patch: Partial<TenantTheme>): Promise<TenantTheme> {
  const { data } = await api.patch('/tenant', patch);
  return {
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    fontFamily: data.fontFamily,
    borderRadius: data.borderRadius ?? 8,
    faviconUrl: data.faviconUrl ?? null,
  };
}
