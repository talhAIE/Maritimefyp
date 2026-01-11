import { Vessel, Trajectory, Statistics, AnomalyAlert, SpeedDistribution, CourseDistribution, VesselTypeData, TimeSeriesData } from '../types';

// Vessel Type Names
const VESSEL_TYPE_NAMES: Record<number, string> = {
  30: 'Fishing',
  52: 'Tug',
  60: 'Passenger',
  70: 'Cargo',
  79: 'Cargo',
  80: 'Tanker',
  89: 'Tanker',
  36: 'Pleasure Craft',
  37: 'Pleasure Craft',
};

// Generate random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate mock statistics
export const mockStatistics: Statistics = {
  totalVessels: 912,
  activeVessels: 247,
  anomaliesDetected: 23,
  accuracy: 95.0,
  precision: 90.91,
  recall: 100.0,
  f1Score: 95.24,
  totalRecords: 5063274,
  trainingSequences: 1006037,
};

// Generate mock vessels
export const generateMockVessels = (count: number): Vessel[] => {
  const vessels: Vessel[] = [];
  const baseTimestamp = new Date('2024-12-15T12:00:00');
  
  for (let i = 0; i < count; i++) {
    const isAnomaly = Math.random() < 0.1; // 10% anomalies
    const vessel: Vessel = {
      mmsi: 300000000 + i,
      latitude: random(40.50, 40.75),
      longitude: random(-74.20, -73.90),
      speed: random(1.0, 30.0),
      course: random(0, 360),
      vesselType: [30, 52, 60, 70, 79, 80, 89][randomInt(0, 6)],
      timestamp: new Date(baseTimestamp.getTime() + i * 60000).toISOString(),
      status: isAnomaly ? 'anomaly' : 'normal',
      error: isAnomaly ? random(0.0002, 0.001) : random(0.00001, 0.0001),
    };
    vessels.push(vessel);
  }
  
  return vessels;
};

// Generate mock trajectories
export const generateMockTrajectories = (count: number): Trajectory[] => {
  const trajectories: Trajectory[] = [];
  
  for (let i = 0; i < count; i++) {
    const isAnomaly = Math.random() < 0.15;
    const baseLat = random(40.55, 40.70);
    const baseLon = random(-74.10, -73.95);
    const positions = [];
    const baseTime = new Date('2024-12-15T12:00:00');
    
    for (let j = 0; j < 30; j++) {
      const latOffset = isAnomaly && j >= 10 && j < 20 ? random(-0.15, 0.15) : random(-0.01, 0.01);
      const lonOffset = isAnomaly && j >= 10 && j < 20 ? random(-0.15, 0.15) : random(-0.01, 0.01);
      
      positions.push({
        latitude: baseLat + latOffset * j / 10,
        longitude: baseLon + lonOffset * j / 10,
        timestamp: new Date(baseTime.getTime() + j * 60000).toISOString(),
      });
    }
    
    trajectories.push({
      mmsi: 300000000 + i,
      positions,
      status: isAnomaly ? 'anomaly' : 'normal',
      error: isAnomaly ? random(0.0002, 0.001) : random(0.00001, 0.0001),
    });
  }
  
  return trajectories;
};

// Generate mock alerts
export const generateMockAlerts = (count: number): AnomalyAlert[] => {
  const alerts: AnomalyAlert[] = [];
  const baseTime = new Date();
  const statuses: Array<'new' | 'reviewed' | 'resolved'> = ['new', 'reviewed', 'resolved'];
  const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  
  for (let i = 0; i < count; i++) {
    const error = random(0.0002, 0.001);
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (error > 0.0007) severity = 'high';
    else if (error > 0.0004) severity = 'medium';
    
    alerts.push({
      id: `alert-${i + 1}`,
      mmsi: 300000000 + i,
      timestamp: new Date(baseTime.getTime() - i * 3600000).toISOString(),
      error,
      severity,
      status: statuses[randomInt(0, 2)],
      location: {
        latitude: random(40.50, 40.75),
        longitude: random(-74.20, -73.90),
      },
    });
  }
  
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate speed distribution
export const generateSpeedDistribution = (): SpeedDistribution[] => {
  const data: SpeedDistribution[] = [];
  for (let speed = 0; speed <= 50; speed += 2) {
    let count = 0;
    if (speed < 5) count = randomInt(500, 2000);
    else if (speed < 15) count = randomInt(2000, 5000);
    else if (speed < 25) count = randomInt(1000, 3000);
    else if (speed < 35) count = randomInt(200, 800);
    else count = randomInt(0, 200);
    
    data.push({ speed, count });
  }
  return data;
};

// Generate course distribution
export const generateCourseDistribution = (): CourseDistribution[] => {
  const data: CourseDistribution[] = [];
  for (let course = 0; course < 360; course += 15) {
    const count = randomInt(100, 1500);
    data.push({ course, count });
  }
  return data;
};

// Generate vessel type data
export const generateVesselTypeData = (): VesselTypeData[] => {
  const types = [
    { type: 70, name: 'Cargo', count: 45000 },
    { type: 79, name: 'Cargo', count: 38000 },
    { type: 80, name: 'Tanker', count: 32000 },
    { type: 52, name: 'Tug', count: 28000 },
    { type: 60, name: 'Passenger', count: 25000 },
    { type: 30, name: 'Fishing', count: 18000 },
    { type: 89, name: 'Tanker', count: 15000 },
    { type: 36, name: 'Pleasure Craft', count: 12000 },
  ];
  
  const total = types.reduce((sum, t) => sum + t.count, 0);
  
  return types.map(t => ({
    type: t.type,
    typeName: t.name,
    count: t.count,
    percentage: (t.count / total) * 100,
  }));
};

// Generate time series data
export const generateTimeSeriesData = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const baseDate = new Date('2024-12-01');
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const normal = randomInt(800, 1200);
    const anomaly = randomInt(0, 50);
    
    data.push({
      date: date.toISOString().split('T')[0],
      normal,
      anomaly,
      total: normal + anomaly,
    });
  }
  
  return data;
};

// Traffic density points (heatmap data)
export const generateTrafficDensityPoints = (count: number = 5000): Array<[number, number, number]> => {
  const points: Array<[number, number, number]> = [];
  
  // Create clusters around main shipping lanes
  const clusters = [
    { lat: 40.62, lon: -74.05, radius: 0.08 },
    { lat: 40.65, lon: -74.02, radius: 0.06 },
    { lat: 40.68, lon: -73.98, radius: 0.07 },
    { lat: 40.60, lon: -74.08, radius: 0.05 },
  ];
  
  for (let i = 0; i < count; i++) {
    const cluster = clusters[randomInt(0, clusters.length - 1)];
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * cluster.radius;
    const lat = cluster.lat + Math.cos(angle) * distance;
    const lon = cluster.lon + Math.sin(angle) * distance;
    const intensity = Math.random();
    
    points.push([lat, lon, intensity]);
  }
  
  return points;
};

export const mockVessels = generateMockVessels(247);
export const mockTrajectories = generateMockTrajectories(50);
export const mockAlerts = generateMockAlerts(23);
export const speedDistribution = generateSpeedDistribution();
export const courseDistribution = generateCourseDistribution();
export const vesselTypeData = generateVesselTypeData();
export const timeSeriesData = generateTimeSeriesData(30);
export const trafficDensityPoints = generateTrafficDensityPoints(5000);