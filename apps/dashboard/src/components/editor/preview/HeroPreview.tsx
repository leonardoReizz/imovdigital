import type { HeroSettings, SearchBarSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { SearchBarPreview } from './SearchBarPreview';

const HEIGHT_MAP = { small: '300px', medium: '450px', large: '600px', full: '100vh' };

export function HeroPreview({ settings }: { settings: HeroSettings }) {
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const config = useEditorStore((s) => s.config);

  // Find the search bar section to embed it inside the hero
  const searchBarSection = config?.sections.find((s) => s.type === 'search_bar' && s.visible);
  const searchBarSettings = searchBarSection?.settings as SearchBarSettings | undefined;
  const searchBarPosition = searchBarSettings?.position;

  const embedSearchBar =
    searchBarSettings &&
    (searchBarPosition === 'center_hero' ||
      searchBarPosition === 'above_hero' ||
      searchBarPosition === 'below_hero');

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

  // Vertical alignment for text
  const verticalAlign =
    searchBarPosition === 'below_hero' ? 'justify-start pt-20' :
    searchBarPosition === 'above_hero' ? 'justify-end pb-20' :
    'justify-center';

  return (
    <div className="relative overflow-hidden" style={{ ...bgStyle, minHeight: HEIGHT_MAP[settings.height] }}>
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col h-full px-8 py-12 ${verticalAlign}`}
        style={{ minHeight: HEIGHT_MAP[settings.height], textAlign: settings.textAlign }}
      >
        {/* Search bar above text */}
        {embedSearchBar && searchBarPosition === 'above_hero' && (
          <div className="mb-8">
            <SearchBarPreview settings={searchBarSettings} embedded />
          </div>
        )}

        {/* Hero text content */}
        <div className={`max-w-4xl w-full ${settings.textAlign === 'center' ? 'mx-auto' : settings.textAlign === 'right' ? 'ml-auto' : ''}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'inherit' }}>
            {settings.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8" style={{ fontFamily: 'inherit' }}>
            {settings.subheadline}
          </p>

          {/* Search bar in center (between text and CTA) */}
          {embedSearchBar && searchBarPosition === 'center_hero' && (
            <div className="mb-8">
              <SearchBarPreview settings={searchBarSettings} embedded />
            </div>
          )}

          {settings.ctaLabel && !embedSearchBar && (
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {settings.ctaLabel}
            </button>
          )}

          {settings.ctaLabel && embedSearchBar && searchBarPosition !== 'below_hero' && (
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {settings.ctaLabel}
            </button>
          )}
        </div>

        {/* Search bar below text */}
        {embedSearchBar && searchBarPosition === 'below_hero' && (
          <div className="mt-8">
            <SearchBarPreview settings={searchBarSettings} embedded />
          </div>
        )}

        {settings.ctaLabel && embedSearchBar && searchBarPosition === 'below_hero' && (
          <div className={`mt-6 ${settings.textAlign === 'center' ? 'mx-auto' : settings.textAlign === 'right' ? 'ml-auto' : ''}`}>
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {settings.ctaLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
