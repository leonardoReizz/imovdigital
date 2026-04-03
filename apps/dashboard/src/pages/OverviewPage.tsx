import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Building2,
  MessageSquare,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowRight,
  Home,
  Mail,
  Phone,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '@imovdigital/utils';
import { useSubscription } from '../contexts/SubscriptionContext';

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
  BOTH: 'Ambos',
};

const SOURCE_LABELS: Record<string, string> = {
  FORM: 'Formulário',
  WHATSAPP: 'WhatsApp',
  PHONE: 'Telefone',
};

interface DashboardData {
  cards: {
    totalProperties: number;
    activeProperties: number;
    featuredProperties: number;
    leadsThisMonth: number;
    unseenLeads: number;
    totalUsers: number;
    leadsGrowth: number;
  };
  recentLeads: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    message: string | null;
    source: string;
    seen: boolean;
    propertyTitle: string | null;
    createdAt: string;
  }[];
  recentProperties: {
    id: string;
    title: string;
    slug: string;
    price: number;
    rentPrice: number | null;
    listingType: string;
    active: boolean;
    images: any[];
    createdAt: string;
  }[];
  propertiesByType: { type: string; count: number }[];
  propertiesByListing: { listingType: string; count: number }[];
}

export function OverviewPage() {
  const { canAccessLeads } = useSubscription();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tenant/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { cards } = data;

  const statCards = [
    { label: 'Imóveis Ativos', value: cards.activeProperties, total: cards.totalProperties, icon: Building2, color: 'bg-primary', sub: `${cards.totalProperties} cadastrados` },
    { label: 'Leads do Mês', value: cards.leadsThisMonth, icon: MessageSquare, color: 'bg-green-500', growth: cards.leadsGrowth, sub: cards.unseenLeads > 0 ? `${cards.unseenLeads} não lidos` : 'Todos lidos' },
    { label: 'Destaques', value: cards.featuredProperties, icon: Star, color: 'bg-amber-500', sub: 'Imóveis em destaque' },
    { label: 'Equipe', value: cards.totalUsers, icon: Users, color: 'bg-purple-500', sub: 'Membros ativos' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <Link
          to="/dashboard/properties/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <Building2 className="w-4 h-4" />
          Novo Imóvel
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</span>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">{card.sub}</span>
              {card.growth !== undefined && card.growth !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {card.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.growth > 0 ? '+' : ''}{card.growth}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Últimos Leads</h3>
            <Link to="/dashboard/leads" className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.recentLeads.length === 0 ? (
            <div className="p-10 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhum lead recebido ainda</p>
            </div>
          ) : (
            <div>
              {data.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${lead.seen ? 'bg-gray-100' : 'bg-primary/20'}`}>
                    {lead.source === 'WHATSAPP' ? (
                      <Phone className={`w-4 h-4 ${lead.seen ? 'text-gray-400' : 'text-primary'}`} />
                    ) : (
                      <Mail className={`w-4 h-4 ${lead.seen ? 'text-gray-400' : 'text-primary'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{canAccessLeads ? lead.name : `${lead.name.charAt(0)}${'•'.repeat(lead.name.length - 1)}`}</p>
                      {!lead.seen && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {!canAccessLeads
                        ? '••••••••••'
                        : lead.propertyTitle
                          ? `Interesse em: ${lead.propertyTitle}`
                          : lead.phone || lead.email || 'Sem contato'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </span>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {timeAgo(lead.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          {/* Properties by type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Por Tipo</h3>
            {data.propertiesByType.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum imóvel ativo</p>
            ) : (
              <div className="space-y-3">
                {data.propertiesByType.map((item) => {
                  const max = Math.max(...data.propertiesByType.map((i) => i.count));
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{TYPE_LABELS[item.type] || item.type}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Properties by listing type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Por Modalidade</h3>
            {data.propertiesByListing.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum imóvel ativo</p>
            ) : (
              <div className="space-y-2">
                {data.propertiesByListing.map((item) => (
                  <div key={item.listingType} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-gray-600">{LISTING_LABELS[item.listingType] || item.listingType}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent properties */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Últimos Imóveis</h3>
              <Link to="/dashboard/properties" className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {data.recentProperties.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Nenhum imóvel cadastrado</p>
              </div>
            ) : (
              <div>
                {data.recentProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/dashboard/properties/${prop.id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {Array.isArray(prop.images) && prop.images.length > 0 ? (
                        <img src={(prop.images[0] as any).url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{prop.title}</p>
                      <p className={`text-xs font-semibold ${prop.listingType === 'RENT' ? 'text-primary' : 'text-gray-500'}`}>
                        {formatPrice(prop.listingType === 'RENT' && prop.rentPrice ? prop.rentPrice : prop.price)}
                        {prop.listingType === 'RENT' && <span className="font-normal text-gray-400">/mês</span>}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${prop.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
