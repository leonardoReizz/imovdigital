'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveFileUrl } from '@/lib/api';

interface Image {
  url: string;
  alt: string;
}

interface Props {
  images: Image[];
  galleryStyle: 'single' | 'carousel' | 'grid';
  title: string;
}

export function ImageGallery({ images, galleryStyle, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-100 aspect-[2.5/1] flex items-center justify-center">
        <p className="text-gray-400">Sem imagens</p>
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1));
  const next = () => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0));

  return (
    <>
      {galleryStyle === 'single' ? (
        <div className="rounded-2xl overflow-hidden aspect-[2.5/1] bg-gray-100 cursor-pointer" onClick={() => openLightbox(0)}>
          <img src={resolveFileUrl(images[0].url)} alt={images[0].alt || title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </div>
      ) : galleryStyle === 'carousel' ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[2.5/1] bg-gray-100 cursor-pointer" onClick={() => openLightbox(0)}>
          <img src={resolveFileUrl(images[0].url)} alt={images[0].alt || title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              1/{images.length} — clique para ver todas
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 sm:grid-rows-2 gap-1 rounded-2xl overflow-hidden h-[250px] sm:h-[420px]">
          <div className="sm:col-span-2 sm:row-span-2 overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
            <img src={resolveFileUrl(images[0].url)} alt={images[0].alt || title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="hidden sm:block overflow-hidden cursor-pointer relative" onClick={() => openLightbox(i + 1)}>
              <img src={resolveFileUrl(img.url)} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">+{images.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={resolveFileUrl(images[lightboxIndex].url)}
              alt={images[lightboxIndex].alt || title}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-4 pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    i === lightboxIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={resolveFileUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
