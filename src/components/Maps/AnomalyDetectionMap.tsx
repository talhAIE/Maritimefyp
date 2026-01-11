import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Trajectory } from '../../types';

interface AnomalyDetectionMapProps {
  normalTrajectory: Trajectory;
  anomalousTrajectory: Trajectory;
}

function MapBounds({ normalTrajectory, anomalousTrajectory }: AnomalyDetectionMapProps) {
  const map = useMap();
  
  useEffect(() => {
    const allPositions = [
      ...normalTrajectory.positions,
      ...anomalousTrajectory.positions
    ];
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(
        allPositions.map(p => [p.latitude, p.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [normalTrajectory, anomalousTrajectory, map]);
  
  return null;
}

export default function AnomalyDetectionMap({ normalTrajectory, anomalousTrajectory }: AnomalyDetectionMapProps) {
  const normalPositions = normalTrajectory.positions.map(p => [p.latitude, p.longitude] as [number, number]);
  const anomalousPositions = anomalousTrajectory.positions.map(p => [p.latitude, p.longitude] as [number, number]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection Comparison</h3>
        <p className="text-sm text-gray-600 mt-1">Normal vs. Anomalous trajectory comparison</p>
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
          <MapBounds normalTrajectory={normalTrajectory} anomalousTrajectory={anomalousTrajectory} />
          
          {/* Normal trajectory */}
          <Polyline
            positions={normalPositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
            }}
          />
          {normalPositions.length > 0 && (
            <>
              <Marker
                position={normalPositions[0]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [16, 16],
                })}
              />
              <Marker
                position={normalPositions[normalPositions.length - 1]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [16, 16],
                })}
              />
            </>
          )}
          
          {/* Anomalous trajectory */}
          <Polyline
            positions={anomalousPositions}
            pathOptions={{
              color: '#ef4444',
              weight: 4,
              opacity: 0.9,
              dashArray: '10, 10',
            }}
          />
          {anomalousPositions.length > 0 && (
            <Marker
              position={anomalousPositions[10]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 12px; font-weight: bold;">!</span></div>',
                iconSize: [20, 20],
              })}
            />
          )}
        </MapContainer>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="border-r border-gray-200 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="font-semibold text-gray-900">Normal Trajectory</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">CLEARED</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Error: {normalTrajectory.error?.toFixed(6) || 'N/A'}</div>
              <div>MMSI: {normalTrajectory.mmsi}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-gray-900">Anomalous Trajectory</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">DETECTED</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Error: {anomalousTrajectory.error?.toFixed(6) || 'N/A'}</div>
              <div>MMSI: {anomalousTrajectory.mmsi}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}