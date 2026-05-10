import { useEffect, useState } from 'react';
import { Activity, Layers, Radio, Ship } from 'lucide-react';
import VesselsTable from '../Tables/VesselsTable';
import { getStatistics, getVessels } from '../../api/client';
import type { Statistics, Vessel } from '../../types';

function formatRows(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-4 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  hint,
}: {
  icon: typeof Ship;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2.5 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function DataView() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stats, vess] = await Promise.all([getStatistics(), getVessels(100)]);
        if (!cancelled) {
          setStatistics(stats);
          setVessels(vess);
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
        <p className="font-semibold">Could not load dataset</p>
        <p className="mt-1 text-sm">{error}</p>
        <p className="mt-3 text-sm text-red-900/90">
          Start the API with{' '}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">python -m backend</code> and ensure AIS
          CSV data is under <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">data/</code>.
        </p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-600">
        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
        <p className="text-sm font-medium">Loading dataset…</p>
      </div>
    );
  }

  const seq = statistics.trainingSequences;

  return (
    <div className="space-y-10 pb-8">
      <SectionHeader
        eyebrow="Loaded CSV"
        title="AIS dataset & fleet"
        description="Counts below describe the AIS file the API has in memory right now — not a separate “training download.” Sliding-window totals use the same 30-ping length and stride-5 rule as the backend training-sequence estimator."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Radio}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          label="AIS ping rows"
          value={statistics.totalRecords.toLocaleString()}
          hint={`≈ ${formatRows(statistics.totalRecords)} rows in the loaded snapshot`}
        />
        <MetricCard
          icon={Layers}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          label="Sliding windows"
          value={seq.toLocaleString()}
          hint="Countable 30-ping windows (stride 5) per vessel — used to size LSTM-style training data"
        />
        <MetricCard
          icon={Ship}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Unique MMSIs"
          value={statistics.totalVessels.toLocaleString()}
          hint="Distinct vessels in this file"
        />
        <MetricCard
          icon={Activity}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Active (24h window)"
          value={statistics.activeVessels.toLocaleString()}
          hint="Vessels with at least one ping in the last 24h of dataset time"
        />
      </div>

      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Model metrics (from evaluation file)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Static numbers from <span className="font-mono">model_saved/evaluation_metrics.json</span> when present; live
          anomaly counts use the loaded threshold and current scores.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <dt className="text-xs text-slate-500">Anomalies (now)</dt>
            <dd className="font-mono text-lg font-semibold text-slate-900">{statistics.anomaliesDetected}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Accuracy</dt>
            <dd className="font-mono text-lg font-semibold text-slate-900">{statistics.accuracy}%</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Precision</dt>
            <dd className="font-mono text-lg font-semibold text-slate-900">{statistics.precision}%</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Recall</dt>
            <dd className="font-mono text-lg font-semibold text-slate-900">{statistics.recall}%</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">F1</dt>
            <dd className="font-mono text-lg font-semibold text-slate-900">{statistics.f1Score}%</dd>
          </div>
        </dl>
      </section>

      <section>
        <SectionHeader
          eyebrow="Fleet"
          title="Recent vessel positions"
          description="Sample of rows returned by the API (newest-first, capped for performance)."
        />
        <VesselsTable vessels={vessels} maxVessels={100} />
      </section>
    </div>
  );
}
