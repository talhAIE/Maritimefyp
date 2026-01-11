import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Trajectory } from '../../types';

interface SurveillanceDashboardProps {
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

export default function SurveillanceDashboard({ trajectories, maxTrajectories = 20 }: SurveillanceDashboardProps) {
  const displayTrajectories = trajectories.slice(0, maxTrajectories);
  const normalCount = displayTrajectories.filter(t => t.status === 'normal').length;
  const anomalyCount = displayTrajectories.filter(t => t.status === 'anomaly').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Surveillance Dashboard</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time vessel monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Vessels Monitored</div>
              <div className="text-2xl font-bold text-gray-900">{displayTrajectories.length}</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Cleared</div>
              <div className="text-2xl font-bold text-green-600">{normalCount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-600 font-medium">Flagged</div>
              <div className="text-2xl font-bold text-red-600">{anomalyCount}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[700px] w-full">
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
          {displayTrajectories.map((trajectory) => {
            const positions = trajectory.positions.map(p => [p.latitude, p.longitude] as [number, number]);
            const isAnomaly = trajectory.status === 'anomaly';
            
            return (
              <Polyline
                key={trajectory.mmsi}
                positions={positions}
                pathOptions={{
                  color: isAnomaly ? '#ef4444' : '#10b981',
                  weight: isAnomaly ? 4 : 2,
                  opacity: 0.8,
                  dashArray: isAnomaly ? '5, 5' : undefined,
                }}
              />
            );
          })}
        </MapContainer>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Cleared ({normalCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: '#ef4444' }}></div>
              <span className="text-gray-700 font-medium">Flagged ({anomalyCount})</span>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            Threshold: 0.000116 | Last scan: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}