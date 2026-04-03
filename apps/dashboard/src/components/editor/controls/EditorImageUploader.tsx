import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useR2Upload } from '../../../hooks/useR2Upload';
import { api } from '../../../lib/api';

interface EditorImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: 'banners' | 'logos' | 'gallery';
  aspectRatio?: string;
}

export function EditorImageUploader({
  label,
  value,
  onChange,
  folder = 'gallery',
  aspectRatio,
}: EditorImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useR2Upload();
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Formato inválido. Use PNG, JPG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem excede 5MB');
      return;
    }

    setError('');
    try {
      const url = await upload(file, { folder });
      onChange(url);
    } catch {
      setError('Erro ao enviar imagem');
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <img
            src={value}
            alt=""
            className="w-full object-cover"
            style={{ aspectRatio: aspectRatio || '16/9' }}
          />
          <button
            type="button"
            onClick={() => {
              if (value) api.delete('/upload/file', { data: { url: value } }).catch(() => {});
              onChange(null);
            }}
            className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-300" />
              <span className="text-xs text-gray-500">Clique para enviar</span>
            </div>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
