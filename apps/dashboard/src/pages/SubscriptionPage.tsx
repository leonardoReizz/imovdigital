import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import {
  CreditCard,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Building2,
  Users,
  Globe,
  MessageSquare,
  Zap,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '@imovdigital/utils';

interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  propertyLimit: number;
  userLimit: number;
  features: Record<string, boolean>;
  stripePriceId: string | null;
}

interface SubInfo {
  tenant: {
    id: string;
    name: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    trialDaysLeft: number;
    trialExpired: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };
  currentPlan: Plan;
  plans: Plan[];
  usage: { properties: number; users: number };
  limits: {
    properties: number;
    users: number;
    customDomain: boolean;
    leads: boolean;
    team: boolean;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  TRIAL: { label: 'Teste Grátis', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Clock },
  ACTIVE: { label: 'Ativo', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: Check },
  OVERDUE: { label: 'Pagamento Pendente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertCircle },
  CANCELED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: X },
};

const TRIAL_LIMITS = [
  { icon: Building2, label: 'Até 10 imóveis', included: true },
  { icon: Globe, label: 'Domínio personalizado', included: false },
  { icon: Users, label: 'Adicionar equipe', included: false },
  { icon: MessageSquare, label: 'Painel de leads', included: false },
];

export function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const [info, setInfo] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    api.get('/subscription')
      .then(({ data }) => setInfo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckingOut(planId);
    try {
      const { data } = await api.post('/subscription/checkout', { planId });
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Erro ao iniciar checkout. Verifique se o Stripe está configurado.');
    } finally {
      setCheckingOut(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.post('/subscription/portal');
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Erro ao abrir portal de faturamento.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!info) return null;

  const { tenant, currentPlan, plans, usage, limits } = info;
  const isTrial = tenant.subscriptionStatus === 'TRIAL';
  const isActive = tenant.subscriptionStatus === 'ACTIVE';
  const statusCfg = STATUS_CONFIG[tenant.subscriptionStatus] || STATUS_CONFIG.TRIAL;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Assinatura</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie seu plano e acompanhe o uso</p>
      </div>

      {/* Success/Cancel feedback */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
          <Check className="w-4 h-4" />
          Assinatura ativada com sucesso! Aproveite todos os recursos.
        </motion.div>
      )}
      {canceled && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4" />
          Checkout cancelado. Você pode tentar novamente quando quiser.
        </motion.div>
      )}

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-6 mb-6 ${statusCfg.bg}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <statusCfg.icon className={`w-6 h-6 ${statusCfg.color}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
                <span className="text-sm text-gray-500">— {currentPlan.name}</span>
              </div>
              {isTrial && !tenant.trialExpired && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {tenant.trialDaysLeft > 0
                    ? `${tenant.trialDaysLeft} ${tenant.trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}`
                    : 'Último dia do teste'}
                </p>
              )}
              {isTrial && tenant.trialExpired && (
                <p className="text-sm text-red-600 font-medium mt-0.5">
                  Período de teste encerrado. Assine para continuar usando.
                </p>
              )}
            </div>
          </div>

          {isActive && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Gerenciar Faturamento
            </button>
          )}
        </div>
      </motion.div>

      {/* Trial Limits Banner */}
      {isTrial && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">Limitações do teste grátis</h3>
          <div className="grid grid-cols-2 gap-3">
            {TRIAL_LIMITS.map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.included ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <item.icon className={`w-4 h-4 ${item.included ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {item.included ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Usage */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-4">Uso atual</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Imóveis</span>
              <span className="text-sm font-semibold text-gray-900">{usage.properties}/{limits.properties}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (usage.properties / limits.properties) * 100)}%`,
                  backgroundColor: usage.properties >= limits.properties ? '#ef4444' : '#2563eb',
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Membros da equipe</span>
              <span className="text-sm font-semibold text-gray-900">{usage.users}/{limits.users}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (usage.users / limits.users) * 100)}%`,
                  backgroundColor: usage.users >= limits.users ? '#ef4444' : '#2563eb',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {isTrial ? 'Escolha um plano' : 'Planos disponíveis'}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {plans.filter((p) => p.monthlyPrice > 0).map((plan, i) => {
          const isCurrentPlan = plan.id === currentPlan.id && isActive;
          const isPopular = i === 1; // Second plan is "popular"

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`relative bg-white rounded-xl border-2 p-6 transition-colors ${
                isPopular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Mais popular
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                    {isCurrentPlan && (
                      <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Plano atual
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.monthlyPrice)}</span>
                    <span className="text-sm text-gray-500">/mês</span>
                  </div>
                </div>

                <div>
                  {isCurrentPlan ? (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="px-5 py-2.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-xl"
                    >
                      Gerenciar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkingOut !== null}
                      className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                        isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } disabled:opacity-50`}
                    >
                      {checkingOut === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Assinar'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {plan.propertyLimit} imóveis
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  {plan.userLimit} usuários
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Domínio próprio
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Leads ilimitados
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-gray-400" />
                  Suporte prioritário
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No plans message */}
      {plans.filter((p) => p.monthlyPrice > 0).length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum plano pago configurado ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Configure os planos no banco de dados para ativar o checkout.</p>
        </div>
      )}

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6"
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Perguntas frequentes</h4>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Posso cancelar a qualquer momento?</p>
            <p className="text-gray-500 mt-0.5">Sim. Sem multa ou fidelidade. Ao cancelar, você mantém acesso até o fim do período pago.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">O que acontece quando o teste grátis acaba?</p>
            <p className="text-gray-500 mt-0.5">Seus dados são mantidos por 30 dias. Você precisa assinar um plano para continuar usando a plataforma.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Posso mudar de plano depois?</p>
            <p className="text-gray-500 mt-0.5">Sim. Você pode fazer upgrade ou downgrade pelo portal de faturamento. A diferença é calculada automaticamente.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
