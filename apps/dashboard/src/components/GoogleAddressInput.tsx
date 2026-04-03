import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export interface AddressData {
  fullAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
}

interface GoogleAddressInputProps {
  onSelect: (address: AddressData) => void;
}

let googleScriptLoaded = false;
let googleScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleScriptLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    loadCallbacks.push(resolve);

    if (googleScriptLoading) return;
    googleScriptLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

function extractComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string {
  return components.find((c) => c.types.includes(type))?.long_name || '';
}

function extractState(
  components: google.maps.GeocoderAddressComponent[],
): string {
  return (
    components.find((c) => c.types.includes('administrative_area_level_1'))
      ?.short_name || ''
  );
}

export function GoogleAddressInput({ onSelect }: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(googleScriptLoaded);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Keep callback ref always up to date
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!apiKey) {
      setReady(true);
      return;
    }
    loadGoogleMapsScript(apiKey).then(() => setReady(true));
  }, [apiKey]);

  useEffect(() => {
    if (!ready || !inputRef.current || !apiKey || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'br' },
      fields: ['address_components', 'formatted_address', 'geometry'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place?.address_components) return;

      const components = place.address_components;
      const location = place.geometry?.location;

      const data: AddressData = {
        fullAddress: place.formatted_address || '',
        street: extractComponent(components, 'route'),
        number: extractComponent(components, 'street_number'),
        neighborhood:
          extractComponent(components, 'sublocality_level_1') ||
          extractComponent(components, 'sublocality') ||
          extractComponent(components, 'neighborhood'),
        city:
          extractComponent(components, 'administrative_area_level_2') ||
          extractComponent(components, 'locality'),
        state: extractState(components),
        zipCode: extractComponent(components, 'postal_code'),
        latitude: location ? location.lat() : null,
        longitude: location ? location.lng() : null,
      };

      onSelectRef.current(data);
    });

    autocompleteRef.current = autocomplete;
  }, [ready, apiKey]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Buscar Endereço
        </label>
        {!ready && apiKey && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Carregando...
          </span>
        )}
        {!apiKey && (
          <span className="text-xs text-amber-500">
            Chave do Google Maps não configurada
          </span>
        )}
      </div>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite o endereço e selecione uma sugestão..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        {apiKey
          ? 'Selecione uma sugestão para preencher os campos abaixo automaticamente'
          : 'Adicione VITE_GOOGLE_MAPS_API_KEY no .env para ativar o autocomplete'}
      </p>
    </div>
  );
}
