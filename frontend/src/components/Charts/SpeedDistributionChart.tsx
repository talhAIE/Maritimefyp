import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SpeedDistribution } from '../../types';

interface SpeedDistributionChartProps {
  data: SpeedDistribution[];
}

export default function SpeedDistributionChart({ data }: SpeedDistributionChartProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Speed distribution</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Speed over ground (knots) across AIS pings — shows typical operating bands and slow traffic.
        </p>
      </div>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 4 }}>
            <defs>
              <linearGradient id="speedArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="speed"
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              label={{ value: 'Speed (kn)', fill: '#94a3b8', fontSize: 11, position: 'bottom', offset: 0 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              tickFormatter={(v) =>
                `${v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : v}`
              }
            />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
              formatter={(value: number) => [value.toLocaleString(), 'Pings']}
            />
            <Area
              type="stepAfter"
              dataKey="count"
              stroke="#1d4ed8"
              strokeWidth={2}
              fill="url(#speedArea)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
