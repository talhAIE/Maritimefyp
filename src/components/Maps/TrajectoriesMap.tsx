import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Trajectory } from '../../types';

interface TrajectoriesMapProps {
  trajectories: Trajectory[];
  maxTrajectories?: number;
}

function MapBounds({ trajectories }: { trajectories: Trajectory[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (trajectories.length > 0) {
      const allPositions = trajectories.flatMap(t => t.positions);
      if (allPositions.length > 0) {
        const bounds = L.latLngBounds(
          allPositions.map(p => [p.latitude, p.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [trajectories, map]);
  
  return null;
}

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export default function TrajectoriesMap({ trajectories, maxTrajectories = 10 }: TrajectoriesMapProps) {
  const displayTrajectories = trajectories.slice(0, maxTrajectories);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Sample Vessel Trajectories</h3>
        <p className="text-sm text-gray-600 mt-1">Individual ship paths over time</p>
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
          <MapBounds trajectories={displayTrajectories} />
          {displayTrajectories.map((trajectory, index) => {
            const positions = trajectory.positions.map(p => [p.latitude, p.longitude] as [number, number]);
            const color = colors[index % colors.length];
            
            return (
              <div key={trajectory.mmsi}>
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color,
                    weight: 3,
                    opacity: 0.8,
                  }}
                />
                {positions.length > 0 && (
                  <>
                    <Marker
                      position={positions[0]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [12, 12],
                      })}
                    />
                    <Marker
                      position={positions[positions.length - 1]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: ${color === '#ef4444' ? '#ef4444' : '#10b981'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [12, 12],
                      })}
                    />
                  </>
                )}
              </div>
            );
          })}
        </MapContainer>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {displayTrajectories.length} of {trajectories.length} trajectories
          </span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Start Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">End Point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}