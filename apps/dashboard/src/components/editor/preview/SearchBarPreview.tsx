import type { SearchBarSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { Search } from 'lucide-react';

const RADIUS_MAP = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' };

const FIELD_LABELS: Record<string, string> = {
  tipo: 'Tipo',
  cidade: 'Cidade',
  bairro: 'Bairro',
  preco: 'Modalidade',
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

  const bar = (
    <div
      className="max-w-4xl mx-auto p-3 shadow-lg"
      style={{
        backgroundColor: settings.backgroundColor,
        borderRadius: RADIUS_MAP[settings.borderRadius],
        display: isMobile ? 'grid' : 'flex',
        gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
        gap: isMobile ? 0 : undefined,
        alignItems: 'center',
      }}
    >
      {settings.fields.map((field, i) => (
        <div
          key={field}
          className="cursor-pointer"
          style={{
            flex: isMobile ? undefined : 1,
            padding: isMobile ? '8px 12px' : '8px 12px',
            borderRight: !isMobile && i < settings.fields.length - 1 ? '1px solid #f3f4f6' : undefined,
          }}
          onClick={handleSearch}
        >
          <span className="text-[11px] text-gray-400 block mb-0.5 font-medium">{FIELD_LABELS[field]}</span>
          <p className="text-sm text-gray-300 truncate">Selecionar...</p>
        </div>
      ))}
      <button
        className="text-white shrink-0 flex items-center justify-center gap-2"
        style={{
          backgroundColor: primaryColor,
          borderRadius: '0.5rem',
          padding: isMobile ? '10px' : '12px',
          ...(isMobile ? { gridColumn: '1 / -1', marginTop: 8 } : { marginLeft: 8 }),
        }}
        onClick={handleSearch}
      >
        <Search className="w-5 h-5" />
        {isMobile && <span className="text-sm font-medium">Buscar</span>}
      </button>
    </div>
  );

  if (embedded) return bar;
  if (settings.position !== 'standalone') return null;

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px' }} className="bg-gray-50">
      {bar}
    </div>
  );
}
