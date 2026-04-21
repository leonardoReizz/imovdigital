import type { Element, ElementType } from '@imovdigital/types';

/**
 * Default element factory. `isFreeLayout` decides whether the element
 * gets an initial absolute position (for sections in "free" layout).
 */
export function buildDefaultElement(
  type: ElementType,
  id: string,
  isFreeLayout: boolean,
): Element {
  const basePosition = isFreeLayout ? { position: { x: 24, y: 24 } } : {};

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        content: 'Texto novo',
        tag: 'p',
        style: { fontSize: 16, color: '#0f172a' },
        ...basePosition,
        size: isFreeLayout ? { w: 320, h: 'auto' } : undefined,
      };
    case 'image':
      return {
        id,
        type: 'image',
        src: null,
        alt: '',
        objectFit: 'cover',
        style: { borderRadius: 8 },
        ...basePosition,
        size: isFreeLayout ? { w: 320, h: 200 } : { w: 'full', h: 'auto' },
      };
    case 'button':
      return {
        id,
        type: 'button',
        label: 'Clique aqui',
        url: '#',
        variant: 'primary',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 'auto', h: 'auto' } : undefined,
      };
    case 'container':
      return {
        id,
        type: 'container',
        layout: 'stack',
        children: [],
        style: { paddingTop: 16, paddingBottom: 16, paddingX: 16 },
        ...basePosition,
        size: isFreeLayout ? { w: 400, h: 200 } : { w: 'full', h: 'auto' },
      };
    case 'listings':
      return {
        id,
        type: 'listings',
        source: 'featured',
        count: 6,
        display: 'grid',
        columns: 3,
        cardTemplate: 'standard',
        sortBy: 'recent',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 'full', h: 'auto' } : undefined,
      };
    case 'search':
      return {
        id,
        type: 'search',
        fields: ['type', 'city', 'priceRange', 'bedrooms', 'bathrooms'],
        layout: 'row',
        submitMode: 'redirect',
        submitLabel: 'Buscar',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 'full', h: 'auto' } : undefined,
      };
    case 'form':
      return {
        id,
        type: 'form',
        fields: [
          { id: crypto.randomUUID(), type: 'text', label: 'Nome', required: true },
          { id: crypto.randomUUID(), type: 'phone', label: 'Telefone', required: true },
          { id: crypto.randomUUID(), type: 'email', label: 'E-mail', required: false },
          { id: crypto.randomUUID(), type: 'textarea', label: 'Mensagem', required: false },
        ],
        submitLabel: 'Enviar',
        destination: 'whatsapp',
        successMessage: 'Obrigado! Retornaremos em breve.',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 400, h: 'auto' } : undefined,
      };
    case 'divider':
      return {
        id,
        type: 'divider',
        thickness: 1,
        color: '#e2e8f0',
        lineStyle: 'solid',
        style: {},
        ...basePosition,
        size: { w: 'full', h: 'auto' },
      };
    case 'spacer':
      return {
        id,
        type: 'spacer',
        height: 48,
        style: {},
        ...basePosition,
      };
    case 'video':
      return {
        id,
        type: 'video',
        src: '',
        provider: 'youtube',
        controls: true,
        style: { borderRadius: 8 },
        ...basePosition,
        size: isFreeLayout ? { w: 480, h: 270 } : { w: 'full', h: 360 },
      };
    case 'map':
      return {
        id,
        type: 'map',
        latitude: -23.5505,
        longitude: -46.6333,
        zoom: 14,
        style: { borderRadius: 8 },
        ...basePosition,
        size: isFreeLayout ? { w: 480, h: 320 } : { w: 'full', h: 360 },
      };
    case 'property_gallery':
      return {
        id,
        type: 'property_gallery',
        layout: 'grid',
        columns: 2,
        aspectRatio: '4:3',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 'full', h: 'auto' } : undefined,
      };
    case 'property_map':
      return {
        id,
        type: 'property_map',
        zoom: 15,
        approximateOnly: true,
        style: { borderRadius: 8 },
        ...basePosition,
        size: isFreeLayout ? { w: 'full', h: 320 } : { w: 'full', h: 320 },
      };
    case 'property_contact_form':
      return {
        id,
        type: 'property_contact_form',
        title: 'Interessado neste imóvel?',
        submitLabel: 'Enviar mensagem',
        showPhoneField: true,
        showEmailField: true,
        messagePlaceholder: 'Mensagem (opcional)',
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 380, h: 'auto' } : undefined,
      };
    case 'property_tags':
      return {
        id,
        type: 'property_tags',
        layout: 'chips',
        columns: 2,
        showIcons: true,
        style: {},
        ...basePosition,
      };
    case 'property_prices':
      return {
        id,
        type: 'property_prices',
        title: 'Valores',
        showCondo: true,
        showIptu: true,
        showTotal: true,
        style: {},
        ...basePosition,
        size: isFreeLayout ? { w: 320, h: 'auto' } : undefined,
      };
    case 'property_specs':
      return {
        id,
        type: 'property_specs',
        layout: 'row',
        items: ['area', 'bedrooms', 'bathrooms', 'parkingSpots'],
        style: {},
        ...basePosition,
      };
  }
}
