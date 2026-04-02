import type { FeaturedListingsSettings, Property } from '@imovdigital/types';
import { PropertyCard } from '../PropertyCard';
import Link from 'next/link';

export function FeaturedListings({ settings, properties, primaryColor }: { settings: FeaturedListingsSettings; properties: Property[]; primaryColor: string }) {
  const featured = properties.filter((p) => p.featured && p.active);
  const active = properties.filter((p) => p.active);
  const display = (featured.length > 0 ? featured : active).slice(0, settings.maxItems);

  return (
    <section className="px-4 sm:px-8 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.title}</h2>
          <p className="text-gray-500 mt-2">{settings.subtitle}</p>
        </div>

        {settings.layout === 'list' ? (
          <div className="flex flex-col gap-4">
            {display.map((p) => (
              <PropertyCard key={p.id} property={p} primaryColor={primaryColor} layout="horizontal" showPrice={settings.showPrice} showBadge={settings.showBadge} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(settings.columns, 2)}, 1fr)` }}>
            {display.map((p) => (
              <PropertyCard key={p.id} property={p} primaryColor={primaryColor} showPrice={settings.showPrice} showBadge={settings.showBadge} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/imoveis" className="inline-block text-sm font-medium px-6 py-2.5 rounded-lg border-2 transition-colors hover:opacity-80" style={{ borderColor: primaryColor, color: primaryColor }}>
            Ver todos os imóveis
          </Link>
        </div>
      </div>
    </section>
  );
}
