import { useState } from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { Menu, X } from 'lucide-react';
import { Img } from '../../../Img';

export function PreviewHeader() {
  const config = useEditorStore((s) => s.config);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = config?.primaryColor || '#2563eb';
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = breakpoint === 'mobile';

  const navItems = [
    { label: 'Início', action: () => navigatePreview({ type: 'home' }) },
    { label: 'Imóveis', action: () => navigatePreview({ type: 'search' }) },
    { label: 'Sobre', action: () => {} },
    { label: 'Contato', action: () => {} },
  ];

  return (
    <div className="sticky top-0 z-30">
      <div
        className="flex items-center justify-between bg-white/95 backdrop-blur border-b border-stone-200"
        style={{ padding: isMobile ? '12px 16px' : '16px 32px' }}
      >
        <div className="flex items-center gap-3 shrink-0">
          {config?.logoUrl ? (
            <Img
              src={config.logoUrl}
              alt="Logo"
              style={{ height: isMobile ? Math.min((config as any).logoSize || 32, 28) : (config as any).logoSize || 32 }}
              className="object-contain cursor-pointer"
              onClick={() => navigatePreview({ type: 'home' })}
            />
          ) : (
            <span
              className="cursor-pointer text-gray-900"
              style={{ fontSize: isMobile ? 16 : 20, fontFamily: 'Georgia, serif', fontWeight: 700 }}
              onClick={() => navigatePreview({ type: 'home' })}
            >
              Logo
            </span>
          )}
        </div>

        {isMobile ? (
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-gray-700">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        ) : (
          <nav className="flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="relative uppercase font-semibold text-gray-700 hover:text-gray-900 transition-colors group"
                style={{ fontSize: 11, letterSpacing: '0.2em' }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px transition-all group-hover:w-full" style={{ backgroundColor: primaryColor }} />
              </button>
            ))}
          </nav>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className="bg-white border-b border-stone-200 px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setMenuOpen(false); }}
              className="block w-full text-left text-gray-900"
              style={{ fontSize: 24, fontFamily: 'Georgia, serif' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
