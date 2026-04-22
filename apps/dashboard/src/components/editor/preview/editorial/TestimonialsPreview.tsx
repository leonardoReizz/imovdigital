import type { TestimonialsSettings } from '@imovdigital/types';
import { Quote } from 'lucide-react';

const PLACEHOLDER = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito.', rating: 5 },
];

export function TestimonialsPreview({ settings }: { settings: TestimonialsSettings }) {
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER;
  const item = items[0];

  return (
    <div className="px-4 sm:px-8 py-20" style={{ backgroundColor: '#f5f5f4' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="uppercase font-semibold text-gray-500" style={{ fontSize: 11, letterSpacing: '0.2em' }}>— {settings.title}</span>
        </div>
        <div className="relative">
          <Quote className="absolute -top-4 -left-2 text-stone-300" style={{ width: 64, height: 64 }} strokeWidth={1} />
          <blockquote className="text-gray-800 leading-snug text-center pt-12" style={{ fontSize: 28, fontFamily: 'Georgia, serif' }}>
            &ldquo;{item.text}&rdquo;
          </blockquote>
          <div className="text-center mt-8">
            <p className="uppercase text-gray-500 font-semibold" style={{ fontSize: 12, letterSpacing: '0.2em' }}>{item.name}</p>
            <p className="text-xs text-gray-400 mt-1">{'★'.repeat(item.rating)}</p>
          </div>
          {items.length > 1 && (
            <div className="text-center mt-10">
              <span className="text-xs text-gray-400 font-mono">01 / {String(items.length).padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
