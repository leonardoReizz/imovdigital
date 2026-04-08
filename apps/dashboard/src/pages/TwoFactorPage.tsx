import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import logoImg from '../assets/logo.png';

// Cooldowns in seconds: auto-send → 30s, 1st resend → 1min, 2nd → 5min, 3rd+ → 5min
const COOLDOWNS = [30, 60, 300, 300];

export function TwoFactorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const hasSentRef = useRef(false);

  // Cooldown timer
  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Send code automatically on page load
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    const token = localStorage.getItem('accessToken');
    if (token) {
      api.post('/auth/resend-two-factor')
        .then(() => {
          setSent(true);
          startCooldown(COOLDOWNS[0]); // 30s cooldown after auto-send
          setResendCount(1);
        })
        .catch(() => {});
    }
    inputRefs.current[0]?.focus();
  }, [startCooldown]);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const formatCooldown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d) && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeStr: string) => {
    setVerifying(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-two-factor', { code: codeStr });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-two-factor');
      setSent(true);
      const nextCooldown = COOLDOWNS[Math.min(resendCount, COOLDOWNS.length - 1)];
      setResendCount((c) => c + 1);
      startCooldown(nextCooldown);
    } catch {
      setError('Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logoImg} alt="ImovDigital" className="h-12 object-contain mx-auto mb-6" />
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verificação de segurança</h1>
          <p className="text-sm text-gray-500 mt-2">
            {sent
              ? <>Enviamos um código de 6 dígitos para o seu e-mail.<br />Digite o código abaixo para continuar.</>
              : 'Enviando código para o seu e-mail...'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-sm">
          {/* Code inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 rounded-lg sm:rounded-xl outline-none transition-colors ${
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : digit
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 focus:border-primary'
                }`}
                disabled={verifying}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Verifying indicator */}
          {verifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando...
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">Não recebeu o código?</p>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {cooldown > 0
                ? `Reenviar em ${formatCooldown(cooldown)}`
                : 'Reenviar código'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          O código expira em 10 minutos
        </p>
      </motion.div>
    </div>
  );
}
