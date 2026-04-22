import type { CTABannerSettings } from '@imovdigital/types';
import { ArrowRight } from 'lucide-react';

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
    <div className="px-4 sm:px-8 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative px-8 sm:px-16 py-16 sm:py-20 overflow-hidden" style={bgStyle}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />
          <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center" style={{ color: settings.textColor }}>
            <div className="lg:col-span-8">
              <span className="inline-block uppercase font-semibold mb-3 opacity-80" style={{ fontSize: 11, letterSpacing: '0.2em' }}>— Vamos conversar</span>
              <h2 className="font-bold leading-tight mb-3" style={{ fontSize: 36, fontFamily: 'Georgia, serif' }}>{settings.headline}</h2>
              <p className="text-base sm:text-lg opacity-80 max-w-2xl">{settings.subheadline}</p>
            </div>
            {settings.ctaLabel && (
              <div className="lg:col-span-4 lg:text-right">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-full shadow-lg">
                  {settings.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
