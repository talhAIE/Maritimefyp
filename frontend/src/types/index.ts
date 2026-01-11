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