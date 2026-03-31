export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Comercial',
  LAND: 'Terreno',
  RURAL: 'Rural',
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  SALE: 'Venda',
  RENT: 'Aluguel',
  BOTH: 'Venda e Aluguel',
};

export const BEDROOM_OPTIONS = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'featured', label: 'Destaques' },
];

export const AMENITY_ICONS: Record<string, string> = {
  Piscina: '🏊',
  Academia: '🏋️',
  Churrasqueira: '🔥',
  'Portaria 24h': '🔒',
  Elevador: '🛗',
  Varanda: '🌅',
  Jardim: '🌳',
  'Ar-condicionado': '❄️',
  'Pet Place': '🐾',
  Playground: '🎠',
};
