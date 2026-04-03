import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  Globe,
  Check,
  X,
  Loader2,
  ExternalLink,
  Copy,
  AlertCircle,
  RefreshCw,
  Shield,
  Trash2,
  Lock,
} from 'lucide-react';
import { api } from '../lib/api';

interface Tenant {
  id: string;
  slug: string;
  customDomain: string | null;
}

interface SlugCheck {
  available: boolean;
  slug: string;
  reason?: string;
}

interface DomainVerification {
  verified: boolean;
  domain?: string;
  expected?: string;
  reason?: string;
  found?: string[];
}

const BASE_DOMAIN = 'imovdigital.com.br';

export function DomainPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Slug state
  const [slug, setSlug] = useState('');
  const [slugCheck, setSlugCheck] = useState<SlugCheck | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugSuccess, setSlugSuccess] = useState('');
  const [slugError, setSlugError] = useState('');

  // Domain state
  const [domain, setDomain] = useState('');
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainSuccess, setDomainSuccess] = useState('');
  const [domainError, setDomainError] = useState('');
  const [verification, setVerification] = useState<DomainVerification | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [copied, setCopied] = useState('');
  const { canUseCustomDomain } = useSubscription();

  useEffect(() => {
    api.get('/tenant')
      .then(({ data }) => {
        setTenant(data);
        setSlug(data.slug);
        setDomain(data.customDomain || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Debounced slug check
  useEffect(() => {
    if (!slug || slug === tenant?.slug) {
      setSlugCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const { data } = await api.get(`/tenant/check-slug?slug=${encodeURIComponent(slug)}`);
        setSlugCheck(data);
      } catch {
        setSlugCheck(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, tenant?.slug]);

  const handleSaveSlug = async () => {
    setSlugSaving(true);
    setSlugError('');
    setSlugSuccess('');
    try {
      const { data } = await api.patch('/tenant/slug', { slug });
      setTenant(data);
      setSlug(data.slug);
      setSlugCheck(null);
      setSlugSuccess('Subdomínio atualizado com sucesso!');
      setTimeout(() => setSlugSuccess(''), 3000);
    } catch (err: any) {
      setSlugError(err?.response?.data?.message || 'Erro ao atualizar subdomínio');
    } finally {
      setSlugSaving(false);
    }
  };

  const handleSaveDomain = async () => {
    setDomainSaving(true);
    setDomainError('');
    setDomainSuccess('');
    try {
      const { data } = await api.patch('/tenant/domain', { domain: domain || null });
      setTenant(data);
      setDomain(data.customDomain || '');
      setVerification(null);
      setDomainSuccess(domain ? 'Domínio configurado! Verifique o DNS abaixo.' : 'Domínio removido.');
      setTimeout(() => setDomainSuccess(''), 4000);
    } catch (err: any) {
      setDomainError(err?.response?.data?.message || 'Erro ao configurar domínio');
    } finally {
      setDomainSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    setVerifying(true);
    try {
      const { data } = await api.post('/tenant/verify-domain');
      setVerification(data);
    } catch {
      setVerification({ verified: false, reason: 'Erro ao verificar DNS' });
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    setDomain('');
    setDomainSaving(true);
    try {
      const { data } = await api.patch('/tenant/domain', { domain: null });
      setTenant(data);
      setDomain('');
      setVerification(null);
      setDomainSuccess('Domínio removido.');
      setTimeout(() => setDomainSuccess(''), 3000);
    } catch {
      setDomainError('Erro ao remover domínio');
    } finally {
      setDomainSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const currentSubdomain = `${tenant?.slug}.${BASE_DOMAIN}`;
  const slugChanged = slug !== tenant?.slug;
  const canSaveSlug = slugChanged && slugCheck?.available && !slugSaving;
  const hasDomain = Boolean(tenant?.customDomain);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Domínio</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure o endereço do site da sua imobiliária
        </p>
      </div>

      {/* Current URL */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-light border border-primary/30 rounded-xl p-5 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Seu site está em</p>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <a
                href={`https://${hasDomain ? tenant!.customDomain : currentSubdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-primary-dark hover:underline"
              >
                {hasDomain ? tenant!.customDomain : currentSubdomain}
              </a>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(`https://${hasDomain ? tenant!.customDomain : currentSubdomain}`, 'url')}
            className="p-2 text-blue-400 hover:text-primary hover:bg-primary/20 rounded-lg transition-colors"
          >
            {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Subdomain */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1">Subdomínio</h3>
        <p className="text-sm text-gray-500 mb-4">
          O endereço gratuito do seu site no ImovDigital
        </p>

        <div className="flex items-center gap-0">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-l-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="sua-imobiliaria"
          />
          <div className="px-4 py-2.5 bg-gray-50 border border-l-0 border-gray-200 rounded-r-xl text-sm text-gray-500">
            .{BASE_DOMAIN}
          </div>
        </div>

        {/* Slug status */}
        <div className="mt-2 min-h-[24px]">
          {slugChecking && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Verificando...
            </div>
          )}
          {!slugChecking && slugCheck && (
            <div className={`flex items-center gap-1.5 text-xs ${slugCheck.available ? 'text-green-600' : 'text-red-500'}`}>
              {slugCheck.available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {slugCheck.available ? `${slugCheck.slug}.${BASE_DOMAIN} está disponível` : slugCheck.reason}
            </div>
          )}
          {slugError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3" />
              {slugError}
            </div>
          )}
          {slugSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <Check className="w-3 h-3" />
              {slugSuccess}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveSlug}
          disabled={!canSaveSlug}
          className="mt-3 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {slugSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar subdomínio'}
        </button>
      </motion.div>

      {/* Custom Domain */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900">Domínio personalizado</h3>
          {!canUseCustomDomain && <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">PRO</span>}
        </div>

        {!canUseCustomDomain ? (
          <div className="text-center py-6">
            <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Recurso disponível nos planos pagos</p>
            <Link to="/dashboard/subscription" className="text-sm font-medium text-primary hover:text-primary-dark">
              Fazer upgrade →
            </Link>
          </div>
        ) : (
        <>
        <p className="text-sm text-gray-500 mb-4">
          Use seu próprio domínio (ex: <span className="font-medium">www.suaimobiliaria.com.br</span>)
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="www.suaimobiliaria.com.br"
          />
          {hasDomain && (
            <button
              onClick={handleRemoveDomain}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover domínio"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {domainError && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
            <AlertCircle className="w-3 h-3" />
            {domainError}
          </div>
        )}
        {domainSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
            <Check className="w-3 h-3" />
            {domainSuccess}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSaveDomain}
            disabled={domainSaving || domain === (tenant?.customDomain || '')}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {domainSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar domínio'}
          </button>
          {hasDomain && (
            <button
              onClick={handleVerifyDomain}
              disabled={verifying}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Verificar DNS
            </button>
          )}
        </div>

        {/* DNS Verification Status */}
        {verification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 p-4 rounded-xl border ${
              verification.verified
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {verification.verified ? (
                <>
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">DNS verificado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">DNS pendente</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600">{verification.reason}</p>
          </motion.div>
        )}
        </>
        )}
      </motion.div>

      {/* DNS Instructions */}
      {hasDomain && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-1">Configuração DNS</h3>
          <p className="text-sm text-gray-500 mb-4">
            Adicione o registro abaixo no painel de DNS do seu domínio
          </p>

          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">CNAME</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{tenant?.customDomain}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{currentSubdomain}</td>
                  <td className="px-2 py-3">
                    <button
                      onClick={() => copyToClipboard(currentSubdomain, 'cname')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copied === 'cname' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 text-xs text-gray-500">
            <p>1. Acesse o painel de DNS do registrador do seu domínio</p>
            <p>2. Crie um registro <strong>CNAME</strong> com os valores acima</p>
            <p>3. Aguarde a propagação do DNS (pode levar até 24h)</p>
            <p>4. Clique em "Verificar DNS" para confirmar a configuração</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
