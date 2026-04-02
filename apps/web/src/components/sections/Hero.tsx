import type { HeroSettings, SearchBarSettings } from '@imovdigital/types';
import { SearchBar } from './SearchBar';

const HEIGHT_MAP = { small: '300px', medium: '450px', large: '600px', full: '100vh' };

export function Hero({ settings, searchBar, primaryColor, cities, tenantSlug }: { settings: HeroSettings; searchBar?: SearchBarSettings; primaryColor: string; cities?: string[]; tenantSlug?: string }) {
  const embedSearch = searchBar && ['center_hero', 'above_hero', 'below_hero'].includes(searchBar.position);

  const bgStyle: React.CSSProperties = {};
  if (settings.backgroundType === 'image' && settings.backgroundUrl) {
    bgStyle.backgroundImage = `url(${settings.backgroundUrl})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else if (settings.backgroundType === 'gradient') {
    bgStyle.background = `linear-gradient(135deg, ${primaryColor}, #1e40af)`;
  } else {
    bgStyle.backgroundColor = primaryColor;
  }

  return (
    <section className="relative overflow-hidden" style={{ ...bgStyle, minHeight: HEIGHT_MAP[settings.height] }}>
      <div className="absolute inset-0" style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }} />

      <div className="relative z-10 flex flex-col justify-center px-4 sm:px-8 py-16" style={{ minHeight: HEIGHT_MAP[settings.height], textAlign: settings.textAlign }}>
        {embedSearch && searchBar!.position === 'above_hero' && (
          <div className="mb-8"><SearchBar settings={searchBar!} primaryColor={primaryColor} embedded cities={cities} tenantSlug={tenantSlug} /></div>
        )}

        <div className={`max-w-4xl w-full ${settings.textAlign === 'center' ? 'mx-auto' : settings.textAlign === 'right' ? 'ml-auto' : ''}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{settings.headline}</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8">{settings.subheadline}</p>

          {embedSearch && searchBar!.position === 'center_hero' && (
            <div className="mb-8"><SearchBar settings={searchBar!} primaryColor={primaryColor} embedded cities={cities} tenantSlug={tenantSlug} /></div>
          )}

          {settings.ctaLabel && (
            <a href={settings.ctaUrl} className="inline-block px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
              {settings.ctaLabel}
            </a>
          )}
        </div>

        {embedSearch && searchBar!.position === 'below_hero' && (
          <div className="mt-8"><SearchBar settings={searchBar!} primaryColor={primaryColor} embedded cities={cities} tenantSlug={tenantSlug} /></div>
        )}
      </div>
    </section>
  );
}
