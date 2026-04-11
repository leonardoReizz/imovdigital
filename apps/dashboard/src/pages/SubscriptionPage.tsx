import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatPrice } from '@imovdigital/utils';
import { CancellationModal } from '../components/CancellationModal';

interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  propertyLimit: number;
  userLimit: number;
  features: Record<string, boolean>;
  stripePriceId: string | null;
  stripeYearlyPriceId: string | null;
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
  currentBilling: 'monthly' | 'yearly';
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
  TRIAL: { label: 'Teste Grátis', color: 'text-primary-dark', bg: 'bg-primary-light border-primary/30', icon: Clock },
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

const PLAN_ICONS: Record<string, React.ElementType> = {
  basico: Building2,
  profissional: Zap,
  multiunidade: Sparkles,
};

export function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const [info, setInfo] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      const { data } = await api.post('/subscription/checkout', { planId, billing });
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Erro ao iniciar checkout. Verifique se o Stripe está configurado.');
    } finally {
      setCheckingOut(null);
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

  const { tenant, currentPlan, currentBilling, plans, usage, limits } = info;
  const isTrial = tenant.subscriptionStatus === 'TRIAL';
  const isActive = tenant.subscriptionStatus === 'ACTIVE';
  const statusCfg = STATUS_CONFIG[tenant.subscriptionStatus] || STATUS_CONFIG.TRIAL;
  const paidPlans = plans.filter((p) => p.monthlyPrice > 0);

  return (
    <div className="max-w-5xl mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  backgroundColor: usage.properties >= limits.properties ? '#ef4444' : 'var(--color-primary)',
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
                  backgroundColor: usage.users >= limits.users ? '#ef4444' : 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plans Header + Billing Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {isTrial ? 'Escolha um plano' : 'Planos disponíveis'}
        </h3>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              billing === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              billing === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Anual
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paidPlans.map((plan, i) => {
          const isCurrentPlan = plan.id === currentPlan.id && isActive && billing === currentBilling;
          const isPopular = i === 1;
          const PlanIcon = PLAN_ICONS[plan.slug] || Building2;

          const monthlyEquivalent = billing === 'yearly' && plan.yearlyPrice
            ? Math.round(plan.yearlyPrice / 12)
            : plan.monthlyPrice;
          const totalPrice = billing === 'yearly' && plan.yearlyPrice
            ? plan.yearlyPrice
            : plan.monthlyPrice;
          const savings = billing === 'yearly' && plan.yearlyPrice
            ? (plan.monthlyPrice * 12) - plan.yearlyPrice
            : 0;
          const hasYearly = !!plan.yearlyPrice;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all ${
                isPopular
                  ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3" />
                  Mais popular
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isPopular ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <PlanIcon className={`w-5 h-5 ${isPopular ? 'text-primary' : 'text-gray-600'}`} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                {isCurrentPlan && (
                  <span className="inline-block text-[11px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full mt-1">
                    Plano atual
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    {formatPrice(monthlyEquivalent)}
                  </span>
                  <span className="text-sm text-gray-400">/mês</span>
                </div>
                {billing === 'yearly' && hasYearly ? (
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-xs text-gray-400">
                      {formatPrice(totalPrice)} cobrado anualmente
                    </p>
                    {savings > 0 && (
                      <p className="text-xs font-semibold text-emerald-600">
                        Economia de {formatPrice(savings)}/ano
                      </p>
                    )}
                  </div>
                ) : billing === 'yearly' && !hasYearly ? (
                  <p className="text-xs text-gray-400 mt-1.5">Plano anual em breve</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1.5">Cobrado mensalmente</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{plan.propertyLimit <= 0 ? <strong>Imóveis ilimitados</strong> : <><strong>{plan.propertyLimit}</strong> imóveis</>}</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{plan.userLimit <= 0 ? <strong>Usuários ilimitados</strong> : <><strong>{plan.userLimit}</strong> usuários</>}</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Domínio próprio
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Editor visual
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  Leads ilimitados
                </li>
                {plan.features?.whatsappNotifications && (
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Notificação de leads via WhatsApp
                  </li>
                )}
                {plan.features?.prioritySupport && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      Até 10 filiais
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      Suporte prioritário
                    </li>
                  </>
                )}
                {!plan.features?.prioritySupport && plan.features?.whatsappNotifications && (
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    Até 2 filiais
                  </li>
                )}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="px-5 py-3 text-sm font-medium bg-green-50 text-green-700 rounded-xl text-center">
                  Plano atual
                </div>
              ) : billing === 'yearly' && !hasYearly ? (
                <div className="px-5 py-3 text-sm font-medium bg-gray-50 text-gray-400 rounded-xl text-center">
                  Em breve
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={checkingOut !== null}
                  className={`w-full px-5 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {checkingOut === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : plan.id === currentPlan.id && isActive && billing !== currentBilling ? (
                    billing === 'yearly' ? 'Mudar para anual' : 'Mudar para mensal'
                  ) : (
                    'Assinar'
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* No plans message */}
      {paidPlans.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum plano pago configurado ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Configure os planos no banco de dados para ativar o checkout.</p>
        </div>
      )}

      {/* Advanced Options — Cancel */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-200 mt-8"
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full px-6 py-4 text-left"
          >
            <span className="text-sm font-medium text-gray-500">Opções avançadas</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cancelar assinatura e solicitar reembolso</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Conforme o Código de Defesa do Consumidor (Art. 49), você tem direito ao reembolso integral em até 7 dias após a contratação.
                  </p>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shrink-0 ml-4"
                >
                  Cancelar plano
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancellationModal
            onClose={() => setShowCancelModal(false)}
            onCanceled={() => { setShowCancelModal(false); window.location.reload(); }}
          />
        )}
      </AnimatePresence>

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
          <div>
            <p className="font-medium text-gray-700">Qual a diferença entre mensal e anual?</p>
            <p className="text-gray-500 mt-0.5">O plano anual é cobrado uma vez por ano com desconto de até 17%. Você economiza o equivalente a 2 meses.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
