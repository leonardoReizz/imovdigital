import { useEffect, useRef, useState } from 'react';
import { X, Palette, Upload, Trash2 } from 'lucide-react';
import { useEditorStore } from './store';
import { ColorField, SelectField } from './sidebar/controls';
import { useR2Upload } from '../hooks/useR2Upload';
import type { TenantTheme } from './api';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Playfair Display', label: 'Playfair Display (serif)' },
  { value: 'Merriweather', label: 'Merriweather (serif)' },
  { value: 'system-ui, -apple-system, sans-serif', label: 'Sistema (padrão do OS)' },
];

const RADIUS_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: 'Quadrado' },
  { value: 4, label: 'Sutil' },
  { value: 8, label: 'Padrão' },
  { value: 16, label: 'Arredondado' },
  { value: 24, label: 'Pílula' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ThemePanel({ open, onClose }: Props) {
  const tenantTheme = useEditorStore((s) => s.tenantTheme);
  const savingTheme = useEditorStore((s) => s.savingTheme);
  const saveTenantTheme = useEditorStore((s) => s.saveTenantTheme);
  const setTenantThemeLocal = useEditorStore((s) => s.setTenantThemeLocal);
  const { upload, uploading } = useR2Upload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Snapshot the theme when the panel opens so we can revert on cancel.
  // Live edits go through setTenantThemeLocal → store → Canvas rerenders.
  const [original, setOriginal] = useState<TenantTheme | null>(null);

  useEffect(() => {
    if (open && tenantTheme && !original) {
      setOriginal({ ...tenantTheme });
    }
    if (!open) setOriginal(null);
  }, [open, tenantTheme, original]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function patch(p: Partial<TenantTheme>) {
    setTenantThemeLocal(p);
  }

  async function handleSave() {
    if (!tenantTheme) return;
    await saveTenantTheme(tenantTheme);
    setOriginal(null);
    onClose();
  }

  function handleCancel() {
    if (original) setTenantThemeLocal(original);
    setOriginal(null);
    onClose();
  }

  async function handleFaviconUpload(file: File) {
    const publicUrl = await upload(file, { folder: 'logos' });
    patch({ faviconUrl: publicUrl });
  }

  return (
    <div
      onClick={handleCancel}
      className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" />
            Tema global
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!tenantTheme ? (
          <div className="p-8 text-center text-sm text-slate-400">Carregando tema…</div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500">
              Essas configurações valem para <strong>todas as páginas</strong> do site —
              botões, cards de imóvel, barra de busca e tipografia seguem o mesmo tema.
              O canvas atualiza em tempo real; clique em cancelar pra descartar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6">
              <ColorField
                label="Cor primária"
                value={tenantTheme.primaryColor}
                onChange={(primaryColor) => patch({ primaryColor })}
                hint="Usada em botões, destaques, preços e links."
              />

              <ColorField
                label="Cor secundária"
                value={tenantTheme.secondaryColor}
                onChange={(secondaryColor) => patch({ secondaryColor })}
                hint="Variação complementar (ex: botão secundário)."
              />

              <SelectField
                label="Fonte"
                value={tenantTheme.fontFamily}
                onChange={(fontFamily) => patch({ fontFamily })}
                options={FONT_OPTIONS}
              />

              <div>
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
                  Arredondamento
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Raio de borda de botões, cards, campos e caixas do site.
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {RADIUS_PRESETS.map((preset) => {
                    const isActive = tenantTheme.borderRadius === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => patch({ borderRadius: preset.value })}
                        className={`flex flex-col items-center gap-1 py-2 border text-[10px] font-medium transition-colors ${
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                        style={{ borderRadius: 6 }}
                      >
                        <span
                          className={`w-6 h-6 border-2 ${isActive ? 'border-white' : 'border-slate-400'}`}
                          style={{ borderRadius: preset.value }}
                        />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
                  Favicon
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Imagem quadrada exibida na aba do navegador. PNG, SVG ou ICO, idealmente 32×32 ou 64×64.
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0"
                  >
                    {tenantTheme.faviconUrl ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img
                        src={tenantTheme.faviconUrl}
                        alt="favicon"
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">vazio</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFaviconUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Enviando…' : tenantTheme.faviconUrl ? 'Substituir' : 'Enviar'}
                  </button>
                  {tenantTheme.faviconUrl && (
                    <button
                      onClick={() => patch({ faviconUrl: null })}
                      className="px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md flex items-center gap-1"
                      title="Remover favicon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="mt-4 p-4 rounded-md border border-slate-200"
              style={{ fontFamily: tenantTheme.fontFamily }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Pré-visualização
              </p>
              <h3 className="text-lg font-semibold" style={{ color: '#0f172a' }}>
                Seu novo lar começa aqui
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Imóveis selecionados para você.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-1.5 text-xs font-medium text-white"
                  style={{
                    background: tenantTheme.primaryColor,
                    borderRadius: tenantTheme.borderRadius,
                  }}
                >
                  Botão primário
                </button>
                <button
                  className="px-3 py-1.5 text-xs font-medium text-white"
                  style={{
                    background: tenantTheme.secondaryColor,
                    borderRadius: tenantTheme.borderRadius,
                  }}
                >
                  Secundário
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={savingTheme}
                className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
              >
                {savingTheme ? 'Salvando…' : 'Salvar tema'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
