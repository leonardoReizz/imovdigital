const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Source Sans 3',
  'PT Sans',
  'Oswald',
  'Noto Sans',
  'Rubik',
  'Work Sans',
  'DM Sans',
  'Outfit',
  'Plus Jakarta Sans',
  'Manrope',
];

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
}

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        style={{ fontFamily: value }}
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}
