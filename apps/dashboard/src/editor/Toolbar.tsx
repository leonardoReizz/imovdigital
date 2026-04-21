import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  Rocket,
  Save,
  Minus,
  Plus,
  Keyboard,
  Palette,
} from 'lucide-react';
import type { Breakpoint } from '@imovdigital/types';
import { selectCanRedo, selectCanUndo, useEditorStore } from './store';
import { ShortcutsModal } from './ShortcutsModal';
import { ThemePanel } from './ThemePanel';
import { PageSwitcher } from './PageSwitcher';

const VIEWPORTS: { value: Breakpoint; icon: typeof Monitor; label: string }[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function Toolbar() {
  const navigate = useNavigate();

  const page = useEditorStore((s) => s.page);
  const viewport = useEditorStore((s) => s.viewport);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const setViewport = useEditorStore((s) => s.setViewport);
  const save = useEditorStore((s) => s.save);
  const publish = useEditorStore((s) => s.publish);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore(selectCanUndo);
  const canRedo = useEditorStore(selectCanRedo);
  const zoom = useEditorStore((s) => s.zoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetZoom = useEditorStore((s) => s.resetZoom);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setShortcutsOpen((v) => !v);
    window.addEventListener('editor:toggle-shortcuts', onToggle);
    return () => window.removeEventListener('editor:toggle-shortcuts', onToggle);
  }, []);

  return (
    <header className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 hover:bg-slate-100 rounded-md"
          title="Voltar ao dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <PageSwitcher />
        {page && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {page.status === 'published' ? 'Publicada' : 'Rascunho'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
        {VIEWPORTS.map((vp) => {
          const Icon = vp.icon;
          return (
            <button
              key={vp.value}
              onClick={() => setViewport(vp.value)}
              className={`px-2 py-1 rounded flex items-center gap-1.5 text-xs font-medium ${
                viewport === vp.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
              title={vp.label}
            >
              <Icon className="w-3.5 h-3.5" />
              {vp.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
          title="Desfazer (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
          title="Refazer (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-0.5 bg-slate-100 rounded-md px-1 py-0.5">
          <button
            onClick={zoomOut}
            className="p-1 hover:bg-white rounded"
            title="Diminuir zoom"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={resetZoom}
            className="px-1.5 text-[11px] tabular-nums font-medium text-slate-600 hover:bg-white rounded min-w-[38px]"
            title="Resetar (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1 hover:bg-white rounded"
            title="Aumentar zoom"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={() => {
            if (page) window.open(`/dashboard/pages/${page.id}/preview`, '_blank');
          }}
          className="px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1.5 text-slate-600"
          title="Abrir preview em nova aba"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>

        <button
          onClick={() => save()}
          disabled={!isDirty || isSaving}
          className="px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1.5 text-slate-600 disabled:opacity-40"
          title="Salvar (Cmd+S)"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Salvando…' : 'Salvar'}
        </button>

        <button
          onClick={() => setThemeOpen(true)}
          className="px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1.5 text-slate-600"
          title="Tema global (cores e fontes)"
        >
          <Palette className="w-3.5 h-3.5" />
          Tema
        </button>

        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"
          title="Atalhos de teclado (Cmd+/)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={() => publish()}
          className="ml-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-md text-xs font-medium flex items-center gap-1.5 text-white"
        >
          <Rocket className="w-3.5 h-3.5" />
          Publicar
        </button>
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </header>
  );
}
