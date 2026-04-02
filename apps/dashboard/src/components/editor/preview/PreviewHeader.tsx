import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { Home, Search, Menu, X, Info, Phone } from 'lucide-react';

export function PreviewHeader() {
  const config = useEditorStore((s) => s.config);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = config?.primaryColor || '#2563eb';
  const [menuOpen, setMenuOpen] = useState(false);

  const isMobile = breakpoint === 'mobile';

  const navItems = [
    { label: 'Início', icon: Home, action: () => navigatePreview({ type: 'home' }) },
    { label: 'Imóveis', icon: Search, action: () => navigatePreview({ type: 'search' }) },
    { label: 'Sobre', icon: Info, action: () => {} },
    { label: 'Contato', icon: Phone, action: () => {} },
  ];

  const handleNav = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-30">
      {/* Header bar */}
      <div
        className="flex items-center justify-between bg-white border-b border-gray-200 shadow-sm"
        style={{ padding: isMobile ? '8px 12px' : '12px 24px' }}
      >
        <div className="flex items-center gap-3 shrink-0">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt="Logo"
              style={{ height: isMobile ? 24 : 28 }}
              className="object-contain cursor-pointer"
              onClick={() => { navigatePreview({ type: 'home' }); setMenuOpen(false); }}
            />
          ) : (
            <div
              className="rounded flex items-center font-bold text-white cursor-pointer"
              style={{ backgroundColor: primaryColor, padding: isMobile ? '2px 8px' : '4px 12px', fontSize: isMobile ? 12 : 14 }}
              onClick={() => { navigatePreview({ type: 'home' }); setMenuOpen(false); }}
            >
              Logo
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        ) : (
          <nav className="flex items-center gap-5 text-sm text-gray-600">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.action)}
                className="hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.action)}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <item.icon className="w-4 h-4 text-gray-400" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
