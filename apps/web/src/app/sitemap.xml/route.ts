import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';

export async function GET() {
  const slug = await resolveTenantSlug();
  const xml = await apiFetch<string>(`/public/${slug}/sitemap.xml`);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
