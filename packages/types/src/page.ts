// ─── Visual Editor v2 — Page / Section / Element ──────────────
// A tenant owns N Pages. Each Page has a vertical flow of Sections.
// Inside a Section, children are rendered as "free" (absolute),
// "stack" (flow) or "grid". Components are shared between the
// editor canvas and the published site.

// ─── Primitives ───────────────────────────────────────────────

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export type SectionLayout = 'free' | 'stack' | 'grid';

export interface GridConfig {
  cols: number;
  gap: number;
  direction?: 'row' | 'column';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

export interface SectionStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: { color: string; opacity: number };
  paddingTop?: number;
  paddingBottom?: number;
  paddingX?: number;
  minHeight?: number;
  maxWidth?: number | 'full';
  align?: 'left' | 'center' | 'right';
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  w: number | 'auto' | 'full';
  h: number | 'auto';
}

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingX?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// ─── Theme ────────────────────────────────────────────────────

export interface ThemeTokens {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  fontSize: number; // base px
  borderRadius: number; // base px
}

// ─── Elements ─────────────────────────────────────────────────

export type ElementType =
  | 'text'
  | 'image'
  | 'button'
  | 'container'
  | 'listings'
  | 'search'
  | 'form'
  | 'divider'
  | 'spacer'
  | 'video'
  | 'map'
  // Property-specific blocks — data-bound to the current property on the
  // `property` template page (/imoveis/:slug).
  | 'property_gallery'
  | 'property_map'
  | 'property_contact_form'
  | 'property_tags'
  | 'property_prices'
  | 'property_specs';

interface ElementBase<T extends ElementType> {
  id: string;
  type: T;
  position?: ElementPosition;
  size?: ElementSize;
  style: ElementStyle;
  hidden?: Partial<Record<Breakpoint, boolean>>;
  responsive?: Partial<Record<Breakpoint, ResponsiveElementOverride>>;
  /**
   * When the parent section/container is in `grid` layout, how many
   * columns this element spans. Defaults to 1. Ignored in free/stack.
   */
  gridSpan?: number;
}

export interface ResponsiveElementOverride {
  position?: ElementPosition;
  size?: ElementSize;
  style?: ElementStyle;
}

/**
 * Fields from the current Property that a text element can bind to.
 * When set, the rendered content is pulled from the active property in
 * the BlocksContext instead of the element's literal `content`.
 * Used primarily on the `property` template page.
 */
export type PropertyBinding =
  | 'title'
  | 'description'
  | 'price'
  | 'rentPrice'
  | 'area'
  | 'bedrooms'
  | 'bathrooms'
  | 'parkingSpots'
  | 'neighborhood'
  | 'city'
  | 'fullAddress'
  | 'type'
  | 'listingType';

export const PROPERTY_BINDING_LABELS: Record<PropertyBinding, string> = {
  title: 'Título do imóvel',
  description: 'Descrição',
  price: 'Preço',
  rentPrice: 'Aluguel mensal',
  area: 'Área (m²)',
  bedrooms: 'Quartos',
  bathrooms: 'Banheiros',
  parkingSpots: 'Vagas',
  neighborhood: 'Bairro',
  city: 'Cidade',
  fullAddress: 'Endereço completo',
  type: 'Tipo (apartamento, casa…)',
  listingType: 'Operação (venda, aluguel)',
};

export interface TextElement extends ElementBase<'text'> {
  content: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  /** If set, pulls content from the active property at render time. */
  binding?: PropertyBinding | null;
}

export interface ImageElement extends ElementBase<'image'> {
  src: string | null;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill';
  href?: string;
}

export interface ButtonElement extends ElementBase<'button'> {
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  openInNewTab?: boolean;
}

export interface ContainerElement extends ElementBase<'container'> {
  layout: SectionLayout;
  gridConfig?: GridConfig;
  children: Element[];
}

export interface ListingsElement extends ElementBase<'listings'> {
  source: 'featured' | 'filter' | 'manual';
  filter?: {
    type?: string;
    listingType?: 'SALE' | 'RENT' | 'BOTH';
    city?: string;
    neighborhood?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
  };
  manualIds?: string[];
  count: number;
  display: 'grid' | 'carousel' | 'list';
  columns: 1 | 2 | 3 | 4;
  cardTemplate: 'compact' | 'standard' | 'highlight';
  sortBy: 'recent' | 'price_asc' | 'price_desc' | 'area_desc' | 'manual';
  showLoadMore?: boolean;
}

export interface SearchElement extends ElementBase<'search'> {
  fields: Array<
    | 'type'
    | 'operation'
    | 'city'
    | 'neighborhood'
    | 'priceRange'
    | 'bedrooms'
    | 'bathrooms'
    | 'parking'
    | 'areaRange'
  >;
  layout: 'row' | 'stacked' | 'compact' | 'sidebar';
  submitMode: 'redirect' | 'inline';
  submitLabel: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormElement extends ElementBase<'form'> {
  fields: FormField[];
  submitLabel: string;
  destination: 'email' | 'whatsapp' | 'both';
  successMessage: string;
}

export interface DividerElement extends ElementBase<'divider'> {
  thickness: number;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export interface SpacerElement extends ElementBase<'spacer'> {
  height: number;
}

export interface VideoElement extends ElementBase<'video'> {
  src: string;
  provider: 'youtube' | 'vimeo' | 'upload';
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
}

export interface MapElement extends ElementBase<'map'> {
  latitude: number;
  longitude: number;
  zoom: number;
  radius?: number;
  markerLabel?: string;
}

/* ─── Property-specific blocks ──────────────────────────────── */

export interface PropertyGalleryElement extends ElementBase<'property_gallery'> {
  layout: 'grid' | 'carousel' | 'single';
  columns: 2 | 3 | 4;
  aspectRatio: '4:3' | '16:9' | '1:1';
}

export interface PropertyMapElement extends ElementBase<'property_map'> {
  zoom: number;
  approximateOnly: boolean;
}

export interface PropertyContactFormElement extends ElementBase<'property_contact_form'> {
  title: string;
  submitLabel: string;
  showPhoneField: boolean;
  showEmailField: boolean;
  messagePlaceholder: string;
}

export interface PropertyTagsElement extends ElementBase<'property_tags'> {
  layout: 'chips' | 'grid';
  columns: 2 | 3;
  showIcons: boolean;
}

export interface PropertyPricesElement extends ElementBase<'property_prices'> {
  showCondo: boolean;
  showIptu: boolean;
  showTotal: boolean;
  title: string;
}

export interface PropertySpecsElement extends ElementBase<'property_specs'> {
  layout: 'row' | 'grid';
  items: Array<'area' | 'bedrooms' | 'bathrooms' | 'parkingSpots' | 'suites'>;
}

export type Element =
  | TextElement
  | ImageElement
  | ButtonElement
  | ContainerElement
  | ListingsElement
  | SearchElement
  | FormElement
  | DividerElement
  | SpacerElement
  | VideoElement
  | MapElement
  | PropertyGalleryElement
  | PropertyMapElement
  | PropertyContactFormElement
  | PropertyTagsElement
  | PropertyPricesElement
  | PropertySpecsElement;

// ─── Section ──────────────────────────────────────────────────

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'listings'
  | 'search'
  | 'features'
  | 'cta'
  | 'gallery'
  | 'testimonials'
  | 'faq'
  | 'footer'
  | 'blank';

export interface ResponsiveSectionOverride {
  style?: SectionStyle;
  gridConfig?: GridConfig;
  hidden?: boolean;
}

export interface Section {
  id: string;
  type: SectionType;
  layout: SectionLayout;
  style: SectionStyle;
  gridConfig?: GridConfig;
  children: Element[];
  responsive?: Partial<Record<Breakpoint, ResponsiveSectionOverride>>;
}

// ─── Page ─────────────────────────────────────────────────────

export type PageStatus = 'draft' | 'published';

export interface PageSeo {
  title: string;
  description: string;
  ogImage?: string;
}

export interface Page {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  seo: PageSeo;
  theme: ThemeTokens;
  sections: Section[];
  status: PageStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Shape persisted as JSON blob (everything except DB-managed columns).
export type PageData = Omit<
  Page,
  'id' | 'tenantId' | 'slug' | 'title' | 'status' | 'publishedAt' | 'createdAt' | 'updatedAt'
>;

// ─── Labels (pt-BR) ───────────────────────────────────────────

export const SECTION_LABELS: Record<SectionType, string> = {
  navbar: 'Menu (navbar)',
  hero: 'Hero',
  listings: 'Lista de imóveis',
  search: 'Busca',
  features: 'Destaques',
  cta: 'Chamada (CTA)',
  gallery: 'Galeria',
  testimonials: 'Depoimentos',
  faq: 'Perguntas frequentes',
  footer: 'Rodapé',
  blank: 'Vazia',
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
  text: 'Texto',
  image: 'Imagem',
  button: 'Botão',
  container: 'Container',
  listings: 'Lista de imóveis',
  search: 'Busca',
  form: 'Formulário',
  divider: 'Divisor',
  spacer: 'Espaço',
  video: 'Vídeo',
  map: 'Mapa',
  property_gallery: 'Galeria do imóvel',
  property_map: 'Mapa do imóvel',
  property_contact_form: 'Formulário de contato',
  property_tags: 'Características/Amenidades',
  property_prices: 'Valores (preço, IPTU, condomínio)',
  property_specs: 'Specs (área, quartos…)',
};

// ─── Defaults ─────────────────────────────────────────────────

export const DEFAULT_THEME: ThemeTokens = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  fontFamily: 'Inter',
  fontSize: 16,
  borderRadius: 8,
};

export const DEFAULT_SEO: PageSeo = {
  title: '',
  description: '',
};

// Default factories accept an id generator so client and server
// can produce the same shape. Both sides must pass a UUID v4.

export function createDefaultSection(type: SectionType, id: string): Section {
  const base: Section = {
    id,
    type,
    layout: 'stack',
    style: { paddingTop: 64, paddingBottom: 64, paddingX: 24, maxWidth: 1280 },
    children: [],
  };

  switch (type) {
    case 'hero':
      return {
        ...base,
        layout: 'free',
        style: { ...base.style, minHeight: 560, paddingTop: 96, paddingBottom: 96 },
      };
    case 'cta':
      return {
        ...base,
        layout: 'free',
        style: { ...base.style, minHeight: 320 },
      };
    case 'listings':
    case 'features':
    case 'testimonials':
    case 'gallery':
      return {
        ...base,
        layout: 'grid',
        gridConfig: { cols: 3, gap: 24 },
      };
    case 'navbar':
      return {
        id,
        type: 'navbar',
        layout: 'stack',
        style: {
          paddingTop: 16,
          paddingBottom: 16,
          paddingX: 32,
          maxWidth: 'full',
          backgroundColor: '#ffffff',
        },
        gridConfig: {
          cols: 1,
          gap: 16,
          direction: 'row',
          justifyContent: 'between',
          alignItems: 'center',
        },
        children: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Minha Imobiliária',
            tag: 'h3',
            style: { fontSize: 18, fontWeight: 700, color: '#0f172a' },
          },
          {
            id: crypto.randomUUID(),
            type: 'container',
            layout: 'stack',
            gridConfig: { cols: 1, gap: 8, direction: 'row', alignItems: 'center' },
            children: [
              {
                id: crypto.randomUUID(),
                type: 'button',
                label: 'Início',
                url: '/',
                variant: 'ghost',
                style: {},
              },
              {
                id: crypto.randomUUID(),
                type: 'button',
                label: 'Imóveis',
                url: '/imoveis',
                variant: 'ghost',
                style: {},
              },
              {
                id: crypto.randomUUID(),
                type: 'button',
                label: 'Contato',
                url: '#contato',
                variant: 'ghost',
                style: {},
              },
            ],
            style: {},
          },
        ],
      };
    default:
      return base;
  }
}

export function createDefaultPage(
  tenantId: string,
  pageId: string,
  sectionId: string,
  slug = 'home',
): Page {
  const now = new Date().toISOString();
  return {
    id: pageId,
    tenantId,
    slug,
    title: slug === 'home' ? 'Home' : slug,
    seo: { ...DEFAULT_SEO },
    theme: { ...DEFAULT_THEME },
    sections: [createDefaultSection('hero', sectionId)],
    status: 'draft',
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
