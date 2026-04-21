import type { FormElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks } from '../context';

export function FormBlock({ element }: { element: FormElement }) {
  const { theme } = useBlocks();

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#fff',
        padding: 24,
        borderRadius: theme.borderRadius,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        width: '100%',
        ...elementStyleToCss(element.style),
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      {element.fields.map((field) => (
        <div key={field.id}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: '#334155',
              marginBottom: 6,
            }}
          >
            {field.label}
            {field.required && <span style={{ color: '#ef4444' }}> *</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              rows={4}
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #e2e8f0',
                borderRadius: theme.borderRadius,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          ) : field.type === 'select' ? (
            <select
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #e2e8f0',
                borderRadius: theme.borderRadius,
                background: '#fff',
              }}
            >
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #e2e8f0',
                borderRadius: theme.borderRadius,
              }}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        style={{
          height: 44,
          background: theme.primaryColor,
          color: '#fff',
          border: 'none',
          borderRadius: theme.borderRadius,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {element.submitLabel}
      </button>
    </form>
  );
}
