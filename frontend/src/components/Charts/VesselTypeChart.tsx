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
import type { VesselTypeData } from '../../types';

interface VesselTypeChartProps {
  data: VesselTypeData[];
}

const TOP_VISIBLE = 8;
const BAR_COLORS = ['#2563eb', '#dc2626', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#ea580c'];
const OTHER_COLOR = '#94a3b8';

type ChartRow = {
  key: string;
  label: string;
  shortLabel: string;
  count: number;
  share: number;
  isOther?: boolean;
  /** Type codes folded into Other, for tooltip */
  foldedCodes?: number[];
};

function buildRows(raw: VesselTypeData[]): ChartRow[] {
  if (raw.length === 0) return [];

  const total = raw.reduce((s, d) => s + d.count, 0) || 1;
  const sorted = [...raw].sort((a, b) => b.count - a.count);

  const top = sorted.slice(0, TOP_VISIBLE);
  const rest = sorted.slice(TOP_VISIBLE);

  const rows: ChartRow[] = top.map((d) => ({
    key: `t-${d.type}`,
    label: formatLabel(d.typeName, d.type),
    shortLabel: truncate(formatLabel(d.typeName, d.type), 46),
    count: d.count,
    share: (d.count / total) * 100,
  }));

  if (rest.length > 0) {
    const foldedCodes = rest.map((d) => d.type);
    const count = rest.reduce((s, d) => s + d.count, 0);
    rows.push({
      key: 'other',
      label: `Other (${rest.length} AIS codes)`,
      shortLabel: `Other · ${rest.length} codes`,
      count,
      share: (count / total) * 100,
      isOther: true,
      foldedCodes,
    });
  }

  return rows;
}

function formatLabel(name: string, code: number): string {
  const base = name?.trim() || 'Unknown';
  return `${base} (${code})`;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export default function VesselTypeChart({ data }: VesselTypeChartProps) {
  const rows = buildRows(data);
  const maxCount = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  const chartHeight = Math.min(520, Math.max(260, rows.length * 44 + 56));

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-600">
        No vessel-type data from the API.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="mb-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Fleet mix</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Top {TOP_VISIBLE} AIS vessel categories by ping count; long tail merged into{' '}
          <span className="font-medium text-slate-700">Other</span> so the chart stays readable. Source: your CSV via
          the API.
        </p>
      </div>
      <div style={{ height: chartHeight }} className="mt-4 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ left: 4, right: 72, top: 4, bottom: 8 }}
            barCategoryGap={10}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, Math.ceil(maxCount * 1.08)]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#cbd5e1"
              tickFormatter={(v) =>
                `${v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `${Math.round(v / 1000)}k` : `${v}`}`
              }
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              width={168}
              tick={{ fill: '#334155', fontSize: 11 }}
              stroke="#cbd5e1"
              interval={0}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as ChartRow;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
                    <p className="font-medium text-slate-900">{row.label}</p>
                    <p className="mt-1 text-slate-600">
                      <span className="font-semibold tabular-nums text-slate-900">{row.count.toLocaleString()}</span>{' '}
                      pings ·{' '}
                      <span className="tabular-nums">{row.share.toFixed(1)}%</span>
                    </p>
                    {row.isOther && row.foldedCodes && row.foldedCodes.length <= 24 && (
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                        Codes: {row.foldedCodes.join(', ')}
                      </p>
                    )}
                    {row.isOther && row.foldedCodes && row.foldedCodes.length > 24 && (
                      <p className="mt-1 text-xs text-slate-500">
                        {row.foldedCodes.length} distinct type codes aggregated into Other.
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22} tabIndex={-1}>
              {rows.map((r, i) => (
                <Cell key={r.key} fill={r.isOther ? OTHER_COLOR : BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
