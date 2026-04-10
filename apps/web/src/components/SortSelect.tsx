'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CustomSelect } from './CustomSelect';

const SORT_OPTIONS = [
  { value: '', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'featured', label: 'Destaques' },
];

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <CustomSelect
      options={SORT_OPTIONS}
      value={currentSort}
      onChange={handleChange}
      placeholder="Ordenar"
      className="w-44"
    />
  );
}
