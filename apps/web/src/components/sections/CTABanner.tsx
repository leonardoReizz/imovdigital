import type { CTABannerSettings } from '@imovdigital/types';
import { resolveFileUrl } from '@/lib/api';

export function CTABanner({ settings }: { settings: CTABannerSettings }) {
  const bgStyle: React.CSSProperties = settings.backgroundType === 'gradient'
    ? { background: `linear-gradient(135deg, ${settings.backgroundValue}, ${settings.backgroundValue}dd)` }
    : settings.backgroundType === 'image'
      ? { backgroundImage: `url(${resolveFileUrl(settings.backgroundValue)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: settings.backgroundValue };

  return (
    <section className="px-4 sm:px-8 py-20" style={bgStyle}>
      <div className="max-w-4xl mx-auto text-center" style={{ color: settings.textColor }}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{settings.headline}</h2>
        <p className="text-lg opacity-80 mb-8">{settings.subheadline}</p>
        {settings.ctaLabel && (
          <a href={settings.ctaUrl} className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity">
            {settings.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
