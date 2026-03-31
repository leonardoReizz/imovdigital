import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Type,
  LayoutTemplate,
  Image,
  SlidersHorizontal,
  Search,
  Grid3X3,
  PanelLeft,
  Eye,
  Save,
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import type { SiteTheme } from '@imovdigital/types';
import { TEMPLATE_PRESETS, THEME_MODERNO } from '@imovdigital/types';

// ─── Editor Tabs ─────────────────────────────────────────────

const TABS = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'colors', label: 'Cores', icon: Palette },
  { id: 'typography', label: 'Tipografia', icon: Type },
  { id: 'hero', label: 'Hero / Banner', icon: Image },
  { id: 'cards', label: 'Cards', icon: Grid3X3 },
  { id: 'filters', label: 'Filtros', icon: SlidersHorizontal },
  { id: 'header', label: 'Cabeçalho', icon: PanelLeft },
  { id: 'search', label: 'Busca', icon: Search },
] as const;

const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato',
  'Montserrat', 'Playfair Display', 'Merriweather',
  'Nunito', 'Raleway', 'DM Sans', 'Space Grotesk',
] as const;

// ─── Small Components ────────────────────────────────────────

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs font-mono border border-gray-200 rounded-lg text-center uppercase"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function SliderField({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</h4>;
}


// ─── Live Iframe Preview ─────────────────────────────────────

function LivePreviewIframe({ theme, previewMode, tenantSlug }: { theme: SiteTheme; previewMode: 'desktop' | 'mobile'; tenantSlug: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = previewMode === 'mobile';

  // Send theme + tenant to iframe whenever they change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const sendData = () => {
      iframe.contentWindow?.postMessage(
        { type: 'IMOVDIGITAL_THEME_UPDATE', theme, tenantSlug },
        '*',
      );
    };

    sendData();
    iframe.addEventListener('load', sendData);
    return () => iframe.removeEventListener('load', sendData);
  }, [theme, tenantSlug]);

  const webUrl = import.meta.env.VITE_WEB_URL || 'http://localhost:5174';

  return (
    <div
      className="transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200"
      style={{
        width: isMobile ? 390 : '100%',
        height: isMobile ? 760 : '100%',
        minHeight: isMobile ? undefined : 600,
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center border border-gray-200">
          minha-imobiliaria.imovdigital.com.br
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={webUrl}
        className="w-full border-0"
        style={{ height: 'calc(100% - 40px)' }}
        title="Prévia do portal"
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function BrandingPage() {
  const [theme, setTheme] = useState<SiteTheme>(THEME_MODERNO);
  const [activeTab, setActiveTab] = useState<string>('templates');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [tenantSlug, setTenantSlug] = useState('');

  useEffect(() => {
    api.get('/tenant')
      .then(({ data }) => {
        if (data.siteTheme) setTheme(data.siteTheme as SiteTheme);
        if (data.slug) setTenantSlug(data.slug);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateNested = (section: keyof SiteTheme, field: string, value: unknown) => {
    setTheme((prev) => ({ ...prev, [section]: { ...(prev[section] as any), [field]: value } }));
    setSaved(false);
  };

  const applyTemplate = (templateId: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === templateId);
    if (preset) { setTheme(preset.theme); setSaved(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/tenant', { siteTheme: theme, primaryColor: theme.colors.primary, secondaryColor: theme.colors.secondary, fontFamily: theme.typography.headingFont });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">Identidade Visual</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <button onClick={() => { setTheme(THEME_MODERNO); setSaved(false); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"><RotateCcw className="w-3.5 h-3.5" />Resetar</button>
          <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20">
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : saved ? <><Check className="w-4 h-4" />Salvo</> : <><Save className="w-4 h-4" />Salvar</>}
          </motion.button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <div className="w-[380px] border-r border-gray-200 bg-white flex shrink-0">
          <div className="w-14 border-r border-gray-100 bg-gray-50/50 py-2 flex flex-col items-center gap-1 shrink-0">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>
                {activeTab === 'templates' && (
                  <div><SectionTitle>Escolha um template</SectionTitle>
                    <div className="space-y-3">
                      {TEMPLATE_PRESETS.map((preset) => (
                        <button key={preset.id} onClick={() => applyTemplate(preset.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${theme.templateId === preset.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{preset.name}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{preset.description}</p>
                            </div>
                            {theme.templateId === preset.id && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 ml-3"><Check className="w-3 h-3 text-white" /></div>}
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            {Object.values(preset.theme.colors).slice(0, 5).map((color, i) => <div key={i} className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: color }} />)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <div><SectionTitle>Cores principais</SectionTitle><div className="space-y-3"><ColorPicker label="Primária" value={theme.colors.primary} onChange={(v) => updateNested('colors', 'primary', v)} /><ColorPicker label="Secundária" value={theme.colors.secondary} onChange={(v) => updateNested('colors', 'secondary', v)} /><ColorPicker label="Destaque" value={theme.colors.accent} onChange={(v) => updateNested('colors', 'accent', v)} /></div></div>
                    <div><SectionTitle>Fundos</SectionTitle><div className="space-y-3"><ColorPicker label="Página" value={theme.colors.background} onChange={(v) => updateNested('colors', 'background', v)} /><ColorPicker label="Cards" value={theme.colors.surface} onChange={(v) => updateNested('colors', 'surface', v)} /></div></div>
                    <div><SectionTitle>Texto</SectionTitle><div className="space-y-3"><ColorPicker label="Principal" value={theme.colors.text} onChange={(v) => updateNested('colors', 'text', v)} /><ColorPicker label="Secundário" value={theme.colors.textMuted} onChange={(v) => updateNested('colors', 'textMuted', v)} /></div></div>
                  </div>
                )}
                {activeTab === 'typography' && (
                  <div className="space-y-6">
                    <SectionTitle>Fontes</SectionTitle>
                    <SelectField label="Títulos" value={theme.typography.headingFont} options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))} onChange={(v) => updateNested('typography', 'headingFont', v)} />
                    <SelectField label="Corpo" value={theme.typography.bodyFont} options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))} onChange={(v) => updateNested('typography', 'bodyFont', v)} />
                    <SelectField label="Tamanho base" value={theme.typography.baseFontSize} options={[{ value: 'sm', label: 'Pequeno' }, { value: 'base', label: 'Médio' }, { value: 'lg', label: 'Grande' }]} onChange={(v) => updateNested('typography', 'baseFontSize', v)} />
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2"><p style={{ fontFamily: theme.typography.headingFont }} className="font-bold text-gray-900">Título de exemplo</p><p style={{ fontFamily: theme.typography.bodyFont }} className="text-sm text-gray-600">Texto de corpo com a fonte selecionada para o portal.</p></div>
                  </div>
                )}
                {activeTab === 'hero' && (
                  <div className="space-y-5">
                    <SectionTitle>Banner Principal</SectionTitle>
                    <SelectField label="Estilo" value={theme.hero.style} options={[{ value: 'fullscreen', label: 'Tela cheia' }, { value: 'half', label: 'Metade' }, { value: 'compact', label: 'Compacto' }, { value: 'none', label: 'Desativado' }]} onChange={(v) => updateNested('hero', 'style', v)} />
                    {theme.hero.style !== 'none' && <>
                      <SliderField label="Escurecimento" value={theme.hero.overlayOpacity} min={0} max={80} unit="%" onChange={(v) => updateNested('hero', 'overlayOpacity', v)} />
                      <ToggleField label="Barra de busca" checked={theme.hero.showSearchBar} onChange={(v) => updateNested('hero', 'showSearchBar', v)} />
                      {theme.hero.showSearchBar && <SelectField label="Posição da busca" value={theme.hero.searchBarPosition} options={[{ value: 'center', label: 'Centralizada' }, { value: 'bottom', label: 'Inferior' }]} onChange={(v) => updateNested('hero', 'searchBarPosition', v)} />}
                      <SectionTitle>Textos</SectionTitle>
                      <div><label className="text-sm text-gray-700 block mb-1">Título</label><input type="text" value={theme.hero.title} onChange={(e) => updateNested('hero', 'title', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" /></div>
                      <div><label className="text-sm text-gray-700 block mb-1">Subtítulo</label><input type="text" value={theme.hero.subtitle} onChange={(e) => updateNested('hero', 'subtitle', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" /></div>
                    </>}
                  </div>
                )}
                {activeTab === 'cards' && (
                  <div className="space-y-5">
                    <SectionTitle>Card do imóvel</SectionTitle>
                    <SelectField label="Estilo" value={theme.propertyCard.style} options={[{ value: 'standard', label: 'Padrão' }, { value: 'minimal', label: 'Minimalista' }, { value: 'detailed', label: 'Detalhado' }]} onChange={(v) => updateNested('propertyCard', 'style', v)} />
                    <SelectField label="Imagem" value={theme.propertyCard.imageAspect} options={[{ value: '16:9', label: '16:9 (Widescreen)' }, { value: '4:3', label: '4:3 (Clássico)' }, { value: '1:1', label: '1:1 (Quadrado)' }]} onChange={(v) => updateNested('propertyCard', 'imageAspect', v)} />
                    <SelectField label="Bordas" value={theme.propertyCard.borderRadius} options={[{ value: 'none', label: 'Retas' }, { value: 'sm', label: 'Leve' }, { value: 'md', label: 'Médio' }, { value: 'lg', label: 'Grande' }, { value: 'xl', label: 'Extra' }]} onChange={(v) => updateNested('propertyCard', 'borderRadius', v)} />
                    <ToggleField label="Preço" checked={theme.propertyCard.showPrice} onChange={(v) => updateNested('propertyCard', 'showPrice', v)} />
                    <ToggleField label="Endereço" checked={theme.propertyCard.showAddress} onChange={(v) => updateNested('propertyCard', 'showAddress', v)} />
                    <ToggleField label="Características" description="Quartos, vagas, área" checked={theme.propertyCard.showFeatures} onChange={(v) => updateNested('propertyCard', 'showFeatures', v)} />
                    <SectionTitle>Grade</SectionTitle>
                    <SelectField label="Colunas" value={String(theme.propertyGrid.columns)} options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} onChange={(v) => updateNested('propertyGrid', 'columns', Number(v))} />
                    <SelectField label="Espaçamento" value={theme.propertyGrid.gap} options={[{ value: 'sm', label: 'Pequeno' }, { value: 'md', label: 'Médio' }, { value: 'lg', label: 'Grande' }]} onChange={(v) => updateNested('propertyGrid', 'gap', v)} />
                  </div>
                )}
                {activeTab === 'filters' && (
                  <div className="space-y-5">
                    <SectionTitle>Posição</SectionTitle>
                    <SelectField label="Local" value={theme.filters.position} options={[{ value: 'top', label: 'Acima' }, { value: 'sidebar', label: 'Lateral' }, { value: 'modal', label: 'Modal' }]} onChange={(v) => updateNested('filters', 'position', v)} />
                    <SectionTitle>Visibilidade</SectionTitle>
                    <ToggleField label="Tipo" checked={theme.filters.showPropertyType} onChange={(v) => updateNested('filters', 'showPropertyType', v)} />
                    <ToggleField label="Venda / Aluguel" checked={theme.filters.showListingType} onChange={(v) => updateNested('filters', 'showListingType', v)} />
                    <ToggleField label="Preço" checked={theme.filters.showPriceRange} onChange={(v) => updateNested('filters', 'showPriceRange', v)} />
                    <ToggleField label="Quartos" checked={theme.filters.showBedrooms} onChange={(v) => updateNested('filters', 'showBedrooms', v)} />
                    <ToggleField label="Bairro" checked={theme.filters.showNeighborhood} onChange={(v) => updateNested('filters', 'showNeighborhood', v)} />
                    <ToggleField label="Comodidades" checked={theme.filters.showAmenities} onChange={(v) => updateNested('filters', 'showAmenities', v)} />
                  </div>
                )}
                {activeTab === 'header' && (
                  <div className="space-y-5">
                    <SectionTitle>Cabeçalho</SectionTitle>
                    <SelectField label="Estilo" value={theme.header.style} options={[{ value: 'solid', label: 'Sólido' }, { value: 'transparent', label: 'Transparente' }, { value: 'gradient', label: 'Gradiente' }]} onChange={(v) => updateNested('header', 'style', v)} />
                    <ToggleField label="Busca no header" checked={theme.header.showSearch} onChange={(v) => updateNested('header', 'showSearch', v)} />
                    <SectionTitle>Rodapé</SectionTitle>
                    <SelectField label="Estilo" value={theme.footer.style} options={[{ value: 'simple', label: 'Simples' }, { value: 'detailed', label: 'Completo' }]} onChange={(v) => updateNested('footer', 'style', v)} />
                  </div>
                )}
                {activeTab === 'search' && (
                  <div className="space-y-5">
                    <SectionTitle>Busca</SectionTitle>
                    <ToggleField label="No hero" checked={theme.hero.showSearchBar} onChange={(v) => updateNested('hero', 'showSearchBar', v)} />
                    <ToggleField label="No cabeçalho" checked={theme.header.showSearch} onChange={(v) => updateNested('header', 'showSearch', v)} />
                    <p className="text-xs text-gray-400">Permite visitantes buscarem por bairro, cidade ou palavra-chave.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-gray-100/50 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-white shrink-0">
            <Eye className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-500 font-medium">Prévia ao vivo — Site real navegável</p>
          </div>
          <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
            <LivePreviewIframe theme={theme} previewMode={previewMode} tenantSlug={tenantSlug} />
          </div>
        </div>
      </div>
    </div>
  );
}
