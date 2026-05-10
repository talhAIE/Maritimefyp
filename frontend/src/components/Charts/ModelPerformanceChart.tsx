import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Statistics } from '../../types';

interface ModelPerformanceChartProps {
  statistics: Statistics;
}

const COLORS = ['#1d4ed8', '#0d9488', '#ea580c', '#7c3aed'];

export default function ModelPerformanceChart({ statistics }: ModelPerformanceChartProps) {
  const data = [
    { name: 'Accuracy', score: statistics.accuracy },
    { name: 'Precision', score: statistics.precision },
    { name: 'Recall', score: statistics.recall },
    { name: 'F1-score', score: statistics.f1Score },
  ].filter((d) => d.score > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[320px] flex-col rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Model metrics</h3>
        <p className="mt-1 text-sm text-slate-600">
          Metrics come from evaluation run (served via API). No values yet — add{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">model_saved/evaluation_metrics.json</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Model metrics</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Reported test performance (percentage). Sourced from the backend evaluation file — not recomputed live.
        </p>
      </div>
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fill: '#475569', fontSize: 12 }}
              stroke="#cbd5e1"
            />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(2)}%`, 'Score']}
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
