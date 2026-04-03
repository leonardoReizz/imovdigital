'use client';

import { useState } from 'react';
import type { TestimonialsSettings } from '@imovdigital/types';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';

const PLACEHOLDER = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito.', rating: 5 },
  { name: 'João P.', text: 'Profissionais competentes e dedicados. Recomendo!', rating: 4 },
  { name: 'Ana L.', text: 'Processo rápido e transparente do início ao fim.', rating: 5 },
];

function Card({ item }: { item: { name: string; text: string; rating: number } }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
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
  );
}

export function Testimonials({ settings }: { settings: TestimonialsSettings }) {
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER;
  const [current, setCurrent] = useState(0);

  return (
    <section className="px-4 sm:px-8 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{settings.title}</h2>

        {settings.layout === 'carousel' ? (
          (() => {
            const perPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : Math.min(3, items.length);
            const totalPages = Math.ceil(items.length / perPage);
            const page = current % totalPages;
            const visible = items.slice(page * perPage, page * perPage + perPage);
            return (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visible.map((item, i) => (
                    <Card key={page * perPage + i} item={item} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setCurrent((c) => (c === 0 ? totalPages - 1 : c - 1))} className="p-2 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-400">{page + 1}/{totalPages}</span>
                    <button onClick={() => setCurrent((c) => c + 1)} className="p-2 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <Card key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
