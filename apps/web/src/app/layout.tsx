import type { Metadata } from 'next';
import { resolveTenantSlug } from '@/lib/tenant';
import { apiFetch, resolveFileUrl } from '@/lib/api';
import './globals.css';

const TIKTOK_PIXEL_SCRIPT = `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

  ttq.load('D7HQVBBC77U2ODPGMDV0');
  ttq.page();
}(window, document, 'ttq');`;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const slug = await resolveTenantSlug();
    const [seo, siteConfig] = await Promise.all([
      apiFetch(`/public/${slug}/seo/home`),
      apiFetch(`/public/${slug}/site-config`).catch(() => null),
    ]);

    const faviconUrl = resolveFileUrl((siteConfig as any)?.faviconUrl);

    return {
      title: seo.title,
      description: seo.description,
      ...(faviconUrl && {
        icons: { icon: faviconUrl },
      }),
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
        <script dangerouslySetInnerHTML={{ __html: TIKTOK_PIXEL_SCRIPT }} />
      </head>
      <body style={{ fontFamily: `'${fontFamily}', sans-serif`, fontSize: `${fontSize}px`, ['--color-primary' as string]: primaryColor }}>
        {children}
      </body>
    </html>
  );
}
