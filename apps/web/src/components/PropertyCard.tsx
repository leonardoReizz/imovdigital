import Link from 'next/link';
import type { Property } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { resolveFileUrl } from '@/lib/api';
import { MapPin, BedDouble, Bath, Car, Home } from 'lucide-react';

interface Props {
  property: Property;
  primaryColor: string;
  layout?: 'vertical' | 'horizontal';
  showPrice?: boolean;
  showBadge?: boolean;
}

export function PropertyCard({ property, primaryColor, layout = 'vertical', showPrice = true, showBadge = true }: Props) {
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;

  if (layout === 'horizontal') {
    return (
      <Link href={`/imoveis/${property.slug}`} className="group flex bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative w-48 sm:w-64 shrink-0 bg-gray-100">
          {hasImage ? (
            <img src={resolveFileUrl(property.images[0].url)} alt={property.images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-gray-200" /></div>
          )}
          {showBadge && property.featured && (
            <span className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>Destaque</span>
          )}
        </div>
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center gap-1.5">
          <p className="text-base font-medium text-gray-900 group-hover:text-[--color-primary] transition-colors">{property.title}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{property.neighborhood}, {property.city}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
            {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
            <span>{property.area}m²</span>
          </div>
          {showPrice && (
            <p className={`text-lg font-bold mt-1 ${isRent ? 'text-[--color-primary]' : 'text-gray-900'}`}>
              {formatPrice(mainPrice)}{isRent && <span className="text-sm font-normal text-gray-500">/mês</span>}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/imoveis/${property.slug}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all">
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {hasImage ? (
          <img src={resolveFileUrl(property.images[0].url)} alt={property.images[0].alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-gray-200" /></div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-white text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: primaryColor }}>
            {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
          </span>
          {showBadge && property.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-md">Destaque</span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-1.5">
        {showPrice && (
          <p className={`text-lg font-bold ${isRent ? 'text-[--color-primary]' : 'text-gray-900'}`}>
            {formatPrice(mainPrice)}{isRent && <span className="text-sm font-normal text-gray-500">/mês</span>}
          </p>
        )}
        <p className="text-sm font-medium text-gray-900 group-hover:text-[--color-primary] transition-colors truncate">{property.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{property.neighborhood}, {property.city}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
      </div>
    </Link>
  );
}
