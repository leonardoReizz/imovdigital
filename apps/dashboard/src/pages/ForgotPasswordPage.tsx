import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Check, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import logoImg from '../assets/logo.png';

const emailSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
    .regex(/\d/, 'Precisa de um número'),
  confirmPassword: z.string().min(1, 'Confirme a senha'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type EmailForm = z.infer<typeof emailSchema>;
type CodeForm = z.infer<typeof codeSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Um número', test: (v: string) => /\d/.test(v) },
];

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [resending, setResending] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const passwordValue = passwordForm.watch('password') || '';

  const onEmailSubmit = async (data: EmailForm) => {
    setServerError('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setStep('code');
    } catch {
      setServerError('Erro ao enviar código. Tente novamente.');
    }
  };

  const onCodeSubmit = async (data: CodeForm) => {
    setServerError('');
    try {
      await api.post('/auth/verify-reset-code', { email, code: data.code });
      setCode(data.code);
      setStep('password');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Código inválido ou expirado');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setServerError('');
    try {
      await api.post('/auth/reset-password', { email, code, password: data.password });
      setStep('done');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Erro ao redefinir senha');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch { /* ignore */ }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src={logoImg} alt="ImovDigital" className="h-10 object-contain" />
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Email */}
        {step === 'email' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Esqueceu a senha?</h2>
              <p className="text-gray-500 mt-2">Informe seu e-mail e enviaremos um código de 6 dígitos</p>
            </div>

            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${emailForm.formState.errors.email ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {emailForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {emailForm.formState.isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Enviar código <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-6 justify-center">
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </Link>
          </motion.div>
        )}

        {/* Step 2: Code */}
        {step === 'code' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verifique seu e-mail</h2>
              <p className="text-gray-500 mt-2">
                Enviamos um código de 6 dígitos para <strong className="text-gray-700">{email}</strong>
              </p>
            </div>

            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Código</label>
                <input
                  {...codeForm.register('code')}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className={`w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${codeForm.formState.errors.code ? 'border-red-300' : 'border-gray-200'}`}
                />
                {codeForm.formState.errors.code && <p className="text-xs text-red-500 mt-1 text-center">{codeForm.formState.errors.code.message}</p>}
              </div>

              <button
                type="submit"
                disabled={codeForm.formState.isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {codeForm.formState.isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Verificar <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep('email')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Trocar e-mail
              </button>
              <button onClick={handleResend} disabled={resending} className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50">
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: New password */}
        {step === 'password' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Nova senha</h2>
              <p className="text-gray-500 mt-2">Crie uma nova senha para sua conta</p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...passwordForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua nova senha"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${passwordForm.formState.errors.password ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.password.message}</p>}

                <div className="mt-3 space-y-2">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(passwordValue);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passed ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {passed && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={`text-xs transition-colors ${passed ? 'text-green-600' : 'text-gray-400'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme a nova senha"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${passwordForm.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {passwordForm.formState.isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  'Redefinir senha'
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
            <p className="text-gray-500 mb-8">Sua senha foi alterada com sucesso. Você já pode fazer login.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Ir para o login <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
