import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Shield,
  Save,
  Loader2,
  Check,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
  Trash2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';

const orgSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

type OrgForm = z.infer<typeof orgSchema>;

interface Tenant {
  id: string;
  name: string;
  slug: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  subscriptionStatus: string;
}

export function OrganizationPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [twoFAUpdating, setTwoFAUpdating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const form = useForm<OrgForm>({ resolver: zodResolver(orgSchema) });

  useEffect(() => {
    api.get('/tenant')
      .then(({ data }) => {
        setTenant(data);
        form.reset({ name: data.name });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: OrgForm) => {
    setError('');
    setSuccess('');
    try {
      const { data: updated } = await api.patch('/tenant', { name: data.name });
      setTenant(updated);
      setSuccess('Dados da organização atualizados!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao atualizar');
    }
  };

  const toggleTwoFA = async () => {
    if (!tenant) return;
    setTwoFAUpdating(true);
    try {
      const { data: updated } = await api.patch('/tenant', {
        twoFactorEnabled: !tenant.twoFactorEnabled,
      });
      setTenant(updated);
    } catch {
      // ignore
    } finally {
      setTwoFAUpdating(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (deleteConfirm !== tenant?.name) {
      setDeleteError(`Digite "${tenant?.name}" para confirmar`);
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      // Soft-delete: we don't actually delete, just deactivate
      await api.patch('/tenant', { subscriptionStatus: 'CANCELED' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Erro ao desativar organização');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Organização</h2>
        <p className="text-sm text-gray-500 mt-1">Configurações da sua imobiliária</p>
      </div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-400" />
          Dados da imobiliária
        </h3>
        <p className="text-sm text-gray-500 mb-5">Informações básicas da organização</p>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                <Check className="w-4 h-4" />{success}
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />{error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nome da imobiliária</label>
              <input
                {...form.register('name')}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${form.formState.errors.name ? 'border-red-300' : 'border-gray-200'}`}
              />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Slug (subdomínio)</label>
              <input value={tenant?.slug || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-400">Altere em Domínio</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">ID da organização</label>
              <input value={tenant?.id || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Criada em</label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </form>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Autenticação em dois fatores (2FA)
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Exigir que todos os membros da equipe usem 2FA ao fazer login
        </p>

        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {tenant?.twoFactorEnabled ? (
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                <ShieldOff className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tenant?.twoFactorEnabled ? '2FA ativado' : '2FA desativado'}
              </p>
              <p className="text-xs text-gray-500">
                {tenant?.twoFactorEnabled
                  ? 'Todos os membros precisarão confirmar login por e-mail'
                  : 'Login com apenas e-mail e senha'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTwoFA}
            disabled={twoFAUpdating}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              tenant?.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            {twoFAUpdating ? (
              <Loader2 className="w-4 h-4 text-white animate-spin absolute top-1 left-4" />
            ) : (
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                tenant?.twoFactorEnabled ? 'translate-x-6' : ''
              }`} />
            )}
          </button>
        </div>

        {tenant?.twoFactorEnabled && (
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Ao ativar, um código será enviado por e-mail em cada login dos membros da equipe.
          </p>
        )}
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-red-200 p-6"
      >
        <h3 className="text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Zona de perigo
        </h3>
        <p className="text-sm text-gray-500 mb-4">Ações irreversíveis na organização</p>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Desativar organização
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Desativar "{tenant?.name}"?</p>
            <p className="text-xs text-red-600/70 mb-4">
              Todos os imóveis, leads e configurações serão desativados. Os dados serão mantidos por 30 dias.
            </p>

            <AnimatePresence>
              {deleteError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />{deleteError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-red-700">
                  Digite <strong>{tenant?.name}</strong> para confirmar
                </label>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={tenant?.name}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirm(''); setDeleteError(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteOrg}
                  disabled={deleting || deleteConfirm !== tenant?.name}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Desativar
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
