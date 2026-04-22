'use client';

import { useState } from 'react';
import type { TestimonialsSettings } from '@imovdigital/types';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const PLACEHOLDER = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito.', rating: 5 },
  { name: 'João P.', text: 'Profissionais competentes e dedicados. Recomendo!', rating: 4 },
  { name: 'Ana L.', text: 'Processo rápido e transparente do início ao fim.', rating: 5 },
];

export function Testimonials({ settings }: { settings: TestimonialsSettings }) {
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER;
  const [current, setCurrent] = useState(0);
  const item = items[current % items.length];

  return (
    <section className="px-4 sm:px-8 py-24 bg-stone-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-500">— {settings.title}</span>
        </div>

        <div className="relative">
          <Quote className="absolute -top-6 -left-2 w-16 h-16 text-stone-300" strokeWidth={1} />
          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-800 leading-snug text-center pt-12">
            &ldquo;{item.text}&rdquo;
          </blockquote>
          <div className="text-center mt-10">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">{item.name}</p>
            <p className="text-xs text-gray-400 mt-1">{'★'.repeat(item.rating)}</p>
          </div>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-6 mt-12">
              <button onClick={() => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1))} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-gray-400 font-mono">
                {String((current % items.length) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <button onClick={() => setCurrent((c) => c + 1)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
