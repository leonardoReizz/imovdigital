import { useEditorStore } from '../../store/editorStore';
import { ColorPicker, FontSelector, EditorImageUploader, RangeSlider } from './controls';
import { RotateCcw } from 'lucide-react';
import { SITE_TEMPLATES, type SiteTemplate } from '@imovdigital/types';

export function GlobalSettings() {
  const config = useEditorStore((s) => s.config);
  const updateGlobal = useEditorStore((s) => s.updateGlobal);

  if (!config) return null;

  const currentTemplate = (config.template || 'classic') as SiteTemplate;

  const handleReset = () => {
    updateGlobal({
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Inter',
      fontSize: 16,
    } as any);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Template do site</label>
        <div className="grid grid-cols-2 gap-2">
          {SITE_TEMPLATES.map((tpl) => {
            const active = currentTemplate === tpl.value;
            return (
              <button
                key={tpl.value}
                type="button"
                onClick={() => updateGlobal({ template: tpl.value } as any)}
                className={`text-left rounded-lg border p-2.5 transition-colors ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className={`text-xs font-semibold ${active ? 'text-primary' : 'text-gray-700'}`}>{tpl.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{tpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <EditorImageUploader
          label="Logo"
          value={config.logoUrl}
          onChange={(v) => updateGlobal({ logoUrl: v })}
          folder="logos"
          aspectRatio="3/1"
        />
        <p className="text-[10px] text-gray-400 mt-1">Recomendado: 600×200px, PNG transparente</p>
        <RangeSlider
          label="Tamanho da logo (navbar)"
          value={(config as any).logoSize || 32}
          onChange={(v) => updateGlobal({ logoSize: v } as any)}
          min={20}
          max={80}
          step={2}
          suffix="px"
        />
      </div>

      <div>
        <EditorImageUploader
          label="Favicon"
          value={config.faviconUrl}
          onChange={(v) => updateGlobal({ faviconUrl: v })}
          folder="logos"
          aspectRatio="1/1"
        />
        <p className="text-[10px] text-gray-400 mt-1">Recomendado: 32×32px ou 64×64px, PNG ou ICO</p>
      </div>

      <ColorPicker
        label="Cor primária"
        value={config.primaryColor}
        onChange={(v) => updateGlobal({ primaryColor: v })}
      />

      <ColorPicker
        label="Cor secundária"
        value={config.secondaryColor}
        onChange={(v) => updateGlobal({ secondaryColor: v })}
      />

      <FontSelector
        label="Fonte principal"
        value={config.fontFamily}
        onChange={(v) => updateGlobal({ fontFamily: v })}
      />

      <RangeSlider
        label="Tamanho da fonte"
        value={(config as any).fontSize || 16}
        onChange={(v) => updateGlobal({ fontSize: v } as any)}
        min={12}
        max={22}
        step={1}
        suffix="px"
      />

      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Resetar para padrão
      </button>
    </div>
  );
}
