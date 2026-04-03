import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  DollarSign,
  Ruler,
  Search,
  ImagePlus,
  Star,
  ChevronDown,
  X,
  Plus,
  Globe,
  Video,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { generateSlug } from '@imovdigital/utils';
import { GoogleAddressInput } from '../components/GoogleAddressInput';
import type { AddressData } from '../components/GoogleAddressInput';
import { ImageUploader, type ImageFile } from '../components/ImageUploader';

// ─── Constants ───────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartamento' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'RURAL', label: 'Rural' },
] as const;

const LISTING_TYPES = [
  { value: 'SALE', label: 'Venda' },
  { value: 'RENT', label: 'Aluguel' },
  { value: 'BOTH', label: 'Venda e Aluguel' },
] as const;

const AMENITIES_OPTIONS = [
  // Cômodos
  'Sala',
  'Sala de Jantar',
  'Cozinha',
  'Varanda',
  'Varanda Gourmet',
  'Área de Serviço',
  'Closet',
  'Despensa',
  'Escritório',
  // Lazer
  'Piscina',
  'Academia',
  'Churrasqueira',
  'Espaço Gourmet',
  'Salão de Festas',
  'Playground',
  'Brinquedoteca',
  'Quadra Esportiva',
  'Sauna',
  'Home Theater',
  'Rooftop',
  'Pet Place',
  // Infraestrutura
  'Portaria 24h',
  'Elevador',
  'Ar-condicionado',
  'Jardim',
  'Lavanderia',
  'Coworking',
  'Bicicletário',
  'Vista para o Mar',
] as const;

const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
] as const;

const SECTIONS = [
  { id: 'basic', label: 'Dados Básicos', icon: Building2 },
  { id: 'location', label: 'Localização', icon: MapPin },
  { id: 'pricing', label: 'Valores', icon: DollarSign },
  { id: 'details', label: 'Detalhes', icon: Ruler },
  { id: 'amenities', label: 'Comodidades', icon: Star },
  { id: 'media', label: 'Mídia', icon: ImagePlus },
  { id: 'seo', label: 'SEO', icon: Globe },
] as const;

// ─── Helpers ─────────────────────────────────────────────────

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  const cents = parseInt(digits || '0', 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function parseCurrencyToCents(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

// ─── Components ──────────────────────────────────────────────

function SectionCard({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  );
}

function FieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}

function Input({
  label,
  required,
  hint,
  ...props
}: {
  label: string;
  required?: boolean;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <FieldLabel label={label} required={required} hint={hint} />
      <input
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
      />
    </div>
  );
}

function Select({
  label,
  required,
  options,
  hint,
  ...props
}: {
  label: string;
  required?: boolean;
  hint?: string;
  options: readonly { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      <div className="relative">
        <select
          {...props}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none pr-10"
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function Textarea({
  label,
  required,
  hint,
  rows = 4,
  ...props
}: {
  label: string;
  required?: boolean;
  hint?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      <textarea
        rows={rows}
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {label}
        </span>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

function CurrencyInput({
  label,
  required,
  hint,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: number;
  onChange: (cents: number) => void;
}) {
  const [display, setDisplay] = useState(value ? formatCurrency(String(value)) : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrency(raw);
    setDisplay(formatted);
    onChange(parseCurrencyToCents(raw));
  };

  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      <div className="relative">
        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder="R$ 0,00"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  rentPrice: number;
  condoFee: number;
  iptuYearly: number;
  area: string;
  usableArea: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parkingSpots: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  petFriendly: boolean;
  furnished: boolean;
  financingAvailable: boolean;
  featured: boolean;
  active: boolean;
  videoUrl: string;
  metaTitle: string;
  metaDescription: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  type: '',
  listingType: '',
  price: 0,
  rentPrice: 0,
  condoFee: 0,
  iptuYearly: 0,
  area: '',
  usableArea: '',
  bedrooms: '',
  suites: '',
  bathrooms: '',
  parkingSpots: '',
  floor: '',
  totalFloors: '',
  yearBuilt: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  fullAddress: '',
  latitude: null,
  longitude: null,
  amenities: [],
  petFriendly: false,
  furnished: false,
  financingAvailable: false,
  featured: false,
  active: true,
  videoUrl: '',
  metaTitle: '',
  metaDescription: '',
};

export function PropertyFormPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id: string }>();
  const isEditing = Boolean(propertyId);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; order: number; alt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [amenitySearch, setAmenitySearch] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState('');

  // Load property data when editing
  useEffect(() => {
    if (!propertyId) return;
    setLoadingProperty(true);
    api.get(`/properties/${propertyId}`)
      .then(({ data }) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || '',
          listingType: data.listingType || '',
          price: data.price || 0,
          rentPrice: data.rentPrice || 0,
          condoFee: data.condoFee || 0,
          iptuYearly: data.iptuYearly || 0,
          area: data.area ? String(data.area) : '',
          usableArea: data.usableArea ? String(data.usableArea) : '',
          bedrooms: data.bedrooms ? String(data.bedrooms) : '',
          suites: data.suites ? String(data.suites) : '',
          bathrooms: data.bathrooms ? String(data.bathrooms) : '',
          parkingSpots: data.parkingSpots ? String(data.parkingSpots) : '',
          floor: data.floor ? String(data.floor) : '',
          totalFloors: data.totalFloors ? String(data.totalFloors) : '',
          yearBuilt: data.yearBuilt ? String(data.yearBuilt) : '',
          street: data.fullAddress?.split(',')[0]?.trim() || '',
          number: '',
          complement: '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          fullAddress: data.fullAddress || '',
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          amenities: data.amenities || [],
          petFriendly: data.petFriendly || false,
          furnished: data.furnished || false,
          financingAvailable: data.financingAvailable || false,
          featured: data.featured || false,
          active: data.active ?? true,
          videoUrl: data.videoUrl || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
        });
        if (data.images && data.images.length > 0) {
          setExistingImages(data.images);
        }
      })
      .catch(() => {
        setError('Erro ao carregar imóvel.');
      })
      .finally(() => setLoadingProperty(false));
  }, [propertyId]);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    const trimmed = amenitySearch.trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      update('amenities', [...form.amenities, trimmed]);
      setAmenitySearch('');
    }
  };

  const handleAddressSelect = (data: AddressData) => {
    console.log(data, "DATA")
    setForm((prev) => ({
      ...prev,
      fullAddress: data.fullAddress,
      street: data.street || prev.street,
      number: data.number || prev.number,
      neighborhood: data.neighborhood || prev.neighborhood,
      city: data.city || prev.city,
      state: data.state || prev.state,
      zipCode: data.zipCode || prev.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
  };

  const hasEnoughDataForSeo = !!(form.title && form.type && form.neighborhood && form.city);

  const missingFieldsForSeo = [
    !form.title && 'Título',
    !form.type && 'Tipo do imóvel',
    !form.neighborhood && 'Bairro',
    !form.city && 'Cidade',
  ].filter(Boolean) as string[];

  const handleGenerateSeo = async () => {
    if (!hasEnoughDataForSeo) return;
    setSeoLoading(true);
    setSeoError('');

    try {
      const { data } = await api.post('/properties/generate-seo', {
        title: form.title,
        description: form.description,
        type: form.type,
        listingType: form.listingType,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        bedrooms: form.bedrooms,
        suites: form.suites,
        bathrooms: form.bathrooms,
        parkingSpots: form.parkingSpots,
        area: form.area,
        price: form.price,
        amenities: form.amenities,
      });
      update('metaTitle', data.metaTitle);
      update('metaDescription', data.metaDescription);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.[0] ||
        err?.response?.data?.message ||
        'Erro ao gerar SEO. Verifique se a chave da API está configurada.';
      setSeoError(typeof msg === 'string' ? msg : String(msg));
    } finally {
      setSeoLoading(false);
    }
  };

  const seoTitleLength = (form.metaTitle || form.title).length;
  const seoDescLength = (form.metaDescription || form.description).length;

  const filteredAmenities = AMENITIES_OPTIONS.filter(
    (a) =>
      a.toLowerCase().includes(amenitySearch.toLowerCase()) &&
      !form.amenities.includes(a),
  );

  const uploadImages = async (): Promise<{ url: string; order: number; alt: string }[]> => {
    const uploaded: { url: string; order: number; alt: string }[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const { data: presigned } = await api.post('/upload/presigned', {
          filename: img.file.name,
          contentType: img.file.type,
          folder: 'gallery',
        });

        if (presigned.uploadUrl) {
          await fetch(presigned.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': img.file.type },
            body: img.file,
          });
        }

        uploaded.push({
          url: presigned.publicUrl,
          order: i,
          alt: img.alt || img.file.name.replace(/\.[^.]+$/, ''),
        });
      } catch {
        // If a single image fails, continue with the rest
        console.error(`Failed to upload image: ${img.file.name}`);
      }
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload new images, keep existing ones
      const newUploaded = images.length > 0 ? await uploadImages() : [];
      const uploadedImages = [
        ...existingImages,
        ...newUploaded.map((img, i) => ({ ...img, order: existingImages.length + i })),
      ];

      const slug = generateSlug(form.title);
      const payload = {
        title: form.title,
        description: form.description,
        slug,
        type: form.type,
        listingType: form.listingType,
        price: form.price,
        rentPrice: form.rentPrice || undefined,
        condoFee: form.condoFee || undefined,
        iptuYearly: form.iptuYearly || undefined,
        area: parseFloat(form.area) || 0,
        usableArea: form.usableArea ? parseFloat(form.usableArea) : undefined,
        bedrooms: parseInt(form.bedrooms) || 0,
        suites: parseInt(form.suites) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        parkingSpots: parseInt(form.parkingSpots) || 0,
        floor: form.floor ? parseInt(form.floor) : undefined,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        fullAddress: [
          form.street,
          form.number,
          form.complement,
          form.neighborhood,
          form.city,
          form.state,
        ].filter(Boolean).join(', '),
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
        amenities: form.amenities,
        petFriendly: form.petFriendly,
        furnished: form.furnished,
        financingAvailable: form.financingAvailable,
        featured: form.featured,
        active: form.active,
        images: uploadedImages,
        videoUrl: form.videoUrl || undefined,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      };

      if (propertyId) {
        await api.patch(`/properties/${propertyId}`, payload);
      } else {
        await api.post('/properties', payload);
      }
      navigate('/dashboard/properties');
    } catch {
      setError('Erro ao salvar imóvel. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/properties')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing ? 'Atualize os dados do imóvel' : 'Preencha os dados para cadastrar um novo imóvel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            label="Ativo"
            checked={form.active}
            onChange={(v) => update('active', v)}
          />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-8">
          {/* Sidebar navigation */}
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden xl:block w-52 shrink-0"
          >
            <div className="sticky top-8 space-y-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </a>
              ))}
            </div>
          </motion.nav>

          {/* Form sections */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* ── Basic ── */}
            <SectionCard id="basic" title="Dados Básicos" icon={Building2}>
              <div className="space-y-5">
                <Input
                  label="Título do Anúncio"
                  required
                  hint="Aparece nos resultados de busca"
                  placeholder="Ex: Apartamento 3 quartos com vista para o mar - Copacabana"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />

                <Textarea
                  label="Descrição"
                  required
                  hint={`${form.description.length}/2000 caracteres`}
                  placeholder="Descreva os detalhes do imóvel: localização, diferenciais, acabamentos, proximidade de comércios e transporte..."
                  rows={6}
                  maxLength={2000}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Tipo do Imóvel"
                    required
                    options={PROPERTY_TYPES}
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                  />
                  <Select
                    label="Tipo de Anúncio"
                    required
                    options={LISTING_TYPES}
                    value={form.listingType}
                    onChange={(e) => update('listingType', e.target.value)}
                  />
                </div>

                <Toggle
                  label="Imóvel em Destaque"
                  description="Aparece em primeiro nos resultados e na página inicial do portal"
                  checked={form.featured}
                  onChange={(v) => update('featured', v)}
                />
              </div>
            </SectionCard>

            {/* ── Location ── */}
            <SectionCard id="location" title="Localização" icon={MapPin}>
              <div className="space-y-5">
                <GoogleAddressInput onSelect={handleAddressSelect} />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Rua"
                      required
                      placeholder="Ex: Rua das Flores"
                      value={form.street}
                      onChange={(e) => update('street', e.target.value)}
                    />
                  </div>
                  <Input
                    label="Número"
                    required
                    placeholder="123"
                    value={form.number}
                    onChange={(e) => update('number', e.target.value)}
                  />
                  <Input
                    label="Complemento"
                    placeholder="Apto 401, Bloco B"
                    value={form.complement}
                    onChange={(e) => update('complement', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Bairro"
                    required
                    hint="Filtro"
                    placeholder="Ex: Copacabana"
                    value={form.neighborhood}
                    onChange={(e) => update('neighborhood', e.target.value)}
                  />
                  <Input
                    label="Cidade"
                    required
                    placeholder="Ex: Rio de Janeiro"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                  <Select
                    label="Estado"
                    required
                    options={BRAZILIAN_STATES.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                  />
                  <Input
                    label="CEP"
                    required
                    placeholder="00000-000"
                    maxLength={9}
                    value={form.zipCode}
                    onChange={(e) => update('zipCode', e.target.value)}
                  />
                </div>

                {form.latitude && form.longitude && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">
                      Coordenadas capturadas: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── Pricing ── */}
            <SectionCard id="pricing" title="Valores" icon={DollarSign}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CurrencyInput
                    label="Preço de Venda"
                    required={form.listingType !== 'RENT'}
                    hint="Campo usado em filtros"
                    value={form.price}
                    onChange={(v) => update('price', v)}
                  />
                  {(form.listingType === 'RENT' || form.listingType === 'BOTH') && (
                    <CurrencyInput
                      label="Preço do Aluguel"
                      required
                      hint="Valor mensal"
                      value={form.rentPrice}
                      onChange={(v) => update('rentPrice', v)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CurrencyInput
                    label="Condomínio"
                    hint="Valor mensal (opcional)"
                    value={form.condoFee}
                    onChange={(v) => update('condoFee', v)}
                  />
                  <CurrencyInput
                    label="IPTU Anual"
                    hint="Valor anual (opcional)"
                    value={form.iptuYearly}
                    onChange={(v) => update('iptuYearly', v)}
                  />
                </div>

                <Toggle
                  label="Aceita Financiamento"
                  description="Indica que o imóvel pode ser financiado — usado como filtro no portal"
                  checked={form.financingAvailable}
                  onChange={(v) => update('financingAvailable', v)}
                />
              </div>
            </SectionCard>

            {/* ── Details ── */}
            <SectionCard id="details" title="Detalhes do Imóvel" icon={Ruler}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Área Total (m²)"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="120"
                    value={form.area}
                    onChange={(e) => update('area', e.target.value)}
                  />
                  <Input
                    label="Área Útil (m²)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="95"
                    value={form.usableArea}
                    onChange={(e) => update('usableArea', e.target.value)}
                  />
                  <Input
                    label="Quartos"
                    required
                    hint="Filtro"
                    type="number"
                    min="0"
                    placeholder="3"
                    value={form.bedrooms}
                    onChange={(e) => update('bedrooms', e.target.value)}
                  />
                  <Input
                    label="Suítes"
                    hint="Filtro"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={form.suites}
                    onChange={(e) => update('suites', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Banheiros"
                    required
                    type="number"
                    min="0"
                    placeholder="2"
                    value={form.bathrooms}
                    onChange={(e) => update('bathrooms', e.target.value)}
                  />
                  <Input
                    label="Vagas de Garagem"
                    required
                    type="number"
                    min="0"
                    placeholder="1"
                    value={form.parkingSpots}
                    onChange={(e) => update('parkingSpots', e.target.value)}
                  />
                  <Input
                    label="Andar"
                    type="number"
                    min="0"
                    placeholder="7"
                    value={form.floor}
                    onChange={(e) => update('floor', e.target.value)}
                  />
                  <Input
                    label="Total de Andares"
                    type="number"
                    min="0"
                    placeholder="20"
                    value={form.totalFloors}
                    onChange={(e) => update('totalFloors', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Ano de Construção"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="2020"
                    value={form.yearBuilt}
                    onChange={(e) => update('yearBuilt', e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                  <Toggle
                    label="Aceita Pet"
                    description="Campo usado como filtro no portal"
                    checked={form.petFriendly}
                    onChange={(v) => update('petFriendly', v)}
                  />
                  <Toggle
                    label="Mobiliado"
                    description="Campo usado como filtro no portal"
                    checked={form.furnished}
                    onChange={(v) => update('furnished', v)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Amenities ── */}
            <SectionCard id="amenities" title="Comodidades" icon={Star}>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar ou adicionar comodidade..."
                    value={amenitySearch}
                    onChange={(e) => setAmenitySearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                    className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                  {amenitySearch.trim() && (
                    <button
                      type="button"
                      onClick={addCustomAmenity}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar
                    </button>
                  )}
                </div>

                {/* Selected amenities */}
                {form.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium pl-3 pr-2 py-1.5 rounded-lg"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className="hover:bg-blue-100 rounded p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Available amenities grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className="text-left px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── Media ── */}
            <SectionCard id="media" title="Mídia" icon={ImagePlus}>
              <div className="space-y-5">
                {/* Existing images (from server) */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Imagens salvas ({existingImages.length})</p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, i) => (
                        <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              api.delete('/upload/file', { data: { url: img.url } }).catch(() => {});
                              setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {i === 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              Capa
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images to upload */}
                <ImageUploader images={images} onChange={setImages} />

                <div className="flex items-start gap-3 w-full">
                  <Video className="w-5 h-5 text-gray-400 mt-2.5 shrink-0" />
                  <Input
                    label="URL do Vídeo"
                    hint="YouTube ou Vimeo"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => update('videoUrl', e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── SEO ── */}
            <SectionCard id="seo" title="SEO — Otimização para o Google" icon={Globe}>
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Esses campos controlam como o imóvel aparece nos resultados de busca do Google.
                    Se deixados em branco, o título e a descrição do anúncio serão usados automaticamente.
                  </p>
                </div>

                {/* AI Generate */}
                {hasEnoughDataForSeo ? (
                  <motion.button
                    type="button"
                    onClick={handleGenerateSeo}
                    disabled={seoLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2.5 bg-linear-to-r from-violet-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
                  >
                    {seoLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Gerando com IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Gerar com IA
                      </>
                    )}
                  </motion.button>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          Preencha os dados para gerar SEO com IA
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Campos necessários: {missingFieldsForSeo.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {seoError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {seoError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google preview */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                    Prévia no Google
                  </p>
                  <div className="space-y-1">
                    <p className="text-blue-700 text-lg font-medium leading-snug truncate">
                      {form.metaTitle || form.title || 'Título do Imóvel'}
                    </p>
                    <p className="text-green-700 text-xs">
                      agencia.imovdigital.com.br/imovel/{generateSlug(form.title) || 'slug-do-imovel'}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {form.metaDescription ||
                        form.description ||
                        'Descrição do imóvel aparecerá aqui nos resultados de busca...'}
                    </p>
                  </div>
                </div>

                <Input
                  label="Meta Title"
                  hint={`${seoTitleLength}/60 caracteres`}
                  placeholder="Deixe vazio para usar o título do anúncio"
                  maxLength={60}
                  value={form.metaTitle}
                  onChange={(e) => update('metaTitle', e.target.value)}
                />

                <Textarea
                  label="Meta Description"
                  hint={`${seoDescLength}/160 caracteres`}
                  placeholder="Deixe vazio para usar a descrição do anúncio"
                  rows={3}
                  maxLength={160}
                  value={form.metaDescription}
                  onChange={(e) => update('metaDescription', e.target.value)}
                />

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Dicas de SEO
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Use a localização no título: "Apartamento 3 quartos em Copacabana"</li>
                    <li>Meta title ideal: entre 50 e 60 caracteres</li>
                    <li>Meta description ideal: entre 120 e 160 caracteres</li>
                    <li>Inclua tipo do imóvel, bairro e diferenciais na descrição</li>
                    <li>Imagens com boa resolução melhoram o ranking nas buscas</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* ── Submit ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between py-6 border-t border-gray-200"
            >
              <button
                type="button"
                onClick={() => navigate('/dashboard/properties')}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
