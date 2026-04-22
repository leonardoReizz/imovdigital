import { useState } from 'react';
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
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { api } from '../../lib/api';

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
      {s.backgroundType === 'gradient' && (
        <>
          <ColorPicker label="Cor inicial do gradiente" value={s.gradientFrom || '#2563eb'} onChange={(v) => update('gradientFrom', v)} />
          <ColorPicker label="Cor final do gradiente" value={s.gradientTo || '#1e40af'} onChange={(v) => update('gradientTo', v)} />
          <SelectField
            label="Direção do gradiente"
            value={s.gradientDirection || '135deg'}
            onChange={(v) => update('gradientDirection', v)}
            options={[
              { value: 'to right', label: 'Horizontal →' },
              { value: 'to left', label: 'Horizontal ←' },
              { value: 'to bottom', label: 'Vertical ↓' },
              { value: 'to top', label: 'Vertical ↑' },
              { value: '135deg', label: 'Diagonal ↘' },
              { value: '45deg', label: 'Diagonal ↗' },
            ]}
          />
        </>
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

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className={`text-lg ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function TestimonialsSettingsPanel({ section }: { section: Section<'testimonials'> }) {
  const updateSection = useEditorStore((s) => s.updateSection);
  const update = useSectionUpdater(section.id);
  const s = section.settings;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: '', text: '', rating: 5 });
  const [fetchingGoogle, setFetchingGoogle] = useState(false);
  const [googleReviews, setGoogleReviews] = useState<any[]>([]);
  const [googleError, setGoogleError] = useState('');

  const source = s.source || 'manual';
  const items = s.items || [];

  const addItem = () => {
    if (!draft.name.trim() || !draft.text.trim()) return;
    if (items.length >= 8) return;
    const newItems = [...items, { ...draft, avatarUrl: null }];
    updateSection(section.id, { items: newItems });
    setDraft({ name: '', text: '', rating: 5 });
  };

  const updateItem = (index: number) => {
    if (!draft.name.trim() || !draft.text.trim()) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...draft };
    updateSection(section.id, { items: newItems });
    setEditingIndex(null);
    setDraft({ name: '', text: '', rating: 5 });
  };

  const removeItem = (index: number) => {
    updateSection(section.id, { items: items.filter((_: any, i: number) => i !== index) });
    if (editingIndex === index) { setEditingIndex(null); setDraft({ name: '', text: '', rating: 5 }); }
  };

  const startEdit = (index: number) => {
    const item = items[index];
    setDraft({ name: item.name, text: item.text, rating: item.rating });
    setEditingIndex(index);
  };

  const fetchGoogleReviews = async () => {
    if (!s.googlePlaceId?.trim()) {
      setGoogleError('Insira o Place ID do Google');
      return;
    }
    setFetchingGoogle(true);
    setGoogleError('');
    try {
      const { data } = await api.get(`/public/google-reviews?placeId=${encodeURIComponent(s.googlePlaceId)}&minRating=${s.minRating || 0}`);
      setGoogleReviews(data);
      if (data.length === 0) {
        setGoogleError('Nenhuma avaliação encontrada para este Place ID');
      }
    } catch {
      setGoogleError('Erro ao buscar avaliações. Verifique o Place ID.');
    } finally {
      setFetchingGoogle(false);
    }
  };

  const importGoogleReviews = (selected: any[]) => {
    const imported = selected.slice(0, 8).map((r: any) => ({
      name: r.name,
      text: r.text,
      rating: r.rating,
      avatarUrl: r.avatarUrl || null,
    }));
    updateSection(section.id, { items: imported });
    setGoogleReviews([]);
  };

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

      <ToggleGroup
        label="Fonte dos depoimentos"
        value={source}
        onChange={(v) => update('source', v)}
        options={[
          { value: 'manual', label: 'Manual' },
          { value: 'google', label: 'Google' },
        ]}
      />

      {source === 'google' ? (
        <div className="space-y-3">
          <TextInput
            label="Google Place ID"
            value={s.googlePlaceId || ''}
            onChange={(v) => update('googlePlaceId', v)}
            placeholder="Ex: ChIJ..."
          />
          <p className="text-[10px] text-gray-400 -mt-2">
            Encontre em{' '}
            <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Place ID Finder
            </a>
          </p>

          <SelectField
            label="Avaliação mínima"
            value={String(s.minRating || 0)}
            onChange={(v) => update('minRating', Number(v))}
            options={[
              { value: '0', label: 'Todas' },
              { value: '3', label: '3+ estrelas' },
              { value: '4', label: '4+ estrelas' },
              { value: '5', label: 'Apenas 5 estrelas' },
            ]}
          />

          <button
            type="button"
            onClick={fetchGoogleReviews}
            disabled={fetchingGoogle || !s.googlePlaceId?.trim()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg disabled:opacity-40"
          >
            {fetchingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
            {fetchingGoogle ? 'Buscando...' : 'Buscar avaliações do Google'}
          </button>

          {googleError && (
            <p className="text-xs text-red-500">{googleError}</p>
          )}

          {/* Google reviews to select */}
          {googleReviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">{googleReviews.length} avaliações encontradas</p>
                <button
                  type="button"
                  onClick={() => importGoogleReviews(googleReviews)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Importar todas
                </button>
              </div>
              {googleReviews.map((r: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.avatarUrl && <img src={r.avatarUrl} alt="" className="w-5 h-5 rounded-full" />}
                      <span className="text-sm font-medium text-gray-700">{r.name}</span>
                      <span className="text-xs text-yellow-500">{'★'.repeat(r.rating)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (items.length < 8) {
                          updateSection(section.id, { items: [...items, { name: r.name, text: r.text, rating: r.rating, avatarUrl: r.avatarUrl }] });
                        }
                      }}
                      disabled={items.length >= 8}
                      className="text-xs text-primary hover:underline disabled:text-gray-400"
                    >
                      Adicionar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Imported items */}
          {items.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500">Selecionados ({items.length}/8)</p>
              {items.map((item: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-xs text-yellow-500">{'★'.repeat(item.rating)}</span>
                    </div>
                    <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">Remover</button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Manual items */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Depoimentos ({items.length}/8)</p>
            {items.map((item: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-yellow-500">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => startEdit(i)} className="text-xs text-primary hover:underline">Editar</button>
                    <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">Remover</button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">"{item.text}"</p>
              </div>
            ))}
          </div>

          {/* Add/Edit form */}
          {items.length < 8 && (
            <div className="bg-primary-light/50 rounded-lg p-3 space-y-3 border border-primary/20">
              <p className="text-xs font-medium text-primary-dark">{editingIndex !== null ? 'Editar depoimento' : 'Novo depoimento'}</p>
              <TextInput label="Nome" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} placeholder="Nome do cliente" />
              <TextareaField label="Depoimento" value={draft.text} onChange={(v) => setDraft((d) => ({ ...d, text: v }))} placeholder="O que o cliente disse..." rows={2} />
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Avaliação</label>
                <StarRating value={draft.rating} onChange={(v) => setDraft((d) => ({ ...d, rating: v }))} />
              </div>
              <div className="flex gap-2">
                {editingIndex !== null && (
                  <button type="button" onClick={() => { setEditingIndex(null); setDraft({ name: '', text: '', rating: 5 }); }} className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg">
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={editingIndex !== null ? () => updateItem(editingIndex) : addItem}
                  disabled={!draft.name.trim() || !draft.text.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg disabled:opacity-40"
                >
                  {editingIndex !== null ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          )}

          {items.length >= 8 && (
            <p className="text-xs text-gray-400">Limite de 8 depoimentos atingido.</p>
          )}
        </>
      )}
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
      {s.backgroundType === 'gradient' ? (
        <>
          <ColorPicker label="Cor inicial do gradiente" value={s.gradientFrom || s.backgroundValue || '#2563eb'} onChange={(v) => update('gradientFrom', v)} />
          <ColorPicker label="Cor final do gradiente" value={s.gradientTo || '#1e40af'} onChange={(v) => update('gradientTo', v)} />
          <SelectField
            label="Direção do gradiente"
            value={s.gradientDirection || '135deg'}
            onChange={(v) => update('gradientDirection', v)}
            options={[
              { value: 'to right', label: 'Horizontal →' },
              { value: 'to left', label: 'Horizontal ←' },
              { value: 'to bottom', label: 'Vertical ↓' },
              { value: 'to top', label: 'Vertical ↑' },
              { value: '135deg', label: 'Diagonal ↘' },
              { value: '45deg', label: 'Diagonal ↗' },
            ]}
          />
        </>
      ) : (
        <ColorPicker label="Cor/Valor do fundo" value={s.backgroundValue} onChange={(v) => update('backgroundValue', v)} />
      )}
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

      <BadgeToggle label="Mostrar mapa" value={s.showMap} onChange={(v) => update('showMap', v)} />
      <BadgeToggle label="Exibir WhatsApp" value={s.showWhatsApp} onChange={(v) => update('showWhatsApp', v)} />

      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
        Endereço, telefone e WhatsApp são gerenciados em <strong>Contato</strong> no painel lateral.
      </p>

      <BadgeToggle label="Mostrar formulário" value={s.showForm} onChange={(v) => update('showForm', v)} />
      {s.showForm && (
        <>
          <p className="text-xs text-gray-400 -mt-2">Campos do formulário:</p>
          <BadgeToggle label="Campo e-mail" value={s.showEmailField ?? false} onChange={(v) => update('showEmailField', v)} />
          <BadgeToggle label="Campo telefone/WhatsApp" value={s.showPhoneField ?? true} onChange={(v) => update('showPhoneField', v)} />
        </>
      )}
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
      <RangeSlider
        label="Tamanho da logo"
        value={s.logoSize || 32}
        onChange={(v) => update('logoSize', v)}
        min={16}
        max={80}
        step={2}
        suffix="px"
      />
      <TextareaField label="Descrição" value={s.description} onChange={(v) => update('description', v)} />
      <TextInput label="CRECI" value={s.creci || ''} onChange={(v) => update('creci', v)} placeholder="CRECI J-00000/SC" />
      <TextInput label="Texto de copyright" value={s.copyrightText} onChange={(v) => update('copyrightText', v)} />
      <ColorPicker label="Cor de fundo" value={s.backgroundColor} onChange={(v) => update('backgroundColor', v)} />
      <ColorPicker label="Cor do texto" value={s.textColor} onChange={(v) => update('textColor', v)} />
      <p className="text-xs font-medium text-gray-500 pt-2">Redes sociais no rodapé</p>
      <p className="text-xs text-gray-400 -mt-2">URLs são carregadas da página de Contato.</p>
      <BadgeToggle label="Instagram" value={s.showInstagram ?? true} onChange={(v) => update('showInstagram', v)} />
      <BadgeToggle label="Facebook" value={s.showFacebook ?? true} onChange={(v) => update('showFacebook', v)} />
      <BadgeToggle label="YouTube" value={s.showYoutube ?? false} onChange={(v) => update('showYoutube', v)} />
      <BadgeToggle label="LinkedIn" value={s.showLinkedin ?? false} onChange={(v) => update('showLinkedin', v)} />
      <BadgeToggle label="TikTok" value={s.showTiktok ?? false} onChange={(v) => update('showTiktok', v)} />
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
