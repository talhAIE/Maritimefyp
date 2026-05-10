export interface Vessel {
  mmsi: number;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  vesselType: number;
  timestamp: string;
  status: 'normal' | 'anomaly';
  error?: number;
}

export interface Trajectory {
  mmsi: number;
  positions: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
  status: 'normal' | 'anomaly';
  error?: number;
}

export interface Statistics {
  totalVessels: number;
  activeVessels: number;
  anomaliesDetected: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalRecords: number;
  trainingSequences: number;
}

export interface AnomalyAlert {
  id: string;
  mmsi: number;
  timestamp: string;
  error: number;
  severity: 'low' | 'medium' | 'high';
  status: 'new' | 'reviewed' | 'resolved';
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SpeedDistribution {
  speed: number;
  count: number;
}

export interface CourseDistribution {
  course: number;
  count: number;
}

export interface VesselTypeData {
  type: number;
  typeName: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  normal: number;
  anomaly: number;
  total: number;
}

/** Matches `GET /health` when the backend is up. */
/** `GET /api/model/vessel-scores` — ranked LSTM reconstruction error per MMSI. */
export interface VesselScoreRow {
  mmsi: number;
  mse: number;
  flagged: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  ratio_to_threshold?: number;
}

export interface VesselScoresPayload {
  threshold: number | null;
  scored_count: number;
  inference_active: boolean;
  vessels: VesselScoreRow[];
}

export interface ApiHealth {
  message: string;
  status: string;
  data_loaded: boolean;
  csv_path_configured?: string;
  csv_path_used?: string | null;
  model_loaded: boolean;
  scaler_loaded: boolean;
  threshold: number | null;
  detail: string;
  /** True when weights ran on at least one vessel and a threshold is set. */
  inference_active?: boolean;
  vessels_scored?: number;
  anomalies_flagged?: number;
  mse_median?: number | null;
  inference_device?: string | null;
  expected_model_weights?: string;
  expected_scaler?: string;
  weights_file_present?: boolean;
  scaler_file_present?: boolean;
}