import { useState } from 'react';
import { MessageCircle, X, Headphones, Bug, Lightbulb, HelpCircle } from 'lucide-react';

const PHONE = import.meta.env.VITE_SUPPORT_WHATSAPP || '5500000000000';

const OPTIONS = [
  { label: 'Preciso de ajuda', icon: HelpCircle, message: 'Olá! Preciso de ajuda com a plataforma ImovDigital.' },
  { label: 'Reportar um problema', icon: Bug, message: 'Olá! Gostaria de reportar um problema na plataforma ImovDigital.' },
  { label: 'Sugerir funcionalidade', icon: Lightbulb, message: 'Olá! Tenho uma sugestão de funcionalidade para o ImovDigital.' },
];

export function SupportWidget() {
  const [open, setOpen] = useState(false);

  const openWhatsApp = (message: string) => {
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank');
    setOpen(false);
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-5 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-semibold">Suporte</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              <p className="text-xs text-gray-500 px-1 pb-2">Como podemos ajudar?</p>
              {OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => openWhatsApp(opt.message)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <opt.icon className="w-4 h-4 text-gray-400" />
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">Atendimento via WhatsApp</p>
            </div>
          </div>
        </>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors hover:scale-105"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </>
  );
}
