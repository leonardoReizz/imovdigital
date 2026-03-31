import { PropertyType, ListingType, PropertySort } from './enums';

export interface PropertyImage {
  url: string;
  order: number;
  alt: string;
}

export interface Property {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  slug: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  rentPrice: number | null;
  condoFee: number | null;
  iptuYearly: number | null;
  area: number;
  usableArea: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  petFriendly: boolean;
  furnished: boolean;
  financingAvailable: boolean;
  images: PropertyImage[];
  videoUrl: string | null;
  active: boolean;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  rentPrice?: number;
  condoFee?: number;
  iptuYearly?: number;
  area: number;
  usableArea?: number;
  bedrooms: number;
  suites?: number;
  bathrooms: number;
  parkingSpots: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  petFriendly?: boolean;
  furnished?: boolean;
  financingAvailable?: boolean;
  images?: PropertyImage[];
  videoUrl?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PropertyFilters {
  q?: string;
  type?: PropertyType;
  listingType?: ListingType;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  suites?: number;
  petFriendly?: boolean;
  furnished?: boolean;
  financingAvailable?: boolean;
  page?: number;
  limit?: number;
  sort?: PropertySort;
}

export interface PaginatedList<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
