import { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  ListOrdered,
  MapPin,
  Radio,
  Bell,
  BookOpen,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ModelInferenceBanner from './ModelInferenceBanner';
import { getHealth, getVesselScores } from '../../api/client';
import type { ApiHealth, VesselScoresPayload } from '../../types';

function severityBadgeClass(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-900 ring-red-200';
    case 'medium':
      return 'bg-amber-100 text-amber-950 ring-amber-200';
    case 'low':
      return 'bg-yellow-50 text-yellow-900 ring-yellow-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

export default function ModelInsightsView() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [payload, setPayload] = useState<VesselScoresPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, scores] = await Promise.all([getHealth(), getVesselScores(300)]);
        if (!cancelled) {
          setHealth(h);
          setPayload(scores);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!payload?.vessels.length || payload.threshold == null) return [];
    return payload.vessels.slice(0, 14).map((v) => ({
      label: String(v.mmsi),
      ratio: typeof v.ratio_to_threshold === 'number' ? v.ratio_to_threshold : v.mse / payload.threshold!,
      mse: v.mse,
      flagged: v.flagged,
    }));
  }, [payload]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Could not load model insights</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!health || !payload) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <p className="text-sm font-medium">Loading trained-model output…</p>
        </div>
      </div>
    );
  }

  const flagged = payload.vessels.filter((v) => v.flagged).length;

  return (
    <div className="space-y-10 pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-primary-700/20 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 px-6 py-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-2xl gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <Brain className="h-8 w-8" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">Trained autoencoder</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">How to use the model</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                The backend encodes each vessel’s{' '}
                <span className="font-semibold text-white">last 30 AIS pings</span> (LAT, LON, SOG, COG) with the scaler
                you trained on, reconstructs them, and exposes{' '}
                <span className="font-semibold text-white">reconstruction error (MSE)</span>. Higher MSE ⇒ movement
                pattern deviates further from “normal” in the historical sense of this dataset — surfaced here, on Alerts,
                and on maps.
              </p>
            </div>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-3 text-sm lg:text-right">
            <div className="rounded-lg bg-black/25 px-3 py-2 backdrop-blur-sm">
              <dt className="text-xs uppercase tracking-wide text-slate-300">MMSIs scored</dt>
              <dd className="font-mono text-xl font-semibold tabular-nums">{payload.scored_count.toLocaleString()}</dd>
            </div>
            <div className="rounded-lg bg-black/25 px-3 py-2 backdrop-blur-sm">
              <dt className="text-xs uppercase tracking-wide text-slate-300">Above threshold</dt>
              <dd className="font-mono text-xl font-semibold tabular-nums text-amber-200">{flagged.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      <ModelInferenceBanner health={health} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <ListOrdered className="h-6 w-6 text-primary-600" />
          <h2 className="mt-3 font-semibold text-slate-900">1. Rank by risk</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Use the table below (highest MSE first). Compare the ratio to the configured threshold: values above{' '}
            <span className="font-mono text-xs">1.0×</span> count as flagged for this load.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <Bell className="h-6 w-6 text-amber-600" />
          <h2 className="mt-3 font-semibold text-slate-900">2. Open Alerts</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Go to <span className="font-medium text-slate-800">Anomaly Alerts</span> for the same vessels with severity
            bands (low / medium / high) and last known position.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <MapPin className="h-6 w-6 text-emerald-600" />
          <h2 className="mt-3 font-semibold text-slate-900">3. Map context</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">Maps & trajectories</span> colour tracks using the same
            scores so you can validate patterns spatially.
          </p>
        </div>
      </section>

      {payload.scored_count === 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
          <Radio className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">No live scores yet</p>
            <p className="mt-1 text-sm text-amber-900/90">
              Add <span className="font-mono text-xs">ais_lstm_autoencoder.pth</span> and{' '}
              <span className="font-mono text-xs">scaler.pkl</span> under <span className="font-mono text-xs">model_saved/</span>, ensure AIS
              CSV is loaded, and restart the API. Vessels need enough pings for a 30-step window.
            </p>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <section className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-4 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900">Top vessels by MSE ÷ threshold</h2>
            <p className="mt-1 text-sm text-slate-600">
              Bars above the red line exceed the anomaly cutoff. Values are dimensionless ratios (not raw MSE).
            </p>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  stroke="#cbd5e1"
                  domain={[0, 'auto']}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={100}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  content={({ active, label, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as { mse?: number; ratio?: number };
                    if (d?.mse == null) return null;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                        <p className="font-medium text-slate-900">MMSI {label}</p>
                        <p className="mt-1 text-slate-600">
                          Ratio{' '}
                          <span className="font-mono">{typeof d.ratio === 'number' ? `${d.ratio.toFixed(3)}×` : '—'}</span>
                        </p>
                        <p className="text-slate-600">
                          MSE <span className="font-mono">{d.mse.toExponential(4)}</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={1} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'threshold', fill: '#dc2626', fontSize: 11 }} />
                <Bar dataKey="ratio" name="MSE/threshold" radius={[0, 4, 4, 0]}>
                  {chartData.map((e) => (
                    <Cell key={e.label} fill={e.flagged ? '#dc2626' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {payload.vessels.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <h2 className="font-semibold text-slate-900">Ranked reconstruction error</h2>
                <p className="mt-1 text-sm text-slate-600">
                  From <span className="font-mono text-xs">GET /api/model/vessel-scores</span>. Threshold{' '}
                  {payload.threshold != null ? payload.threshold.toExponential(4) : '—'} · showing {payload.vessels.length}{' '}
                  of {payload.scored_count} scored MMSIs
                </p>
              </div>
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">MMSI</th>
                  <th className="px-4 py-3 font-medium">MSE</th>
                  <th className="px-4 py-3 font-medium">× threshold</th>
                  <th className="px-4 py-3 font-medium">Flagged</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payload.vessels.map((v) => (
                  <tr key={v.mmsi} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono text-slate-900">{v.mmsi}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-800">{v.mse.toExponential(4)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700">
                      {typeof v.ratio_to_threshold === 'number' ? `${v.ratio_to_threshold.toFixed(2)}×` : '—'}
                    </td>
                    <td className="px-4 py-2.5">{v.flagged ? <span className="text-red-600 font-medium">Yes</span> : 'No'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${severityBadgeClass(v.severity)}`}>
                        {v.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
