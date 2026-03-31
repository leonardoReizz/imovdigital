import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Bed,
  Car,
  Maximize2,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Star,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '@imovdigital/utils';

interface Property {
  id: string;
  title: string;
  slug: string;
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
  active: boolean;
  featured: boolean;
  images: { url: string; order: number; alt: string }[];
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Comercial',
  LAND: 'Terreno',
  RURAL: 'Rural',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'Venda',
  RENT: 'Aluguel',
  BOTH: 'Venda e Aluguel',
};

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterListing, setFilterListing] = useState('');
  const [filterActive, setFilterActive] = useState<'' | 'true' | 'false'>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/properties');
      setProperties(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await api.patch(`/properties/${id}`, { active: !active });
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !active } : p)),
      );
    } catch {
      // silently fail
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silently fail
    }
    setOpenMenu(null);
  };

  const filtered = properties.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        p.title.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filterType && p.type !== filterType) return false;
    if (filterListing && p.listingType !== filterListing) return false;
    if (filterActive === 'true' && !p.active) return false;
    if (filterActive === 'false' && p.active) return false;
    return true;
  });

  const activeCount = properties.filter((p) => p.active).length;
  const featuredCount = properties.filter((p) => p.featured).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Imóveis</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {properties.length} cadastrados &middot; {activeCount} ativos &middot; {featuredCount} em destaque
          </p>
        </div>
        <Link
          to="/dashboard/properties/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Imóvel
        </Link>
      </div>

      {/* Filters bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, bairro ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Tipo</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="LAND">Terreno</option>
                <option value="RURAL">Rural</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterListing}
                onChange={(e) => setFilterListing(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Anúncio</option>
                <option value="SALE">Venda</option>
                <option value="RENT">Aluguel</option>
                <option value="BOTH">Ambos</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterActive}
                onChange={(e) =>
                  setFilterActive(e.target.value as '' | 'true' | 'false')
                }
                className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Status</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Property list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full mx-auto"
          />
          <p className="text-sm text-gray-400 mt-4">Carregando imóveis...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-200 p-16 text-center"
        >
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          {properties.length === 0 ? (
            <>
              <p className="text-gray-600 font-medium">Nenhum imóvel cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em "Novo Imóvel" para começar
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                Nenhum imóvel encontrado
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros de busca
              </p>
            </>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                    {property.images.length > 0 ? (
                      <img
                        src={property.images[0].url}
                        alt={property.images[0].alt || property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {property.featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {property.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {property.neighborhood}, {property.city} - {property.state}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        {property.listingType === 'RENT' ? (
                          <>
                            <p className="text-sm font-bold text-blue-600">
                              {formatPrice(property.rentPrice || property.price)}/mês
                            </p>
                          </>
                        ) : property.listingType === 'BOTH' ? (
                          <>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(property.price)}
                            </p>
                            {property.rentPrice && (
                              <p className="text-xs font-semibold text-blue-600">
                                {formatPrice(property.rentPrice)}/mês
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(property.price)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags + details */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">
                          {TYPE_LABELS[property.type] || property.type}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md font-medium text-blue-600">
                          {LISTING_LABELS[property.listingType] || property.listingType}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5" /> {property.bedrooms}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" /> {property.parkingSpots}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" /> {property.area}m²
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                            property.active
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {property.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleActive(property.id, property.active)}
                          title={property.active ? 'Desativar' : 'Ativar'}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {property.active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          to={`/dashboard/properties/${property.id}/edit`}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === property.id ? null : property.id,
                              )
                            }
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenu === property.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]"
                            >
                              <button
                                onClick={() => deleteProperty(property.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
