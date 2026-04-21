import { createElement, type ReactElement } from 'react';
import type { Property, PropertyBinding, TextElement } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Imóvel Comercial',
  LAND: 'Terreno',
  COBERTURA: 'Cobertura',
  CHACARA: 'Chácara',
  SITIO: 'Sítio',
  SOBRADO: 'Sobrado',
  GALPAO: 'Galpão',
  LOFT: 'Loft',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'Venda',
  RENT: 'Aluguel',
  BOTH: 'Venda ou Aluguel',
};

function resolveBinding(property: Property, binding: PropertyBinding): string {
  switch (binding) {
    case 'title': return property.title;
    case 'description': return property.description;
    case 'price': return formatPrice(property.price);
    case 'rentPrice':
      return property.rentPrice ? `${formatPrice(property.rentPrice)}/mês` : '';
    case 'area': return `${property.area} m²`;
    case 'bedrooms': return String(property.bedrooms);
    case 'bathrooms': return String(property.bathrooms);
    case 'parkingSpots': return String(property.parkingSpots);
    case 'neighborhood': return property.neighborhood;
    case 'city': return property.city;
    case 'fullAddress': return property.fullAddress;
    case 'type': return TYPE_LABELS[property.type] ?? property.type;
    case 'listingType': return LISTING_LABELS[property.listingType] ?? property.listingType;
  }
}

export function TextBlock({ element }: { element: TextElement }): ReactElement {
  const { property } = useBlocks();

  let content: string = element.content;
  if (element.binding && property) {
    const resolved = resolveBinding(property, element.binding);
    if (resolved) content = resolved;
  }

  return createElement(
    element.tag,
    { style: { margin: 0, ...elementStyleToCss(element.style) } },
    content,
  );
}
