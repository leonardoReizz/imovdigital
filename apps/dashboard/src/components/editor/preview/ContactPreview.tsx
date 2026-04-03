import type { ContactSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { MapPin, MessageCircle, Send } from 'lucide-react';

export function ContactPreview({ settings }: { settings: ContactSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const cd = useEditorStore((s) => s.contactData);
  const isMobile = breakpoint === 'mobile';

  const showEmailField = settings.showEmailField ?? false;
  const showPhoneField = settings.showPhoneField ?? true;

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900 text-center mb-10">{settings.title}</h2>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 24 : 48 }}>
          {/* Info */}
          <div className="space-y-6" style={{ flex: 1 }}>
            {cd?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                <p className="text-gray-600">{cd.address}</p>
              </div>
            )}

            {settings.showWhatsApp && cd?.whatsapp && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-gray-600">{cd.whatsapp}</p>
              </div>
            )}

            {settings.showMap && (
              cd?.latitude && cd?.longitude ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-gray-100">
                  <iframe
                    src={`https://maps.google.com/maps?ll=${cd.latitude},${cd.longitude}&z=15&t=m&output=embed`}
                    className="absolute inset-0 w-full h-full border-0"
                    style={{ pointerEvents: 'none' }}
                    loading="lazy"
                    title="Mapa"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-xs text-gray-400">Configure o endereço em Contato no painel</p>
                </div>
              )
            )}
          </div>

          {/* Form */}
          {settings.showForm && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-3" style={{ flex: 1 }}>
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-400">Seu nome *</div>
              {showEmailField && (
                <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-400">Seu e-mail {!showPhoneField ? '*' : ''}</div>
              )}
              {showPhoneField && (
                <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-400">Seu WhatsApp {!showEmailField ? '*' : ''}</div>
              )}
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 h-20">Mensagem (opcional)</div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                <Send className="w-4 h-4" /> Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
