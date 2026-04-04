'use client';

import { useState } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { PhoneInput } from './PhoneInput';

interface LeadFormProps {
  tenantSlug: string;
  propertyId?: string;
  propertyTitle?: string;
  primaryColor: string;
  compact?: boolean;
}

export function LeadForm({ tenantSlug, propertyId, propertyTitle, primaryColor, compact }: LeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSending(true);
    setError('');
    try {
      await fetch(`/api/public/${tenantSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          message: message || (propertyTitle ? `Tenho interesse no imóvel: ${propertyTitle}` : 'Contato pelo site'),
          propertyId: propertyId || undefined,
          source: 'FORM',
        }),
      });
      setSent(true);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${primaryColor}20` }}>
          <Check className="w-6 h-6" style={{ color: primaryColor }} />
        </div>
        <p className="text-sm font-semibold text-gray-900">Mensagem enviada!</p>
        <p className="text-xs text-gray-500 mt-1">Entraremos em contato em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-${compact ? '2' : '3'}`}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome *"
        required
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary]"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu e-mail"
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary]"
      />
      <PhoneInput
        value={phone}
        onChange={setPhone}
        placeholder="(11) 99999-9999"
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary]"
      />
      {!compact && (
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem (opcional)"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[--color-primary]/20 focus:border-[--color-primary] resize-none"
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-medium rounded-lg text-sm disabled:opacity-50 transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  );
}
