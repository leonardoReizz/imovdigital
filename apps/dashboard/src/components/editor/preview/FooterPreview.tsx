import type { FooterSettings } from '@imovdigital/types';

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
          </div>

          {/* Columns */}
          {settings.columns.map((col, i) => (
            <div key={i} className="flex-1">
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <span className="text-sm opacity-70 hover:opacity-100 cursor-pointer">
                      {link.label}
                    </span>
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
