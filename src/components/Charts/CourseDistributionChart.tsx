import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CourseDistribution } from '../../types';

interface CourseDistributionChartProps {
  data: CourseDistribution[];
}

export default function CourseDistributionChart({ data }: CourseDistributionChartProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Course (heading)</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          COG buckets (15°) show dominant traffic corridors and tidal lane alignment in the AOI.
        </p>
      </div>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="course"
              tick={{ fill: '#64748b', fontSize: 10 }}
              stroke="#cbd5e1"
              interval={data.length > 16 ? 'preserveStartEnd' : 0}
              label={{ value: 'Degrees', fill: '#94a3b8', fontSize: 11, position: 'bottom', offset: 0 }}
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
            <Bar dataKey="count" fill="#0d9488" fillOpacity={0.92} radius={[4, 4, 2, 2]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
