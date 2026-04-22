import type { HeroSettings, SearchBarSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { SearchBarPreview } from './SearchBarPreview';

const HEIGHT_MAP = { small: '300px', medium: '450px', large: '600px', full: '100vh' };

export function HeroPreview({ settings }: { settings: HeroSettings }) {
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const config = useEditorStore((s) => s.config);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';

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
    const from = settings.gradientFrom || primaryColor;
    const to = settings.gradientTo || '#1e40af';
    const direction = settings.gradientDirection || '135deg';
    bgStyle.background = `linear-gradient(${direction}, ${from}, ${to})`;
  } else {
    bgStyle.backgroundColor = primaryColor;
  }

  return (
    <div className="relative overflow-hidden" style={{ ...bgStyle, minHeight: HEIGHT_MAP[settings.height] }}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }}
      />

      <div
        className="relative z-10 flex flex-col justify-center"
        style={{
          minHeight: HEIGHT_MAP[settings.height],
          textAlign: settings.textAlign,
          padding: isMobile ? '40px 16px' : '48px 32px',
        }}
      >
        {embedSearchBar && searchBarPosition === 'above_hero' && (
          <div className="mb-8">
            <SearchBarPreview settings={searchBarSettings} embedded />
          </div>
        )}

        <div className={`max-w-4xl w-full ${settings.textAlign === 'center' ? 'mx-auto' : settings.textAlign === 'right' ? 'ml-auto' : ''}`}>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontSize: isMobile ? 28 : 48, lineHeight: 1.15 }}
          >
            {settings.headline}
          </h1>
          <p
            className="text-white/80 mb-8"
            style={{ fontSize: isMobile ? 16 : 20 }}
          >
            {settings.subheadline}
          </p>

          {embedSearchBar && searchBarPosition === 'center_hero' && (
            <div className="mb-8">
              <SearchBarPreview settings={searchBarSettings} embedded />
            </div>
          )}

          {settings.ctaLabel && (
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg"
              style={{ backgroundColor: primaryColor, fontSize: isMobile ? 14 : 18 }}
            >
              {settings.ctaLabel}
            </button>
          )}
        </div>

        {embedSearchBar && searchBarPosition === 'below_hero' && (
          <div className="mt-8">
            <SearchBarPreview settings={searchBarSettings} embedded />
          </div>
        )}
      </div>
    </div>
  );
}
