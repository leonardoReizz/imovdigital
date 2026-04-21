import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Box,
  Home,
  Search,
  FormInput,
  Minus,
  MoveVertical,
  Video,
  Map,
  MapPin,
  LayoutGrid,
  ListFilter,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  GalleryHorizontal,
  GalleryVerticalEnd,
  PanelBottom,
  PanelTop,
  PanelLeftClose,
  Square,
  Layers,
  Mail,
  Tags,
  DollarSign,
  Maximize2,
  type LucideIcon,
} from 'lucide-react';
import type { Element as BlockElement, ElementType, Page, SectionType } from '@imovdigital/types';
import { SECTION_LABELS, ELEMENT_LABELS } from '@imovdigital/types';
import { useEditorStore } from '../store';
import { NewElementDraggable, NewSectionDraggable } from '../dnd/draggables';

const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  navbar: PanelTop,
  hero: Home,
  listings: LayoutGrid,
  search: ListFilter,
  features: Sparkles,
  cta: Square,
  gallery: GalleryHorizontal,
  testimonials: MessageSquareQuote,
  faq: HelpCircle,
  footer: PanelBottom,
  blank: Layers,
};

const ELEMENT_ICONS: Record<ElementType, LucideIcon> = {
  text: Type,
  image: ImageIcon,
  button: MousePointerClick,
  container: Box,
  listings: LayoutGrid,
  search: Search,
  form: FormInput,
  divider: Minus,
  spacer: MoveVertical,
  video: Video,
  map: Map,
  property_gallery: GalleryVerticalEnd,
  property_map: MapPin,
  property_contact_form: Mail,
  property_tags: Tags,
  property_prices: DollarSign,
  property_specs: Maximize2,
};

const SECTION_ORDER: SectionType[] = [
  'navbar',
  'hero',
  'listings',
  'search',
  'features',
  'cta',
  'gallery',
  'testimonials',
  'faq',
  'footer',
  'blank',
];

const ELEMENT_ORDER: ElementType[] = [
  'text',
  'image',
  'button',
  'container',
  'listings',
  'search',
  'form',
  'divider',
  'spacer',
  'video',
  'map',
];

const PROPERTY_ELEMENT_ORDER: ElementType[] = [
  'property_gallery',
  'property_prices',
  'property_specs',
  'property_tags',
  'property_map',
  'property_contact_form',
];

export function ElementLibrary() {
  const page = useEditorStore((s) => s.page);
  const selection = useEditorStore((s) => s.selection);
  const insertSection = useEditorStore((s) => s.insertSection);
  const insertElement = useEditorStore((s) => s.insertElement);
  const toggle = useEditorStore((s) => s.toggleLeftPanel);

  // Determine which section the element will be added to.
  const targetSectionId =
    selection?.kind === 'section'
      ? selection.id
      : selection?.kind === 'element'
        ? findSectionIdForElement(page, selection.id)
        : page?.sections[page.sections.length - 1]?.id;

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex-shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between p-3 pb-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Seções
        </h2>
        <button
          onClick={toggle}
          title="Colapsar painel (Cmd+,)"
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {SECTION_ORDER.map((type) => {
            const Icon = SECTION_ICONS[type];
            return (
              <NewSectionDraggable key={type} sectionType={type}>
                <button
                  onClick={() => insertSection(type)}
                  className="w-full flex flex-col items-center gap-1 p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-md text-xs"
                  title="Clique ou arraste pro canvas"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700 text-[11px] leading-tight text-center">
                    {SECTION_LABELS[type]}
                  </span>
                </button>
              </NewSectionDraggable>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Blocos do imóvel
        </h2>
        <p className="text-[11px] text-slate-400 mb-2">
          Puxam dados do imóvel automaticamente (use na página "Detalhe do imóvel").
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PROPERTY_ELEMENT_ORDER.map((type) => {
            const Icon = ELEMENT_ICONS[type];
            return (
              <NewElementDraggable key={type} elementType={type}>
                <button
                  disabled={!targetSectionId}
                  onClick={() => targetSectionId && insertElement(targetSectionId, type)}
                  className="w-full flex flex-col items-center gap-1 p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-md text-xs disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
                  title="Clique ou arraste pro canvas"
                >
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-700 text-[11px] leading-tight text-center">
                    {ELEMENT_LABELS[type]}
                  </span>
                </button>
              </NewElementDraggable>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Elementos
        </h2>
        {!targetSectionId && (
          <p className="text-[11px] text-slate-400 mb-2">
            Selecione uma seção para adicionar elementos.
          </p>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {ELEMENT_ORDER.map((type) => {
            const Icon = ELEMENT_ICONS[type];
            return (
              <NewElementDraggable key={type} elementType={type}>
                <button
                  disabled={!targetSectionId}
                  onClick={() => targetSectionId && insertElement(targetSectionId, type)}
                  className="w-full flex flex-col items-center gap-1 p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-md text-xs disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
                  title="Clique ou arraste pro canvas"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700 text-[11px] leading-tight text-center">
                    {ELEMENT_LABELS[type]}
                  </span>
                </button>
              </NewElementDraggable>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function findSectionIdForElement(page: Page | null, elementId: string): string | undefined {
  if (!page) return undefined;
  for (const section of page.sections) {
    if (containsElement(section.children, elementId)) return section.id;
  }
  return undefined;
}

function containsElement(elements: BlockElement[], id: string): boolean {
  for (const el of elements) {
    if (el.id === id) return true;
    if (el.type === 'container' && containsElement(el.children, id)) return true;
  }
  return false;
}
