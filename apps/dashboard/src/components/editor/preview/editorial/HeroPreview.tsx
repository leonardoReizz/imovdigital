import type { HeroSettings, SearchBarSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { SearchBarPreview } from '../SearchBarPreview';
import { ArrowRight } from 'lucide-react';

const HEIGHT_MAP = { small: '420px', medium: '560px', large: '680px', full: '100vh' };

export function HeroPreview({ settings }: { settings: HeroSettings }) {
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const config = useEditorStore((s) => s.config);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';

  const searchBarSection = config?.sections.find((s) => s.type === 'search_bar' && s.visible);
  const searchBarSettings = searchBarSection?.settings as SearchBarSettings | undefined;
  const embedSearchBar = searchBarSettings && (searchBarSettings.position === 'center_hero' || searchBarSettings.position === 'above_hero' || searchBarSettings.position === 'below_hero');

  const visualStyle: React.CSSProperties = {};
  if (settings.backgroundType === 'image' && settings.backgroundUrl) {
    visualStyle.backgroundImage = `url(${settings.backgroundUrl})`;
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
      <div
        className="max-w-7xl mx-auto grid items-center"
        style={{
          padding: isMobile ? '40px 16px' : '64px 32px',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 32 : 48,
        }}
      >
        {/* Text */}
        <div className="relative z-10">
          <span
            className="inline-block uppercase font-semibold mb-5 pb-1.5 border-b-2"
            style={{ color: primaryColor, borderColor: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}
          >
            — Imobiliária
          </span>
          <h1
            className="font-bold text-gray-900 leading-[1.05] mb-5"
            style={{ fontSize: isMobile ? 36 : 56, fontFamily: 'Georgia, serif' }}
          >
            {settings.headline}
          </h1>
          <p className="text-gray-500 max-w-xl mb-8 leading-relaxed" style={{ fontSize: isMobile ? 15 : 18 }}>
            {settings.subheadline}
          </p>
          {settings.ctaLabel && (
            <span
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full shadow-md"
              style={{ backgroundColor: primaryColor, fontSize: isMobile ? 13 : 15 }}
            >
              {settings.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Visual */}
        <div className="relative">
          <div
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl"
            style={{ ...visualStyle, aspectRatio: isMobile ? '4/5' : '4/5' }}
          >
            {settings.backgroundType === 'image' && settings.backgroundUrl && settings.overlayOpacity > 0 && (
              <div className="absolute inset-0" style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }} />
            )}
          </div>
          {!isMobile && (
            <>
              <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-2xl" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full" style={{ borderColor: primaryColor, borderWidth: 3, borderStyle: 'solid', opacity: 0.4 }} />
            </>
          )}
        </div>
      </div>

      {embedSearchBar && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-4 pb-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-2 border border-gray-100">
            <SearchBarPreview settings={searchBarSettings!} embedded />
          </div>
        </div>
      )}
    </section>
  );
}
