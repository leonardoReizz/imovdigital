import type { FooterSettings } from '@imovdigital/types';
import { resolveFileUrl } from '@/lib/api';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

interface Props {
  settings: FooterSettings;
  contactData?: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    tiktok?: string | null;
  } | null;
}

export function Footer({ settings, contactData }: Props) {
  const socials = [
    { url: contactData?.instagram, icon: Instagram, show: settings.showInstagram ?? true, label: 'Instagram' },
    { url: contactData?.facebook, icon: Facebook, show: settings.showFacebook ?? true, label: 'Facebook' },
    { url: contactData?.youtube, icon: Youtube, show: settings.showYoutube ?? false, label: 'YouTube' },
    { url: contactData?.linkedin, icon: Linkedin, show: settings.showLinkedin ?? false, label: 'LinkedIn' },
  ].filter((s) => s.url && s.show);

  return (
    <footer className="px-4 sm:px-8 pt-16 pb-8" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="max-w-7xl mx-auto">
        {/* Top: huge brand statement */}
        <div className="grid lg:grid-cols-12 gap-10 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="lg:col-span-7">
            {settings.logoUrl ? (
              <img src={resolveFileUrl(settings.logoUrl)} alt="" className="mb-6 object-contain" style={{ height: (settings.logoSize || 32) * 1.4 }} />
            ) : (
              <div className="h-12 w-32 rounded mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            )}
            <p className="font-serif text-2xl sm:text-3xl leading-snug max-w-2xl opacity-90">{settings.description}</p>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Navegação</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-base opacity-80 hover:opacity-100 transition-opacity">Início</a></li>
                <li><a href="/imoveis" className="text-base opacity-80 hover:opacity-100 transition-opacity">Imóveis</a></li>
                <li><a href="/#sobre" className="text-base opacity-80 hover:opacity-100 transition-opacity">Sobre</a></li>
                <li><a href="/#contato" className="text-base opacity-80 hover:opacity-100 transition-opacity">Contato</a></li>
              </ul>
            </div>
            {socials.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Redes</h4>
                <div className="flex items-center gap-2">
                  {socials.map((s, i) => (
                    <a key={i} href={s.url!} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-2.5 rounded-full transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <s.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom columns */}
        {settings.columns.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 py-10 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {settings.columns.map((col, i) => (
              <div key={i}>
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href={link.url} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Bottom: copyright + creci */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs opacity-50">
          <p>{settings.copyrightText}</p>
          {settings.creci && <p>{settings.creci}</p>}
        </div>
      </div>
    </footer>
  );
}
