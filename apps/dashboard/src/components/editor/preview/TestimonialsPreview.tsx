import type { TestimonialsSettings } from '@imovdigital/types';
import { Star, User } from 'lucide-react';

function TestimonialCard({ item }: { item: { name: string; text: string; rating: number } }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600 mb-4">"{item.text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-300" />
        </div>
        <span className="text-sm font-medium text-gray-900">{item.name}</span>
      </div>
    </div>
  );
}

const PLACEHOLDER_ITEMS = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito para minha família.', rating: 5 },
  { name: 'João P.', text: 'Profissionais competentes e dedicados. Recomendo!', rating: 4 },
  { name: 'Ana L.', text: 'Processo rápido e transparente do início ao fim.', rating: 5 },
];

export function TestimonialsPreview({ settings }: { settings: TestimonialsSettings }) {
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER_ITEMS;

  return (
    <div className="px-8 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{settings.title}</h2>
        <div className="grid grid-cols-3 gap-6">
          {items.slice(0, 3).map((item, i) => (
            <TestimonialCard key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
