import type { HeroSettings, SearchBarSettings } from '@imovdigital/types';
import { SearchBar } from '@/components/sections/SearchBar';
import { resolveFileUrl } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

const HEIGHT_MAP = { small: '420px', medium: '560px', large: '680px', full: '100vh' };

export function Hero({ settings, searchBar, primaryColor, cities, tenantSlug }: { settings: HeroSettings; searchBar?: SearchBarSettings; primaryColor: string; cities?: string[]; tenantSlug?: string }) {
  const embedSearch = searchBar && ['center_hero', 'above_hero', 'below_hero'].includes(searchBar.position);

  const visualStyle: React.CSSProperties = {};
  if (settings.backgroundType === 'image' && settings.backgroundUrl) {
    visualStyle.backgroundImage = `url(${resolveFileUrl(settings.backgroundUrl)})`;
    visualStyle.backgroundSize = 'cover';
    visualStyle.backgroundPosition = 'center';
  } else if (settings.backgroundType === 'gradient') {
    const from = settings.gradientFrom || primaryColor;
    const to = settings.gradientTo || '#1e40af';
    const direction = settings.gradientDirection || '135deg';
    visualStyle.background = `linear-gradient(${direction}, ${from}, ${to})`;
  } else {
    visualStyle.backgroundColor = primaryColor;
  }

  return (
    <section className="relative bg-white" style={{ minHeight: HEIGHT_MAP[settings.height] }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left: editorial copy */}
        <div className="lg:col-span-6 relative z-10">
          <span
            className="inline-block uppercase tracking-[0.2em] text-[11px] font-semibold mb-6 pb-1.5 border-b-2"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            — Imobiliária
          </span>
          <h1
            className="font-serif font-bold text-gray-900 leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)' }}
          >
            {settings.headline}
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
            {settings.subheadline}
          </p>
          {settings.ctaLabel && (
            <a
              href={settings.ctaUrl}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-medium rounded-full shadow-md hover:shadow-xl hover:translate-x-0.5 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {settings.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Right: large visual block */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl" style={visualStyle}>
            {settings.backgroundType === 'image' && settings.backgroundUrl && settings.overlayOpacity > 0 && (
              <div className="absolute inset-0" style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }} />
            )}
          </div>
          {/* Decorative accent */}
          <div
            className="hidden lg:block absolute -bottom-6 -left-6 w-28 h-28 rounded-3xl -z-0"
            style={{ backgroundColor: primaryColor, opacity: 0.15 }}
          />
          <div
            className="hidden lg:block absolute -top-4 -right-4 w-16 h-16 rounded-full -z-0"
            style={{ borderColor: primaryColor, borderWidth: 3, borderStyle: 'solid', opacity: 0.4 }}
          />
        </div>
      </div>

      {/* Embedded search bar */}
      {embedSearch && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6 pb-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-2 border border-gray-100">
            <SearchBar settings={searchBar!} primaryColor={primaryColor} embedded cities={cities} tenantSlug={tenantSlug} />
          </div>
        </div>
      )}
    </section>
  );
}
