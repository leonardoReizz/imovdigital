import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  CheckCheck,
  Building2,
  X,
  Loader2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeWall } from '../components/UpgradeWall';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  seen: boolean;
  createdAt: string;
  property: { id: string; title: string; slug: string } | null;
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  FORM: { label: 'Formulário', color: 'bg-primary-light text-primary-dark', icon: Mail },
  WHATSAPP: { label: 'WhatsApp', color: 'bg-green-50 text-green-700', icon: MessageSquare },
  PHONE: { label: 'Telefone', color: 'bg-purple-50 text-purple-700', icon: Phone },
};

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

export function LeadsPage() {
  const { canAccessLeads } = useSubscription();

  if (!canAccessLeads) {
    return (
      <UpgradeWall
        feature="Painel de Leads"
        description="Receba e gerencie os contatos dos visitantes do seu site. Veja quem se interessou por cada imóvel e entre em contato diretamente."
      />
    );
  }

  return <LeadsContent />;
}

function LeadsContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeen, setFilterSeen] = useState<'' | 'true' | 'false'>('');
  const [filterSource, setFilterSource] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchLeads = async () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (filterSeen) params.set('seen', filterSeen);
    if (filterSource) params.set('source', filterSource);
    if (sort) params.set('sort', sort);

    try {
      const { data } = await api.get(`/leads?${params.toString()}`);
      setLeads(data.data);
      setTotal(data.total);
      setUnseenCount(data.unseenCount);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [search, filterSeen, filterSource, sort]);

  const handleMarkSeen = async (id: string) => {
    try {
      await api.patch(`/leads/${id}/seen`);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, seen: true } : l));
      setUnseenCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllSeen = async () => {
    try {
      await api.patch('/leads/mark-all-seen');
      setLeads((prev) => prev.map((l) => ({ ...l, seen: true })));
      setUnseenCount(0);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este lead?')) return;
    setDeleting(id);
    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotal((t) => t - 1);
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {total === 1 ? 'lead' : 'leads'}
            {unseenCount > 0 && <> &middot; <span className="text-primary font-medium">{unseenCount} não {unseenCount === 1 ? 'lido' : 'lidos'}</span></>}
          </p>
        </div>
        {unseenCount > 0 && (
          <button onClick={handleMarkAllSeen} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <CheckCheck className="w-4 h-4" />
            Marcar todos como lidos
          </button>
        )}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterSeen} onChange={(e) => setFilterSeen(e.target.value as any)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="">Todos</option>
              <option value="false">Não lidos</option>
              <option value="true">Lidos</option>
            </select>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="">Todas as fontes</option>
              <option value="FORM">Formulário</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE">Telefone</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Nenhum lead encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            {search || filterSeen || filterSource ? 'Tente ajustar os filtros' : 'Os leads aparecerão aqui quando visitantes entrarem em contato'}
          </p>
        </motion.div>
      ) : (
        <div className="flex gap-6">
          {/* Lead list */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {leads.map((lead, i) => {
                const src = SOURCE_CONFIG[lead.source] || SOURCE_CONFIG.FORM;
                const isSelected = selectedLead?.id === lead.id;

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => {
                      setSelectedLead(lead);
                      if (!lead.seen) handleMarkSeen(lead.id);
                    }}
                    className={`group flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors ${
                      isSelected ? 'bg-primary-light' : 'hover:bg-gray-50'
                    } ${!lead.seen ? 'bg-primary-light/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${lead.seen ? 'bg-transparent' : 'bg-primary'}`} />

                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${lead.seen ? 'bg-gray-100' : 'bg-primary/20'}`}>
                      <src.icon className={`w-4 h-4 ${lead.seen ? 'text-gray-400' : 'text-primary'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${lead.seen ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{lead.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${src.color}`}>{src.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lead.property ? lead.property.title : lead.phone || lead.email || 'Contato geral'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400">{timeAgo(lead.createdAt)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                        disabled={deleting === lead.id}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {deleting === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedLead && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 shrink-0 hidden lg:block"
              >
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{selectedLead.name}</h3>
                    <button onClick={() => setSelectedLead(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    {selectedLead.email && (
                      <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                        <Mail className="w-4 h-4 text-gray-400" />{selectedLead.email}
                      </a>
                    )}
                    {selectedLead.phone && (
                      <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                        <Phone className="w-4 h-4 text-gray-400" />{selectedLead.phone}
                      </a>
                    )}
                    {selectedLead.phone && (
                      <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg justify-center hover:bg-green-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />Abrir WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Property */}
                  {selectedLead.property && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Interesse em</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">{selectedLead.property.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {selectedLead.message && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Mensagem</p>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-line">{selectedLead.message}</p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="space-y-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span>Fonte</span>
                      <span className={`font-medium px-1.5 py-0.5 rounded ${(SOURCE_CONFIG[selectedLead.source] || SOURCE_CONFIG.FORM).color}`}>
                        {(SOURCE_CONFIG[selectedLead.source] || SOURCE_CONFIG.FORM).label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recebido</span>
                      <span className="text-gray-600">{new Date(selectedLead.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {selectedLead.email && (
                      <a href={`mailto:${selectedLead.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> E-mail
                      </a>
                    )}
                    {selectedLead.phone && (
                      <a href={`tel:${selectedLead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> Ligar
                      </a>
                    )}
                    <button onClick={() => handleDelete(selectedLead.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
