'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { resolveFileUrl } from '@/lib/api';

interface SiteHeaderProps {
  logoUrl: string | null;
  logoSize?: number;
  siteName: string;
  primaryColor: string;
}

export function SiteHeader({ logoUrl, logoSize, siteName, primaryColor }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Início' },
    { href: '/imoveis', label: 'Imóveis' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <img src={resolveFileUrl(logoUrl)} alt={siteName} className="object-contain" style={{ height: logoSize || 32 }} />
            ) : (
              <span className="font-serif text-xl font-bold text-gray-900">{siteName}</span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => {
              const isAnchor = l.href.startsWith('#');
              const Comp: any = isAnchor ? 'a' : Link;
              return (
                <Comp
                  key={l.href}
                  href={l.href}
                  className="relative text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-700 hover:text-gray-900 transition-colors group"
                >
                  {l.label}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-px transition-all group-hover:w-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </Comp>
              );
            })}
          </nav>

          <button onClick={() => setOpen(true)} className="md:hidden p-2 text-gray-700 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 w-full h-full bg-white flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
              {logoUrl ? (
                <img src={resolveFileUrl(logoUrl)} alt={siteName} className="object-contain" style={{ height: Math.min(logoSize || 32, 36) }} />
              ) : (
                <span className="font-serif text-lg font-bold text-gray-900">{siteName}</span>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100 text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-6 py-10 space-y-6">
              {links.map((l) => {
                const isAnchor = l.href.startsWith('#');
                const Comp: any = isAnchor ? 'a' : Link;
                return (
                  <Comp
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block font-serif text-3xl text-gray-900 hover:opacity-60 transition-opacity"
                  >
                    {l.label}
                  </Comp>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out }
      `}</style>
    </>
  );
}
