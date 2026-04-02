import type { Metadata } from 'next';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch } from '@/lib/api';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const slug = await resolveTenantSlug();
    const seo = await apiFetch(`/public/${slug}/seo/home`);
    return {
      title: seo.title,
      description: seo.description,
      openGraph: {
        title: seo.openGraph['og:title'],
        description: seo.openGraph['og:description'],
        url: seo.canonical,
        siteName: seo.openGraph['og:site_name'],
        locale: 'pt_BR',
        type: 'website',
        ...(seo.openGraph['og:image'] && { images: [seo.openGraph['og:image']] }),
      },
      alternates: { canonical: seo.canonical },
    };
  } catch {
    return { title: 'ImovDigital' };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let fontFamily = 'Inter';
  let primaryColor = '#2563eb';
  let fontSize = 16;
  let jsonLd: object | null = null;

  try {
    const slug = await resolveTenantSlug();
    const [tenant, siteConfig, seo] = await Promise.all([
      apiFetch(`/public/${slug}`),
      apiFetch(`/public/${slug}/site-config`).catch(() => null),
      apiFetch(`/public/${slug}/seo/home`).catch(() => null),
    ]);
    fontFamily = (siteConfig as any)?.fontFamily || tenant.fontFamily || 'Inter';
    primaryColor = (siteConfig as any)?.primaryColor || tenant.primaryColor || '#2563eb';
    fontSize = (siteConfig as any)?.fontSize || 16;
    if (seo?.jsonLd) jsonLd = seo.jsonLd;
  } catch {
    // use defaults
  }

  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </head>
      <body style={{ fontFamily: `'${fontFamily}', sans-serif`, fontSize: `${fontSize}px`, ['--color-primary' as string]: primaryColor }}>
        {children}
      </body>
    </html>
  );
}
