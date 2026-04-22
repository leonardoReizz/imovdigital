import Link from 'next/link';
import type { Property } from '@imovdigital/types';
import { formatPrice } from '@imovdigital/utils';
import { resolveFileUrl } from '@/lib/api';
import { MapPin, BedDouble, Bath, Car, Home, ArrowUpRight } from 'lucide-react';
import { PropertyImageCarousel } from '@/components/PropertyImageCarousel';

interface Props {
  property: Property;
  primaryColor: string;
  layout?: 'vertical' | 'horizontal';
  showPrice?: boolean;
  showBadge?: boolean;
  carousel?: boolean;
}

export function PropertyCard({ property, primaryColor, layout = 'vertical', showPrice = true, showBadge = true, carousel = true }: Props) {
  const hasImage = property.images && property.images.length > 0;
  const isRent = property.listingType === 'RENT';
  const mainPrice = isRent ? (property.rentPrice || property.price) : property.price;

  const renderImage = () => {
    if (!hasImage) {
      return <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-gray-200" /></div>;
    }
    if (carousel && property.images.length > 1) {
      return <PropertyImageCarousel images={property.images} />;
    }
    return <img src={resolveFileUrl(property.images[0].url)} alt={property.images[0].alt} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />;
  };

  if (layout === 'horizontal') {
    return (
      <Link href={`/imoveis/${property.slug}`} className="group flex bg-white border-b border-gray-200 hover:border-gray-300 transition-colors">
        <div className="relative w-56 sm:w-72 aspect-[4/3] shrink-0 overflow-hidden bg-gray-50">
          {renderImage()}
          {showBadge && property.featured && (
            <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-white/90 backdrop-blur z-10" style={{ color: primaryColor }}>Destaque</span>
          )}
        </div>
        <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{isRent ? 'Aluguel' : 'Venda'}</p>
          <p className="font-serif text-xl text-gray-900 leading-tight">{property.title}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{property.neighborhood}, {property.city}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
            {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
            <span>{property.area}m²</span>
          </div>
          {showPrice && (
            <p className="font-serif text-2xl font-semibold text-gray-900 mt-2">
              {formatPrice(mainPrice)}{isRent && <span className="text-sm font-normal text-gray-500"> /mês</span>}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/imoveis/${property.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {renderImage()}
        <div className="absolute top-4 left-4 z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 bg-white/90 backdrop-blur" style={{ color: primaryColor }}>
            {isRent ? 'Aluguel' : property.listingType === 'BOTH' ? 'Venda/Aluguel' : 'Venda'}
          </span>
        </div>
        {showBadge && property.featured && (
          <span className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 bg-amber-400 text-amber-900">Destaque</span>
        )}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-gray-900" />
        </div>
      </div>
      <div className="pt-5 pb-2 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{property.neighborhood}, {property.city}</p>
        <p className="font-serif text-lg text-gray-900 leading-tight group-hover:opacity-70 transition-opacity">{property.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>}
          {property.parkingSpots > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parkingSpots}</span>}
          <span>{property.area}m²</span>
        </div>
        {showPrice && (
          <p className="font-serif text-xl font-semibold text-gray-900 pt-2">
            {formatPrice(mainPrice)}{isRent && <span className="text-sm font-normal text-gray-500"> /mês</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
