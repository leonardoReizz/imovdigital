import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCheck,
  User as UserIcon,
  X,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Crown,
} from 'lucide-react';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeWall } from '../components/UpgradeWall';
import { PhoneInput } from '../components/PhoneInput';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  OWNER: { label: 'Proprietário', color: 'text-amber-700', bg: 'bg-amber-50', icon: Crown },
  ADMIN: { label: 'Administrador', color: 'text-primary-dark', bg: 'bg-primary-light', icon: Shield },
  AGENT: { label: 'Corretor', color: 'text-green-700', bg: 'bg-green-50', icon: UserCheck },
};

// ─── Modal ───────────────────────────────────────────────────

function MemberModal({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMember | null; // null = create
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(member);
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [role, setRole] = useState(member?.role || 'AGENT');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    if (!email.trim()) { setError('E-mail é obrigatório'); return; }
    if (!isEditing && !password) { setError('Senha é obrigatória'); return; }
    if (!isEditing && password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return; }

    setSaving(true);
    try {
      if (isEditing) {
        const payload: any = { name, phone: phone || undefined, role };
        if (password) payload.password = password;
        await api.patch(`/users/${member!.id}`, payload);
      } else {
        await api.post('/users', { name, email, phone: phone || undefined, role, password });
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Membro' : 'Novo Membro'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do membro"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              disabled={isEditing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Telefone</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Cargo</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ADMIN', 'AGENT'] as const).map((r) => {
                const cfg = ROLE_CONFIG[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                      role === r
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <cfg.icon className="w-4 h-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {role === 'ADMIN' ? 'Acesso total ao painel, incluindo configurações e equipe' : 'Pode gerenciar imóveis e visualizar leads'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              {isEditing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Manter senha atual' : 'Mínimo 6 caracteres'}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function TeamPage() {
  const { canAccessTeam } = useSubscription();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState('');

  if (!canAccessTeam) {
    return (
      <UpgradeWall
        feature="Gerenciamento de Equipe"
        description="Adicione corretores e administradores à sua equipe. Defina permissões e gerencie o acesso de cada membro."
      />
    );
  }

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/users');
      setMembers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao remover membro');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const handleSaved = () => {
    setModal({ open: false, member: null });
    fetchMembers();
  };

  const owners = members.filter((m) => m.role === 'OWNER');
  const admins = members.filter((m) => m.role === 'ADMIN');
  const agents = members.filter((m) => m.role === 'AGENT');

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipe</h2>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} {members.length === 1 ? 'membro' : 'membros'} na equipe
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, member: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Proprietários', count: owners.length, color: 'amber', icon: Crown },
          { label: 'Administradores', count: admins.length, color: 'blue', icon: Shield },
          { label: 'Corretores', count: agents.length, color: 'green', icon: UserCheck },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Nenhum membro na equipe</p>
          <p className="text-sm text-gray-400 mt-1">Adicione membros para gerenciar sua imobiliária</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <AnimatePresence>
            {members.map((member, i) => {
              const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.AGENT;
              const isOwner = member.role === 'OWNER';

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModal({ open: true, member })}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!isOwner && (
                      <button
                        onClick={() => setDeleteConfirm({ id: member.id, name: member.name })}
                        disabled={deleting === member.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remover"
                      >
                        {deleting === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Permissions info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5"
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissões por cargo</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Crown className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Proprietário</p>
              <p className="text-xs text-gray-500">Acesso total. Gerencia assinatura, equipe e todas as configurações. Não pode ser removido.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Administrador</p>
              <p className="text-xs text-gray-500">Gerencia imóveis, leads, equipe, editor do site e configurações. Sem acesso à assinatura.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Corretor</p>
              <p className="text-xs text-gray-500">Gerencia imóveis e visualiza leads atribuídos. Sem acesso a configurações.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Member Modal */}
      <AnimatePresence>
        {modal.open && (
          <MemberModal
            member={modal.member}
            onClose={() => setModal({ open: false, member: null })}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Remover membro</h3>
                  <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja remover <strong>{deleteConfirm.name}</strong> da equipe?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={deleting === deleteConfirm.id}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting === deleteConfirm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Remover
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
