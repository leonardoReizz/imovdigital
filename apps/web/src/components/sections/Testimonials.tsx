import type { TestimonialsSettings } from '@imovdigital/types';
import { Star, User } from 'lucide-react';

const PLACEHOLDER = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito.', rating: 5 },
  { name: 'João P.', text: 'Profissionais competentes e dedicados. Recomendo!', rating: 4 },
  { name: 'Ana L.', text: 'Processo rápido e transparente do início ao fim.', rating: 5 },
];

export function Testimonials({ settings }: { settings: TestimonialsSettings }) {
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER;

  return (
    <section className="px-4 sm:px-8 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{settings.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
