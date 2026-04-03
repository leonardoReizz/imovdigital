import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Trash2,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { formatPhone } from '../components/PhoneInput';

// ─── Schemas ─────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
    .regex(/\d/, 'Precisa de um número'),
  confirmPassword: z.string().min(1, 'Confirme a nova senha'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const deleteSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória para confirmar'),
  confirm: z.string().min(1, 'Confirmação é obrigatória'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type DeleteForm = z.infer<typeof deleteSchema>;

// ─── Main Page ───────────────────────────────────────────────

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const deleteForm = useForm<DeleteForm>({ resolver: zodResolver(deleteSchema) });

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        profileForm.reset({ name: data.name, phone: data.phone || '' });
        setEmail(data.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/auth/me', data);
      setProfileSuccess('Dados atualizados com sucesso!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Erro ao atualizar dados');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Senha alterada com sucesso!');
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  const onDeleteSubmit = async (data: DeleteForm) => {
    if (data.confirm !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR para confirmar');
      return;
    }
    setDeleteError('');
    try {
      await api.delete('/auth/me', { data: { password: data.password } });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Erro ao excluir conta');
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
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Dados pessoais
        </h3>
        <p className="text-sm text-gray-500 mb-5">Informações básicas da sua conta</p>

        <AnimatePresence>
          {profileSuccess && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                <Check className="w-4 h-4" />{profileSuccess}
              </div>
            </motion.div>
          )}
          {profileError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />{profileError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nome completo</label>
              <input
                {...profileForm.register('name')}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${profileForm.formState.errors.name ? 'border-red-300' : 'border-gray-200'}`}
              />
              {profileForm.formState.errors.name && <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                value={formatPhone(profileForm.watch('phone') || '')}
                onChange={(e) => profileForm.setValue('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input value={email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {profileForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Alterar senha
        </h3>
        <p className="text-sm text-gray-500 mb-5">Atualize sua senha de acesso</p>

        <AnimatePresence>
          {passwordSuccess && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                <Check className="w-4 h-4" />{passwordSuccess}
              </div>
            </motion.div>
          )}
          {passwordError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />{passwordError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Senha atual</label>
            <div className="relative">
              <input
                {...passwordForm.register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${passwordForm.formState.errors.currentPassword ? 'border-red-300' : 'border-gray-200'}`}
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nova senha</label>
              <div className="relative">
                <input
                  {...passwordForm.register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${passwordForm.formState.errors.newPassword ? 'border-red-300' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Confirmar nova senha</label>
              <input
                {...passwordForm.register('confirmPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${passwordForm.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
              />
              {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {passwordForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Alterar senha
          </button>
        </form>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-red-200 p-6"
      >
        <h3 className="text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Zona de perigo
        </h3>
        <p className="text-sm text-gray-500 mb-4">Ações irreversíveis na sua conta</p>

        {!showDeleteSection ? (
          <button
            onClick={() => setShowDeleteSection(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Tem certeza que deseja excluir sua conta?</p>
            <p className="text-xs text-red-600/70 mb-4">Seus dados serão desativados. Esta ação não pode ser desfeita.</p>

            <AnimatePresence>
              {deleteError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />{deleteError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-red-700">Sua senha</label>
                <input
                  {...deleteForm.register('password')}
                  type="password"
                  placeholder="Digite sua senha"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${deleteForm.formState.errors.password ? 'border-red-400' : 'border-red-200'}`}
                />
                {deleteForm.formState.errors.password && <p className="text-xs text-red-500">{deleteForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-red-700">Digite <strong>EXCLUIR</strong> para confirmar</label>
                <input
                  {...deleteForm.register('confirm')}
                  placeholder="EXCLUIR"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none ${deleteForm.formState.errors.confirm ? 'border-red-400' : 'border-red-200'}`}
                />
                {deleteForm.formState.errors.confirm && <p className="text-xs text-red-500">{deleteForm.formState.errors.confirm.message}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowDeleteSection(false); deleteForm.reset(); setDeleteError(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleteForm.formState.isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Excluir conta
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
