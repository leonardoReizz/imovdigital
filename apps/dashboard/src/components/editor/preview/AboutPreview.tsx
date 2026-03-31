import type { AboutSettings } from '@imovdigital/types';
import { Building2 } from 'lucide-react';

export function AboutPreview({ settings }: { settings: AboutSettings }) {
  const imageFirst = settings.imagePosition === 'left';

  return (
    <div className="px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className={`flex items-center gap-12 ${imageFirst ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Image */}
          <div className="flex-1">
            {settings.imageUrl ? (
              <img src={settings.imageUrl} alt="" className="w-full rounded-xl object-cover aspect-[4/3]" />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-200" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">{settings.title}</h2>
            <p className="text-gray-600 leading-relaxed">{settings.text}</p>

            {settings.showStats && settings.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                {settings.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
