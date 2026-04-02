import type { AboutSettings } from '@imovdigital/types';
import { Building2 } from 'lucide-react';

export function About({ settings, primaryColor }: { settings: AboutSettings; primaryColor: string }) {
  return (
    <section className="px-4 sm:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${settings.imagePosition === 'left' ? '' : 'md:flex-row-reverse'}`}>
          <div className="flex-1 w-full">
            {settings.imageUrl ? (
              <img src={settings.imageUrl} alt={settings.title} className="w-full rounded-xl object-cover aspect-[4/3]" />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-200" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{settings.title}</h2>
            <p className="text-gray-600 leading-relaxed">{settings.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
