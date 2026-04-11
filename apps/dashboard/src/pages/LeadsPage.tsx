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
  Copy,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeWall } from '../components/UpgradeWall';
import { PhoneInput } from '../components/PhoneInput';
import { Save } from 'lucide-react';

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

export function LeadsSettingsPage() {
  const { canAccessLeads, isTrial } = useSubscription();

  if (!canAccessLeads) {
    return (
      <UpgradeWall
        feature="Painel de Leads"
        description="Receba e gerencie os contatos dos visitantes do seu site. Veja quem se interessou por cada imóvel e entre em contato diretamente."
      />
    );
  }

  return <LeadsSettings isTrial={isTrial} />;
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
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {total === 1 ? 'lead' : 'leads'}
            {unseenCount > 0 && <> &middot; <span className="text-primary font-medium">{unseenCount} não {unseenCount === 1 ? 'lido' : 'lidos'}</span></>}
          </p>
        </div>
        {unseenCount > 0 && (
          <button onClick={handleMarkAllSeen} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 shrink-0 whitespace-nowrap">
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Marcar todos como lidos</span>
            <span className="sm:hidden">Marcar lidos</span>
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
          <div className="flex gap-2 flex-wrap">
            <select value={filterSeen} onChange={(e) => setFilterSeen(e.target.value as any)} className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none min-w-0">
              <option value="">Todos</option>
              <option value="false">Não lidos</option>
              <option value="true">Lidos</option>
            </select>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none min-w-0">
              <option value="">Fontes</option>
              <option value="FORM">Formulário</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE">Telefone</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none min-w-0">
              <option value="newest">Recentes</option>
              <option value="oldest">Antigos</option>
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

          {/* Detail panel — desktop */}
          <AnimatePresence>
            {selectedLead && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 shrink-0 hidden lg:block"
              >
                <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onDelete={handleDelete} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detail modal — mobile */}
          <AnimatePresence>
            {selectedLead && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setSelectedLead(null)}
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl"
                >
                  <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
                  <div className="p-5">
                    <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onDelete={handleDelete} />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 text-gray-300 hover:text-gray-500 rounded transition-colors shrink-0" title="Copiar">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function LeadDetail({ lead, onClose, onDelete }: { lead: Lead; onClose: () => void; onDelete: (id: string) => void }) {
  const src = SOURCE_CONFIG[lead.source] || SOURCE_CONFIG.FORM;
  return (
    <div className="bg-white rounded-xl lg:border lg:border-gray-200 lg:p-6 lg:sticky lg:top-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{lead.name}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {lead.email && (
          <div className="flex items-center gap-2">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors flex-1 min-w-0 truncate">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />{lead.email}
            </a>
            <CopyButton text={lead.email} />
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors flex-1 min-w-0">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />{lead.phone}
            </a>
            <CopyButton text={lead.phone} />
          </div>
        )}
        {lead.phone && (
          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg justify-center hover:bg-green-600 transition-colors">
            <MessageSquare className="w-4 h-4" />Abrir WhatsApp
          </a>
        )}
      </div>

      {lead.property && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Interesse em</p>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">{lead.property.title}</p>
          </div>
        </div>
      )}

      {lead.message && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Mensagem</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-line">{lead.message}</p>
        </div>
      )}

      <div className="space-y-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
        <div className="flex justify-between">
          <span>Fonte</span>
          <span className={`font-medium px-1.5 py-0.5 rounded ${src.color}`}>{src.label}</span>
        </div>
        <div className="flex justify-between">
          <span>Recebido</span>
          <span className="text-gray-600">{new Date(lead.createdAt).toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Mail className="w-3.5 h-3.5" /> E-mail
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Phone className="w-3.5 h-3.5" /> Ligar
          </a>
        )}
        <button onClick={() => onDelete(lead.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Lead Settings (WhatsApp notifications) ─────────────────

interface PipelineAgent {
  name: string;
  phone: string;
  active: boolean;
  leadCount: number;
}

function LeadsSettings({ isTrial }: { isTrial: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const [planFeatures, setPlanFeatures] = useState<any>({});

  // Simple mode
  const [phones, setPhones] = useState<string[]>([]);
  const [initialPhones, setInitialPhones] = useState<string[]>([]);

  // Pipeline mode
  const [pipelineEnabled, setPipelineEnabled] = useState(false);
  const [masterPhone, setMasterPhone] = useState('');
  const [agents, setAgents] = useState<PipelineAgent[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');

  // Initial state for dirty check
  const [initialState, setInitialState] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/contact'),
      api.get('/subscription'),
    ]).then(([contactRes, subRes]) => {
      const d = contactRes.data || {};
      setPhones(d.leadNotifyPhones || []);
      setInitialPhones(d.leadNotifyPhones || []);
      setPipelineEnabled(d.leadPipelineEnabled || false);
      setMasterPhone(d.leadMasterPhone || '');
      setAgents(d.leadPipelineAgents || []);
      setPlanFeatures(subRes.data?.currentPlan?.features || {});
      setInitialState(JSON.stringify({
        phones: d.leadNotifyPhones || [],
        pipelineEnabled: d.leadPipelineEnabled || false,
        masterPhone: d.leadMasterPhone || '',
        agents: d.leadPipelineAgents || [],
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hasFeature = !!planFeatures.whatsappNotifications && !isTrial;
  const maxPhones = planFeatures.prioritySupport ? 5 : 2;

  const currentState = JSON.stringify({
    phones: phones.filter((p) => p.trim()),
    pipelineEnabled,
    masterPhone,
    agents,
  });
  const isDirty = currentState !== initialState;

  const addAgent = () => {
    if (!newAgentName.trim() || !newAgentPhone.trim()) return;
    setAgents([...agents, { name: newAgentName.trim(), phone: newAgentPhone, active: true, leadCount: 0 }]);
    setNewAgentName('');
    setNewAgentPhone('');
  };

  const removeAgent = (index: number) => {
    setAgents(agents.filter((_, i) => i !== index));
  };

  const toggleAgent = (index: number) => {
    setAgents(agents.map((a, i) => i === index ? { ...a, active: !a.active } : a));
  };

  const handleSave = async () => {
    setSaving(true);
    setServerError('');
    setSuccess('');
    try {
      await api.patch('/contact', {
        leadNotifyPhones: phones.filter((p) => p.trim()),
        leadPipelineEnabled: pipelineEnabled,
        leadMasterPhone: masterPhone.trim() || null,
        leadPipelineAgents: agents,
      });
      setInitialPhones(phones.filter((p) => p.trim()));
      setInitialState(currentState);
      setSuccess('Configurações salvas!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configurações de Leads</h2>
        <p className="text-sm text-gray-500 mt-1">Configure como você recebe notificações de novos leads</p>
      </div>

      {/* WhatsApp Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Notificações via WhatsApp
          </h3>
          {!hasFeature && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Receba uma mensagem no WhatsApp sempre que um lead preencher o formulário do seu site
        </p>

        {!hasFeature ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Disponível nos planos Profissional e Multiunidade</p>
            <p className="text-xs text-gray-400">Faça upgrade para receber notificações em tempo real</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Pipeline toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Esteira de leads</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribui leads automaticamente entre corretores em rodízio
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPipelineEnabled(!pipelineEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${pipelineEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pipelineEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {pipelineEnabled ? (
              <>
                {/* Master phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Número master (recebe todos os leads)</label>
                  <PhoneInput
                    value={masterPhone}
                    onChange={setMasterPhone}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="text-[11px] text-gray-400">Este número recebe todos os leads + informação de qual corretor foi designado</p>
                </div>

                {/* Agents list */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Corretores na esteira</p>

                  {agents.length === 0 && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">Nenhum corretor adicionado</p>
                  )}

                  {agents.map((agent, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${agent.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <button
                        type="button"
                        onClick={() => toggleAgent(i)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${agent.active ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                      >
                        {agent.active && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.phone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-900">{agent.leadCount}</p>
                        <p className="text-[10px] text-gray-400">leads</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAgent(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add agent form */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Adicionar corretor</p>
                    <div className="flex gap-2">
                      <input
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        placeholder="Nome"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                      />
                      <PhoneInput
                        value={newAgentPhone}
                        onChange={setNewAgentPhone}
                        placeholder="(11) 99999-9999"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={addAgent}
                        disabled={!newAgentName.trim() || !newAgentPhone.trim()}
                        className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-40 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Simple mode — phone list */}
                <p className="text-xs text-gray-400">
                  Adicione até <strong>{maxPhones}</strong> números para receber notificações quando um lead preencher o formulário.
                </p>

                {phones.map((phone, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <PhoneInput
                      value={phone}
                      onChange={(v) => {
                        const updated = [...phones];
                        updated[i] = v;
                        setPhones(updated);
                      }}
                      placeholder="(11) 99999-9999"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setPhones(phones.filter((_, j) => j !== i))}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {phones.length < maxPhones && (
                  <button
                    type="button"
                    onClick={() => setPhones([...phones, ''])}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar número
                  </button>
                )}

                {phones.length >= maxPhones && (
                  <p className="text-xs text-gray-400">Limite de {maxPhones} números atingido para o seu plano.</p>
                )}
              </>
            )}

            {/* Feedback */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">
                <Check className="w-4 h-4" />{success}
              </div>
            )}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />{serverError}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
