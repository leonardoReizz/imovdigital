interface MapCircleProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  primaryColor: string;
}

export function MapCircle({ latitude, longitude, radius, primaryColor }: MapCircleProps) {
  // If no coordinates, show placeholder
  if (!latitude || !longitude) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-sm text-gray-400">Localização aproximada não disponível</p>
      </div>
    );
  }

  const zoom = radius <= 200 ? 16 : radius <= 500 ? 15 : radius <= 1000 ? 14 : 13;

  return (
    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative bg-gray-100">
      {/* Map tiles - 3x3 grid for coverage */}
      <div className="absolute inset-0">
        {renderTileGrid(latitude, longitude, zoom)}
      </div>

      {/* Privacy circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border-4 opacity-30"
          style={{
            backgroundColor: primaryColor,
            borderColor: primaryColor,
            width: `${Math.min(80, Math.max(30, radius / 15))}%`,
            aspectRatio: '1',
          }}
        />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-3 h-3 rounded-full shadow-lg"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Label */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
        <p className="text-xs text-gray-600">Localização aproximada</p>
      </div>

      {/* OSM attribution */}
      <div className="absolute bottom-1 right-1 text-[8px] text-gray-400 bg-white/60 px-1 rounded">
        © OpenStreetMap
      </div>
    </div>
  );
}

// Tile math helpers
function lonToTileX(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function latToTileY(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  );
}

function renderTileGrid(lat: number, lon: number, zoom: number) {
  const centerX = lonToTileX(lon, zoom);
  const centerY = latToTileY(lat, zoom);
  const tiles: React.ReactNode[] = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      tiles.push(
        <img
          key={`${x}-${y}`}
          src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
          alt=""
          className="absolute"
          style={{
            width: '33.34%',
            height: '33.34%',
            left: `${(dx + 1) * 33.34}%`,
            top: `${(dy + 1) * 33.34}%`,
          }}
          draggable={false}
        />,
      );
    }
  }
  return tiles;
}
