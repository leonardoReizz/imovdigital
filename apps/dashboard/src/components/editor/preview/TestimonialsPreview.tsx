import type { TestimonialsSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

const PLACEHOLDER_ITEMS = [
  { name: 'Maria S.', text: 'Excelente atendimento! Encontraram o apartamento perfeito para minha família.', rating: 5 },
  { name: 'João P.', text: 'Profissionais competentes e dedicados. Recomendo!', rating: 4 },
  { name: 'Ana L.', text: 'Processo rápido e transparente do início ao fim.', rating: 5 },
];

export function TestimonialsPreview({ settings }: { settings: TestimonialsSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';
  const items = settings.items.length > 0 ? settings.items : PLACEHOLDER_ITEMS;
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900 text-center mb-10">{settings.title}</h2>

        {isMobile || settings.layout === 'carousel' ? (
          (() => {
            const perPage = isMobile ? 1 : Math.min(3, items.length);
            const totalPages = Math.ceil(items.length / perPage);
            const page = current % totalPages;
            const visible = items.slice(page * perPage, page * perPage + perPage);
            return (
              <div className="relative">
                <div className="grid gap-6" style={{ gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(3, items.length)}, 1fr)` }}>
                  {visible.map((item, i) => (
                    <TestimonialCard key={page * perPage + i} item={item} />
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
          <div className="grid gap-6" style={{ gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(items.length, 3)}, 1fr)` }}>
            {items.map((item, i) => (
              <TestimonialCard key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
