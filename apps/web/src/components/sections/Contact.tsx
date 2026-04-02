'use client';

import { useState } from 'react';
import type { ContactSettings } from '@imovdigital/types';
import { MapPin, MessageCircle, Send, Check, Loader2 } from 'lucide-react';

interface Props {
  settings: ContactSettings;
  primaryColor: string;
  tenantSlug?: string;
}

export function Contact({ settings, primaryColor, tenantSlug }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const showEmailField = settings.showEmailField ?? false;
  const showPhoneField = settings.showPhoneField ?? true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (showEmailField && !email.trim() && !showPhoneField) return;
    if (showPhoneField && !phone.trim() && !showEmailField) return;

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
          message: message || 'Contato pelo formulário do site',
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

  return (
    <section className="px-4 sm:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{settings.title}</h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Info */}
          <div className="flex-1 space-y-6">
            {settings.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                <p className="text-gray-600">{settings.address}</p>
              </div>
            )}
            {settings.showWhatsApp && settings.whatsAppNumber && (
              <a
                href={`https://wa.me/${settings.whatsAppNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-gray-600">{settings.whatsAppNumber}</p>
              </a>
            )}
            {settings.showMap && (
              <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-sm text-gray-400">Mapa</p>
              </div>
            )}
          </div>

          {/* Form */}
          {settings.showForm && (
            <div className="flex-1 bg-gray-50 rounded-xl p-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Check className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Mensagem enviada!</h3>
                  <p className="text-sm text-gray-500">Entraremos em contato em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome *"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {showEmailField && (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`Seu e-mail ${!showPhoneField ? '*' : ''}`}
                      required={!showPhoneField}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  )}
                  {showPhoneField && (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={`Seu WhatsApp ${!showEmailField ? '*' : ''}`}
                      required={!showEmailField}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  )}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mensagem (opcional)"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none focus:border-blue-500"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
