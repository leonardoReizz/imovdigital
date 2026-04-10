'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveFileUrl } from '@/lib/api';

interface Props {
  images: { url: string; alt: string }[];
  aspectRatio?: string;
}

export function PropertyImageCarousel({ images, aspectRatio = '16/10' }: Props) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };

  return (
    <div className="relative w-full h-full group/carousel">
      <img
        src={resolveFileUrl(images[current].url)}
        alt={images[current].alt}
        className="w-full h-full object-cover"
        style={{ aspectRatio }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {images.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
            {images.length > 5 && (
              <span className="text-[9px] text-white/70 ml-0.5">+{images.length - 5}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
