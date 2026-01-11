import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TrafficDensityMapProps {
  points: Array<[number, number, number]>;
}

function MapBounds({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points.map(p => [p[0], p[1]] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  
  return null;
}

export default function TrafficDensityMap({ points }: TrafficDensityMapProps) {
  // Get intensity range for color scaling
  const intensities = points.map(p => p[2]);
  const maxIntensity = Math.max(...intensities);
  const minIntensity = Math.min(...intensities);

  const getColor = (intensity: number) => {
    const normalized = (intensity - minIntensity) / (maxIntensity - minIntensity);
    if (normalized > 0.7) return '#ef4444'; // red
    if (normalized > 0.5) return '#f59e0b'; // orange
    if (normalized > 0.3) return '#eab308'; // yellow
    return '#3b82f6'; // blue
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Traffic Density Heatmap</h3>
        <p className="text-sm text-gray-600 mt-1">New York Harbor shipping lanes</p>
      </div>
      <div className="h-[600px] w-full">
        <MapContainer
          center={[40.65, -74.05]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds points={points} />
          {points.slice(0, 2000).map((point, index) => (
            <CircleMarker
              key={index}
              center={[point[0], point[1]]}
              radius={3 + point[2] * 5}
              pathOptions={{
                color: getColor(point[2]),
                fillColor: getColor(point[2]),
                fillOpacity: 0.6,
                opacity: 0.8,
              }}
            />
          ))}
        </MapContainer>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Low Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Medium Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">High Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Very High Traffic</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">{points.length.toLocaleString()} data points</span>
      </div>
    </div>
  );
}