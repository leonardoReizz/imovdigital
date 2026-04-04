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
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
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
  found?: string;
  ssl?: boolean;
  sslError?: string;
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
    setVerification(null);
    try {
      const { data } = await api.patch('/tenant/domain', { domain: domain || null });
      setTenant(data);
      setDomain(data.customDomain || '');
      setDomainSuccess(domain ? 'Domínio salvo! Siga os passos abaixo para ativá-lo.' : 'Domínio removido.');
      setTimeout(() => setDomainSuccess(''), 5000);
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
      setVerification({ verified: false, reason: 'Erro ao verificar. Tente novamente.' });
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
  const originDomain = `origin.${BASE_DOMAIN}`;
  const slugChanged = slug !== tenant?.slug;
  const canSaveSlug = slugChanged && slugCheck?.available && !slugSaving;
  const hasDomain = Boolean(tenant?.customDomain);

  // Steps status
  const step1Done = hasDomain;
  const step2Done = verification?.verified === true;
  const step3Done = verification?.ssl === true;

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
              <ExternalLink className="w-4 h-4 text-primary/50" />
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(`https://${hasDomain ? tenant!.customDomain : currentSubdomain}`, 'url')}
            className="p-2 text-primary/50 hover:text-primary hover:bg-primary/20 rounded-lg transition-colors"
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
        className="bg-white rounded-xl border border-gray-200 p-6"
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
            <p className="text-sm text-gray-500 mb-5">
              Use seu próprio domínio para dar mais credibilidade ao site da sua imobiliária
            </p>

            {/* Step-by-step guide */}
            <div className="space-y-6">
              {/* Step 1: Enter domain */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    step1Done ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                  }`}>
                    {step1Done ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className={`w-0.5 flex-1 mt-2 ${step1Done ? 'bg-green-200' : 'bg-gray-200'}`} />
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Digite seu domínio</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Ex: meusite.com.br, www.imobiliaria.com, etc.
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

                  {(!hasDomain || domain !== tenant?.customDomain) && (
                    <button
                      onClick={handleSaveDomain}
                      disabled={domainSaving || !domain || domain === (tenant?.customDomain || '')}
                      className="mt-3 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {domainSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar domínio'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Configure DNS */}
              <div className={`flex gap-4 ${!hasDomain ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    step2Done ? 'bg-green-100 text-green-700' : step1Done ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step2Done ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <div className={`w-0.5 flex-1 mt-2 ${step2Done ? 'bg-green-200' : 'bg-gray-200'}`} />
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Configure o DNS do seu domínio</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Acesse o painel onde você comprou o domínio (GoDaddy, Registro.br, HostGator, etc.) e adicione este registro:
                  </p>

                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase">Tipo</th>
                          <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase">Nome/Host</th>
                          <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase">Aponta para</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">CNAME</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">
                            {tenant?.customDomain?.startsWith('www.') ? 'www' : '@'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-900 font-semibold">{originDomain}</td>
                          <td className="px-2 py-3">
                            <button
                              onClick={() => copyToClipboard(originDomain, 'cname')}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {copied === 'cname' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Dica:</strong> Após configurar, a propagação do DNS pode levar de 5 minutos até 24 horas.
                      Enquanto isso, você pode tentar clicar em "Verificar e ativar" abaixo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Verify and activate SSL */}
              <div className={`flex gap-4 ${!hasDomain ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    step3Done ? 'bg-green-100 text-green-700' : step1Done ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step3Done ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Verificar e ativar HTTPS</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Após configurar o DNS, clique no botão abaixo. Vamos verificar se está tudo certo e gerar automaticamente o certificado SSL (HTTPS) para o seu domínio.
                  </p>

                  <button
                    onClick={handleVerifyDomain}
                    disabled={verifying || !hasDomain}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : step3Done ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verificado e ativo
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verificar e ativar HTTPS
                      </>
                    )}
                  </button>

                  {/* Verification result */}
                  {verification && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      {verification.verified && verification.ssl ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Domínio ativo com HTTPS</span>
                          </div>
                          <p className="text-xs text-green-600">
                            Seu site está acessível em <strong>https://{tenant?.customDomain}</strong> com certificado SSL.
                          </p>
                        </div>
                      ) : verification.verified && !verification.ssl ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">DNS verificado, SSL em processamento</span>
                          </div>
                          <p className="text-xs text-amber-600">
                            {verification.sslError || 'O certificado SSL está sendo gerado. Aguarde alguns minutos e tente novamente.'}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-semibold text-red-700">DNS ainda não configurado</span>
                          </div>
                          <p className="text-xs text-red-600 mb-2">
                            {verification.reason}
                          </p>
                          <p className="text-xs text-gray-500">
                            Verifique se o registro CNAME foi adicionado corretamente no painel do seu domínio.
                            Se acabou de configurar, aguarde alguns minutos e tente novamente.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
