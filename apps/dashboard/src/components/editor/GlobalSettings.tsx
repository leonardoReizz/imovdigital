import { useEditorStore } from '../../store/editorStore';
import { ColorPicker, FontSelector, EditorImageUploader } from './controls';
import { RotateCcw } from 'lucide-react';

export function GlobalSettings() {
  const config = useEditorStore((s) => s.config);
  const updateGlobal = useEditorStore((s) => s.updateGlobal);

  if (!config) return null;

  const handleReset = () => {
    updateGlobal({
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Inter',
    });
  };

  return (
    <div className="space-y-5">
      <EditorImageUploader
        label="Logo"
        value={config.logoUrl}
        onChange={(v) => updateGlobal({ logoUrl: v })}
        folder="logos"
        aspectRatio="3/1"
      />

      <EditorImageUploader
        label="Favicon"
        value={config.faviconUrl}
        onChange={(v) => updateGlobal({ faviconUrl: v })}
        folder="logos"
        aspectRatio="1/1"
      />

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
