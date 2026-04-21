import type { Element, Section, SectionLayout, TextElement, ImageElement, ButtonElement, ListingsElement, SearchElement, SpacerElement, DividerElement, PropertyBinding, PropertyGalleryElement, PropertyMapElement, PropertyContactFormElement, PropertyTagsElement, PropertyPricesElement, PropertySpecsElement } from '@imovdigital/types';
import { PROPERTY_BINDING_LABELS } from '@imovdigital/types';
import { PanelRightClose, RotateCcw } from 'lucide-react';
import { selectSelectedElement, selectSelectedSection, useEditorStore } from '../store';
import {
  ColorField,
  ImageUploadField,
  NumberField,
  SelectField,
  TextField,
  TextAreaField,
  Toggle,
  ToggleGroup,
} from './controls';

export function PropertiesPanel() {
  const selection = useEditorStore((s) => s.selection);
  const page = useEditorStore((s) => s.page);
  const section = useEditorStore(selectSelectedSection);
  const element = useEditorStore(selectSelectedElement);
  const toggle = useEditorStore((s) => s.toggleRightPanel);

  return (
    <aside className="w-72 border-l border-slate-200 bg-white flex-shrink-0 overflow-y-auto">
      <div className="flex items-center justify-end px-2 pt-2">
        <button
          onClick={toggle}
          title="Colapsar painel (Cmd+.)"
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>
      {selection === null && page && <PagePanel />}
      {selection?.kind === 'section' && section && <SectionPanel section={section} />}
      {selection?.kind === 'element' && element && <ElementPanel element={element} />}
    </aside>
  );
}

function PagePanel() {
  const page = useEditorStore((s) => s.page)!;
  const update = useEditorStore((s) => s.updatePageMeta);
  const resetPageToTemplate = useEditorStore((s) => s.resetPageToTemplate);

  const isReserved =
    page.slug === 'home' || page.slug === 'property' || page.slug === 'search';

  async function handleReset() {
    if (
      !confirm(
        'Redefinir esta página pelo template padrão? Todo o conteúdo atual será substituído e essa ação não pode ser desfeita.',
      )
    ) return;
    await resetPageToTemplate();
  }

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Página</h2>

      <TextField label="Título" value={page.title} onChange={(title) => update({ title })} />
      <TextField label="Slug" value={page.slug} onChange={(slug) => update({ slug })} hint="URL da página" />

      <div className="pt-3 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">SEO</h3>
        <div className="space-y-3">
          <TextField
            label="Título SEO"
            value={page.seo.title}
            onChange={(title) => update({ seo: { title } })}
          />
          <TextAreaField
            label="Descrição SEO"
            value={page.seo.description}
            onChange={(description) => update({ seo: { description } })}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tema</h3>
        <div className="space-y-3">
          <ColorField
            label="Cor primária"
            value={page.theme.primaryColor}
            onChange={(primaryColor) => update({ theme: { primaryColor } })}
          />
          <ColorField
            label="Cor secundária"
            value={page.theme.secondaryColor}
            onChange={(secondaryColor) => update({ theme: { secondaryColor } })}
          />
          <TextField
            label="Fonte"
            value={page.theme.fontFamily}
            onChange={(fontFamily) => update({ theme: { fontFamily } })}
            hint="Ex: Inter, Roboto, sans-serif"
          />
          <NumberField
            label="Raio dos cantos"
            value={page.theme.borderRadius}
            onChange={(borderRadius) => update({ theme: { borderRadius } })}
            suffix="px"
            min={0}
            max={40}
          />
        </div>
      </div>

      {isReserved && (
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center gap-1.5"
            title="Descarta o conteúdo atual e aplica o template padrão mais recente"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Redefinir pelo template padrão
          </button>
          <p className="text-[11px] text-slate-400 mt-2 leading-snug">
            Útil se os campos dinâmicos do imóvel (título, preço, descrição) não estão
            aparecendo — aplica o template mais recente.
          </p>
        </div>
      )}
    </div>
  );
}

function SectionPanel({ section }: { section: Section }) {
  const updateSection = useEditorStore((s) => s.updateSection);
  const setSectionLayout = useEditorStore((s) => s.setSectionLayout);
  const removeSection = useEditorStore((s) => s.removeSection);

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Seção</h2>

      <ToggleGroup<SectionLayout>
        label="Layout"
        value={section.layout}
        onChange={(layout) => setSectionLayout(section.id, layout)}
        options={[
          { value: 'stack', label: 'Fluxo' },
          { value: 'grid', label: 'Grid' },
          { value: 'free', label: 'Livre' },
        ]}
      />

      {section.layout === 'grid' && (
        <NumberField
          label="Colunas"
          value={section.gridConfig?.cols}
          onChange={(cols) =>
            updateSection(section.id, (s) => {
              s.gridConfig = { ...(s.gridConfig ?? { cols: 3, gap: 24 }), cols };
            })
          }
          min={1}
          max={6}
        />
      )}

      {(section.layout === 'grid' || section.layout === 'stack') && (
        <NumberField
          label="Espaçamento"
          value={section.gridConfig?.gap ?? 16}
          onChange={(gap) =>
            updateSection(section.id, (s) => {
              s.gridConfig = { ...(s.gridConfig ?? { cols: 1, gap: 16 }), gap };
            })
          }
          suffix="px"
          min={0}
          max={120}
        />
      )}

      <div className="pt-3 border-t border-slate-100 space-y-3">
        <ColorField
          label="Cor de fundo"
          value={section.style.backgroundColor}
          onChange={(backgroundColor) =>
            updateSection(section.id, (s) => {
              s.style.backgroundColor = backgroundColor;
            })
          }
        />
        <ImageUploadField
          label="Imagem de fundo"
          folder="banners"
          value={section.style.backgroundImage ?? null}
          onChange={(url) =>
            updateSection(section.id, (s) => {
              s.style.backgroundImage = url ?? undefined;
            })
          }
        />
        <NumberField
          label="Padding topo"
          value={section.style.paddingTop ?? 0}
          onChange={(v) => updateSection(section.id, (s) => { s.style.paddingTop = v; })}
          suffix="px"
          min={0}
        />
        <NumberField
          label="Padding base"
          value={section.style.paddingBottom ?? 0}
          onChange={(v) => updateSection(section.id, (s) => { s.style.paddingBottom = v; })}
          suffix="px"
          min={0}
        />
        <NumberField
          label="Altura mínima"
          value={section.style.minHeight ?? 0}
          onChange={(v) => updateSection(section.id, (s) => { s.style.minHeight = v; })}
          suffix="px"
          min={0}
        />
      </div>

      <button
        onClick={() => removeSection(section.id)}
        className="w-full mt-4 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md border border-red-100"
      >
        Remover seção
      </button>
    </div>
  );
}

function ElementPanel({ element }: { element: Element }) {
  const updateStyle = useEditorStore((s) => s.updateElementStyle);
  const remove = useEditorStore((s) => s.removeElement);
  const hasTextAlign = element.type === 'text' || element.type === 'button';
  const viewport = useEditorStore((s) => s.viewport);
  const setHidden = useEditorStore((s) => s.setElementHiddenAtBreakpoint);
  const resetResponsive = useEditorStore((s) => s.resetElementResponsive);

  const isBreakpointOverride = viewport !== 'desktop';
  const hasOverride = !!element.responsive?.[viewport] || !!element.hidden?.[viewport];
  const isHiddenAtBp = !!element.hidden?.[viewport];
  const bpLabel = viewport === 'tablet' ? 'Tablet' : 'Mobile';

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {element.type}
      </h2>

      {isBreakpointOverride && (
        <div className="px-2.5 py-2 rounded-md border border-amber-200 bg-amber-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-800">
              Editando {bpLabel}
              {hasOverride && <span className="ml-1 text-amber-600">• override</span>}
            </span>
            {hasOverride && (
              <button
                onClick={() => resetResponsive(element.id, viewport)}
                className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900"
                title="Resetar overrides deste breakpoint"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
            )}
          </div>
          <Toggle
            label={`Ocultar em ${bpLabel}`}
            checked={isHiddenAtBp}
            onChange={(v) => setHidden(element.id, viewport, v)}
          />
        </div>
      )}

      <ElementSpecificFields element={element} />

      <div className="pt-3 border-t border-slate-100 space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estilo</h3>
        {hasTextAlign && (
          <ToggleGroup<'left' | 'center' | 'right'>
            label="Alinhamento"
            value={(element.style.textAlign as 'left' | 'center' | 'right') ?? 'left'}
            onChange={(textAlign) => updateStyle(element.id, { textAlign })}
            options={[
              { value: 'left', label: '⇤' },
              { value: 'center', label: '↔' },
              { value: 'right', label: '⇥' },
            ]}
          />
        )}
        <ColorField
          label="Cor do texto"
          value={element.style.color}
          onChange={(color) => updateStyle(element.id, { color })}
        />
        <ColorField
          label="Fundo"
          value={element.style.backgroundColor}
          onChange={(backgroundColor) => updateStyle(element.id, { backgroundColor })}
        />
        <NumberField
          label="Raio dos cantos"
          value={element.style.borderRadius}
          onChange={(borderRadius) => updateStyle(element.id, { borderRadius })}
          suffix="px"
          min={0}
          max={80}
        />
        <NumberField
          label="Opacidade"
          value={element.style.opacity ?? 1}
          onChange={(opacity) => updateStyle(element.id, { opacity })}
          min={0}
          max={1}
          step={0.05}
        />
      </div>

      <button
        onClick={() => remove(element.id)}
        className="w-full mt-4 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md border border-red-100"
      >
        Remover elemento
      </button>
    </div>
  );
}

function ElementSpecificFields({ element }: { element: Element }) {
  const update = useEditorStore((s) => s.updateElement);

  switch (element.type) {
    case 'text':
      return (
        <TextFields
          element={element}
          onContent={(content) => update(element.id, (e) => { (e as TextElement).content = content; })}
          onTag={(tag) => update(element.id, (e) => { (e as TextElement).tag = tag as TextElement['tag']; })}
          onBinding={(binding) => update(element.id, (e) => {
            (e as TextElement).binding = binding;
          })}
        />
      );
    case 'image':
      return (
        <>
          <ImageUploadField
            label="Imagem"
            value={element.src}
            onChange={(src) => update(element.id, (e) => { (e as ImageElement).src = src; })}
          />
          <TextField
            label="Texto alternativo"
            value={element.alt}
            onChange={(alt) => update(element.id, (e) => { (e as ImageElement).alt = alt; })}
          />
          <SelectField
            label="Ajuste"
            value={element.objectFit}
            onChange={(fit) => update(element.id, (e) => { (e as ImageElement).objectFit = fit; })}
            options={[
              { value: 'cover', label: 'Preencher (cover)' },
              { value: 'contain', label: 'Caber (contain)' },
              { value: 'fill', label: 'Esticar' },
            ]}
          />
        </>
      );
    case 'button':
      return (
        <>
          <TextField
            label="Texto"
            value={element.label}
            onChange={(label) => update(element.id, (e) => { (e as ButtonElement).label = label; })}
          />
          <TextField
            label="Link"
            value={element.url}
            onChange={(url) => update(element.id, (e) => { (e as ButtonElement).url = url; })}
          />
          <SelectField
            label="Estilo"
            value={element.variant}
            onChange={(variant) => update(element.id, (e) => { (e as ButtonElement).variant = variant; })}
            options={[
              { value: 'primary', label: 'Primário' },
              { value: 'secondary', label: 'Secundário' },
              { value: 'outline', label: 'Contorno' },
              { value: 'ghost', label: 'Fantasma' },
            ]}
          />
          <Toggle
            label="Abrir em nova aba"
            checked={!!element.openInNewTab}
            onChange={(openInNewTab) => update(element.id, (e) => { (e as ButtonElement).openInNewTab = openInNewTab; })}
          />
        </>
      );
    case 'listings':
      return (
        <>
          <SelectField
            label="Fonte"
            value={element.source}
            onChange={(source) => update(element.id, (e) => { (e as ListingsElement).source = source; })}
            options={[
              { value: 'featured', label: 'Destaques' },
              { value: 'filter', label: 'Filtro automático' },
              { value: 'manual', label: 'Seleção manual' },
            ]}
          />
          <NumberField
            label="Quantidade"
            value={element.count}
            onChange={(count) => update(element.id, (e) => { (e as ListingsElement).count = count; })}
            min={1}
            max={24}
          />
          <SelectField
            label="Exibição"
            value={element.display}
            onChange={(display) => update(element.id, (e) => { (e as ListingsElement).display = display; })}
            options={[
              { value: 'grid', label: 'Grade' },
              { value: 'carousel', label: 'Carrossel' },
              { value: 'list', label: 'Lista' },
            ]}
          />
          <SelectField
            label="Colunas"
            value={String(element.columns)}
            onChange={(v) => update(element.id, (e) => { (e as ListingsElement).columns = Number(v) as ListingsElement['columns']; })}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
          />
          <SelectField
            label="Template do card"
            value={element.cardTemplate}
            onChange={(cardTemplate) => update(element.id, (e) => { (e as ListingsElement).cardTemplate = cardTemplate; })}
            options={[
              { value: 'compact', label: 'Compacto' },
              { value: 'standard', label: 'Padrão' },
              { value: 'highlight', label: 'Destaque' },
            ]}
          />
        </>
      );
    case 'search':
      return (
        <SelectField
          label="Layout"
          value={element.layout}
          onChange={(layout) => update(element.id, (e) => { (e as SearchElement).layout = layout; })}
          options={[
            { value: 'row', label: 'Horizontal' },
            { value: 'stacked', label: 'Empilhado' },
            { value: 'compact', label: 'Compacto' },
            { value: 'sidebar', label: 'Lateral (filtros)' },
          ]}
        />
      );
    case 'spacer':
      return (
        <NumberField
          label="Altura"
          value={element.height}
          onChange={(height) => update(element.id, (e) => { (e as SpacerElement).height = height; })}
          suffix="px"
          min={8}
          max={400}
        />
      );
    case 'divider':
      return (
        <>
          <NumberField
            label="Espessura"
            value={element.thickness}
            onChange={(thickness) => update(element.id, (e) => { (e as DividerElement).thickness = thickness; })}
            suffix="px"
            min={1}
            max={20}
          />
          <SelectField
            label="Estilo"
            value={element.lineStyle}
            onChange={(lineStyle) => update(element.id, (e) => { (e as DividerElement).lineStyle = lineStyle; })}
            options={[
              { value: 'solid', label: 'Sólido' },
              { value: 'dashed', label: 'Tracejado' },
              { value: 'dotted', label: 'Pontilhado' },
            ]}
          />
        </>
      );
    case 'property_gallery':
      return (
        <>
          <SelectField
            label="Layout"
            value={element.layout}
            onChange={(layout) => update(element.id, (e) => { (e as PropertyGalleryElement).layout = layout; })}
            options={[
              { value: 'grid', label: 'Grade' },
              { value: 'carousel', label: 'Carrossel' },
              { value: 'single', label: 'Imagem grande' },
            ]}
          />
          {element.layout === 'grid' && (
            <SelectField
              label="Colunas"
              value={String(element.columns)}
              onChange={(v) => update(element.id, (e) => { (e as PropertyGalleryElement).columns = Number(v) as PropertyGalleryElement['columns']; })}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
            />
          )}
          <SelectField
            label="Proporção"
            value={element.aspectRatio}
            onChange={(aspectRatio) => update(element.id, (e) => { (e as PropertyGalleryElement).aspectRatio = aspectRatio; })}
            options={[
              { value: '4:3', label: '4:3 (paisagem)' },
              { value: '16:9', label: '16:9 (widescreen)' },
              { value: '1:1', label: '1:1 (quadrado)' },
            ]}
          />
        </>
      );
    case 'property_map':
      return (
        <>
          <NumberField
            label="Zoom"
            value={element.zoom}
            onChange={(zoom) => update(element.id, (e) => { (e as PropertyMapElement).zoom = zoom; })}
            min={10}
            max={20}
          />
          <Toggle
            label="Mostrar localização aproximada"
            checked={element.approximateOnly}
            onChange={(approximateOnly) => update(element.id, (e) => { (e as PropertyMapElement).approximateOnly = approximateOnly; })}
            hint="Esconde o marcador exato e mostra um círculo — protege a privacidade."
          />
        </>
      );
    case 'property_contact_form':
      return (
        <>
          <TextField
            label="Título"
            value={element.title}
            onChange={(title) => update(element.id, (e) => { (e as PropertyContactFormElement).title = title; })}
          />
          <TextField
            label="Texto do botão"
            value={element.submitLabel}
            onChange={(submitLabel) => update(element.id, (e) => { (e as PropertyContactFormElement).submitLabel = submitLabel; })}
          />
          <TextField
            label="Placeholder da mensagem"
            value={element.messagePlaceholder}
            onChange={(messagePlaceholder) => update(element.id, (e) => { (e as PropertyContactFormElement).messagePlaceholder = messagePlaceholder; })}
          />
          <Toggle
            label="Pedir telefone"
            checked={element.showPhoneField}
            onChange={(showPhoneField) => update(element.id, (e) => { (e as PropertyContactFormElement).showPhoneField = showPhoneField; })}
          />
          <Toggle
            label="Pedir e-mail"
            checked={element.showEmailField}
            onChange={(showEmailField) => update(element.id, (e) => { (e as PropertyContactFormElement).showEmailField = showEmailField; })}
          />
        </>
      );
    case 'property_tags':
      return (
        <>
          <SelectField
            label="Layout"
            value={element.layout}
            onChange={(layout) => update(element.id, (e) => { (e as PropertyTagsElement).layout = layout; })}
            options={[
              { value: 'chips', label: 'Chips (badges)' },
              { value: 'grid', label: 'Grade com ícones' },
            ]}
          />
          {element.layout === 'grid' && (
            <>
              <SelectField
                label="Colunas"
                value={String(element.columns)}
                onChange={(v) => update(element.id, (e) => { (e as PropertyTagsElement).columns = Number(v) as PropertyTagsElement['columns']; })}
                options={[
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                ]}
              />
              <Toggle
                label="Mostrar ícones"
                checked={element.showIcons}
                onChange={(showIcons) => update(element.id, (e) => { (e as PropertyTagsElement).showIcons = showIcons; })}
              />
            </>
          )}
        </>
      );
    case 'property_prices':
      return (
        <>
          <TextField
            label="Título do bloco"
            value={element.title}
            onChange={(title) => update(element.id, (e) => { (e as PropertyPricesElement).title = title; })}
          />
          <Toggle
            label="Mostrar condomínio"
            checked={element.showCondo}
            onChange={(showCondo) => update(element.id, (e) => { (e as PropertyPricesElement).showCondo = showCondo; })}
          />
          <Toggle
            label="Mostrar IPTU"
            checked={element.showIptu}
            onChange={(showIptu) => update(element.id, (e) => { (e as PropertyPricesElement).showIptu = showIptu; })}
          />
          <Toggle
            label="Mostrar valor total"
            checked={element.showTotal}
            onChange={(showTotal) => update(element.id, (e) => { (e as PropertyPricesElement).showTotal = showTotal; })}
            hint="Soma aluguel + condomínio (só pra aluguel)."
          />
        </>
      );
    case 'property_specs':
      return (
        <>
          <SelectField
            label="Layout"
            value={element.layout}
            onChange={(layout) => update(element.id, (e) => { (e as PropertySpecsElement).layout = layout; })}
            options={[
              { value: 'row', label: 'Linha horizontal' },
              { value: 'grid', label: 'Grade de cards' },
            ]}
          />
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Itens exibidos
            </p>
            {(['area', 'bedrooms', 'bathrooms', 'parkingSpots', 'suites'] as const).map((spec) => {
              const label =
                spec === 'area' ? 'Área' :
                spec === 'bedrooms' ? 'Quartos' :
                spec === 'bathrooms' ? 'Banheiros' :
                spec === 'parkingSpots' ? 'Vagas' : 'Suítes';
              const checked = element.items.includes(spec);
              return (
                <Toggle
                  key={spec}
                  label={label}
                  checked={checked}
                  onChange={(v) => update(element.id, (e) => {
                    const el = e as PropertySpecsElement;
                    if (v) {
                      el.items = Array.from(new Set([...el.items, spec]));
                    } else {
                      el.items = el.items.filter((s) => s !== spec);
                    }
                  })}
                />
              );
            })}
          </div>
        </>
      );
    default:
      return null;
  }
}

function TextFields({
  element,
  onContent,
  onTag,
  onBinding,
}: {
  element: TextElement;
  onContent: (v: string) => void;
  onTag: (v: string) => void;
  onBinding: (v: PropertyBinding | null) => void;
}) {
  const page = useEditorStore((s) => s.page);
  const canBind = page?.slug === 'property';
  const bindingValue = element.binding ?? '';

  return (
    <>
      {canBind && (
        <SelectField
          label="Conteúdo dinâmico"
          value={bindingValue}
          onChange={(v) => onBinding((v || null) as PropertyBinding | null)}
          hint="Puxa do imóvel em exibição. Se vazio, usa o texto fixo abaixo."
          options={[
            { value: '', label: '— Texto fixo —' },
            ...Object.entries(PROPERTY_BINDING_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
      )}
      <TextAreaField
        label={element.binding ? 'Texto fallback (se o campo estiver vazio)' : 'Conteúdo'}
        value={element.content}
        onChange={onContent}
      />
      <SelectField
        label="Tag"
        value={element.tag}
        onChange={onTag}
        options={[
          { value: 'h1', label: 'Título 1 (H1)' },
          { value: 'h2', label: 'Título 2 (H2)' },
          { value: 'h3', label: 'Título 3 (H3)' },
          { value: 'h4', label: 'Título 4 (H4)' },
          { value: 'p', label: 'Parágrafo' },
          { value: 'span', label: 'Span' },
        ]}
      />
    </>
  );
}
