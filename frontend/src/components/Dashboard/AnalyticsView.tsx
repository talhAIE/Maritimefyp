import { useEffect, useState } from 'react';
import SpeedDistributionChart from '../Charts/SpeedDistributionChart';
import CourseDistributionChart from '../Charts/CourseDistributionChart';
import VesselTypeChart from '../Charts/VesselTypeChart';
import AnomalyTimelineChart from '../Charts/AnomalyTimelineChart';
import {
  getCourseDistribution,
  getSpeedDistribution,
  getTimeline,
  getVesselTypeDistribution,
} from '../../api/client';
import type { CourseDistribution, SpeedDistribution, TimeSeriesData, VesselTypeData } from '../../types';

export default function AnalyticsView() {
  const [speedDistribution, setSpeedDistribution] = useState<SpeedDistribution[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<CourseDistribution[]>([]);
  const [vesselTypeData, setVesselTypeData] = useState<VesselTypeData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [spd, crs, vt, ts] = await Promise.all([
          getSpeedDistribution(),
          getCourseDistribution(),
          getVesselTypeDistribution(),
          getTimeline(),
        ]);
        if (!cancelled) {
          setSpeedDistribution(spd);
          setCourseDistribution(crs);
          setVesselTypeData(vt);
          setTimeSeriesData(ts);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Could not load analytics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!loaded && !error) {
    return <div className="text-gray-600">Loading analytics…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600">Detailed analysis of vessel behavior and patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeedDistributionChart data={speedDistribution} />
        <CourseDistributionChart data={courseDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VesselTypeChart data={vesselTypeData} />
        <AnomalyTimelineChart data={timeSeriesData} />
      </div>
    </div>
  );
}
