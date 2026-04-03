import { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import logoImg from '../../assets/logo.png';
import { SectionsList } from '../../components/editor/SectionsList';
import { SectionSettings } from '../../components/editor/SectionSettings';
import { GlobalSettings } from '../../components/editor/GlobalSettings';
import { PropertyDetailSettings } from '../../components/editor/PropertyDetailSettings';
import { SearchPageSettings } from '../../components/editor/SearchPageSettings';
import { SitePreview } from '../../components/editor/SitePreview';
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Upload,
  ExternalLink,
  Undo2,
  Redo2,
  Loader2,
  Layers,
  Palette,
  ArrowLeft,
  Globe,
  Home,
  Search,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { PreviewPage } from '../../store/editorStore';

type PanelTab = 'sections' | 'global' | 'property' | 'search';

function getPreviewLabel(page: PreviewPage, properties: { id: string; title: string }[]) {
  switch (page.type) {
    case 'home':
      return '/';
    case 'search':
      return '/imoveis';
    case 'property': {
      const p = properties.find((pr) => pr.id === page.propertyId);
      return `/imoveis/${p ? p.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30) : page.propertyId.slice(0, 8)}`;
    }
  }
}

export function SiteEditor() {
  const loadConfig = useEditorStore((s) => s.loadConfig);
  const isLoading = useEditorStore((s) => s.isLoading);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const save = useEditorStore((s) => s.save);
  const publish = useEditorStore((s) => s.publish);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const previewPage = useEditorStore((s) => s.previewPage);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);
  const properties = useEditorStore((s) => s.properties);

  const [activeTab, setActiveTab] = useState<PanelTab>('sections');

  // Auto-switch tabs when navigating preview
  const isOnPropertyPage = previewPage.type === 'property';
  const isOnSearchPage = previewPage.type === 'search';
  const effectiveTab =
    isOnPropertyPage && (activeTab === 'sections' || activeTab === 'search') ? 'property' :
    isOnSearchPage && (activeTab === 'sections' || activeTab === 'property') ? 'search' :
    activeTab;

  useAutoSave();

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleSave = async () => {
    try {
      await save();
      toast.success('Configuração salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handlePublish = async () => {
    try {
      await publish();
      toast.success('Site publicado com sucesso!');
    } catch {
      toast.error('Erro ao publicar site');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <img src={logoImg} alt="ImovDigital" className="h-14 object-contain" />
          </a>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm text-gray-500">Editor do Site</span>
          {isDirty && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Alterações não salvas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= historyLength - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Breakpoint toolbar */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-2">
            {([
              { bp: 'desktop' as const, Icon: Monitor, label: 'Desktop' },
              { bp: 'tablet' as const, Icon: Tablet, label: 'Tablet' },
              { bp: 'mobile' as const, Icon: Smartphone, label: 'Mobile' },
            ]).map(({ bp, Icon, label }) => (
              <button
                key={bp}
                onClick={() => setBreakpoint(bp)}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${
                  breakpoint === bp
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Upload className="w-4 h-4" />
            Publicar
          </button>

          {/* View site */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ver site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Page navigation */}
          <div className="flex border-b border-gray-200 shrink-0 px-2 py-2 gap-1">
            <button
              onClick={() => { navigatePreview({ type: 'home' }); setActiveTab('sections'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                previewPage.type === 'home' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <button
              onClick={() => { navigatePreview({ type: 'search' }); setActiveTab('search'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                previewPage.type === 'search' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Busca
            </button>
            <button
              onClick={() => {
                const firstProp = properties[0];
                if (firstProp) {
                  navigatePreview({ type: 'property', propertyId: firstProp.id });
                  setActiveTab('property');
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                previewPage.type === 'property' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Imóvel
            </button>
          </div>

          {/* Settings tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            {/* Context-specific tab */}
            <button
              onClick={() => {
                if (previewPage.type === 'home') setActiveTab('sections');
                else if (previewPage.type === 'search') setActiveTab('search');
                else setActiveTab('property');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                effectiveTab === 'sections' || effectiveTab === 'search' || effectiveTab === 'property'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {previewPage.type === 'home' ? 'Seções' : previewPage.type === 'search' ? 'Busca' : 'Imóvel'}
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                effectiveTab === 'global'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Global
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {effectiveTab === 'sections' ? (
              selectedSectionId ? (
                <SectionSettings />
              ) : (
                <SectionsList />
              )
            ) : effectiveTab === 'search' ? (
              <SearchPageSettings />
            ) : effectiveTab === 'property' ? (
              <PropertyDetailSettings />
            ) : (
              <GlobalSettings />
            )}
          </div>
        </aside>

        {/* Live Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Preview URL bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
            <button
              onClick={() => navigatePreview({ type: 'home' })}
              disabled={previewPage.type === 'home'}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
              title="Voltar à Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 font-mono">
                seusite.imovdigital.com.br{getPreviewLabel(previewPage, properties)}
              </span>
            </div>
          </div>
          <SitePreview />
        </div>
      </div>
    </div>
  );
}
