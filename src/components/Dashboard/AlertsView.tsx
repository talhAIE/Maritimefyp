import AlertsTable from '../Tables/AlertsTable';
import { mockAlerts } from '../../data/mockData';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

export default function AlertsView() {
  const newAlerts = mockAlerts.filter(a => a.status === 'new').length;
  const highSeverity = mockAlerts.filter(a => a.severity === 'high').length;

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
              <p className="text-3xl font-bold text-gray-900">{mockAlerts.length}</p>
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

      <AlertsTable alerts={mockAlerts} />
    </div>
  );
}