import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  Search,
  Building2,
  Home,
  Store,
  TreePine,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyCard } from '../components/PropertyCard';
import { FilterBar, EMPTY_FILTERS, type Filters } from '../components/FilterBar';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';

interface Property {
  id: string;
  slug: string;
  title: string;
  type: string;
  listingType: string;
  price: number;
  rentPrice: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  neighborhood: string;
  city: string;
  state: string;
  featured: boolean;
  active: boolean;
  images: { url: string; order: number; alt: string }[];
  createdAt: string;
}

const CATEGORIES = [
  { icon: Building2, label: 'Apartamentos', type: 'APARTMENT' },
  { icon: Home, label: 'Casas', type: 'HOUSE' },
  { icon: Store, label: 'Comerciais', type: 'COMMERCIAL' },
  { icon: TreePine, label: 'Terrenos', type: 'LAND' },
];

export function HomePage() {
  const [searchParams] = useSearchParams();
  const { tenantSlug } = useTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    type: searchParams.get('type') || '',
    listingType: searchParams.get('listing') || '',
  }));
  const [showFilters, setShowFilters] = useState(
    !!(searchParams.get('type') || searchParams.get('listing')),
  );

  useEffect(() => {
    if (!tenantSlug) return;
    setLoading(true);
    api
      .get(`/public/${tenantSlug}/properties`)
      .then(({ data }) => setProperties(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  const neighborhoods = useMemo(
    () => [...new Set(properties.map((p) => p.neighborhood))].sort(),
    [properties],
  );

  const filtered = useMemo(() => {
    let result = properties.filter((p) => p.active);

    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      );
    }
    if (filters.type) result = result.filter((p) => p.type === filters.type);
    if (filters.listingType) {
      result = result.filter(
        (p) => p.listingType === filters.listingType || p.listingType === 'BOTH',
      );
    }
    if (filters.neighborhood) result = result.filter((p) => p.neighborhood === filters.neighborhood);
    if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice) * 100);
    if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice) * 100);
    if (filters.bedrooms) result = result.filter((p) => p.bedrooms >= Number(filters.bedrooms));
    if (filters.petFriendly) result = result.filter((p) => (p as any).petFriendly);
    if (filters.furnished) result = result.filter((p) => (p as any).furnished);
    if (filters.financingAvailable) result = result.filter((p) => (p as any).financingAvailable);

    switch (filters.sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [properties, filters]);

  const featured = useMemo(
    () => properties.filter((p) => p.featured && p.active).slice(0, 6),
    [properties],
  );

  const handleHeroSearch = () => {
    setFilters((prev) => ({ ...prev, q: heroSearch }));
    setShowFilters(true);
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  const { theme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background, fontFamily: theme.typography.bodyFont }}>
      {/* ── Hero ── */}
      {theme.hero.style !== 'none' && (
        <div className="relative overflow-hidden" style={{ backgroundColor: theme.colors.secondary }}>
          {/* Background blurs */}
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}e6, ${theme.colors.secondary}d9)` }} />
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${theme.colors.primary}30` }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${theme.colors.accent}20` }} />
          </div>
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${theme.hero.overlayOpacity / 100})` }} />

          <Header transparent />

          <div
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
            style={{
              paddingTop: theme.hero.style === 'fullscreen' ? '9rem' : theme.hero.style === 'half' ? '7rem' : '5rem',
              paddingBottom: theme.hero.style === 'fullscreen' ? '7rem' : theme.hero.style === 'half' ? '5rem' : '3rem',
            }}
          >
            {theme.hero.style === 'fullscreen' && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Os melhores imóveis da região
              </div>
            )}

            <h1
              className="font-bold text-white leading-tight tracking-tight"
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: theme.hero.style === 'fullscreen' ? undefined : theme.hero.style === 'half' ? '2.25rem' : '1.5rem',
              }}
            >
              <span className={theme.hero.style === 'fullscreen' ? 'text-4xl sm:text-5xl lg:text-6xl' : ''}>
                {theme.hero.title || 'Encontre o imóvel perfeito para você'}
              </span>
            </h1>

            {theme.hero.style !== 'compact' && (
              <p className="text-lg text-white/70 mt-5 max-w-2xl mx-auto">
                {theme.hero.subtitle || 'Apartamentos, casas e muito mais. Busque por localização, preço e características.'}
              </p>
            )}

            {theme.hero.showSearchBar && (
              <div className="mt-10 max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl p-2 flex items-center shadow-2xl shadow-black/20">
                  <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                    placeholder="Bairro, cidade ou tipo de imóvel..."
                    className="flex-1 py-3.5 px-3 text-gray-700 outline-none text-[15px]"
                  />
                  <button
                    onClick={handleHeroSearch}
                    className="text-white px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shrink-0"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    Buscar
                    <ArrowRight className="w-4 h-4 hidden sm:block" />
                  </button>
                </div>
              </div>
            )}

            {theme.hero.style === 'fullscreen' && (
              <div className="flex items-center justify-center gap-8 sm:gap-12 mt-10 text-white/70">
                {[
                  { value: properties.length, label: 'Imóveis' },
                  { value: neighborhoods.length, label: 'Bairros' },
                  { value: featured.length, label: 'Destaques' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-hero header fallback */}
      {theme.hero.style === 'none' && <Header />}

      {/* ── Categories ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => {
                setFilters((prev) => ({ ...prev, type: cat.type }));
                setShowFilters(true);
                setTimeout(
                  () => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }),
                  100,
                );
              }}
              className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <cat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                <p className="text-xs text-gray-400">
                  {properties.filter((p) => p.type === cat.type && p.active).length} disponíveis
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured ── */}
      {featured.length > 0 && !showFilters && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Imóveis em Destaque
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Selecionados especialmente para você
              </p>
            </div>
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, sort: 'featured' }));
                setShowFilters(true);
              }}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* ── All Properties with Filters ── */}
      <section id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {showFilters ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Imóveis Disponíveis
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {filtered.length} {filtered.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>

            <div className="mb-8">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                neighborhoods={neighborhoods}
                totalResults={filtered.length}
              />
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full mx-auto animate-spin" />
                <p className="text-sm text-gray-400 mt-4">Carregando imóveis...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Nenhum imóvel encontrado</p>
                <p className="text-sm text-gray-400 mt-1.5">
                  Tente ajustar os filtros para encontrar mais resultados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Adicionados Recentemente
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Os mais novos do portfólio</p>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Ver todos com filtros
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full mx-auto animate-spin" />
              </div>
            ) : properties.filter((p) => p.active).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Nenhum imóvel disponível</p>
                <p className="text-sm text-gray-400 mt-1.5">Volte em breve para novidades!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {properties
                  .filter((p) => p.active)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 6)
                  .map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
              </div>
            )}

            {properties.filter((p) => p.active).length > 6 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  Ver todos os imóveis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── CTA Section ── */}
      <section id="contact" className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Não encontrou o que procura?
          </h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Entre em contato conosco e vamos ajudar você a encontrar o imóvel ideal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a
              href="#"
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="tel:+5511999999999"
              className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Ligar agora
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
