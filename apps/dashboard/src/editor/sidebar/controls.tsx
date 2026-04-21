import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useR2Upload } from '../../hooks/useR2Upload';

interface BaseProps {
  label: string;
  hint?: string;
}

export function Field({ label, hint, children }: BaseProps & { children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </label>
  );
}

interface TextFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({ label, value, onChange, placeholder, hint }: TextFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 px-2 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
      />
    </Field>
  );
}

interface TextAreaProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, rows = 3, hint }: TextAreaProps) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none"
      />
    </Field>
  );
}

interface NumberFieldProps extends BaseProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberField({ label, value, onChange, min, max, step = 1, suffix, hint }: NumberFieldProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) onChange(n);
  };
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={handle}
          min={min}
          max={max}
          step={step}
          className="w-full h-8 px-2 pr-8 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

interface SelectFieldProps<T extends string> extends BaseProps {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

export function SelectField<T extends string>({ label, value, onChange, options, hint }: SelectFieldProps<T>) {
  return (
    <Field label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full h-8 px-2 text-sm border border-slate-200 rounded-md bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

interface ColorFieldProps extends BaseProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange, hint }: ColorFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 border border-slate-200 rounded-md cursor-pointer"
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 h-8 px-2 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
      </div>
    </Field>
  );
}

interface ToggleGroupProps<T extends string> extends BaseProps {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
}

export function ToggleGroup<T extends string>({ label, value, onChange, options, hint }: ToggleGroupProps<T>) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-0.5 bg-slate-100 rounded-md p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title}
            className={`flex-1 px-2 py-1 rounded text-xs font-medium flex items-center justify-center ${
              value === o.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

interface ImageUploadFieldProps extends BaseProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: 'banners' | 'logos' | 'gallery';
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'gallery',
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { upload, uploading, progress } = useR2Upload();

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    try {
      const url = await upload(file, { folder });
      onChange(url);
    } catch (err) {
      console.error('[upload] failed:', err);
    }
  }

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be picked again.
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <Field label={label} hint={hint}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      {value ? (
        <div className="relative border border-slate-200 rounded-md overflow-hidden group">
          <img src={value} alt="" className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[11px] bg-white px-2 py-1 rounded hover:bg-slate-50"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] bg-white text-red-600 p-1 rounded hover:bg-slate-50"
              title="Remover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-1 p-4 border border-dashed rounded-md cursor-pointer text-xs text-slate-500 transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>{progress}%</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Clique ou arraste uma imagem</span>
            </>
          )}
        </div>
      )}
    </Field>
  );
}

interface ToggleProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-sm text-slate-700">{label}</span>
        {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
