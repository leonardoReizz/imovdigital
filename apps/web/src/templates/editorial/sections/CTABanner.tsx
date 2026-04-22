import type { CTABannerSettings } from '@imovdigital/types';
import { resolveFileUrl } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

export function CTABanner({ settings }: { settings: CTABannerSettings }) {
  const bgStyle: React.CSSProperties = settings.backgroundType === 'gradient'
    ? { background: `linear-gradient(${settings.gradientDirection || '135deg'}, ${settings.gradientFrom || settings.backgroundValue}, ${settings.gradientTo || `${settings.backgroundValue}dd`})` }
    : settings.backgroundType === 'image'
      ? { backgroundImage: `url(${resolveFileUrl(settings.backgroundValue)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: settings.backgroundValue };

  return (
    <section className="px-4 sm:px-8 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative px-8 sm:px-16 py-16 sm:py-24 overflow-hidden" style={bgStyle}>
          {/* Diagonal accent strip */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center" style={{ color: settings.textColor }}>
            <div className="lg:col-span-8">
              <span className="inline-block uppercase tracking-[0.2em] text-[11px] font-semibold mb-4 opacity-80">— Vamos conversar</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">{settings.headline}</h2>
              <p className="text-lg opacity-80 max-w-2xl">{settings.subheadline}</p>
            </div>
            {settings.ctaLabel && (
              <div className="lg:col-span-4 lg:text-right">
                <a
                  href={settings.ctaUrl}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-medium rounded-full shadow-lg hover:translate-x-1 transition-transform"
                >
                  {settings.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
