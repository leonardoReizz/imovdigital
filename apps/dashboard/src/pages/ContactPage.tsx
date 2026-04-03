import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { api } from '../lib/api';
import { PhoneInput } from '../components/PhoneInput';
import { GoogleAddressInput } from '../components/GoogleAddressInput';
import type { AddressData } from '../components/GoogleAddressInput';
import type { BusinessHours } from '@imovdigital/types';

const DAYS = [
  { key: 'mon', label: 'Segunda' },
  { key: 'tue', label: 'Terça' },
  { key: 'wed', label: 'Quarta' },
  { key: 'thu', label: 'Quinta' },
  { key: 'fri', label: 'Sexta' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
] as const;

const DEFAULT_HOURS: BusinessHours = {
  mon: '09:00-18:00',
  tue: '09:00-18:00',
  wed: '09:00-18:00',
  thu: '09:00-18:00',
  fri: '09:00-18:00',
  sat: '09:00-13:00',
  sun: '',
};

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

interface FormState {
  whatsapp: string;
  whatsappMessage: string;
  phone: string;
  email: string;
  showForm: boolean;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  businessHours: BusinessHours;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
}

const INITIAL: FormState = {
  whatsapp: '',
  whatsappMessage: '',
  phone: '',
  email: '',
  showForm: true,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  businessHours: DEFAULT_HOURS,
  instagram: '',
  facebook: '',
  youtube: '',
  linkedin: '',
  tiktok: '',
};

// ─── Reusable inputs ─────────────────────────────────────────

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateHour = (day: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      businessHours: { ...prev.businessHours, [day]: value },
    }));
  };

  useEffect(() => {
    api.get('/contact')
      .then(({ data }) => {
        if (data) {
          setForm({
            whatsapp: data.whatsapp || '',
            whatsappMessage: data.whatsappMessage || '',
            phone: data.phone || '',
            email: data.email || '',
            showForm: data.showForm ?? true,
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            businessHours: data.businessHours || DEFAULT_HOURS,
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            youtube: data.youtube || '',
            linkedin: data.linkedin || '',
            tiktok: data.tiktok || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/contact', {
        whatsapp: form.whatsapp || null,
        whatsappMessage: form.whatsappMessage || null,
        phone: form.phone || null,
        email: form.email || null,
        showForm: form.showForm,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
        latitude: form.latitude,
        longitude: form.longitude,
        businessHours: form.businessHours,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        youtube: form.youtube || null,
        linkedin: form.linkedin || null,
        tiktok: form.tiktok || null,
      });
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contato</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure os canais de contato exibidos no site da sua imobiliária
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </button>
      </div>

      {/* Feedback */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
          <Check className="w-4 h-4" />
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* WhatsApp & Phone */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp e Telefone
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <Field label="WhatsApp" icon={MessageCircle}>
              <PhoneInput value={form.whatsapp} onChange={(v) => update('whatsapp', v)} placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
            </Field>
            <Field label="Telefone fixo" icon={Phone}>
              <PhoneInput value={form.phone} onChange={(v) => update('phone', v)} placeholder="(11) 3333-3333" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Mensagem padrão do WhatsApp">
              <textarea
                value={form.whatsappMessage}
                onChange={(e) => update('whatsappMessage', e.target.value)}
                placeholder="Olá! Gostaria de mais informações sobre os imóveis..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                Essa mensagem será pré-preenchida quando o visitante clicar no botão de WhatsApp
              </p>
            </Field>
          </div>
        </motion.div>

        {/* Email & Form */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            E-mail e Formulário
          </h3>
          <div className="space-y-4">
            <Field label="E-mail de contato" icon={Mail}>
              <Input value={form.email} onChange={(v) => update('email', v)} placeholder="contato@suaimobiliaria.com.br" type="email" />
              <p className="text-xs text-gray-400 mt-1">
                Os leads enviados pelo formulário serão encaminhados para este e-mail
              </p>
            </Field>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Exibir formulário de contato no site</p>
                <p className="text-xs text-gray-400">Formulário de "Agende uma visita" nas páginas dos imóveis</p>
              </div>
              <button
                type="button"
                onClick={() => update('showForm', !form.showForm)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.showForm ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.showForm ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Endereço da Imobiliária
          </h3>
          <div className="space-y-4">
            <GoogleAddressInput
              onSelect={(addr: AddressData) => {
                update('address', addr.fullAddress);
                update('city', addr.city);
                update('state', addr.state);
                update('zipCode', addr.zipCode);
                update('latitude', addr.latitude);
                update('longitude', addr.longitude);
              }}
            />

            <Field label="Endereço completo">
              <Input value={form.address} onChange={(v) => update('address', v)} placeholder="Rua Exemplo, 123 - Sala 1" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cidade">
                <Input value={form.city} onChange={(v) => update('city', v)} placeholder="São Paulo" />
              </Field>
              <Field label="Estado">
                <select
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">UF</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="CEP">
                <Input value={form.zipCode} onChange={(v) => update('zipCode', v)} placeholder="00000-000" />
              </Field>
            </div>
          </div>
        </motion.div>

        {/* Business Hours */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Horário de Atendimento
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Formato: 09:00-18:00. Deixe em branco para dias sem atendimento.
          </p>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
                <input
                  type="text"
                  value={form.businessHours[key as keyof BusinessHours]}
                  onChange={(e) => updateHour(key, e.target.value)}
                  placeholder="Fechado"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                {form.businessHours[key as keyof BusinessHours] ? (
                  <span className="text-xs text-green-600 w-16 text-right">Aberto</span>
                ) : (
                  <span className="text-xs text-gray-400 w-16 text-right">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-500" />
            Redes Sociais
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Cole a URL completa do perfil da sua imobiliária em cada rede
          </p>
          <div className="space-y-4">
            <Field label="Instagram" icon={Instagram}>
              <Input value={form.instagram} onChange={(v) => update('instagram', v)} placeholder="https://instagram.com/suaimobiliaria" />
            </Field>
            <Field label="Facebook" icon={Facebook}>
              <Input value={form.facebook} onChange={(v) => update('facebook', v)} placeholder="https://facebook.com/suaimobiliaria" />
            </Field>
            <Field label="YouTube" icon={Youtube}>
              <Input value={form.youtube} onChange={(v) => update('youtube', v)} placeholder="https://youtube.com/@suaimobiliaria" />
            </Field>
            <Field label="LinkedIn" icon={Linkedin}>
              <Input value={form.linkedin} onChange={(v) => update('linkedin', v)} placeholder="https://linkedin.com/company/suaimobiliaria" />
            </Field>
            <Field label="TikTok">
              <Input value={form.tiktok} onChange={(v) => update('tiktok', v)} placeholder="https://tiktok.com/@suaimobiliaria" />
            </Field>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
