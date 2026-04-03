import { forwardRef } from 'react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  value: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="tel"
        value={formatPhone(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
          onChange(raw);
        }}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

// Standalone format function for use in other contexts
export { formatPhone };
