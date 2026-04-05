import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Plus, Loader2, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import logoImg from '../assets/logo.png';

export function NoOrganizationPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { data } = await api.post('/auth/create-tenant', { agencyName: name });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar organização');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <img src={logoImg} alt="ImovDigital" className="h-12 object-contain mx-auto mb-8" />

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Nenhuma organização</h1>
          <p className="text-sm text-gray-500 mb-6">
            Você ainda não possui nenhuma imobiliária cadastrada. Crie uma para começar a usar a plataforma.
          </p>

          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Criar minha imobiliária
            </button>
          ) : (
            <div className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nome da imobiliária</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Ex: Imobiliária Horizonte"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCreate(false); setName(''); setError(''); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Criar
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mt-6 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </motion.div>
    </div>
  );
}
