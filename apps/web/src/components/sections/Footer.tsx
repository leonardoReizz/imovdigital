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
    { url: contactData?.instagram, icon: Instagram, show: settings.showInstagram ?? true },
    { url: contactData?.facebook, icon: Facebook, show: settings.showFacebook ?? true },
    { url: contactData?.youtube, icon: Youtube, show: settings.showYoutube ?? false },
    { url: contactData?.linkedin, icon: Linkedin, show: settings.showLinkedin ?? false },
  ].filter((s) => s.url && s.show);

  return (
    <footer className="px-4 sm:px-8 py-12" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 mb-8">
          <div className="flex-1">
            {settings.logoUrl ? (
              <img src={resolveFileUrl(settings.logoUrl)} alt="" className="mb-4 object-contain" style={{ height: settings.logoSize || 32 }} />
            ) : (
              <div className="h-8 w-24 bg-white/10 rounded mb-4" />
            )}
            <p className="text-sm opacity-70">{settings.description}</p>
            {settings.creci && (
              <p className="text-xs opacity-50 mt-2">{settings.creci}</p>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {socials.map((s, i) => (
                  <a key={i} href={s.url!} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Início</a></li>
              <li><a href="/imoveis" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Imóveis</a></li>
              <li><a href="/#sobre" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Sobre</a></li>
              <li><a href="/#contato" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contato</a></li>
            </ul>
          </div>
          {settings.columns.map((col, i) => (
            <div key={i} className="flex-1">
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}><a href={link.url} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-sm opacity-50">{settings.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
