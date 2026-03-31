import type { SearchBarSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { Search } from 'lucide-react';

const RADIUS_MAP = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' };

const FIELD_LABELS: Record<string, string> = {
  tipo: 'Tipo',
  cidade: 'Cidade',
  bairro: 'Bairro',
  preco: 'Preço',
  quartos: 'Quartos',
};

interface SearchBarPreviewProps {
  settings: SearchBarSettings;
  embedded?: boolean;
}

export function SearchBarPreview({ settings, embedded }: SearchBarPreviewProps) {
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);

  const isMobile = breakpoint === 'mobile';

  const handleSearch = () => {
    navigatePreview({ type: 'search' });
  };

  // Mobile: single search input style
  if (isMobile) {
    const mobileBar = (
      <div
        className="mx-auto flex items-center gap-2 p-2 shadow-lg cursor-pointer"
        style={{
          backgroundColor: settings.backgroundColor,
          borderRadius: RADIUS_MAP[settings.borderRadius],
        }}
        onClick={handleSearch}
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
        <span className="flex-1 text-sm text-gray-400 truncate">{settings.placeholder}</span>
        <button
          className="p-2 text-white rounded-lg shrink-0"
          style={{ backgroundColor: primaryColor }}
          onClick={handleSearch}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    );

    if (embedded) return mobileBar;
    if (settings.position !== 'standalone') return null;
    return <div className="px-4 py-4 bg-gray-50">{mobileBar}</div>;
  }

  // Desktop/Tablet: full fields
  const bar = (
    <div
      className="max-w-4xl mx-auto flex items-center gap-3 p-3 shadow-lg"
      style={{
        backgroundColor: settings.backgroundColor,
        borderRadius: RADIUS_MAP[settings.borderRadius],
      }}
    >
      {settings.fields.map((field) => (
        <div key={field} className="flex-1 px-3 py-2 border-r border-gray-100 last:border-0 cursor-pointer" onClick={handleSearch}>
          <span className="text-xs text-gray-400">{FIELD_LABELS[field]}</span>
          <p className="text-sm text-gray-300 mt-0.5">Selecionar...</p>
        </div>
      ))}
      <button
        className="p-3 text-white rounded-lg shrink-0 hover:opacity-90 transition-opacity"
        style={{ backgroundColor: primaryColor }}
        onClick={handleSearch}
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
  );

  if (embedded) return bar;
  if (settings.position !== 'standalone') return null;

  return (
    <div className="px-8 py-6 bg-gray-50">
      {bar}
    </div>
  );
}
