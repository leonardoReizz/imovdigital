'use client';

import { useState, type FormEvent } from 'react';
import type { PropertyContactFormElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks, useIsEditMode } from '../context';

export function PropertyContactFormBlock({ element }: { element: PropertyContactFormElement }) {
  const { property, theme, tenantSlug } = useBlocks();
  const isEdit = useIsEditMode();

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isEdit || !tenantSlug) return;
    setStatus('sending');
    try {
      const apiUrl = typeof window !== 'undefined' && 'NEXT_PUBLIC_API_URL' in (window as unknown as Record<string, unknown>)
        ? String((window as unknown as Record<string, unknown>).NEXT_PUBLIC_API_URL)
        : '/api';
      await fetch(`${apiUrl}/public/${tenantSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message || `Tenho interesse no imóvel: ${property?.title ?? ''}`,
          propertyId: property?.id,
          source: 'FORM',
        }),
      });
      setStatus('ok');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '0 12px',
    border: '1px solid #e2e8f0',
    borderRadius: theme.borderRadius,
    fontSize: 14,
    fontFamily: 'inherit',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: theme.borderRadius,
        ...elementStyleToCss(element.style),
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>
        {element.title}
      </h3>
      <input
        type="text"
        required
        placeholder="Seu nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={inputStyle}
      />
      {element.showPhoneField && (
        <input
          type="tel"
          placeholder="Telefone / WhatsApp"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={inputStyle}
        />
      )}
      {element.showEmailField && (
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />
      )}
      <textarea
        placeholder={element.messagePlaceholder}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={3}
        style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }}
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          height: 44,
          background: theme.primaryColor,
          color: '#fff',
          border: 'none',
          borderRadius: theme.borderRadius,
          fontWeight: 600,
          cursor: 'pointer',
          opacity: status === 'sending' ? 0.6 : 1,
        }}
      >
        {status === 'sending' ? 'Enviando…' : element.submitLabel}
      </button>
      {status === 'ok' && (
        <p style={{ color: '#059669', fontSize: 13, margin: 0 }}>
          Mensagem enviada! Um corretor entrará em contato em breve.
        </p>
      )}
      {status === 'error' && (
        <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
          Erro ao enviar. Tente novamente em instantes.
        </p>
      )}
    </form>
  );
}
