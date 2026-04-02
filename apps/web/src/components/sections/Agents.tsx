import type { AgentsSettings } from '@imovdigital/types';
import { User, Phone, Mail } from 'lucide-react';

export function Agents({ settings }: { settings: AgentsSettings }) {
  return (
    <section className="px-4 sm:px-8 py-16">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{settings.title}</h2>
        <p className="text-gray-500 mb-10">{settings.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-900">Corretor</h3>
              <p className="text-sm text-gray-500 mt-1">CRECI 00000</p>
              {settings.showContact && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="p-2 bg-gray-50 rounded-lg"><Phone className="w-4 h-4 text-gray-400" /></span>
                  <span className="p-2 bg-gray-50 rounded-lg"><Mail className="w-4 h-4 text-gray-400" /></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
