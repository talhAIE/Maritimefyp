import { useEffect, useState } from 'react';
import TrafficDensityMap from '../Maps/TrafficDensityMap';
import TrajectoriesMap from '../Maps/TrajectoriesMap';
import AnomalyDetectionMap from '../Maps/AnomalyDetectionMap';
import SurveillanceDashboard from '../Maps/SurveillanceDashboard';
import { getAnomalyPair, getHealth, getTrafficDensity, getTrajectories } from '../../api/client';
import type { Trajectory } from '../../types';

export default function MapsView() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'trajectories' | 'anomaly' | 'surveillance'>('traffic');
  const [trafficDensityPoints, setTrafficDensityPoints] = useState<[number, number, number][]>([]);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [anomalyPair, setAnomalyPair] = useState<{
    normalTrajectory: Trajectory;
    anomalousTrajectory: Trajectory;
  } | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mseThreshold, setMseThreshold] = useState<number | null>(null);
  const [dataRefreshedAt, setDataRefreshedAt] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pts, trajs, health] = await Promise.all([
          getTrafficDensity(8000),
          getTrajectories(50),
          getHealth(),
        ]);
        if (!cancelled) {
          setTrafficDensityPoints(pts);
          setTrajectories(trajs);
          setMseThreshold(typeof health.threshold === 'number' ? health.threshold : null);
          setDataRefreshedAt(new Date().toLocaleString());
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'anomaly') return;
    let cancelled = false;
    setPairError(null);
    (async () => {
      try {
        const pair = await getAnomalyPair();
        if (!cancelled) setAnomalyPair(pair);
      } catch (e) {
        if (!cancelled)
          setPairError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const normalTraj = anomalyPair?.normalTrajectory ??
    trajectories.find((t) => t.status === 'normal') ?? {
      mmsi: 0,
      positions: [],
      status: 'normal' as const,
    };
  const anomalousTraj = anomalyPair?.anomalousTrajectory ??
    trajectories.find((t) => t.status === 'anomaly') ??
    ({
      ...normalTraj,
      status: 'anomaly' as const,
      mmsi: normalTraj.mmsi + 1,
    } satisfies Trajectory);

  const tabs = [
    { id: 'traffic' as const, label: 'Traffic Density', count: trafficDensityPoints.length },
    { id: 'trajectories' as const, label: 'Sample Trajectories', count: trajectories.length },
    { id: 'anomaly' as const, label: 'Anomaly Detection', count: anomalyPair ? 2 : 0 },
    { id: 'surveillance' as const, label: 'Surveillance Dashboard', count: trajectories.length },
  ];

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Could not load maps</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

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
          <>
            {trafficDensityPoints.length === 0 ? (
              <div className="text-gray-600">Loading map data…</div>
            ) : (
              <TrafficDensityMap points={trafficDensityPoints} />
            )}
          </>
        )}
        {activeTab === 'trajectories' && <TrajectoriesMap trajectories={trajectories} maxTrajectories={10} />}
        {activeTab === 'anomaly' && (
          <>
            {pairError && (
              <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Anomaly pair: {pairError}
              </div>
            )}
            {!anomalyPair && !pairError && (
              <div className="text-gray-600 mb-4">Loading anomaly comparison…</div>
            )}
            {normalTraj.positions.length > 0 && anomalousTraj.positions.length > 0 && (
              <AnomalyDetectionMap normalTrajectory={normalTraj} anomalousTrajectory={anomalousTraj} />
            )}
          </>
        )}
        {activeTab === 'surveillance' && (
          <SurveillanceDashboard
            trajectories={trajectories}
            maxTrajectories={20}
            threshold={mseThreshold}
            dataRefreshedAt={dataRefreshedAt}
          />
        )}
      </div>
    </div>
  );
}
