import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, AlertCircle, Check,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { formatPhone } from '../components/PhoneInput';
import logoImg from '../assets/logo.png';

const step1Schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().optional(),
  agencyName: z.string().min(1, 'Nome da imobiliária é obrigatório'),
});

const step2Schema = z.object({
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

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Um número', test: (v: string) => /\d/.test(v) },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);

  const form1 = useForm<Step1Form>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Form>({ resolver: zodResolver(step2Schema) });

  const onStep1 = (data: Step1Form) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2Form) => {
    if (!step1Data) return;
    setServerError('');
    try {
      const { data: res } = await api.post('/auth/register', {
        ...step1Data,
        password: data.password,
      });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      navigate('/dashboard');
    } catch {
      setServerError('Não foi possível criar a conta. Tente novamente.');
    }
  };

  const passwordValue = form2.watch('password') || '';

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary-dark to-primary-dark relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full items-start">
          <img src={logoImg} alt="ImovDigital" className="h-14 object-contain brightness-0 invert" />

          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Comece a<br />transformar sua<br />
              <span className="text-green-200">imobiliária.</span>
            </h1>
            <p className="text-green-100/80 text-lg max-w-md">
              Crie sua conta em segundos e tenha acesso completo ao portal mais moderno do mercado imobiliário.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Portal personalizado com sua marca',
              'Gestão completa de imóveis e leads',
              '7 dias grátis, sem cartão de crédito',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/80/30 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-green-200" />
                </div>
                <span className="text-green-100/90 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10">
            <img src={logoImg} alt="ImovDigital" className="h-14 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Crie sua conta</h2>
            <p className="text-gray-500 mt-2">
              {step === 1 ? 'Preencha seus dados para começar' : 'Defina sua senha de acesso'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className="flex-1 h-0.5 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: step > 1 ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
                  </div>
                )}
              </div>
            ))}
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

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={form1.handleSubmit(onStep1)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input {...form1.register('name')} placeholder="Seu nome" className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${form1.formState.errors.name ? 'border-red-300' : 'border-gray-200'}`} />
                  </div>
                  {form1.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input {...form1.register('email')} type="email" placeholder="seu@email.com" className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${form1.formState.errors.email ? 'border-red-300' : 'border-gray-200'}`} />
                  </div>
                  {form1.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formatPhone(form1.watch('phone') || '')}
                      onChange={(e) => form1.setValue('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Nome da imobiliária</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input {...form1.register('agencyName')} placeholder="Minha Imobiliária" className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${form1.formState.errors.agencyName ? 'border-red-300' : 'border-gray-200'}`} />
                  </div>
                  {form1.formState.errors.agencyName && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.agencyName.message}</p>}
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  Continuar <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={form2.handleSubmit(onStep2)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...form2.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crie uma senha"
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${form2.formState.errors.password ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form2.formState.errors.password && <p className="text-xs text-red-500 mt-1">{form2.formState.errors.password.message}</p>}

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
                  <label className="block text-sm font-medium text-gray-700">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...form2.register('confirmPassword')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${form2.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                    />
                  </div>
                  {form2.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{form2.formState.errors.confirmPassword.message}</p>}
                </div>

                <div className="flex gap-3">
                  <motion.button type="button" onClick={() => setStep(1)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Voltar
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={form2.formState.isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-[2] bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {form2.formState.isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <>Criar conta <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-500 mt-8">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">Fazer login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
