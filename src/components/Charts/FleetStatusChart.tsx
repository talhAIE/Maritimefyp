import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Statistics } from '../../types';

interface FleetStatusChartProps {
  statistics: Statistics;
}

const CLEARED = '#0d9488';
const FLAGGED = '#dc2626';
const TRACK = '#e2e8f0';

export default function FleetStatusChart({ statistics }: FleetStatusChartProps) {
  const cleared = Math.max(0, statistics.totalVessels - statistics.anomaliesDetected);
  const flagged = statistics.anomaliesDetected;

  const data = [
    { name: 'Cleared (below MSE threshold)', value: cleared, key: 'cleared' as const },
    { name: 'Flagged (above threshold)', value: flagged, key: 'flagged' as const },
  ];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Fleet anomaly status</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Share of MMSIs by last-window reconstruction score vs the current threshold. When no model is loaded,
          everyone appears cleared.
        </p>
      </div>
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={2}
              stroke="#fff"
            >
              <Cell fill={data[0].value === 0 ? TRACK : CLEARED} />
              <Cell fill={data[1].value === 0 ? TRACK : FLAGGED} />
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Vessels']}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgb(15 23 42 / 0.08)',
              }}
            />
            <Legend verticalAlign="bottom" height={44} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {flagged === 0 && (
        <p className="mt-2 text-center text-xs text-slate-500">
          No flagged vessels — if the model is not loaded, scores are unavailable and all ships appear cleared.
        </p>
      )}
    </div>
  );
}
