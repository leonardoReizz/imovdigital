import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  Building2,
  Layers,
  PawPrint,
  Sofa,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import { formatPrice } from '@imovdigital/utils';
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '../lib/constants';

interface Property {
  id: string;
  title: string;
  description: string;
  slug: string;
  type: string;
  listingType: string;
  price: number;
  rentPrice: number | null;
  condoFee: number | null;
  iptuYearly: number | null;
  area: number;
  usableArea: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  neighborhood: string;
  city: string;
  state: string;
  fullAddress: string;
  amenities: string[];
  petFriendly: boolean;
  furnished: boolean;
  financingAvailable: boolean;
  images: { url: string; order: number; alt: string }[];
  featured: boolean;
  createdAt: string;
}

export function PropertyPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .get(`/public/${TENANT_SLUG}/properties/${slug}`)
      .then(({ data }) => setProperty(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(`/public/${TENANT_SLUG}/leads`, {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage || `Tenho interesse no imóvel: ${property?.title}`,
        propertyId: property?.id,
        source: 'FORM',
      });
      setSent(true);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Imóvel não encontrado</h1>
          <p className="text-gray-500 mt-2">Esse imóvel pode ter sido removido ou o link está incorreto.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-medium mt-6 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : [];
  const hasImages = images.length > 0;

  const details = [
    { icon: Bed, label: 'Quartos', value: property.bedrooms, show: property.bedrooms > 0 },
    { icon: Bed, label: 'Suítes', value: property.suites, show: property.suites > 0 },
    { icon: Bath, label: 'Banheiros', value: property.bathrooms, show: property.bathrooms > 0 },
    { icon: Car, label: 'Vagas', value: property.parkingSpots, show: property.parkingSpots > 0 },
    { icon: Maximize2, label: 'Área total', value: `${property.area}m²`, show: true },
    { icon: Maximize2, label: 'Área útil', value: `${property.usableArea}m²`, show: !!property.usableArea },
    { icon: Layers, label: 'Andar', value: `${property.floor}º de ${property.totalFloors}`, show: !!property.floor },
    { icon: Calendar, label: 'Ano', value: property.yearBuilt, show: !!property.yearBuilt },
  ].filter((d) => d.show);

  const tags = [
    { icon: PawPrint, label: 'Aceita pet', active: property.petFriendly },
    { icon: Sofa, label: 'Mobiliado', active: property.furnished },
    { icon: Landmark, label: 'Aceita financiamento', active: property.financingAvailable },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
          <span>/</span>
          <Link to="/?type=" className="hover:text-blue-600 transition-colors">Imóveis</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Gallery */}
        {hasImages ? (
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[2/1] sm:aspect-[2.5/1]">
            <img
              src={images[currentImage].url}
              alt={images[currentImage].alt || property.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentImage ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 aspect-[2.5/1] flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + badges */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {LISTING_TYPE_LABELS[property.listingType]}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {PROPERTY_TYPE_LABELS[property.type]}
                </span>
                {property.featured && (
                  <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-600" /> Destaque
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.fullAddress}</span>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-4">
                {property.listingType === 'RENT' ? (
                  <>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(property.rentPrice || property.price)}
                    </span>
                    <span className="text-gray-500">/mês</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                )}
              </div>
              {property.listingType === 'BOTH' && property.rentPrice && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  Aluguel: {formatPrice(property.rentPrice)}/mês
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {property.condoFee && <span>Condomínio: {formatPrice(property.condoFee)}</span>}
                {property.iptuYearly && <span>IPTU: {formatPrice(property.iptuYearly)}/ano</span>}
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {details.map((d) => (
                  <div key={d.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <d.icon className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{d.value}</p>
                      <p className="text-xs text-gray-500">{d.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                      tag.active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-400 line-through'
                    }`}
                  >
                    <tag.icon className="w-3.5 h-3.5" />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Contact form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Agende uma visita
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Preencha o formulário e entraremos em contato
                </p>

                {sent ? (
                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-800">Mensagem enviada!</p>
                    <p className="text-sm text-green-600 mt-1">Entraremos em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none"
                    />
                    <textarea
                      placeholder="Mensagem (opcional)"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {sending ? 'Enviando...' : 'Enviar mensagem'}
                    </button>
                  </form>
                )}
              </div>

              {/* WhatsApp CTA */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-green-700 transition-colors w-full"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                Chamar no WhatsApp
              </a>

              {/* Phone */}
              <a
                href="tel:+5511999999999"
                className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-gray-800 transition-colors w-full"
              >
                <Phone className="w-5 h-5" />
                Ligar agora
              </a>

              {/* Share + Favorite */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4" />
                  Favoritar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
