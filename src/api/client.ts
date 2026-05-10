import type {
  AnomalyAlert,
  ApiHealth,
  CourseDistribution,
  SpeedDistribution,
  Statistics,
  TimeSeriesData,
  Trajectory,
  Vessel,
  VesselScoresPayload,
  VesselTypeData,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = String(body.detail);
    } catch {
      const t = await res.text();
      if (t) detail = t.slice(0, 200);
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export function getHealth(): Promise<ApiHealth> {
  return fetchJson('/health');
}

export function getStatistics(): Promise<Statistics> {
  return fetchJson('/api/statistics');
}

export function getVessels(limit = 200): Promise<Vessel[]> {
  return fetchJson(`/api/vessels?limit=${limit}`);
}

export function getAlerts(): Promise<AnomalyAlert[]> {
  return fetchJson('/api/alerts');
}

export function getVesselScores(limit = 250): Promise<VesselScoresPayload> {
  return fetchJson(`/api/model/vessel-scores?limit=${limit}`);
}

export function getTrajectories(limit = 50): Promise<Trajectory[]> {
  return fetchJson(`/api/trajectories?limit=${limit}`);
}

export function getTrafficDensity(limit = 8000): Promise<[number, number, number][]> {
  return fetchJson(`/api/maps/traffic-density?limit=${limit}`);
}

export function getAnomalyPair(): Promise<{ normalTrajectory: Trajectory; anomalousTrajectory: Trajectory }> {
  return fetchJson('/api/maps/anomaly-pair');
}

export function getSpeedDistribution(): Promise<SpeedDistribution[]> {
  return fetchJson('/api/analytics/speed-distribution');
}

export function getCourseDistribution(): Promise<CourseDistribution[]> {
  return fetchJson('/api/analytics/course-distribution');
}

export function getVesselTypeDistribution(): Promise<VesselTypeData[]> {
  return fetchJson('/api/analytics/vessel-types');
}

export function getTimeline(): Promise<TimeSeriesData[]> {
  return fetchJson('/api/analytics/timeline');
}
