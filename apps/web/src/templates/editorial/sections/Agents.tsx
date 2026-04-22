import type { AgentsSettings } from '@imovdigital/types';
import { User, Phone, Mail } from 'lucide-react';

export function Agents({ settings }: { settings: AgentsSettings }) {
  return (
    <section className="px-4 sm:px-8 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-3">{settings.title}</h2>
          <p className="text-gray-500 text-lg">{settings.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group">
              <div className="aspect-[4/5] bg-stone-100 mb-5 overflow-hidden flex items-center justify-center">
                <User className="w-16 h-16 text-stone-300 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Corretor</p>
              <p className="font-serif text-xl text-gray-900 mb-2">Nome do corretor</p>
              <p className="text-xs text-gray-500">CRECI 00000</p>
              {settings.showContact && (
                <div className="flex items-center gap-2 mt-4 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="w-px h-4 bg-gray-200" />
                  <Mail className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
