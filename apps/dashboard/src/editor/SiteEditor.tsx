import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useEditorStore } from './store';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { ElementLibrary } from './sidebar/ElementLibrary';
import { PropertiesPanel } from './sidebar/PropertiesPanel';
import { EditorDndProvider } from './dnd/EditorDndProvider';
import { SnapGuides } from './SnapGuides';

export function SiteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const loadPage = useEditorStore((s) => s.loadPage);
  const isLoading = useEditorStore((s) => s.isLoading);
  const error = useEditorStore((s) => s.error);
  const page = useEditorStore((s) => s.page);
  const leftOpen = useEditorStore((s) => s.leftPanelOpen);
  const rightOpen = useEditorStore((s) => s.rightPanelOpen);
  const toggleLeft = useEditorStore((s) => s.toggleLeftPanel);
  const toggleRight = useEditorStore((s) => s.toggleRightPanel);

  useEffect(() => {
    if (id) loadPage(id);
  }, [id, loadPage]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-sm text-slate-500">Página não especificada.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-sm text-slate-500">Carregando editor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => navigate('/dashboard/pages')}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-100"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!page) return null;

  return (
    <EditorDndProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          {leftOpen ? (
            <ElementLibrary />
          ) : (
            <button
              onClick={toggleLeft}
              title="Abrir biblioteca (Cmd+,)"
              className="w-6 border-r border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <main className="flex-1 overflow-hidden">
            <Canvas />
          </main>
          {rightOpen ? (
            <PropertiesPanel />
          ) : (
            <button
              onClick={toggleRight}
              title="Abrir propriedades (Cmd+.)"
              className="w-6 border-l border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <SnapGuides />
    </EditorDndProvider>
  );
}
