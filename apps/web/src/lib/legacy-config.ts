// Legacy config used by /imoveis and /imoveis/:slug until Phase 5 rebuilds
// those pages on top of the new Page/Section/Element model.

export interface PropertyDetailConfig {
  galleryStyle: 'grid' | 'carousel' | 'single';
  contactPosition: 'sidebar' | 'bottom' | 'floating';
  showContactForm: boolean;
  chatTooltip: string;
  showWhatsApp: boolean;
  whatsAppNumber: string;
  showPhone: boolean;
  phoneNumber: string;
  showAddress: boolean;
  showMap: boolean;
  mapRadius: number;
  showAmenities: boolean;
  showDescription: boolean;
  showCosts: boolean;
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

export interface SearchPageConfig {
  pagination: 'paginated' | 'infinite_scroll';
  itemsPerPage: number;
  filterPosition: 'top' | 'sidebar';
  showTypeFilter: boolean;
  showListingFilter: boolean;
  showBedroomsFilter: boolean;
  showBathroomsFilter: boolean;
  showParkingFilter: boolean;
  showCityFilter: boolean;
  showNeighborhoodFilter: boolean;
  showPriceFilter: boolean;
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
