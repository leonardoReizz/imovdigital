import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';

export async function GET() {
  const slug = await resolveTenantSlug();
  const txt = await apiFetch<string>(`/public/${slug}/robots.txt`);
  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
