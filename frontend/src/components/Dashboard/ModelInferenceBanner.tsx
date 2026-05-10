import { AlertTriangle, Brain, Cpu, Radio } from 'lucide-react';
import type { ApiHealth } from '../../types';

export default function ModelInferenceBanner({ health }: { health: ApiHealth | null }) {
  if (!health) return null;

  const dataOk = health.data_loaded;
  const scored = typeof health.vessels_scored === 'number' ? health.vessels_scored : 0;
  const flagged =
    typeof health.anomalies_flagged === 'number' ? health.anomalies_flagged : 0;

  const weightMissing =
    health.weights_file_present === false || health.scaler_file_present === false;

  if (!dataOk) {
    return null;
  }

  const inferenceOn = Boolean(health.inference_active && health.model_loaded);

  /* CSV present but inference stack unavailable (missing files or load error) */
  if (!health.model_loaded || weightMissing) {
    return (
      <div
        className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        role="status"
      >
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" aria-hidden />
          <div>
            <p className="font-semibold text-amber-950">Anomaly model not active</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900/90">
              AIS charts work, but{' '}
              <span className="font-medium text-amber-950">Alerts</span>,{' '}
              <span className="font-medium text-amber-950">fleet donut</span>,{' '}
              <span className="font-medium text-amber-950">severity pie</span>,{' '}
              <span className="font-medium text-amber-950">flagged trajectories</span>, and{' '}
              <span className="font-medium text-amber-950">timeline</span> splits need a loadable checkpoint + scaler under{' '}
              <span className="font-mono text-xs">model_saved/</span>. Run{' '}
              <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">python scripts/verify_model.py</code> then restart{' '}
              <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">python -m backend</code>.
            </p>
            {weightMissing && (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-900 font-mono">
                <span>weights:{health.weights_file_present ? 'ok' : 'missing'}</span>
                <span>scaler:{health.scaler_file_present ? 'ok' : 'missing'}</span>
              </p>
            )}
            <p className="mt-2 text-xs text-amber-800/80 font-mono break-all">{health.detail}</p>
          </div>
        </div>
      </div>
    );
  }

  const dev = health.inference_device ?? 'cpu';
  const th = typeof health.threshold === 'number' ? health.threshold.toExponential(4) : '—';

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Brain className="h-7 w-7" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-950">LSTM autoencoder inference is running</p>
          <p className="mt-1 text-sm text-slate-700">
            Every vessel’s <span className="font-medium text-slate-900">last 30 pings</span> are encoded, reconstructed,
            and compared to threshold <span className="font-mono text-xs text-slate-800">{th}</span>. Output drives{' '}
            <span className="font-medium text-slate-900">Alerts</span>, donut split, trajectory colours, and timeline
            “flagged” pings.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 ring-1 ring-slate-200/80">
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              {scored.toLocaleString()} MMSIs scored
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 ring-1 ring-slate-200/80">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              {flagged.toLocaleString()} above threshold
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 ring-1 ring-slate-200/80">
              <Cpu className="h-3.5 w-3.5 text-slate-600" />
              {dev}
            </span>
            {health.mse_median != null && (
              <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 font-mono ring-1 ring-slate-200/80">
                median MSE≈
                {(typeof health.mse_median === 'number' ? health.mse_median : Number(health.mse_median)).toExponential(
                  3,
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      {!inferenceOn && health.model_loaded && (
        <p className="max-w-xs text-xs text-amber-800">
          Model loaded but <span className="font-semibold">inference_active=false</span> — check CSV and that vessels
          have ≥30 pings, or inspect <span className="font-mono">/health</span>.
        </p>
      )}
    </div>
  );
}
