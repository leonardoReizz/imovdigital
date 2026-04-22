import type { AboutSettings } from '@imovdigital/types';
import { resolveFileUrl } from '@/lib/api';
import { Building2 } from 'lucide-react';

export function About({ settings, primaryColor }: { settings: AboutSettings; primaryColor: string }) {
  const imageLeft = settings.imagePosition === 'left';

  return (
    <section className="px-4 sm:px-8 py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${imageLeft ? '' : 'lg:[&>:first-child]:order-2'}`}>
          {/* Image block */}
          <div className="lg:col-span-7 relative">
            {settings.imageUrl ? (
              <img src={resolveFileUrl(settings.imageUrl)} alt={settings.title} className="w-full aspect-[4/5] lg:aspect-[5/6] object-cover" />
            ) : (
              <div className="w-full aspect-[4/5] lg:aspect-[5/6] bg-stone-200 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-stone-300" />
              </div>
            )}
            {/* Decorative big number/accent */}
            <div
              className={`absolute ${imageLeft ? '-right-4 -bottom-6' : '-left-4 -bottom-6'} px-6 py-4 bg-white shadow-xl`}
              style={{ borderLeft: `4px solid ${primaryColor}` }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Desde</p>
              <p className="font-serif text-2xl font-bold text-gray-900">2010</p>
            </div>
          </div>

          {/* Text block */}
          <div className="lg:col-span-5 space-y-6">
            <span
              className="inline-block uppercase tracking-[0.2em] text-[11px] font-semibold pb-1.5 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              — Quem somos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1]">
              {settings.title}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">{settings.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
