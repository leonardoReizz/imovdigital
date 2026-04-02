import { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { Section, SectionType } from '@imovdigital/types';
import { SECTION_LABELS } from '@imovdigital/types';
import { Pencil, Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

// Preview components
import { HeroPreview } from './preview/HeroPreview';
import { SearchBarPreview } from './preview/SearchBarPreview';
import { FeaturedListingsPreview } from './preview/FeaturedListingsPreview';
import { AboutPreview } from './preview/AboutPreview';
import { AgentsPreview } from './preview/AgentsPreview';
import { TestimonialsPreview } from './preview/TestimonialsPreview';
import { CTABannerPreview } from './preview/CTABannerPreview';
import { ContactPreview } from './preview/ContactPreview';
import { FooterPreview } from './preview/FooterPreview';

// Page previews
import { PreviewHeader } from './preview/PreviewHeader';
import { PropertyDetailPreview } from './preview/PropertyDetailPreview';
import { SearchResultsPreview } from './preview/SearchResultsPreview';

const PREVIEW_COMPONENTS: Record<SectionType, React.ComponentType<{ settings: any }>> = {
  hero: HeroPreview,
  search_bar: SearchBarPreview,
  featured_listings: FeaturedListingsPreview,
  about: AboutPreview,
  agents: AgentsPreview,
  testimonials: TestimonialsPreview,
  cta_banner: CTABannerPreview,
  contact: ContactPreview,
  footer: FooterPreview,
};

const BREAKPOINT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

// ─── Section Wrapper with Overlay ────────────────────────────

function SectionWrapper({ section, index, total }: { section: Section; index: number; total: number }) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const toggleVisibility = useEditorStore((s) => s.toggleSectionVisibility);
  const removeSection = useEditorStore((s) => s.removeSection);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const config = useEditorStore((s) => s.config);

  const isSelected = selectedSectionId === section.id;
  const Preview = PREVIEW_COMPONENTS[section.type];

  const handleMove = (direction: 'up' | 'down') => {
    if (!config) return;
    const sorted = [...config.sections].sort((a, b) => a.order - b.order);
    const ids = sorted.map((s) => s.id);
    const idx = ids.indexOf(section.id);
    if (direction === 'up' && idx > 0) {
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
    }
    reorderSections(ids);
  };

  if (!section.visible) return null;

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
    >
      <Preview settings={section.settings} />

      {/* Hover overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-blue-400/50 transition-colors pointer-events-none" />

      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={() => selectSection(section.id)}
          className="p-1.5 bg-blue-600 text-white rounded-lg shadow-lg text-xs flex items-center gap-1"
          title="Editar"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => toggleVisibility(section.id)}
          className="p-1.5 bg-white text-gray-600 rounded-lg shadow-lg"
          title="Ocultar"
        >
          {section.visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        {index > 0 && (
          <button
            onClick={() => handleMove('up')}
            className="p-1.5 bg-white text-gray-600 rounded-lg shadow-lg"
            title="Mover para cima"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        )}
        {index < total - 1 && (
          <button
            onClick={() => handleMove('down')}
            className="p-1.5 bg-white text-gray-600 rounded-lg shadow-lg"
            title="Mover para baixo"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => removeSection(section.id)}
          className="p-1.5 bg-white text-red-500 rounded-lg shadow-lg"
          title="Excluir"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Section label */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <span className="text-xs bg-black/70 text-white px-2 py-1 rounded-md">
          {SECTION_LABELS[section.type]}
        </span>
      </div>
    </div>
  );
}

// ─── Home Page (sections) ────────────────────────────────────

function HomePagePreview() {
  const config = useEditorStore((s) => s.config);

  if (!config) return null;

  const sorted = [...config.sections].sort((a, b) => a.order - b.order);
  const visible = sorted.filter((s) => s.visible);

  return (
    <>
      {visible.map((section, index) => (
        <SectionWrapper
          key={section.id}
          section={section}
          index={index}
          total={visible.length}
        />
      ))}

      {visible.length === 0 && (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <p className="text-sm">Nenhuma seção visível. Adicione seções no painel lateral.</p>
        </div>
      )}
    </>
  );
}

// ─── Property Detail Page ────────────────────────────────────

function PropertyPagePreview({ propertyId }: { propertyId: string }) {
  const properties = useEditorStore((s) => s.properties);
  const navigatePreview = useEditorStore((s) => s.navigatePreview);

  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-3">
        <p className="text-sm">Imóvel não encontrado</p>
        <button
          onClick={() => navigatePreview({ type: 'home' })}
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar à página inicial
        </button>
      </div>
    );
  }

  return <PropertyDetailPreview property={property} />;
}

// ─── Footer for internal pages ───────────────────────────────

function PageFooter() {
  const config = useEditorStore((s) => s.config);
  if (!config) return null;

  const footerSection = config.sections.find((s) => s.type === 'footer' && s.visible);
  if (!footerSection) return null;

  return <FooterPreview settings={footerSection.settings as any} />;
}

// ─── Main Preview ────────────────────────────────────────────

export function SitePreview() {
  const config = useEditorStore((s) => s.config);
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const previewPage = useEditorStore((s) => s.previewPage);
  const loadProperties = useEditorStore((s) => s.loadProperties);

  // Load properties on mount for real data in previews
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Carregando preview...
      </div>
    );
  }

  const previewId = 'site-preview-container';
  const isInternalPage = previewPage.type !== 'home';

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto min-h-0">
      <link href={`https://fonts.googleapis.com/css2?family=${config.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`} rel="stylesheet" />
      <style>{`#${previewId}, #${previewId} * { font-family: '${config.fontFamily}', sans-serif !important; }`}</style>
      <div className="flex justify-center p-4">
        <div
          id={previewId}
          className="bg-white shadow-xl transition-all duration-300"
          style={{
            width: BREAKPOINT_WIDTHS[breakpoint],
            maxWidth: '100%',
            zoom: ((config as any).fontSize || 16) / 16,
          }}
        >
          {/* Header for internal pages */}
          {isInternalPage && <PreviewHeader />}

          {/* Page content */}
          {previewPage.type === 'home' && <HomePagePreview />}
          {previewPage.type === 'search' && <SearchResultsPreview />}
          {previewPage.type === 'property' && (
            <PropertyPagePreview propertyId={previewPage.propertyId} />
          )}

          {/* Footer on internal pages */}
          {isInternalPage && <PageFooter />}
        </div>
      </div>
    </div>
  );
}
