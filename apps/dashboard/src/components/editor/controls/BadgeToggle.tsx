interface BadgeToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BadgeToggle({ label, value, onChange }: BadgeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            value ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}
