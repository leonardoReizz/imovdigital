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
  whatsAppNumber: string;
  showForm: boolean;
  address: string;
}

export interface FooterSettings {
  logoUrl: string | null;
  description: string;
  showSocials: boolean;
  socials: { platform: string; url: string }[];
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

  // Contact
  contactPosition: 'sidebar' | 'bottom' | 'floating';
  showContactForm: boolean;

  // Quick action buttons
  showWhatsApp: boolean;
  whatsAppNumber: string;
  showPhone: boolean;
  phoneNumber: string;

  // Address & Map
  showAddress: boolean;
  showMap: boolean;
  mapRadius: number; // meters for the privacy circle

  // Details
  showAmenities: boolean;
  showDescription: boolean;
  showCosts: boolean;
}

export const DEFAULT_PROPERTY_DETAIL_CONFIG: PropertyDetailConfig = {
  galleryStyle: 'grid',
  contactPosition: 'sidebar',
  showContactForm: true,
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
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;

  // Sections
  sections: Section[];

  // Property detail page config
  propertyDetail: PropertyDetailConfig;

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
    showStats: true,
    stats: [
      { label: 'Anos de experiência', value: '10+' },
      { label: 'Imóveis vendidos', value: '500+' },
      { label: 'Clientes satisfeitos', value: '1000+' },
    ],
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
    whatsAppNumber: '',
    showForm: true,
    address: '',
  },
  footer: {
    logoUrl: null,
    description: '',
    showSocials: true,
    socials: [],
    columns: [],
    copyrightText: '© 2026 Todos os direitos reservados.',
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
  },
};
