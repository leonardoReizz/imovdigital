import { useEditorStore } from '../../store/editorStore';
import { ColorPicker, FontSelector, EditorImageUploader, RangeSlider, TextInput } from './controls';
import { RotateCcw, BarChart3 } from 'lucide-react';

export function GlobalSettings() {
  const config = useEditorStore((s) => s.config);
  const updateGlobal = useEditorStore((s) => s.updateGlobal);

  if (!config) return null;

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

      {/* Integrations */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Integrações</h4>
        </div>
        <TextInput
          label="Google Analytics (ID)"
          value={(config as any).googleAnalyticsId || ''}
          onChange={(v) => updateGlobal({ googleAnalyticsId: v || null } as any)}
          placeholder="G-XXXXXXXXXX"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Cole o Measurement ID do seu Google Analytics para rastrear visitas no seu site
        </p>
      </div>

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
