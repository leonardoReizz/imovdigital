'use client';

import { useState } from 'react';
import { Share2, Link2, Facebook, Mail, X, Check } from 'lucide-react';

// WhatsApp icon as inline SVG since lucide doesn't have it
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface ShareButtonProps {
  title: string;
  primaryColor: string;
}

export function ShareButton({ title, primaryColor }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `Confira este imóvel: ${title}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const options = [
    {
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="w-5 h-5" />,
      color: 'text-green-600 hover:bg-green-50',
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank'),
    },
    {
      label: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'text-blue-600 hover:bg-blue-50',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      label: 'E-mail',
      icon: <Mail className="w-5 h-5" />,
      color: 'text-gray-600 hover:bg-gray-50',
      onClick: () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`),
    },
    {
      label: copied ? 'Copiado!' : 'Copiar link',
      icon: copied ? <Check className="w-5 h-5 text-green-600" /> : <Link2 className="w-5 h-5" />,
      color: copied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50',
      onClick: handleCopy,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-56">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase">Compartilhar</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => { opt.onClick(); if (opt.label !== 'Copiar link' && opt.label !== 'Copiado!') setOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors ${opt.color}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
