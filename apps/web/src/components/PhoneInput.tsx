'use client';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder, required, className }: PhoneInputProps) {
  return (
    <input
      type="tel"
      value={formatPhone(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
}
