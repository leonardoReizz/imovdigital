import { Link } from 'react-router';
import { MapPin, Bed, Bath, Car, Maximize2, Star, Heart } from 'lucide-react';
import { formatPrice } from '@imovdigital/utils';
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '../lib/constants';

interface Property {
  id: string;
  slug: string;
  title: string;
  type: string;
  listingType: string;
  price: number;
  rentPrice: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  neighborhood: string;
  city: string;
  state: string;
  featured: boolean;
  images: { url: string; order: number; alt: string }[];
}

export function PropertyCard({ property }: { property: Property }) {
  const hasImage = property.images.length > 0;

  return (
    <Link
      to={`/property/${property.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {hasImage ? (
          <img
            src={property.images[0].url}
            alt={property.images[0].alt || property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <Maximize2 className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
            {LISTING_TYPE_LABELS[property.listingType] || property.listingType}
          </span>
          {property.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-900" />
              Destaque
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4 text-gray-500" />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent pt-10 pb-3 px-4">
          {property.listingType === 'RENT' ? (
            <p className="text-blue-400 font-bold text-lg">
              {formatPrice(property.rentPrice || property.price)}
              <span className="text-blue-300/70 text-sm font-normal">/mês</span>
            </p>
          ) : (
            <>
              <p className="text-white font-bold text-lg">
                {formatPrice(property.price)}
              </p>
              {property.listingType === 'BOTH' && property.rentPrice && (
                <p className="text-blue-300 text-xs font-semibold">
                  {formatPrice(property.rentPrice)}/mês
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs truncate">
                {property.neighborhood}, {property.city} - {property.state}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0">
            {PROPERTY_TYPE_LABELS[property.type] || property.type}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Bed className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Bath className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium">{property.bathrooms}</span>
            </div>
          )}
          {property.parkingSpots > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium">{property.parkingSpots}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-600 ml-auto">
            <Maximize2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium">{property.area}m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
