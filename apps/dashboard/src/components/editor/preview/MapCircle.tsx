interface MapCircleProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  primaryColor: string;
}

export function MapCircle({ latitude, longitude, radius, primaryColor }: MapCircleProps) {
  if (!latitude || !longitude) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-sm text-gray-400">Localização aproximada não disponível</p>
      </div>
    );
  }

  const zoom = radius <= 200 ? 16 : radius <= 500 ? 15 : radius <= 1000 ? 14 : 13;
  const circleSize = Math.min(70, Math.max(25, radius / 12));
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) || '';

  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${latitude},${longitude}&zoom=${zoom}&maptype=roadmap`
    : `https://maps.google.com/maps?ll=${latitude},${longitude}&z=${zoom}&t=m&output=embed`;

  return (
    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative bg-gray-100">
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full border-0"
        style={{ pointerEvents: 'none' }}
        loading="lazy"
        title="Mapa"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Privacy circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border-[3px]"
          style={{
            backgroundColor: `${primaryColor}20`,
            borderColor: `${primaryColor}80`,
            width: `${circleSize}%`,
            aspectRatio: '1',
            maxWidth: 280,
            maxHeight: 280,
            minWidth: 80,
            minHeight: 80,
          }}
        />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-lg" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Label */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
        <p className="text-xs text-gray-600 font-medium">Localização aproximada</p>
      </div>
    </div>
  );
}
