import { useEffect, useState } from 'react';
import AlertsTable from '../Tables/AlertsTable';
import { getAlerts } from '../../api/client';
import type { AnomalyAlert } from '../../types';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

export default function AlertsView() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getAlerts();
        if (!cancelled) {
          setAlerts(list);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const newAlerts = alerts.filter((a) => a.status === 'new').length;
  const highSeverity = alerts.filter((a) => a.severity === 'high').length;

  if (!loaded && !error) {
    return <div className="text-gray-600">Loading alerts…</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Could not load alerts</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Anomaly Alerts</h2>
        <p className="text-gray-600">Detected anomalies and security alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">New Alerts</p>
              <p className="text-3xl font-bold text-red-600">{newAlerts}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">High Severity</p>
              <p className="text-3xl font-bold text-orange-600">{highSeverity}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <AlertsTable alerts={alerts} />
    </div>
  );
}
