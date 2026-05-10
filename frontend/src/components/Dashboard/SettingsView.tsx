import { useEffect, useState } from 'react';
import { Activity, FileJson, Info, SlidersHorizontal } from 'lucide-react';
import { getHealth } from '../../api/client';
import type { ApiHealth } from '../../types';

function formatThreshold(t: number | null | undefined): string {
  if (t == null) return '—';
  return t.toExponential(4);
}

const SECTIONS: { name: string; purpose: string }[] = [
  { name: 'Dashboard', purpose: 'Overview charts, alerts preview, model status banner' },
  { name: 'Maps & trajectories', purpose: 'Positions, density, anomaly-coloured tracks' },
  { name: 'Anomaly alerts', purpose: 'Vessels above MSE threshold for this data load' },
  { name: 'Analytics', purpose: 'Speed, course, vessel mix, volume, timeline' },
  { name: 'Model insights', purpose: 'Trained-model use cases, ranked MSE scores, charts' },
  { name: 'AIS dataset & fleet', purpose: 'Loaded CSV stats and vessel table' },
  { name: 'Settings', purpose: 'API health, paths, threshold (this page)' },
];

export default function SettingsView() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await getHealth();
        if (!cancelled) {
          setHealth(h);
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

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Could not reach the API</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-600">
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  const dataOk = health.data_loaded;
  const modelOk = health.model_loaded;
  const inferOn = Boolean(health.inference_active);

  return (
    <div className="space-y-8 pb-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Configuration</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Read-only status from <span className="font-mono text-xs">GET /health</span>. There are no editable controls in
          the UI — change CSV, model files, or threshold on disk and restart the API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">API status</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <span className="text-slate-500">Data loaded:</span>{' '}
              <span className={dataOk ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>
                {dataOk ? 'yes' : 'no'}
              </span>
            </li>
            <li>
              <span className="text-slate-500">Model weights:</span>{' '}
              <span className={modelOk ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'}>
                {modelOk ? 'loaded' : 'not loaded'}
              </span>
            </li>
            <li>
              <span className="text-slate-500">Inference:</span>{' '}
              <span className="font-medium text-slate-900">{inferOn ? 'active' : 'inactive'}</span>
            </li>
            {health.inference_device && (
              <li>
                <span className="text-slate-500">Device:</span>{' '}
                <span className="font-mono text-xs text-slate-800">{health.inference_device}</span>
              </li>
            )}
          </ul>
          {health.detail && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{health.detail}</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <SlidersHorizontal className="h-5 w-5 text-sky-600" />
            <h3 className="font-semibold">Anomaly threshold (MSE)</h3>
          </div>
          <p className="mt-2 font-mono text-xl text-slate-900">{formatThreshold(health.threshold)}</p>
          <p className="mt-2 text-xs text-slate-500">
            From <span className="font-mono">model_saved/threshold.json</span> or auto percentile. Edit file and restart:{' '}
            <span className="font-mono">python -m backend</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 text-slate-900">
            <FileJson className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold">Data path</h3>
          </div>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Resolved CSV</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-slate-900">{health.csv_path_used ?? '—'}</dd>
            </div>
            {health.csv_path_configured && (
              <div>
                <dt className="text-slate-500">Configured hint</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-900">{health.csv_path_configured}</dd>
              </div>
            )}
          </dl>
          {(health.weights_file_present != null || health.scaler_file_present != null) && (
            <p className="mt-3 text-xs text-slate-500">
              Artifacts — weights: {health.weights_file_present === true ? 'present' : health.weights_file_present === false ? 'missing' : '—'}{' '}
              · scaler: {health.scaler_file_present === true ? 'present' : health.scaler_file_present === false ? 'missing' : '—'}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-5">
        <div className="flex items-center gap-2 text-slate-900">
          <Info className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold">What each screen uses</h3>
        </div>
        <ul className="mt-3 divide-y divide-slate-200/90 border-t border-slate-200/90">
          {SECTIONS.map((s) => (
            <li key={s.name} className="flex flex-col gap-0.5 py-2.5 text-sm sm:flex-row sm:items-baseline sm:gap-4">
              <span className="shrink-0 font-medium text-slate-900">{s.name}</span>
              <span className="text-slate-600">{s.purpose}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
