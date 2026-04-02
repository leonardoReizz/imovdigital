import type { Section, SectionType } from '@imovdigital/types';
import { useEditorStore } from '../../store/editorStore';
import {
  TextInput,
  TextareaField,
  ColorPicker,
  RangeSlider,
  ToggleGroup,
  SelectField,
  BadgeToggle,
  EditorImageUploader,
} from './controls';
import { ArrowLeft } from 'lucide-react';

function useSectionUpdater(sectionId: string) {
  const updateSection = useEditorStore((s) => s.updateSection);
  return (key: string, value: unknown) => updateSection(sectionId, { [key]: value });
}

// ─── Hero Settings ───────────────────────────────────────────

function HeroSettingsPanel({ section }: { section: Section<'hero'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.headline} onChange={(v) => update('headline', v)} />
      <TextInput label="Subtítulo" value={s.subheadline} onChange={(v) => update('subheadline', v)} />
      <TextInput label="Texto do botão" value={s.ctaLabel} onChange={(v) => update('ctaLabel', v)} />
      <TextInput label="Link do botão" value={s.ctaUrl} onChange={(v) => update('ctaUrl', v)} />
      <SelectField
        label="Tipo de fundo"
        value={s.backgroundType}
        onChange={(v) => update('backgroundType', v)}
        options={[
          { value: 'color', label: 'Cor sólida' },
          { value: 'gradient', label: 'Gradiente' },
          { value: 'image', label: 'Imagem' },
          { value: 'video', label: 'Vídeo' },
        ]}
      />
      {s.backgroundType === 'image' && (
        <EditorImageUploader
          label="Imagem de fundo"
          value={s.backgroundUrl}
          onChange={(v) => update('backgroundUrl', v)}
          folder="banners"
          aspectRatio="16/9"
        />
      )}
      <ColorPicker label="Cor do overlay" value={s.overlayColor} onChange={(v) => update('overlayColor', v)} />
      <RangeSlider label="Opacidade do overlay" value={s.overlayOpacity} onChange={(v) => update('overlayOpacity', v)} suffix="%" />
      <ToggleGroup
        label="Altura"
        value={s.height}
        onChange={(v) => update('height', v)}
        options={[
          { value: 'small', label: 'Pequena' },
          { value: 'medium', label: 'Média' },
          { value: 'large', label: 'Grande' },
          { value: 'full', label: 'Tela cheia' },
        ]}
      />
      <ToggleGroup
        label="Alinhamento"
        value={s.textAlign}
        onChange={(v) => update('textAlign', v)}
        options={[
          { value: 'left', label: 'Esquerda' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Direita' },
        ]}
      />
    </div>
  );
}

// ─── SearchBar Settings ──────────────────────────────────────

function SearchBarSettingsPanel({ section }: { section: Section<'search_bar'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Placeholder" value={s.placeholder} onChange={(v) => update('placeholder', v)} />
      <SelectField
        label="Posição"
        value={s.position}
        onChange={(v) => update('position', v)}
        options={[
          { value: 'above_hero', label: 'Acima do banner' },
          { value: 'center_hero', label: 'Centro do banner' },
          { value: 'below_hero', label: 'Abaixo do banner' },
          { value: 'standalone', label: 'Separada' },
        ]}
      />
      <ColorPicker label="Cor de fundo" value={s.backgroundColor} onChange={(v) => update('backgroundColor', v)} />
      <ToggleGroup
        label="Borda arredondada"
        value={s.borderRadius}
        onChange={(v) => update('borderRadius', v)}
        options={[
          { value: 'none', label: 'Nenhuma' },
          { value: 'sm', label: 'Pouca' },
          { value: 'md', label: 'Média' },
          { value: 'lg', label: 'Grande' },
          { value: 'full', label: 'Total' },
        ]}
      />
    </div>
  );
}

// ─── FeaturedListings Settings ───────────────────────────────

function FeaturedListingsSettingsPanel({ section }: { section: Section<'featured_listings'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.title} onChange={(v) => update('title', v)} />
      <TextInput label="Subtítulo" value={s.subtitle} onChange={(v) => update('subtitle', v)} />
      <ToggleGroup
        label="Layout"
        value={s.layout}
        onChange={(v) => update('layout', v)}
        options={[
          { value: 'grid', label: 'Grade' },
          { value: 'carousel', label: 'Carrossel' },
          { value: 'list', label: 'Lista' },
        ]}
      />
      <ToggleGroup
        label="Colunas"
        value={String(s.columns)}
        onChange={(v) => update('columns', Number(v))}
        options={[
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
        ]}
      />
      <RangeSlider label="Máximo de itens" value={s.maxItems} onChange={(v) => update('maxItems', v)} min={2} max={12} />
      <BadgeToggle label="Mostrar preço" value={s.showPrice} onChange={(v) => update('showPrice', v)} />
      <BadgeToggle label="Mostrar badge" value={s.showBadge} onChange={(v) => update('showBadge', v)} />
      <TextInput label="Filtrar por tag" value={s.filterTag || ''} onChange={(v) => update('filterTag', v || null)} placeholder="Ex: destaque" />
    </div>
  );
}

// ─── About Settings ──────────────────────────────────────────

function AboutSettingsPanel({ section }: { section: Section<'about'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.title} onChange={(v) => update('title', v)} />
      <TextareaField label="Texto" value={s.text} onChange={(v) => update('text', v)} rows={4} />
      <EditorImageUploader
        label="Imagem"
        value={s.imageUrl}
        onChange={(v) => update('imageUrl', v)}
        folder="banners"
      />
      <ToggleGroup
        label="Posição da imagem"
        value={s.imagePosition}
        onChange={(v) => update('imagePosition', v)}
        options={[
          { value: 'left', label: 'Esquerda' },
          { value: 'right', label: 'Direita' },
        ]}
      />
    </div>
  );
}

// ─── Agents Settings ─────────────────────────────────────────

function AgentsSettingsPanel({ section }: { section: Section<'agents'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.title} onChange={(v) => update('title', v)} />
      <TextInput label="Subtítulo" value={s.subtitle} onChange={(v) => update('subtitle', v)} />
      <ToggleGroup
        label="Layout"
        value={s.layout}
        onChange={(v) => update('layout', v)}
        options={[
          { value: 'grid', label: 'Grade' },
          { value: 'carousel', label: 'Carrossel' },
        ]}
      />
      <BadgeToggle label="Mostrar contato" value={s.showContact} onChange={(v) => update('showContact', v)} />
    </div>
  );
}

// ─── Testimonials Settings ───────────────────────────────────

function TestimonialsSettingsPanel({ section }: { section: Section<'testimonials'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.title} onChange={(v) => update('title', v)} />
      <ToggleGroup
        label="Layout"
        value={s.layout}
        onChange={(v) => update('layout', v)}
        options={[
          { value: 'carousel', label: 'Carrossel' },
          { value: 'grid', label: 'Grade' },
        ]}
      />
      <p className="text-xs text-gray-400">
        Depoimentos podem ser adicionados na seção de preview.
      </p>
    </div>
  );
}

// ─── CTA Banner Settings ────────────────────────────────────

function CTABannerSettingsPanel({ section }: { section: Section<'cta_banner'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.headline} onChange={(v) => update('headline', v)} />
      <TextInput label="Subtítulo" value={s.subheadline} onChange={(v) => update('subheadline', v)} />
      <TextInput label="Texto do botão" value={s.ctaLabel} onChange={(v) => update('ctaLabel', v)} />
      <TextInput label="Link do botão" value={s.ctaUrl} onChange={(v) => update('ctaUrl', v)} />
      <SelectField
        label="Tipo de fundo"
        value={s.backgroundType}
        onChange={(v) => update('backgroundType', v)}
        options={[
          { value: 'color', label: 'Cor' },
          { value: 'gradient', label: 'Gradiente' },
          { value: 'image', label: 'Imagem' },
        ]}
      />
      <ColorPicker label="Cor/Valor do fundo" value={s.backgroundValue} onChange={(v) => update('backgroundValue', v)} />
      <ColorPicker label="Cor do texto" value={s.textColor} onChange={(v) => update('textColor', v)} />
    </div>
  );
}

// ─── Contact Settings ────────────────────────────────────────

function ContactSettingsPanel({ section }: { section: Section<'contact'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <TextInput label="Título" value={s.title} onChange={(v) => update('title', v)} />
      <TextInput label="Endereço" value={s.address} onChange={(v) => update('address', v)} />
      <TextInput label="Número WhatsApp" value={s.whatsAppNumber} onChange={(v) => update('whatsAppNumber', v)} placeholder="+55 11 99999-9999" />
      <BadgeToggle label="Mostrar mapa" value={s.showMap} onChange={(v) => update('showMap', v)} />
      <BadgeToggle label="Mostrar WhatsApp" value={s.showWhatsApp} onChange={(v) => update('showWhatsApp', v)} />
      <BadgeToggle label="Mostrar formulário" value={s.showForm} onChange={(v) => update('showForm', v)} />
    </div>
  );
}

// ─── Footer Settings ─────────────────────────────────────────

function FooterSettingsPanel({ section }: { section: Section<'footer'> }) {
  const update = useSectionUpdater(section.id);
  const s = section.settings;

  return (
    <div className="space-y-4">
      <EditorImageUploader
        label="Logo do rodapé"
        value={s.logoUrl}
        onChange={(v) => update('logoUrl', v)}
        folder="logos"
      />
      <TextareaField label="Descrição" value={s.description} onChange={(v) => update('description', v)} />
      <TextInput label="Texto de copyright" value={s.copyrightText} onChange={(v) => update('copyrightText', v)} />
      <ColorPicker label="Cor de fundo" value={s.backgroundColor} onChange={(v) => update('backgroundColor', v)} />
      <ColorPicker label="Cor do texto" value={s.textColor} onChange={(v) => update('textColor', v)} />
      <BadgeToggle label="Mostrar redes sociais" value={s.showSocials} onChange={(v) => update('showSocials', v)} />
    </div>
  );
}

// ─── Settings Router ─────────────────────────────────────────

const SETTINGS_PANELS: Record<SectionType, React.ComponentType<{ section: any }>> = {
  hero: HeroSettingsPanel,
  search_bar: SearchBarSettingsPanel,
  featured_listings: FeaturedListingsSettingsPanel,
  about: AboutSettingsPanel,
  agents: AgentsSettingsPanel,
  testimonials: TestimonialsSettingsPanel,
  cta_banner: CTABannerSettingsPanel,
  contact: ContactSettingsPanel,
  footer: FooterSettingsPanel,
};

import { SECTION_LABELS } from '@imovdigital/types';

export function SectionSettings() {
  const config = useEditorStore((s) => s.config);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectSection = useEditorStore((s) => s.selectSection);

  if (!config || !selectedSectionId) return null;

  const section = config.sections.find((s) => s.id === selectedSectionId);
  if (!section) return null;

  const Panel = SETTINGS_PANELS[section.type];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => selectSection(null)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h3 className="text-sm font-semibold text-gray-900">
        {SECTION_LABELS[section.type]}
      </h3>

      <Panel section={section} />
    </div>
  );
}
