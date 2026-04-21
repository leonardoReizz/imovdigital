// Default page templates seeded for every tenant. The slugs below are
// **reserved** — the API blocks deleting or renaming them.
//
// `home`     → landing page (/)
// `property` → chrome of the /imoveis/:slug page (header/footer/extras)
// `search`   → chrome of the /imoveis page

import type {
  ButtonElement,
  ContainerElement,
  DividerElement,
  ImageElement,
  ListingsElement,
  Page,
  PageData,
  PropertyContactFormElement,
  PropertyGalleryElement,
  PropertyMapElement,
  PropertyPricesElement,
  PropertySpecsElement,
  PropertyTagsElement,
  SearchElement,
  Section,
  TextElement,
  ThemeTokens,
} from './page';

export const RESERVED_SLUGS = ['home', 'property', 'search'] as const;
export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

export const RESERVED_TITLES: Record<ReservedSlug, string> = {
  home: 'Home',
  property: 'Detalhe do Imóvel',
  search: 'Busca de Imóveis',
};

export const RESERVED_DESCRIPTIONS: Record<ReservedSlug, string> = {
  home: 'Página inicial do site da imobiliária.',
  property: 'Layout usado para cada página de imóvel (/imoveis/:slug).',
  search: 'Layout usado na página de busca e listagem (/imoveis).',
};

export function isReservedSlug(slug: string): slug is ReservedSlug {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

function id(): string {
  return crypto.randomUUID();
}

/* ─── Home template ──────────────────────────────────────────── */

function buildHomeSections(theme: ThemeTokens): Section[] {
  const hero: Section = {
    id: id(),
    type: 'hero',
    layout: 'free',
    style: {
      minHeight: 600,
      paddingTop: 120,
      paddingBottom: 120,
      paddingX: 32,
      backgroundColor: '#0f172a',
      backgroundOverlay: { color: '#000000', opacity: 0.3 },
    },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'Seu novo lar começa aqui',
        tag: 'h1',
        style: { fontSize: 52, fontWeight: 700, color: '#ffffff', textAlign: 'center' },
        position: { x: 120, y: 120 },
        size: { w: 1000, h: 'auto' },
      } as TextElement,
      {
        id: id(),
        type: 'text',
        content: 'Os melhores imóveis da região selecionados para você.',
        tag: 'p',
        style: { fontSize: 20, color: '#e2e8f0', textAlign: 'center' },
        position: { x: 200, y: 210 },
        size: { w: 840, h: 'auto' },
      } as TextElement,
      {
        id: id(),
        type: 'search',
        fields: ['operation', 'type', 'city', 'priceRange'],
        layout: 'row',
        submitMode: 'redirect',
        submitLabel: 'Buscar',
        style: {},
        position: { x: 120, y: 320 },
        size: { w: 1000, h: 'auto' },
      } as SearchElement,
    ],
  };

  const featured: Section = {
    id: id(),
    type: 'listings',
    layout: 'stack',
    style: { paddingTop: 80, paddingBottom: 80, paddingX: 32, maxWidth: 1280 },
    gridConfig: { cols: 1, gap: 32 },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'Imóveis em destaque',
        tag: 'h2',
        style: { fontSize: 32, fontWeight: 700, color: '#0f172a', textAlign: 'center' },
      } as TextElement,
      {
        id: id(),
        type: 'text',
        content: 'Uma seleção cuidadosa das melhores oportunidades do momento.',
        tag: 'p',
        style: { fontSize: 16, color: '#64748b', textAlign: 'center' },
      } as TextElement,
      {
        id: id(),
        type: 'listings',
        source: 'featured',
        count: 6,
        display: 'grid',
        columns: 3,
        cardTemplate: 'standard',
        sortBy: 'recent',
        style: {},
      } as ListingsElement,
    ],
  };

  const about: Section = {
    id: id(),
    type: 'features',
    layout: 'grid',
    gridConfig: { cols: 2, gap: 48 },
    style: { paddingTop: 80, paddingBottom: 80, paddingX: 32, maxWidth: 1280, backgroundColor: '#f8fafc' },
    children: [
      {
        id: id(),
        type: 'container',
        layout: 'stack',
        gridConfig: { cols: 1, gap: 16 },
        children: [
          {
            id: id(),
            type: 'text',
            content: 'Sobre a nossa imobiliária',
            tag: 'h2',
            style: { fontSize: 28, fontWeight: 700, color: '#0f172a' },
          } as TextElement,
          {
            id: id(),
            type: 'text',
            content:
              'Somos especialistas no mercado local com anos de experiência ajudando famílias a encontrarem o lar ideal e investidores a fazerem os melhores negócios.',
            tag: 'p',
            style: { fontSize: 16, color: '#475569', lineHeight: 1.6 },
          } as TextElement,
          {
            id: id(),
            type: 'button',
            label: 'Conheça a equipe',
            url: '/sobre',
            variant: 'primary',
            style: {},
          } as ButtonElement,
        ],
        style: {},
      } as ContainerElement,
      {
        id: id(),
        type: 'image',
        src: null,
        alt: 'Sobre a imobiliária',
        objectFit: 'cover',
        style: { borderRadius: theme.borderRadius },
        size: { w: 'full', h: 360 },
      } as ImageElement,
    ],
  };

  const cta: Section = {
    id: id(),
    type: 'cta',
    layout: 'free',
    style: {
      minHeight: 320,
      paddingTop: 80,
      paddingBottom: 80,
      paddingX: 32,
      backgroundColor: theme.primaryColor,
    },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'Pronto para encontrar seu próximo imóvel?',
        tag: 'h2',
        style: { fontSize: 32, fontWeight: 700, color: '#ffffff', textAlign: 'center' },
        position: { x: 120, y: 80 },
        size: { w: 1000, h: 'auto' },
      } as TextElement,
      {
        id: id(),
        type: 'button',
        label: 'Fale com um corretor',
        url: 'https://wa.me/',
        variant: 'outline',
        openInNewTab: true,
        style: { color: '#ffffff', borderColor: '#ffffff', borderWidth: 1 },
        position: { x: 500, y: 180 },
        size: { w: 'auto', h: 'auto' },
      } as ButtonElement,
    ],
  };

  const footer: Section = {
    id: id(),
    type: 'footer',
    layout: 'stack',
    gridConfig: { cols: 1, gap: 16 },
    style: {
      paddingTop: 48,
      paddingBottom: 24,
      paddingX: 32,
      backgroundColor: '#0f172a',
      maxWidth: 'full',
    },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'CRECI 00000-J',
        tag: 'p',
        style: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
      } as TextElement,
      {
        id: id(),
        type: 'text',
        content: `© ${new Date().getFullYear()} Todos os direitos reservados.`,
        tag: 'p',
        style: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
      } as TextElement,
    ],
  };

  return [buildNavbar(), hero, featured, about, cta, footer];
}

/* ─── Property template (full detail page) ───────────────────── */

function buildPropertySections(theme: ThemeTokens): Section[] {
  // Gallery up top, full-width
  const galleryBar: Section = {
    id: id(),
    type: 'hero',
    layout: 'stack',
    style: { paddingTop: 24, paddingBottom: 16, paddingX: 32, maxWidth: 1280 },
    gridConfig: { cols: 1, gap: 0 },
    children: [
      {
        id: id(),
        type: 'property_gallery',
        layout: 'grid',
        columns: 3,
        aspectRatio: '4:3',
        style: {},
        size: { w: 'full', h: 'auto' },
      } as PropertyGalleryElement,
    ],
  };

  // Two-column layout: main content + sidebar with prices + contact
  const details: Section = {
    id: id(),
    type: 'features',
    layout: 'grid',
    gridConfig: { cols: 3, gap: 32 },
    style: { paddingTop: 16, paddingBottom: 48, paddingX: 32, maxWidth: 1280 },
    children: [
      {
        // Left: takes 2 columns — title, address, specs, description, tags, map
        id: id(),
        type: 'container',
        layout: 'stack',
        gridConfig: { cols: 1, gap: 20 },
        style: { paddingTop: 0 },
        size: { w: 'full', h: 'auto' },
        children: [
          {
            id: id(),
            type: 'text',
            content: 'Título do imóvel',
            binding: 'title',
            tag: 'h1',
            style: { fontSize: 28, fontWeight: 700, color: '#0f172a' },
          } as TextElement,
          {
            id: id(),
            type: 'text',
            content: 'Bairro, Cidade',
            binding: 'fullAddress',
            tag: 'p',
            style: { fontSize: 14, color: '#64748b' },
          } as TextElement,
          {
            id: id(),
            type: 'property_specs',
            layout: 'row',
            items: ['area', 'bedrooms', 'bathrooms', 'parkingSpots'],
            style: {},
          } as PropertySpecsElement,
          {
            id: id(),
            type: 'text',
            content: 'Descrição',
            tag: 'h2',
            style: { fontSize: 18, fontWeight: 600, color: '#0f172a', paddingTop: 8 },
          } as TextElement,
          {
            id: id(),
            type: 'text',
            content: 'Descrição do imóvel',
            binding: 'description',
            tag: 'p',
            style: { fontSize: 15, color: '#334155', lineHeight: 1.6 },
          } as TextElement,
          {
            id: id(),
            type: 'text',
            content: 'Características',
            tag: 'h2',
            style: { fontSize: 18, fontWeight: 600, color: '#0f172a', paddingTop: 8 },
          } as TextElement,
          {
            id: id(),
            type: 'property_tags',
            layout: 'grid',
            columns: 2,
            showIcons: true,
            style: {},
          } as PropertyTagsElement,
          {
            id: id(),
            type: 'text',
            content: 'Localização',
            tag: 'h2',
            style: { fontSize: 18, fontWeight: 600, color: '#0f172a', paddingTop: 8 },
          } as TextElement,
          {
            id: id(),
            type: 'property_map',
            zoom: 15,
            approximateOnly: true,
            style: { borderRadius: theme.borderRadius },
            size: { w: 'full', h: 320 },
          } as PropertyMapElement,
        ],
      } as ContainerElement,
      {
        // Right: 1 column sidebar — prices + contact form
        id: id(),
        type: 'container',
        layout: 'stack',
        gridConfig: { cols: 1, gap: 16 },
        style: { paddingTop: 0 },
        size: { w: 'full', h: 'auto' },
        children: [
          {
            id: id(),
            type: 'property_prices',
            title: 'Valores',
            showCondo: true,
            showIptu: true,
            showTotal: true,
            style: {},
          } as PropertyPricesElement,
          {
            id: id(),
            type: 'property_contact_form',
            title: 'Interessado neste imóvel?',
            submitLabel: 'Enviar mensagem',
            showPhoneField: true,
            showEmailField: true,
            messagePlaceholder: 'Mensagem (opcional)',
            style: {},
          } as PropertyContactFormElement,
        ],
      } as ContainerElement,
    ],
  };

  const similar: Section = {
    id: id(),
    type: 'listings',
    layout: 'stack',
    gridConfig: { cols: 1, gap: 24 },
    style: { paddingTop: 48, paddingBottom: 48, paddingX: 32, maxWidth: 1280, backgroundColor: '#f8fafc' },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'Imóveis semelhantes',
        tag: 'h2',
        style: { fontSize: 22, fontWeight: 700, color: '#0f172a' },
      } as TextElement,
      {
        id: id(),
        type: 'listings',
        source: 'featured',
        count: 3,
        display: 'grid',
        columns: 3,
        cardTemplate: 'compact',
        sortBy: 'recent',
        style: {},
      } as ListingsElement,
    ],
  };

  const footer: Section = buildFooter();

  return [buildNavbar(), galleryBar, details, similar, footer];
}

/* ─── Search template (chrome + search bar) ──────────────────── */

function buildSearchSections(_theme: ThemeTokens): Section[] {
  const results: Section = {
    id: id(),
    type: 'listings',
    layout: 'grid',
    gridConfig: { cols: 4, gap: 32 },
    style: { paddingTop: 48, paddingBottom: 64, paddingX: 32, maxWidth: 1280 },
    children: [
      {
        id: id(),
        type: 'search',
        fields: ['operation', 'type', 'city', 'neighborhood', 'priceRange', 'bedrooms', 'parking', 'areaRange'],
        layout: 'sidebar',
        submitMode: 'redirect',
        submitLabel: 'Aplicar filtros',
        gridSpan: 1,
        style: {},
      } as SearchElement,
      {
        id: id(),
        type: 'listings',
        source: 'featured',
        count: 9,
        display: 'grid',
        columns: 3,
        cardTemplate: 'standard',
        sortBy: 'recent',
        gridSpan: 3,
        showLoadMore: true,
        style: {},
      } as ListingsElement,
    ],
  };

  const footer: Section = buildFooter();

  return [buildNavbar(), results, footer];
}

/* ─── Shared navbar ──────────────────────────────────────────── */
//
// The navbar is shared across every reserved page (home / property /
// search). When the user edits it on any one of them, the backend
// propagates the change to the others so the site's chrome stays
// consistent. The template below is the starting point for new tenants.

function buildNavbar(): Section {
  return {
    id: id(),
    type: 'navbar',
    layout: 'stack',
    style: {
      paddingTop: 14,
      paddingBottom: 14,
      paddingX: 32,
      maxWidth: 'full',
      backgroundColor: '#ffffff',
    },
    gridConfig: {
      cols: 1,
      gap: 16,
      direction: 'row',
      justifyContent: 'between',
      alignItems: 'center',
    },
    children: [
      {
        id: id(),
        type: 'text',
        content: 'Minha Imobiliária',
        tag: 'h3',
        style: { fontSize: 18, fontWeight: 700, color: '#0f172a' },
      } as TextElement,
      {
        id: id(),
        type: 'container',
        layout: 'stack',
        gridConfig: { cols: 1, gap: 8, direction: 'row', alignItems: 'center' },
        style: {},
        children: [
          {
            id: id(),
            type: 'button',
            label: 'Início',
            url: '/',
            variant: 'ghost',
            style: {},
          } as ButtonElement,
          {
            id: id(),
            type: 'button',
            label: 'Imóveis',
            url: '/imoveis',
            variant: 'ghost',
            style: {},
          } as ButtonElement,
          {
            id: id(),
            type: 'button',
            label: 'Contato',
            url: '#contato',
            variant: 'primary',
            style: {},
          } as ButtonElement,
        ],
      } as ContainerElement,
    ],
  };
}

/* ─── Shared footer ──────────────────────────────────────────── */
//
// Shared across every reserved page, same sync rule as the navbar —
// edit it on any one of home/property/search and the change
// propagates to the others.

function buildFooter(): Section {
  const year = new Date().getFullYear();
  const linkStyle = { color: '#cbd5e1', fontSize: 14, textAlign: 'left' as const };
  const headingStyle = { fontSize: 13, fontWeight: 600, color: '#ffffff' };
  return {
    id: id(),
    type: 'footer',
    layout: 'stack',
    gridConfig: { cols: 1, gap: 32 },
    style: {
      paddingTop: 56,
      paddingBottom: 28,
      paddingX: 32,
      backgroundColor: '#0f172a',
      maxWidth: 'full',
    },
    children: [
      {
        id: id(),
        type: 'container',
        layout: 'grid',
        gridConfig: { cols: 4, gap: 40 },
        style: { backgroundColor: 'transparent' },
        size: { w: 'full', h: 'auto' },
        children: [
          {
            id: id(),
            type: 'container',
            layout: 'stack',
            gridConfig: { cols: 1, gap: 12 },
            gridSpan: 2,
            style: { backgroundColor: 'transparent' },
            size: { w: 'full', h: 'auto' },
            children: [
              {
                id: id(),
                type: 'text',
                content: 'Minha Imobiliária',
                tag: 'h3',
                style: { fontSize: 20, fontWeight: 700, color: '#ffffff' },
              } as TextElement,
              {
                id: id(),
                type: 'text',
                content:
                  'Há anos ajudando famílias a encontrarem o imóvel ideal. Atendimento próximo, consultoria transparente e um portfólio cuidadosamente selecionado.',
                tag: 'p',
                style: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6 },
              } as TextElement,
              {
                id: id(),
                type: 'text',
                content: 'CRECI 00000-J',
                tag: 'p',
                style: { fontSize: 12, color: '#64748b', fontWeight: 500 },
              } as TextElement,
            ],
          } as ContainerElement,
          {
            id: id(),
            type: 'container',
            layout: 'stack',
            gridConfig: { cols: 1, gap: 10 },
            style: { backgroundColor: 'transparent' },
            size: { w: 'full', h: 'auto' },
            children: [
              {
                id: id(),
                type: 'text',
                content: 'NAVEGAÇÃO',
                tag: 'h4',
                style: headingStyle,
              } as TextElement,
              {
                id: id(),
                type: 'button',
                label: 'Início',
                url: '/',
                variant: 'ghost',
                style: linkStyle,
              } as ButtonElement,
              {
                id: id(),
                type: 'button',
                label: 'Imóveis',
                url: '/imoveis',
                variant: 'ghost',
                style: linkStyle,
              } as ButtonElement,
              {
                id: id(),
                type: 'button',
                label: 'Contato',
                url: '#contato',
                variant: 'ghost',
                style: linkStyle,
              } as ButtonElement,
            ],
          } as ContainerElement,
          {
            id: id(),
            type: 'container',
            layout: 'stack',
            gridConfig: { cols: 1, gap: 10 },
            style: { backgroundColor: 'transparent' },
            size: { w: 'full', h: 'auto' },
            children: [
              {
                id: id(),
                type: 'text',
                content: 'CONTATO',
                tag: 'h4',
                style: headingStyle,
              } as TextElement,
              {
                id: id(),
                type: 'text',
                content: '(11) 0000-0000',
                tag: 'p',
                style: { fontSize: 14, color: '#cbd5e1' },
              } as TextElement,
              {
                id: id(),
                type: 'text',
                content: 'contato@imobiliaria.com.br',
                tag: 'p',
                style: { fontSize: 14, color: '#cbd5e1' },
              } as TextElement,
              {
                id: id(),
                type: 'text',
                content: 'Av. Principal, 1000',
                tag: 'p',
                style: { fontSize: 14, color: '#cbd5e1' },
              } as TextElement,
            ],
          } as ContainerElement,
        ],
      } as ContainerElement,
      {
        id: id(),
        type: 'divider',
        thickness: 1,
        lineStyle: 'solid',
        color: '#1e293b',
        style: {},
      } as DividerElement,
      {
        id: id(),
        type: 'text',
        content: `© ${year} Minha Imobiliária. Todos os direitos reservados.`,
        tag: 'p',
        style: { fontSize: 13, color: '#64748b', textAlign: 'center' },
      } as TextElement,
    ],
  };
}

/* ─── Factory ────────────────────────────────────────────────── */

export function buildDefaultTemplate(slug: ReservedSlug, theme: ThemeTokens): PageData {
  switch (slug) {
    case 'home':
      return { seo: { title: RESERVED_TITLES.home, description: '' }, theme, sections: buildHomeSections(theme) };
    case 'property':
      return { seo: { title: RESERVED_TITLES.property, description: '' }, theme, sections: buildPropertySections(theme) };
    case 'search':
      return { seo: { title: RESERVED_TITLES.search, description: '' }, theme, sections: buildSearchSections(theme) };
  }
}

// Re-export for convenience
export type { Page };
