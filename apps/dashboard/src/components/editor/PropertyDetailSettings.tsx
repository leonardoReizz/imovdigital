import { useEditorStore } from '../../store/editorStore';
import type { PropertyDetailConfig } from '@imovdigital/types';
import {
  ToggleGroup,
  SelectField,
  TextInput,
  BadgeToggle,
  RangeSlider,
} from './controls';

export function PropertyDetailSettings() {
  const config = useEditorStore((s) => s.config);
  const updateGlobal = useEditorStore((s) => s.updateGlobal);

  if (!config) return null;

  const pd = config.propertyDetail;

  const update = (key: keyof PropertyDetailConfig, value: unknown) => {
    updateGlobal({
      propertyDetail: { ...pd, [key]: value },
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* Gallery */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Galeria de Fotos</h4>
        <ToggleGroup
          label="Estilo da galeria"
          value={pd.galleryStyle}
          onChange={(v) => update('galleryStyle', v)}
          options={[
            { value: 'grid', label: 'Grade' },
            { value: 'carousel', label: 'Carrossel' },
            { value: 'single', label: 'Única' },
          ]}
        />
        <p className="text-xs text-gray-400 mt-1.5">Imagens são expansíveis ao clicar.</p>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Formulário de Contato</h4>
        <div className="space-y-3">
          <SelectField
            label="Posição"
            value={pd.contactPosition}
            onChange={(v) => update('contactPosition', v)}
            options={[
              { value: 'sidebar', label: 'Lateral (desktop)' },
              { value: 'bottom', label: 'Abaixo do conteúdo' },
              { value: 'floating', label: 'Flutuante (fixo)' },
            ]}
          />
          <BadgeToggle label="Mostrar formulário" value={pd.showContactForm} onChange={(v) => update('showContactForm', v)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ações Rápidas</h4>
        <div className="space-y-3">
          <BadgeToggle label="Botão WhatsApp" value={pd.showWhatsApp} onChange={(v) => update('showWhatsApp', v)} />
          {pd.showWhatsApp && (
            <TextInput label="Número WhatsApp" value={pd.whatsAppNumber} onChange={(v) => update('whatsAppNumber', v)} placeholder="+55 11 99999-9999" />
          )}
          <BadgeToggle label="Botão Telefone" value={pd.showPhone} onChange={(v) => update('showPhone', v)} />
          {pd.showPhone && (
            <TextInput label="Número Telefone" value={pd.phoneNumber} onChange={(v) => update('phoneNumber', v)} placeholder="+55 11 3333-3333" />
          )}
        </div>
      </div>

      {/* Address & Map */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Endereço e Mapa</h4>
        <div className="space-y-3">
          <BadgeToggle label="Mostrar endereço completo" value={pd.showAddress} onChange={(v) => update('showAddress', v)} />
          <BadgeToggle label="Mostrar mapa" value={pd.showMap} onChange={(v) => update('showMap', v)} />
          {pd.showMap && (
            <RangeSlider
              label="Raio de privacidade"
              value={pd.mapRadius}
              onChange={(v) => update('mapRadius', v)}
              min={100}
              max={2000}
              step={100}
              suffix="m"
            />
          )}
          {pd.showMap && !pd.showAddress && (
            <p className="text-xs text-gray-400">O mapa mostrará um círculo na região, sem revelar o endereço exato.</p>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Seções do Conteúdo</h4>
        <div className="space-y-3">
          <BadgeToggle label="Mostrar descrição" value={pd.showDescription} onChange={(v) => update('showDescription', v)} />
          <BadgeToggle label="Mostrar comodidades" value={pd.showAmenities} onChange={(v) => update('showAmenities', v)} />
          <BadgeToggle label="Mostrar custos adicionais" value={pd.showCosts} onChange={(v) => update('showCosts', v)} />
        </div>
      </div>
    </div>
  );
}
