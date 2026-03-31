export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  RURAL = 'RURAL',
}

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
