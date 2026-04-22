import type { FooterSettings } from '@imovdigital/types';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { Img } from '../../../Img';

export function FooterPreview({ settings }: { settings: FooterSettings }) {
  const socials = [
    { show: settings.showInstagram ?? true, Icon: Instagram },
    { show: settings.showFacebook ?? true, Icon: Facebook },
    { show: settings.showYoutube ?? false, Icon: Youtube },
    { show: settings.showLinkedin ?? false, Icon: Linkedin },
  ].filter((s) => s.show);

  return (
    <div className="px-4 sm:px-8 pt-16 pb-8" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 pb-10 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="lg:col-span-7">
            {settings.logoUrl ? (
              <Img src={settings.logoUrl} alt="" className="mb-5 object-contain" style={{ height: (settings.logoSize || 32) * 1.4 }} />
            ) : (
              <div className="h-12 w-32 rounded mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            )}
            <p className="leading-snug max-w-2xl opacity-90" style={{ fontSize: 22, fontFamily: 'Georgia, serif' }}>{settings.description}</p>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h4 className="uppercase opacity-50 mb-3" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Navegação</h4>
              <ul className="space-y-2">
                <li><span className="text-base opacity-80">Início</span></li>
                <li><span className="text-base opacity-80">Imóveis</span></li>
                <li><span className="text-base opacity-80">Sobre</span></li>
                <li><span className="text-base opacity-80">Contato</span></li>
              </ul>
            </div>
            {socials.length > 0 && (
              <div>
                <h4 className="uppercase opacity-50 mb-3" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Redes</h4>
                <div className="flex items-center gap-2">
                  {socials.map(({ Icon }, i) => (
                    <span key={i} className="p-2.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <Icon className="w-4 h-4" />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {settings.columns.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 py-10 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {settings.columns.map((col, i) => (
              <div key={i}>
                <h4 className="uppercase opacity-50 mb-3" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => <li key={j}><span className="text-sm opacity-80">{link.label}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="pt-6 flex items-center justify-between text-xs opacity-50">
          <p>{settings.copyrightText}</p>
          {settings.creci && <p>{settings.creci}</p>}
        </div>
      </div>
    </div>
  );
}
