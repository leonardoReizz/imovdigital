import type { ContactSettings } from '@imovdigital/types';
import { MapPin, MessageCircle, Send } from 'lucide-react';

export function Contact({ settings, primaryColor }: { settings: ContactSettings; primaryColor: string }) {
  return (
    <section className="px-4 sm:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{settings.title}</h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="flex-1 space-y-6">
            {settings.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                <p className="text-gray-600">{settings.address}</p>
              </div>
            )}
            {settings.showWhatsApp && settings.whatsAppNumber && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-gray-600">{settings.whatsAppNumber}</p>
              </div>
            )}
            {settings.showMap && (
              <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-sm text-gray-400">Mapa</p>
              </div>
            )}
          </div>
          {settings.showForm && (
            <div className="flex-1 bg-gray-50 rounded-xl p-6 space-y-4">
              <input placeholder="Seu nome" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              <input placeholder="Seu e-mail" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              <textarea placeholder="Mensagem" rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
              <button className="w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                <Send className="w-4 h-4" /> Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
