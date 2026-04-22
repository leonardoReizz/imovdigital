import type { CTABannerSettings } from '@imovdigital/types';

export function CTABannerPreview({ settings }: { settings: CTABannerSettings }) {
  const bgStyle: React.CSSProperties = {};

  if (settings.backgroundType === 'gradient') {
    const from = settings.gradientFrom || settings.backgroundValue;
    const to = settings.gradientTo || `${settings.backgroundValue}dd`;
    const direction = settings.gradientDirection || '135deg';
    bgStyle.background = `linear-gradient(${direction}, ${from}, ${to})`;
  } else if (settings.backgroundType === 'image') {
    bgStyle.backgroundImage = `url(${settings.backgroundValue})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else {
    bgStyle.backgroundColor = settings.backgroundValue;
  }

  return (
    <div className="px-8 py-20" style={bgStyle}>
      <div className="max-w-4xl mx-auto text-center" style={{ color: settings.textColor }}>
        <h2 className="text-3xl font-bold mb-3">{settings.headline}</h2>
        <p className="text-lg opacity-80 mb-8">{settings.subheadline}</p>
        {settings.ctaLabel && (
          <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg">
            {settings.ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
