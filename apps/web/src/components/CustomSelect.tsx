'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function CustomSelect({ options, value, onChange, placeholder = 'Selecione', className, compact }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-1.5 transition-colors ${
          compact
            ? `bg-transparent text-sm cursor-pointer outline-none ${selected ? 'text-gray-700' : 'text-gray-400'}`
            : `px-3 py-2.5 bg-white border rounded-lg text-sm ${open ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`
        }`}
      >
        <span className={`truncate ${!compact && (selected ? 'text-gray-900' : 'text-gray-400')}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute z-50 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1 ${
          compact ? 'left-0 min-w-[180px]' : 'left-0 right-0'
        }`}>
          {/* Clear option */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors whitespace-nowrap ${
                opt.value === value
                  ? 'bg-gray-50 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
              {opt.value === value && <Check className="w-3.5 h-3.5 text-[--color-primary] ml-2" />}
            </button>
          ))}
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">Nenhuma opção</p>
          )}
        </div>
      )}
    </div>
  );
}
