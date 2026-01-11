import { useState } from 'react';
import TrafficDensityMap from '../Maps/TrafficDensityMap';
import TrajectoriesMap from '../Maps/TrajectoriesMap';
import AnomalyDetectionMap from '../Maps/AnomalyDetectionMap';
import SurveillanceDashboard from '../Maps/SurveillanceDashboard';
import { 
  trafficDensityPoints, 
  mockTrajectories,
  generateMockTrajectories 
} from '../../data/mockData';

export default function MapsView() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'trajectories' | 'anomaly' | 'surveillance'>('traffic');

  // Get normal and anomalous trajectories for comparison
  const normalTraj = mockTrajectories.find(t => t.status === 'normal') || mockTrajectories[0];
  const anomalousTraj = mockTrajectories.find(t => t.status === 'anomaly') || {
    ...mockTrajectories[0],
    status: 'anomaly' as const,
    error: 0.000708,
    positions: mockTrajectories[0].positions.map((p, i) => ({
      ...p,
      latitude: p.latitude + (i >= 10 && i < 20 ? -0.2 : 0),
      longitude: p.longitude + (i >= 10 && i < 20 ? 0.2 : 0),
    })),
  };

  const tabs = [
    { id: 'traffic' as const, label: 'Traffic Density', count: trafficDensityPoints.length },
    { id: 'trajectories' as const, label: 'Sample Trajectories', count: mockTrajectories.length },
    { id: 'anomaly' as const, label: 'Anomaly Detection', count: 2 },
    { id: 'surveillance' as const, label: 'Surveillance Dashboard', count: mockTrajectories.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Maps & Trajectories</h2>
        <p className="text-gray-600">Interactive visualizations of vessel movements</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'traffic' && (
          <TrafficDensityMap points={trafficDensityPoints} />
        )}
        {activeTab === 'trajectories' && (
          <TrajectoriesMap trajectories={mockTrajectories} maxTrajectories={10} />
        )}
        {activeTab === 'anomaly' && (
          <AnomalyDetectionMap 
            normalTrajectory={normalTraj}
            anomalousTrajectory={anomalousTraj}
          />
        )}
        {activeTab === 'surveillance' && (
          <SurveillanceDashboard trajectories={mockTrajectories} maxTrajectories={20} />
        )}
      </div>
    </div>
  );
}