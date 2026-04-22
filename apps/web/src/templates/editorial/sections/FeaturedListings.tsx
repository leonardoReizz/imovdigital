import type { FeaturedListingsSettings, Property } from '@imovdigital/types';
import { PropertyCard } from '../PropertyCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedListings({ settings, properties, primaryColor }: { settings: FeaturedListingsSettings; properties: Property[]; primaryColor: string }) {
  const featured = properties.filter((p) => p.featured && p.active);
  const active = properties.filter((p) => p.active);
  const display = (featured.length > 0 ? featured : active).slice(0, settings.maxItems);

  return (
    <section className="px-4 sm:px-8 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div className="max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 inline-block" style={{ color: primaryColor }}>
              Seleção
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              {settings.title}
            </h2>
            {settings.subtitle && (
              <p className="text-gray-500 mt-3 text-base">{settings.subtitle}</p>
            )}
          </div>
          <Link href="/imoveis" className="hidden sm:flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: primaryColor }}>
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {settings.layout === 'list' ? (
          <div className="flex flex-col">
            {display.map((p) => (
              <PropertyCard key={p.id} property={p} primaryColor={primaryColor} layout="horizontal" showPrice={settings.showPrice} showBadge={settings.showBadge} />
            ))}
          </div>
        ) : settings.layout === 'carousel' ? (
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 sm:-mx-8 px-4 sm:px-8">
            {display.map((p) => (
              <div key={p.id} className="shrink-0 w-[300px] sm:w-[360px] snap-start">
                <PropertyCard property={p} primaryColor={primaryColor} showPrice={settings.showPrice} showBadge={settings.showBadge} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid gap-x-8 gap-y-14"
            style={{ gridTemplateColumns: `repeat(${Math.min(settings.columns, 3)}, minmax(0, 1fr))` }}
          >
            {display.map((p) => (
              <PropertyCard key={p.id} property={p} primaryColor={primaryColor} showPrice={settings.showPrice} showBadge={settings.showBadge} />
            ))}
          </div>
        )}

        <div className="text-center mt-14 sm:hidden">
          <Link href="/imoveis" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: primaryColor }}>
            Ver todos os imóveis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
