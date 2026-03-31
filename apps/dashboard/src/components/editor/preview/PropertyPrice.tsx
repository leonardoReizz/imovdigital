import { formatPrice } from '@imovdigital/utils';

interface PropertyPriceProps {
  price: number;
  rentPrice: number | null;
  listingType: string;
  size?: 'sm' | 'lg';
  primaryColor?: string;
}

export function PropertyPrice({ price, rentPrice, listingType, size = 'sm', primaryColor = '#2563eb' }: PropertyPriceProps) {
  const isRent = listingType === 'RENT';
  const isBoth = listingType === 'BOTH';

  const textClass = size === 'lg' ? 'text-3xl font-bold' : 'text-lg font-bold';
  const subClass = size === 'lg' ? 'text-sm font-semibold' : 'text-xs font-semibold';

  if (isRent) {
    return (
      <div>
        <p className={textClass} style={{ color: primaryColor }}>
          {formatPrice(rentPrice || price)}
          <span className={`${size === 'lg' ? 'text-base' : 'text-xs'} font-normal opacity-70`}>/mês</span>
        </p>
      </div>
    );
  }

  if (isBoth && rentPrice) {
    return (
      <div>
        <p className={`${textClass} text-gray-900`}>{formatPrice(price)}</p>
        <p className={subClass} style={{ color: primaryColor }}>
          {formatPrice(rentPrice)}/mês
        </p>
      </div>
    );
  }

  return (
    <p className={`${textClass} text-gray-900`}>{formatPrice(price)}</p>
  );
}
