import type { SiteTheme, TemplatePreset } from './theme';

// ─── Template: Moderno ──────────────────────────────────────
// Clean, spacious, hero fullscreen, grid layout

export const THEME_MODERNO: SiteTheme = {
  templateId: 'moderno',
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: 'base',
  },
  header: {
    style: 'solid',
    position: 'top',
    showSearch: true,
  },
  hero: {
    style: 'fullscreen',
    overlayOpacity: 40,
    showSearchBar: true,
    searchBarPosition: 'center',
    title: 'Encontre o imóvel dos seus sonhos',
    subtitle: 'Busque entre os melhores imóveis da região',
  },
  propertyCard: {
    style: 'standard',
    imageAspect: '16:9',
    showPrice: true,
    showAddress: true,
    showFeatures: true,
    borderRadius: 'xl',
  },
  propertyGrid: {
    layout: 'grid',
    columns: 3,
    gap: 'md',
  },
  filters: {
    position: 'top',
    showPropertyType: true,
    showListingType: true,
    showPriceRange: true,
    showBedrooms: true,
    showNeighborhood: true,
    showAmenities: false,
  },
  propertyDetail: {
    galleryStyle: 'carousel',
    showMap: true,
    showContactForm: true,
    showWhatsapp: true,
    showRelated: true,
  },
  footer: {
    style: 'simple',
    showSocial: true,
    copyrightText: '',
  },
  customCss: '',
};

// ─── Template: Clássico ─────────────────────────────────────
// Elegant, serif headings, sidebar filters, warm tones

export const THEME_CLASSICO: SiteTheme = {
  templateId: 'classico',
  colors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#c4a35a',
    background: '#faf9f6',
    surface: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    baseFontSize: 'base',
  },
  header: {
    style: 'transparent',
    position: 'top',
    showSearch: false,
  },
  hero: {
    style: 'half',
    overlayOpacity: 30,
    showSearchBar: true,
    searchBarPosition: 'bottom',
    title: 'Imóveis selecionados para você',
    subtitle: 'Encontre o endereço perfeito com nossa curadoria exclusiva',
  },
  propertyCard: {
    style: 'minimal',
    imageAspect: '4:3',
    showPrice: true,
    showAddress: true,
    showFeatures: true,
    borderRadius: 'md',
  },
  propertyGrid: {
    layout: 'grid',
    columns: 3,
    gap: 'lg',
  },
  filters: {
    position: 'sidebar',
    showPropertyType: true,
    showListingType: true,
    showPriceRange: true,
    showBedrooms: true,
    showNeighborhood: true,
    showAmenities: true,
  },
  propertyDetail: {
    galleryStyle: 'grid',
    showMap: true,
    showContactForm: true,
    showWhatsapp: true,
    showRelated: true,
  },
  footer: {
    style: 'detailed',
    showSocial: true,
    copyrightText: '',
  },
  customCss: '',
};

// ─── All Presets ─────────────────────────────────────────────

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Layout limpo e espaçoso com hero em tela cheia, busca centralizada e cards arredondados. Ideal para imobiliárias que buscam um visual atual.',
    thumbnail: '/templates/moderno.svg',
    theme: THEME_MODERNO,
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Design elegante com tipografia serifada, filtros laterais e tons sóbrios. Perfeito para imobiliárias de alto padrão.',
    thumbnail: '/templates/classico.svg',
    theme: THEME_CLASSICO,
  },
];
