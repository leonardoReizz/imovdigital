import { useEditorStore } from '../../store/editorStore';
import type { SearchPageConfig } from '@imovdigital/types';
import {
  ToggleGroup,
  SelectField,
  BadgeToggle,
  RangeSlider,
} from './controls';

export function SearchPageSettings() {
  const config = useEditorStore((s) => s.config);
  const updateGlobal = useEditorStore((s) => s.updateGlobal);

  if (!config) return null;

  const sp = config.searchPage;

  const update = (key: keyof SearchPageConfig, value: unknown) => {
    updateGlobal({
      searchPage: { ...sp, [key]: value },
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* Pagination */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Paginação</h4>
        <div className="space-y-3">
          <ToggleGroup
            label="Tipo"
            value={sp.pagination}
            onChange={(v) => update('pagination', v)}
            options={[
              { value: 'paginated', label: 'Páginas' },
              { value: 'infinite_scroll', label: 'Scroll infinito' },
            ]}
          />
          {sp.pagination === 'paginated' && (
            <RangeSlider
              label="Imóveis por página"
              value={sp.itemsPerPage}
              onChange={(v) => update('itemsPerPage', v)}
              min={6}
              max={24}
              step={3}
            />
          )}
        </div>
      </div>

      {/* Layout */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Layout</h4>
        <div className="space-y-3">
          <ToggleGroup
            label="Visualização"
            value={sp.layout}
            onChange={(v) => update('layout', v)}
            options={[
              { value: 'grid', label: 'Grade' },
              { value: 'list', label: 'Lista' },
            ]}
          />
          {sp.layout === 'grid' && (
            <ToggleGroup
              label="Colunas"
              value={String(sp.columns)}
              onChange={(v) => update('columns', Number(v))}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
            />
          )}
          <BadgeToggle
            label="Carrossel de imagens no card"
            value={sp.cardCarousel ?? true}
            onChange={(v) => update('cardCarousel', v)}
          />
        </div>
      </div>

      {/* Filters */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filtros</h4>
        <div className="space-y-3">
          <SelectField
            label="Posição dos filtros"
            value={sp.filterPosition}
            onChange={(v) => update('filterPosition', v)}
            options={[
              { value: 'top', label: 'Barra superior' },
              { value: 'sidebar', label: 'Sidebar lateral' },
            ]}
          />
          <BadgeToggle label="Tipo de imóvel" value={sp.showTypeFilter} onChange={(v) => update('showTypeFilter', v)} />
          <BadgeToggle label="Modalidade (venda/aluguel)" value={sp.showListingFilter} onChange={(v) => update('showListingFilter', v)} />
          <BadgeToggle label="Quartos" value={sp.showBedroomsFilter} onChange={(v) => update('showBedroomsFilter', v)} />
          <BadgeToggle label="Banheiros" value={sp.showBathroomsFilter ?? true} onChange={(v) => update('showBathroomsFilter', v)} />
          <BadgeToggle label="Vagas de garagem" value={sp.showParkingFilter ?? true} onChange={(v) => update('showParkingFilter', v)} />
          <BadgeToggle label="Cidade" value={sp.showCityFilter} onChange={(v) => update('showCityFilter', v)} />
          <BadgeToggle label="Bairro" value={sp.showNeighborhoodFilter} onChange={(v) => update('showNeighborhoodFilter', v)} />
          <BadgeToggle label="Faixa de preço" value={sp.showPriceFilter} onChange={(v) => update('showPriceFilter', v)} />
        </div>
      </div>
    </div>
  );
}
