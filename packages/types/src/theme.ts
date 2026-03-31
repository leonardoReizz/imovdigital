// ─── Theme System ────────────────────────────────────────────
// Controls all visual aspects of a tenant's public portal.
// Stored as JSON on the Tenant model.

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  baseFontSize: 'sm' | 'base' | 'lg';
}

export interface ThemeHeader {
  style: 'solid' | 'transparent' | 'gradient';
  position: 'top' | 'left';
  showSearch: boolean;
}

export interface ThemeHero {
  style: 'fullscreen' | 'half' | 'compact' | 'none';
  overlayOpacity: number; // 0-100
  showSearchBar: boolean;
  searchBarPosition: 'center' | 'bottom';
  title: string;
  subtitle: string;
}

export interface ThemePropertyCard {
  style: 'standard' | 'minimal' | 'detailed';
  imageAspect: '16:9' | '4:3' | '1:1';
  showPrice: boolean;
  showAddress: boolean;
  showFeatures: boolean;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ThemePropertyGrid {
  layout: 'grid' | 'list' | 'masonry';
  columns: 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
}

export interface ThemeFilters {
  position: 'sidebar' | 'top' | 'modal';
  showPropertyType: boolean;
  showListingType: boolean;
  showPriceRange: boolean;
  showBedrooms: boolean;
  showNeighborhood: boolean;
  showAmenities: boolean;
}

export interface ThemePropertyDetail {
  galleryStyle: 'carousel' | 'grid' | 'fullwidth';
  showMap: boolean;
  showContactForm: boolean;
  showWhatsapp: boolean;
  showRelated: boolean;
}

export interface ThemeFooter {
  style: 'simple' | 'detailed';
  showSocial: boolean;
  copyrightText: string;
}

export interface SiteTheme {
  templateId: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  header: ThemeHeader;
  hero: ThemeHero;
  propertyCard: ThemePropertyCard;
  propertyGrid: ThemePropertyGrid;
  filters: ThemeFilters;
  propertyDetail: ThemePropertyDetail;
  footer: ThemeFooter;
  customCss: string;
}

// ─── Template Presets ────────────────────────────────────────

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme: SiteTheme;
}
