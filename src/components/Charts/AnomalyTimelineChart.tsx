import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeSeriesData } from '../../types';
import { format } from 'date-fns';

interface AnomalyTimelineChartProps {
  data: TimeSeriesData[];
}

export default function AnomalyTimelineChart({ data }: AnomalyTimelineChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection Timeline</h3>
        <p className="text-sm text-gray-600 mt-1">Daily detection trends over time</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="normal" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Normal"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="anomaly" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Anomalies"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}