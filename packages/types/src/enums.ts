export enum PropertyType {
  APARTMENT = 'APARTMENT',
  AREA = 'AREA',
  HOUSE = 'HOUSE',
  HOUSE_COMMERCIAL = 'HOUSE_COMMERCIAL',
  CHACARA = 'CHACARA',
  COBERTURA = 'COBERTURA',
  COMMERCIAL = 'COMMERCIAL',
  CONJUNTO_COMERCIAL = 'CONJUNTO_COMERCIAL',
  GALPAO = 'GALPAO',
  GEMINADO = 'GEMINADO',
  LOFT = 'LOFT',
  PREDIO_COMERCIAL = 'PREDIO_COMERCIAL',
  SALA_COMERCIAL = 'SALA_COMERCIAL',
  SALA_CONJUNTO = 'SALA_CONJUNTO',
  SITIO = 'SITIO',
  SOBRADO = 'SOBRADO',
  LAND = 'LAND',
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  AREA: 'Área',
  HOUSE: 'Casa',
  HOUSE_COMMERCIAL: 'Casa Comercial',
  CHACARA: 'Chácara',
  COBERTURA: 'Cobertura',
  COMMERCIAL: 'Comercial',
  CONJUNTO_COMERCIAL: 'Conjunto Comercial',
  GALPAO: 'Galpão',
  GEMINADO: 'Geminado',
  LOFT: 'Loft',
  PREDIO_COMERCIAL: 'Prédio Comercial',
  SALA_COMERCIAL: 'Sala Comercial',
  SALA_CONJUNTO: 'Sala/Conjunto',
  SITIO: 'Sítio',
  SOBRADO: 'Sobrado',
  LAND: 'Terreno',
  RURAL: 'Rural',
};

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT',
  BOTH = 'BOTH',
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  OVERDUE = 'OVERDUE',
  CANCELED = 'CANCELED',
}

export enum LayoutStyle {
  GRID = 'GRID',
  LIST = 'LIST',
  MAP = 'MAP',
}

export enum LeadSource {
  FORM = 'FORM',
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
}

export enum PropertySort {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
  FEATURED = 'featured',
}
