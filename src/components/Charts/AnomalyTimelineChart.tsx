import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesData } from '../../types';
import { format, parseISO } from 'date-fns';

interface AnomalyTimelineChartProps {
  data: TimeSeriesData[];
}

/** Full timeline for anomaly rate context; condensed labels on X. */
export default function AnomalyTimelineChart({ data }: AnomalyTimelineChartProps) {
  const formatted = [...data].map((item) => ({
    ...item,
    shortDate: safeFormat(item.date),
  }));

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Anomaly intensity</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Daily counts (line = anomaly pings · filled area = baseline traffic). Helps spot unusual bursts.
        </p>
      </div>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formatted} margin={{ bottom: 4 }}>
            <defs>
              <linearGradient id="fillNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortDate"
              stroke="#cbd5e1"
              tick={{ fill: '#64748b', fontSize: 10 }}
              angle={formatted.length > 14 ? -32 : 0}
              textAnchor={formatted.length > 14 ? 'end' : 'middle'}
              height={formatted.length > 14 ? 48 : 34}
              interval={formatted.length > 20 ? Math.floor(formatted.length / 12) : 'preserveEnd'}
            />
            <YAxis
              tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : `${v}`)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              width={48}
            />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'normal' ? 'Other pings' : name === 'anomaly' ? 'Flagged MMSI pings' : name,
              ]}
              labelFormatter={(_, p) =>
                (p?.[0]?.payload as TimeSeriesData | undefined)?.date
                  ? `Day ${(p![0].payload as TimeSeriesData).date}`
                  : ''
              }
            />
            <Legend
              formatter={(value) =>
                value === 'normal' ? 'Other pings (area)' : value === 'anomaly' ? 'Flagged MMSI pings' : value
              }
            />
            <Area
              type="monotone"
              dataKey="normal"
              stroke="#64748b"
              strokeWidth={1}
              fill="url(#fillNormal)"
              name="normal"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="anomaly"
              stroke="#dc2626"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0, fill: '#dc2626' }}
              activeDot={{ r: 5 }}
              name="anomaly"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function safeFormat(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d');
  } catch {
    return isoDate;
  }
}
