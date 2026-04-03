import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Building2,
  Users,
  MessageSquare,
  Globe,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';

const REASONS = [
  { value: 'too_expensive', label: 'Muito caro para o que oferece' },
  { value: 'not_using', label: 'Não estou usando o suficiente' },
  { value: 'switched', label: 'Fui para outro sistema' },
  { value: 'technical', label: 'Problemas técnicos frequentes' },
  { value: 'missing_features', label: 'Falta funcionalidade que preciso' },
  { value: 'other', label: 'Outro motivo' },
];

interface Summary {
  planName: string;
  properties: number;
  users: number;
  leads: number;
  hasSitePublished: boolean;
  hasCustomDomain: boolean;
}

export function CancellationModal({ onClose, onCanceled }: { onClose: () => void; onCanceled: () => void }) {
  const [step, setStep] = useState<'summary' | 'feedback' | 'confirm' | 'done'>('summary');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subscription/cancellation-summary')
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (confirmText !== 'CANCELAR') return;
    setCanceling(true);
    setError('');
    try {
      await api.post('/subscription/cancel', { reason, comment: comment || undefined });
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao cancelar');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {step === 'done' ? 'Assinatura cancelada' : 'Cancelar assinatura'}
          </h3>
          <button onClick={step === 'done' ? onCanceled : onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {['summary', 'feedback', 'confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? 'bg-red-600 text-white' :
                    ['summary', 'feedback', 'confirm'].indexOf(step) > i ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>{i + 1}</div>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded ${['summary', 'feedback', 'confirm'].indexOf(step) > i ? 'bg-red-200' : 'bg-gray-100'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Summary */}
          {step === 'summary' && (
            loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : summary && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Tem certeza?</h4>
                  <p className="text-sm text-gray-500">
                    Ao cancelar o plano <strong>{summary.planName}</strong>, você perderá acesso a:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{summary.properties} imóveis cadastrados</p>
                      <p className="text-xs text-gray-500">Seus anúncios ficarão inativos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{summary.leads} leads recebidos</p>
                      <p className="text-xs text-gray-500">Não receberá novos contatos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <Users className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{summary.users} membros na equipe</p>
                      <p className="text-xs text-gray-500">Acesso da equipe será restrito</p>
                    </div>
                  </div>
                  {summary.hasSitePublished && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <Globe className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Site publicado</p>
                        <p className="text-xs text-gray-500">Seu site ficará offline</p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  Seus dados serão mantidos por 30 dias. Você pode reativar a qualquer momento.
                </p>

                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    Manter meu plano
                  </button>
                  <button onClick={() => setStep('feedback')} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    Continuar cancelamento
                  </button>
                </div>
              </div>
            )
          )}

          {/* Step 2: Feedback */}
          {step === 'feedback' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Nos ajude a melhorar</h4>
                <p className="text-sm text-gray-500">Por que você está cancelando? <span className="text-red-500">*</span></p>
              </div>

              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${
                      reason === r.value ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-4 h-4 text-red-600 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">{r.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Quer compartilhar mais detalhes? (opcional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O que podemos fazer para melhorar?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:border-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('summary')} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Voltar
                </button>
                <button
                  onClick={() => reason && setStep('confirm')}
                  disabled={!reason}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Esta ação não pode ser desfeita facilmente</p>
                  <p className="text-xs text-red-600/70">Ao confirmar, seu plano será cancelado imediatamente.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Digite <strong className="text-red-600">CANCELAR</strong> para confirmar
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="CANCELAR"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />{error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('feedback')} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Voltar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={confirmText !== 'CANCELAR' || canceling}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  {canceling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar cancelamento'}
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Assinatura cancelada</h4>
              <p className="text-sm text-gray-500 mb-6">
                Sentimos muito por vê-lo partir. Seus dados serão mantidos por 30 dias caso deseje reativar.
              </p>
              <button
                onClick={onCanceled}
                className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
