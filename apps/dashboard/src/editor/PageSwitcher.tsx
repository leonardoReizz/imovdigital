import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronDown,
  FileText,
  Home,
  Building2,
  Search as SearchIcon,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { listPages, type PageListItem } from './api';
import { useEditorStore } from './store';

const RESERVED_META: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: 'Página inicial', icon: Home },
  property: { label: 'Detalhe do imóvel', icon: Building2 },
  search: { label: 'Busca de imóveis', icon: SearchIcon },
};

export function PageSwitcher() {
  const navigate = useNavigate();
  const { id: currentId } = useParams<{ id: string }>();
  const page = useEditorStore((s) => s.page);
  const isDirty = useEditorStore((s) => s.isDirty);
  const save = useEditorStore((s) => s.save);

  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listPages()
      .then(setPages)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  async function switchTo(id: string) {
    if (id === currentId) {
      setOpen(false);
      return;
    }
    if (isDirty) {
      const choice = window.confirm(
        'Você tem alterações não salvas. Deseja salvar antes de trocar de página?\n\nOK = Salvar e trocar\nCancelar = Descartar e trocar',
      );
      if (choice) await save();
    }
    setOpen(false);
    navigate(`/dashboard/pages/${id}/editor`);
  }

  const reserved = pages.filter((p) => p.reserved);
  const custom = pages.filter((p) => !p.reserved);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 text-sm font-medium text-slate-900 max-w-[240px]"
        title="Trocar de página"
      >
        <span className="truncate">{page?.title ?? 'Editor'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Carregando…</div>
            ) : (
              <>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Páginas padrão
                </div>
                <ul>
                  {reserved.map((p) => {
                    const meta = RESERVED_META[p.slug] ?? { label: p.title, icon: FileText };
                    const Icon = meta.icon;
                    const active = p.id === currentId;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => switchTo(p.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 ${
                            active ? 'bg-slate-100' : ''
                          }`}
                        >
                          <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {meta.label}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">/{p.slug}</p>
                          </div>
                          {p.status === 'published' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {custom.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 mt-1" />
                    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Páginas de campanha
                    </div>
                    <ul>
                      {custom.map((p) => {
                        const active = p.id === currentId;
                        return (
                          <li key={p.id}>
                            <button
                              onClick={() => switchTo(p.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 ${
                                active ? 'bg-slate-100' : ''
                              }`}
                            >
                              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {p.title}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">/{p.slug}</p>
                              </div>
                              {p.status === 'published' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
          <div className="border-t border-slate-100 p-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/pages');
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded"
            >
              Ver todas as páginas…
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
