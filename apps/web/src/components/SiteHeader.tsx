import Link from 'next/link';
import { Home, Search, Info, Phone, Menu } from 'lucide-react';
import { resolveFileUrl } from '@/lib/api';

interface SiteHeaderProps {
  logoUrl: string | null;
  logoSize?: number;
  siteName: string;
  primaryColor: string;
}

export function SiteHeader({ logoUrl, logoSize, siteName, primaryColor }: SiteHeaderProps) {
  return (
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
          <Link href="/" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" /> Início
          </Link>
          <Link href="/imoveis" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Imóveis
          </Link>
          <a href="#sobre" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Info className="w-4 h-4" /> Sobre
          </a>
          <a href="#contato" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> Contato
          </a>
        </nav>

        <button className="md:hidden p-2 text-gray-500 hover:text-gray-700">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
