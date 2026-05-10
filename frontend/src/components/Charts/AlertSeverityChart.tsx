import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AnomalyAlert } from '../../types';

interface AlertSeverityChartProps {
  alerts: AnomalyAlert[];
}

const SEV_COLORS = { low: '#38bdf8', medium: '#f59e0b', high: '#dc2626' } as const;

export default function AlertSeverityChart({ alerts }: AlertSeverityChartProps) {
  const low = alerts.filter((a) => a.severity === 'low').length;
  const medium = alerts.filter((a) => a.severity === 'medium').length;
  const high = alerts.filter((a) => a.severity === 'high').length;

  const data = [
    { name: 'Low', value: low, fill: SEV_COLORS.low },
    { name: 'Medium', value: medium, fill: SEV_COLORS.medium },
    { name: 'High', value: high, fill: SEV_COLORS.high },
  ].filter((d) => d.value > 0);

  if (alerts.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Alerts by severity</h3>
        <p className="mt-1 text-sm text-slate-600">
          No open alerts from the API — load model + scaler to produce flagged MMSIs, or widen the anomaly threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Alerts by severity</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Distribution of flagged vessels ({alerts.length} total). Severity is derived from reconstruction error vs
          threshold.
        </p>
      </div>
      <div className="mx-auto mt-4 h-[220px] w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={88}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, 'Alerts']} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
