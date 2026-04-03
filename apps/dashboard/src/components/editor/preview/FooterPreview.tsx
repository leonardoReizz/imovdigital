import type { FooterSettings } from '@imovdigital/types';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

export function FooterPreview({ settings }: { settings: FooterSettings }) {
  return (
    <div
      className="px-8 py-12"
      style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-12 mb-8">
          {/* Brand */}
          <div className="flex-1">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="h-8 mb-4 object-contain" />
            ) : (
              <div className="h-8 w-24 bg-white/10 rounded mb-4" />
            )}
            <p className="text-sm opacity-70">{settings.description}</p>
            {settings.creci && (
              <p className="text-xs opacity-50 mt-2">{settings.creci}</p>
            )}

            {/* Social icons */}
            {(settings.showInstagram || settings.showFacebook || settings.showYoutube || settings.showLinkedin || settings.showTiktok) && (
              <div className="flex items-center gap-3 mt-4">
                {(settings.showInstagram ?? true) && <span className="p-1.5 bg-white/10 rounded-lg"><Instagram className="w-4 h-4" /></span>}
                {(settings.showFacebook ?? true) && <span className="p-1.5 bg-white/10 rounded-lg"><Facebook className="w-4 h-4" /></span>}
                {settings.showYoutube && <span className="p-1.5 bg-white/10 rounded-lg"><Youtube className="w-4 h-4" /></span>}
                {settings.showLinkedin && <span className="p-1.5 bg-white/10 rounded-lg"><Linkedin className="w-4 h-4" /></span>}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li><span className="text-sm opacity-70">Início</span></li>
              <li><span className="text-sm opacity-70">Imóveis</span></li>
              <li><span className="text-sm opacity-70">Sobre</span></li>
              <li><span className="text-sm opacity-70">Contato</span></li>
            </ul>
          </div>

          {/* Custom Columns */}
          {settings.columns.map((col, i) => (
            <div key={i} className="flex-1">
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <span className="text-sm opacity-70 hover:opacity-100 cursor-pointer">{link.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-sm opacity-50">{settings.copyrightText}</p>
        </div>
      </div>
    </div>
  );
}
