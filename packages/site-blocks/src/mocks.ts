// Editor-only mocks. Used by the dashboard canvas when the tenant has no
// real properties yet, so the corretor can see how Listings/PropertyCard
// will look. Never rendered in apps/web (production).

import type { Property } from '@imovdigital/types';

const MOCK_TITLE = 'Adicione imóveis';
const MOCK_DESCRIPTION = 'Quando você cadastrar um imóvel ele vai aparecer aqui.';

const MOCK_CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'];
const MOCK_NEIGHBORHOODS = ['Jardins', 'Centro', 'Vila Madalena', 'Pinheiros', 'Moema', 'Ipanema'];

function makeMock(index: number): Property {
  const cityIndex = index % MOCK_CITIES.length;
  const nbIndex = index % MOCK_NEIGHBORHOODS.length;
  const price = 350000 + (index * 85000); // cents
  const rentPrice = 2500 + (index * 350);
  const featured = index < 3;

  return {
    id: `mock-${index}`,
    tenantId: 'mock',
    title: MOCK_TITLE,
    description: MOCK_DESCRIPTION,
    slug: `adicione-imoveis-${index}`,
    type: 'APARTMENT' as Property['type'],
    listingType: index % 3 === 0 ? ('RENT' as Property['listingType']) : ('SALE' as Property['listingType']),
    price: price * 100, // to cents
    rentPrice: rentPrice * 100,
    condoFee: 45000,
    iptuYearly: 120000,
    area: 60 + index * 12,
    usableArea: null,
    bedrooms: 1 + (index % 4),
    suites: index % 3,
    bathrooms: 1 + (index % 3),
    parkingSpots: index % 3,
    floor: null,
    totalFloors: null,
    yearBuilt: null,
    neighborhood: MOCK_NEIGHBORHOODS[nbIndex],
    city: MOCK_CITIES[cityIndex],
    state: 'SP',
    zipCode: '00000-000',
    fullAddress: `${MOCK_NEIGHBORHOODS[nbIndex]}, ${MOCK_CITIES[cityIndex]}`,
    latitude: null,
    longitude: null,
    amenities: [],
    petFriendly: index % 2 === 0,
    furnished: index % 3 === 0,
    financingAvailable: false,
    images: [], // cards will render placeholder tiles
    videoUrl: null,
    active: true,
    featured,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date() as unknown as Date,
    updatedAt: new Date() as unknown as Date,
  };
}

export function buildMockProperties(count = 12): Property[] {
  return Array.from({ length: count }).map((_, i) => makeMock(i));
}

export const MOCK_CITIES_LIST = MOCK_CITIES;
export const MOCK_NEIGHBORHOODS_LIST = MOCK_NEIGHBORHOODS;
