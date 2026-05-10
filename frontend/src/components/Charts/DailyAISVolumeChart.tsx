import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeSeriesData } from '../../types';
import { format, parseISO } from 'date-fns';

interface DailyAISVolumeChartProps {
  data: TimeSeriesData[];
}

const WINDOW = 21;

export default function DailyAISVolumeChart({ data }: DailyAISVolumeChartProps) {
  const trimmed = [...data].slice(-WINDOW).map((d) => ({
    ...d,
    label: safeFormat(d.date),
  }));

  if (trimmed.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-sm text-slate-600">
        No timeline data from the API.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">AIS message volume</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Stacked daily position reports ({WINDOW}-day slice). Bottom: pings from MMSIs flagged anomalous; top: remainder.
        </p>
      </div>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trimmed} margin={{ bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              angle={trimmed.length > 14 ? -35 : 0}
              textAnchor={trimmed.length > 14 ? 'end' : 'middle'}
              height={trimmed.length > 14 ? 56 : 32}
              interval={0}
            />
            <YAxis
              tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : `${v}`)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'normal' ? 'Other pings' : name === 'anomaly' ? 'Flagged MMSI pings' : name,
              ]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date ? `Date ${payload[0].payload.date}` : ''
              }
            />
            <Legend
              formatter={(value) =>
                value === 'normal' ? 'Other MMSIs' : value === 'anomaly' ? 'Flagged MMSIs' : value
              }
            />
            <Bar dataKey="normal" stackId="vol" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="anomaly" stackId="vol" fill="#dc2626" radius={[6, 6, 0, 0]} />
          </BarChart>
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
