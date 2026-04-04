'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Info, Phone, Menu, X } from 'lucide-react';
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
    { href: '/', label: 'Início', icon: Home },
    { href: '/imoveis', label: 'Imóveis', icon: Search },
    { href: '#sobre', label: 'Sobre', icon: Info },
    { href: '#contato', label: 'Contato', icon: Phone },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <img src={resolveFileUrl(logoUrl)} alt={siteName} className="object-contain" style={{ height: logoSize || 32 }} />
            ) : (
              <span className="text-lg font-bold" style={{ color: primaryColor }}>{siteName}</span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            {links.map((l) => {
              const Icon = l.icon;
              const isAnchor = l.href.startsWith('#');
              const Comp = isAnchor ? 'a' : Link;
              return (
                <Comp key={l.href} href={l.href} className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
                  <Icon className="w-4 h-4" /> {l.label}
                </Comp>
              );
            })}
          </nav>

          <button onClick={() => setOpen(true)} className="md:hidden p-2 text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              {logoUrl ? (
                <img src={resolveFileUrl(logoUrl)} alt={siteName} className="object-contain" style={{ height: Math.min(logoSize || 32, 36) }} />
              ) : (
                <span className="text-base font-bold" style={{ color: primaryColor }}>{siteName}</span>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4">
              {links.map((l) => {
                const Icon = l.icon;
                const isAnchor = l.href.startsWith('#');
                const Comp = isAnchor ? 'a' : Link;
                return (
                  <Comp
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-400" /> {l.label}
                  </Comp>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
