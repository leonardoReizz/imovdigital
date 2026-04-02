import type { ContactSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { MapPin, MessageCircle, Send } from 'lucide-react';

export function ContactPreview({ settings }: { settings: ContactSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const isMobile = breakpoint === 'mobile';

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900 text-center mb-10">{settings.title}</h2>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 24 : 48 }}>
          {/* Info */}
          <div className="space-y-6" style={{ flex: 1 }}>
            {settings.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
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

          {/* Form */}
          {settings.showForm && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4" style={{ flex: 1 }}>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Nome</label>
                <div className="h-10 bg-white border border-gray-200 rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">E-mail</label>
                <div className="h-10 bg-white border border-gray-200 rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Mensagem</label>
                <div className="h-24 bg-white border border-gray-200 rounded-lg" />
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
