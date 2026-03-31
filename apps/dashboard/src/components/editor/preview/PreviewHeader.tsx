import { useEditorStore } from '../../../store/editorStore';
import { Home, Search, Menu } from 'lucide-react';

export function PreviewHeader() {
  const config = useEditorStore((s) => s.config);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = config?.primaryColor || '#2563eb';

  const isMobile = breakpoint === 'mobile';

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm"
      style={{ padding: isMobile ? '8px 12px' : '12px 24px' }}
    >
      <div className="flex items-center gap-3 shrink-0">
        {config?.logoUrl ? (
          <img
            src={config.logoUrl}
            alt="Logo"
            style={{ height: isMobile ? 24 : 28 }}
            className="object-contain cursor-pointer"
            onClick={() => navigatePreview({ type: 'home' })}
          />
        ) : (
          <div
            className="rounded flex items-center font-bold text-white cursor-pointer"
            style={{ backgroundColor: primaryColor, padding: isMobile ? '2px 8px' : '4px 12px', fontSize: isMobile ? 12 : 14 }}
            onClick={() => navigatePreview({ type: 'home' })}
          >
            Logo
          </div>
        )}
      </div>

      {isMobile ? (
        /* Mobile: hamburger only */
        <button className="p-1.5 text-gray-400 hover:text-gray-600">
          <Menu className="w-5 h-5" />
        </button>
      ) : (
        /* Desktop/Tablet: full nav */
        <nav className="flex items-center gap-5 text-sm text-gray-600">
          <button
            onClick={() => navigatePreview({ type: 'home' })}
            className="hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Início
          </button>
          <button
            onClick={() => navigatePreview({ type: 'search' })}
            className="hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            Imóveis
          </button>
          <button className="hover:text-gray-900 transition-colors">Sobre</button>
          <button className="hover:text-gray-900 transition-colors">Contato</button>
        </nav>
      )}
    </div>
  );
}
