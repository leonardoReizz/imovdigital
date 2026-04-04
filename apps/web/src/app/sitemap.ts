import type { MetadataRoute } from 'next';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const slug = await resolveTenantSlug();
    const data = await apiFetch<{ url: string; lastmod?: string; changefreq?: string; priority?: number }[]>(
      `/public/${slug}/sitemap.xml`
    ).catch(() => null);

    // If the API returns structured sitemap data, use it
    if (Array.isArray(data)) {
      return data.map((entry) => ({
        url: entry.url.startsWith('http') ? entry.url : `${baseUrl}${entry.url}`,
        lastModified: entry.lastmod || new Date().toISOString(),
        changeFrequency: (entry.changefreq as any) || 'weekly',
        priority: entry.priority || 0.8,
      }));
    }

    // Fallback: fetch properties and build sitemap manually
    const properties = await apiFetch<{ data: { slug: string; updatedAt: string }[] }>(
      `/public/${slug}/properties?limit=1000`
    ).catch(() => ({ data: [] }));

    const entries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/imoveis`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];

    for (const property of properties.data) {
      entries.push({
        url: `${baseUrl}/imoveis/${property.slug}`,
        lastModified: property.updatedAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    return entries;
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
