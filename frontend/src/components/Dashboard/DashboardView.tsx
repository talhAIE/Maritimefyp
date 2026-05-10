import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { LayoutDashboard, Activity, Anchor } from 'lucide-react';
import StatsGrid from '../Statistics/StatsGrid';
import SpeedDistributionChart from '../Charts/SpeedDistributionChart';
import CourseDistributionChart from '../Charts/CourseDistributionChart';
import VesselTypeChart from '../Charts/VesselTypeChart';
import AnomalyTimelineChart from '../Charts/AnomalyTimelineChart';
import DailyAISVolumeChart from '../Charts/DailyAISVolumeChart';
import FleetStatusChart from '../Charts/FleetStatusChart';
import ModelPerformanceChart from '../Charts/ModelPerformanceChart';
import AlertSeverityChart from '../Charts/AlertSeverityChart';
import AlertsTable from '../Tables/AlertsTable';
import ModelInferenceBanner from './ModelInferenceBanner';
import {
  getAlerts,
  getCourseDistribution,
  getHealth,
  getSpeedDistribution,
  getStatistics,
  getTimeline,
  getVesselTypeDistribution,
} from '../../api/client';
import type {
  AnomalyAlert,
  ApiHealth,
  CourseDistribution,
  SpeedDistribution,
  Statistics,
  TimeSeriesData,
  VesselTypeData,
} from '../../types';

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

export default function DashboardView() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [speedDistribution, setSpeedDistribution] = useState<SpeedDistribution[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<CourseDistribution[]>([]);
  const [vesselTypeData, setVesselTypeData] = useState<VesselTypeData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, stats, spd, crs, vt, ts, al] = await Promise.all([
          getHealth(),
          getStatistics(),
          getSpeedDistribution(),
          getCourseDistribution(),
          getVesselTypeDistribution(),
          getTimeline(),
          getAlerts(),
        ]);
        if (!cancelled) {
          setHealth(h);
          setStatistics(stats);
          setSpeedDistribution(spd);
          setCourseDistribution(crs);
          setVesselTypeData(vt);
          setTimeSeriesData(ts);
          setAlerts(al);
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
        <p className="font-semibold">Could not load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
        <p className="mt-3 text-sm leading-relaxed text-red-900/90">
          Start the API: <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">python -m backend</code>{' '}
          and ensure AIS data is under{' '}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">data/</code>.
        </p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-6 text-slate-600">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
        <p className="text-sm font-medium">Loading dashboard…</p>
      </div>
    );
  }

  const asOf = format(new Date(), 'PPpp');

  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-800 px-8 py-10 text-white shadow-lg shadow-slate-900/25">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-teal-100">
              <Anchor className="h-3.5 w-3.5" />
              AIS maritime intelligence
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <LayoutDashboard className="h-8 w-8 text-white" aria-hidden />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Operational dashboard</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200">
                  Every figure below is computed from your backend: AIS positions, derived traffic patterns, optional
                  autoencoder scores, and configured evaluation metrics.
                </p>
              </div>
            </div>
          </div>
          <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:text-right">
            <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-100 lg:justify-end">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Records in view</span>
              </div>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {statistics.totalRecords.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-teal-100">Unique vessels</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {statistics.totalVessels.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <p className="relative mt-6 text-xs text-slate-400">Rendered {asOf} · Refresh the page to reload from the API.</p>
      </div>

      <ModelInferenceBanner health={health} />

      {/* KPI cards */}
      <section>
        <SectionHeader
          eyebrow="Snapshot"
          title="Key indicators"
          description="High-level counts and model KPIs exposed by `/api/statistics` — grounded in your current CSV and thresholds."
        />
        <StatsGrid statistics={statistics} />
      </section>

      {/* Kinematics */}
      <section>
        <SectionHeader
          eyebrow="Movement"
          title="Speed & heading"
          description="Fleet-wide kinematics help validate normal operating envelopes before interpreting anomaly spikes."
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SpeedDistributionChart data={speedDistribution} />
          <CourseDistributionChart data={courseDistribution} />
        </div>
      </section>

      {/* Fleet + detection */}
      <section>
        <SectionHeader
          eyebrow="Fleet & risk"
          title="Composition & detection posture"
          description="Fleet mix by AIS type codes, MMSI clearance vs anomaly flags, severity of current alerts, and offline evaluation scores."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <FleetStatusChart statistics={statistics} />
          </div>
          <div className="lg:col-span-1">
            <AlertSeverityChart alerts={alerts} />
          </div>
          <div className="lg:col-span-1">
            <ModelPerformanceChart statistics={statistics} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <VesselTypeChart data={vesselTypeData} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <DailyAISVolumeChart data={timeSeriesData} />
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Timeline"
          title="Anomaly activity over time"
          description="Red line emphasises pings tied to MMSIs flagged anomalous; shaded region shows ambient traffic density."
        />
        <AnomalyTimelineChart data={timeSeriesData} />
      </section>

      <section>
        <SectionHeader
          eyebrow="Operational"
          title="Action queue"
          description="Highest-priority MMSIs surfaced by reconstruction error — reconcile with situational awareness and maps."
        />
        <AlertsTable alerts={alerts.slice(0, 12)} />
      </section>
    </div>
  );
}
