import type { FooterSettings } from '@imovdigital/types';

export function Footer({ settings }: { settings: FooterSettings }) {
  return (
    <footer className="px-4 sm:px-8 py-12" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 mb-8">
          <div className="flex-1">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="" className="h-8 mb-4 object-contain" />
            ) : (
              <div className="h-8 w-24 bg-white/10 rounded mb-4" />
            )}
            <p className="text-sm opacity-70">{settings.description}</p>
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
