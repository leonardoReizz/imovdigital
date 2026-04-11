// ─── Site Config (Visual Editor) ─────────────────────────────
// Each tenant has a SiteConfig stored as JSON, defining the
// sections and global styling of their public website.

export type SectionType =
  | 'hero'
  | 'search_bar'
  | 'featured_listings'
  | 'about'
  | 'agents'
  | 'testimonials'
  | 'cta_banner'
  | 'contact'
  | 'footer';

// ─── Section Settings ────────────────────────────────────────

export interface HeroSettings {
  backgroundType: 'image' | 'video' | 'gradient' | 'color';
  backgroundUrl: string | null;
  overlayOpacity: number;
  overlayColor: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaUrl: string;
  height: 'small' | 'medium' | 'large' | 'full';
  textAlign: 'left' | 'center' | 'right';
}

export interface SearchBarSettings {
  position: 'above_hero' | 'center_hero' | 'below_hero' | 'standalone';
  placeholder: string;
  fields: ('tipo' | 'cidade' | 'bairro' | 'preco' | 'quartos')[];
  backgroundColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface FeaturedListingsSettings {
  title: string;
  subtitle: string;
  layout: 'grid' | 'carousel' | 'list';
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showBadge: boolean;
  maxItems: number;
  filterTag: string | null;
}

export interface AboutSettings {
  title: string;
  text: string;
  imageUrl: string | null;
  imagePosition: 'left' | 'right';
  showStats: boolean;
  stats: { label: string; value: string }[];
}

export interface AgentsSettings {
  title: string;
  subtitle: string;
  layout: 'grid' | 'carousel';
  showContact: boolean;
}

export interface TestimonialsSettings {
  title: string;
  layout: 'carousel' | 'grid';
  source: 'manual' | 'google';
  googlePlaceId: string;
  minRating: number;
  items: {
    name: string;
    text: string;
    rating: number;
    avatarUrl: string | null;
  }[];
}

export interface CTABannerSettings {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaUrl: string;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  textColor: string;
}

export interface ContactSettings {
  title: string;
  showMap: boolean;
  showWhatsApp: boolean;
  showForm: boolean;
  showEmailField: boolean;
  showPhoneField: boolean;
}

export interface FooterSettings {
  logoUrl: string | null;
  logoSize: number; // height in px (default 32)
  description: string;
  creci: string;
  showInstagram: boolean;
  showFacebook: boolean;
  showYoutube: boolean;
  showLinkedin: boolean;
  showTiktok: boolean;
  columns: { title: string; links: { label: string; url: string }[] }[];
  copyrightText: string;
  backgroundColor: string;
  textColor: string;
}

// ─── Settings Map ────────────────────────────────────────────

export interface SectionSettingsMap {
  hero: HeroSettings;
  search_bar: SearchBarSettings;
  featured_listings: FeaturedListingsSettings;
  about: AboutSettings;
  agents: AgentsSettings;
  testimonials: TestimonialsSettings;
  cta_banner: CTABannerSettings;
  contact: ContactSettings;
  footer: FooterSettings;
}

// ─── Property Detail Config ──────────────────────────────────

export interface PropertyDetailConfig {
  // Gallery
  galleryStyle: 'grid' | 'carousel' | 'single';

  // Contact form
  contactPosition: 'sidebar' | 'bottom' | 'floating';
  showContactForm: boolean;
  chatTooltip: string; // tooltip text for floating chat bubble

  // Quick action buttons (shown directly on page)
  showWhatsApp: boolean;
  whatsAppNumber: string;
  showPhone: boolean;
  phoneNumber: string;

  // Address & Map
  showAddress: boolean;
  showMap: boolean;
  mapRadius: number;

  // Details
  showAmenities: boolean;
  showDescription: boolean;
  showCosts: boolean;

  // Similar properties
  showSimilar: boolean;
}

export const DEFAULT_PROPERTY_DETAIL_CONFIG: PropertyDetailConfig = {
  galleryStyle: 'grid',
  contactPosition: 'sidebar',
  showContactForm: true,
  chatTooltip: 'Precisa de ajuda?',
  showWhatsApp: true,
  whatsAppNumber: '',
  showPhone: true,
  phoneNumber: '',
  showAddress: false,
  showMap: true,
  mapRadius: 500,
  showAmenities: true,
  showDescription: true,
  showCosts: true,
  showSimilar: true,
};

// ─── Search Page Config ──────────────────────────────────────

export interface SearchPageConfig {
  // Pagination
  pagination: 'paginated' | 'infinite_scroll';
  itemsPerPage: number;

  // Filters
  filterPosition: 'top' | 'sidebar';
  showTypeFilter: boolean;
  showListingFilter: boolean;
  showBedroomsFilter: boolean;
  showBathroomsFilter: boolean;
  showParkingFilter: boolean;
  showCityFilter: boolean;
  showNeighborhoodFilter: boolean;
  showPriceFilter: boolean;

  // Layout
  layout: 'grid' | 'list';
  columns: 2 | 3 | 4;
  cardCarousel: boolean;
}

export const DEFAULT_SEARCH_PAGE_CONFIG: SearchPageConfig = {
  pagination: 'paginated',
  itemsPerPage: 12,
  filterPosition: 'sidebar',
  showTypeFilter: true,
  showListingFilter: true,
  showBedroomsFilter: true,
  showBathroomsFilter: true,
  showParkingFilter: true,
  showCityFilter: true,
  showNeighborhoodFilter: true,
  showPriceFilter: true,
  layout: 'grid',
  columns: 3,
  cardCarousel: true,
};

// ─── Section ─────────────────────────────────────────────────

export interface Section<T extends SectionType = SectionType> {
  id: string;
  type: T;
  order: number;
  visible: boolean;
  settings: SectionSettingsMap[T];
}

// ─── SiteConfig ──────────────────────────────────────────────

export interface SiteConfig {
  id: string;
  tenantId: string;

  // Global
  primaryColor: string;
  secondaryColor: string;
  fontSize: number; // base font size in px (default 16)
  fontFamily: string;
  logoUrl: string | null;
  logoSize: number; // height in px (default 32)
  faviconUrl: string | null;

  // Sections
  sections: Section[];

  // Property detail page config
  propertyDetail: PropertyDetailConfig;

  // Search/listing page config
  searchPage: SearchPageConfig;

  // Integrations
  googleAnalyticsId: string | null;

  updatedAt: string;
}

// ─── Section Labels (pt-BR) ─────────────────────────────────

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Banner Principal',
  search_bar: 'Barra de Busca',
  featured_listings: 'Imóveis em Destaque',
  about: 'Sobre a Imobiliária',
  agents: 'Corretores',
  testimonials: 'Depoimentos',
  cta_banner: 'Banner CTA',
  contact: 'Contato',
  footer: 'Rodapé',
};

// ─── Default Settings ────────────────────────────────────────

export const DEFAULT_SECTION_SETTINGS: SectionSettingsMap = {
  hero: {
    backgroundType: 'color',
    backgroundUrl: null,
    overlayOpacity: 40,
    overlayColor: '#000000',
    headline: 'Encontre o imóvel dos seus sonhos',
    subheadline: 'As melhores opções de imóveis na sua região',
    ctaLabel: 'Ver Imóveis',
    ctaUrl: '/imoveis',
    height: 'large',
    textAlign: 'center',
  },
  search_bar: {
    position: 'center_hero',
    placeholder: 'Buscar por cidade, bairro...',
    fields: ['tipo', 'cidade', 'bairro', 'preco', 'quartos'],
    backgroundColor: '#ffffff',
    borderRadius: 'lg',
  },
  featured_listings: {
    title: 'Imóveis em Destaque',
    subtitle: 'Selecionamos as melhores opções para você',
    layout: 'grid',
    columns: 3,
    showPrice: true,
    showBadge: true,
    maxItems: 6,
    filterTag: null,
  },
  about: {
    title: 'Sobre Nós',
    text: 'Somos uma imobiliária comprometida em encontrar o imóvel ideal para você.',
    imageUrl: null,
    imagePosition: 'right',
    showStats: false,
    stats: [],
  },
  agents: {
    title: 'Nossa Equipe',
    subtitle: 'Corretores especializados prontos para ajudar',
    layout: 'grid',
    showContact: true,
  },
  testimonials: {
    title: 'O que dizem nossos clientes',
    layout: 'carousel',
    source: 'manual',
    googlePlaceId: '',
    minRating: 0,
    items: [],
  },
  cta_banner: {
    headline: 'Pronto para encontrar seu novo lar?',
    subheadline: 'Entre em contato conosco e agende uma visita',
    ctaLabel: 'Fale Conosco',
    ctaUrl: '/contato',
    backgroundType: 'color',
    backgroundValue: '#2563eb',
    textColor: '#ffffff',
  },
  contact: {
    title: 'Entre em Contato',
    showMap: true,
    showWhatsApp: true,
    showForm: true,
    showEmailField: false,
    showPhoneField: true,
  },
  footer: {
    logoUrl: null,
    logoSize: 32,
    description: '',
    creci: '',
    showInstagram: true,
    showFacebook: true,
    showYoutube: false,
    showLinkedin: false,
    showTiktok: false,
    columns: [],
    copyrightText: '© 2026 Todos os direitos reservados.',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
  },
};
