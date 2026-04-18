import { motion } from 'motion/react';
import { X, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
}

interface Props {
  currentPlan: Plan;
  targetPlan: Plan;
  billing: 'monthly' | 'yearly';
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PlanChangeConfirmModal({ currentPlan, targetPlan, billing, submitting, onConfirm, onClose }: Props) {
  const currentPrice = billing === 'yearly' && currentPlan.yearlyPrice ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
  const targetPrice = billing === 'yearly' && targetPlan.yearlyPrice ? targetPlan.yearlyPrice : targetPlan.monthlyPrice;
  const isUpgrade = targetPrice > currentPrice;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Confirmar mudança de plano</h3>
            <p className="text-sm text-gray-500 mt-1">Revise os detalhes antes de continuar</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="flex-1">
              <div className="text-xs text-gray-500">Plano atual</div>
              <div className="font-semibold text-gray-900">{currentPlan.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{formatBRL(currentPrice)}/{billing === 'yearly' ? 'ano' : 'mês'}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <div className="text-xs text-gray-500">Novo plano</div>
              <div className="font-semibold text-gray-900">{targetPlan.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{formatBRL(targetPrice)}/{billing === 'yearly' ? 'ano' : 'mês'}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Como a cobrança funciona</div>
              {isUpgrade ? (
                <p className="text-gray-600 leading-relaxed">
                  Você será cobrado imediatamente pela diferença proporcional ao tempo restante do seu ciclo atual.
                  Ou seja, só paga pelos dias que usará do novo plano.
                </p>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  Você receberá um crédito proporcional ao tempo restante do plano atual. Esse crédito será
                  aplicado automaticamente na próxima fatura — nada é cobrado agora.
                </p>
              )}
            </div>

            <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Atenção:</strong> após confirmar, você só poderá trocar de plano novamente quando
                faltarem 7 dias ou menos para o fim do ciclo atual. Escolha com cuidado.
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar mudança'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
