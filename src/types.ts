export type StationStatus = 'healthy' | 'suspicious' | 'anomaly' | 'offline';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AnomalyParameter = 'temperature' | 'pressure' | 'humidity' | 'multi_sensor' | 'signal_loss';

export interface TelemetryReading {
  temperature: number; // in °C
  pressure: number; // in hPa
  humidity: number; // in %
  windSpeed: number; // in m/s
  rainfall: number; // in mm (last 1h)
  solarRadiation: number; // in W/m²
  batteryVoltage: number; // in V (e.g. 12.6V)
  signalDbm: number; // in dBm (e.g. -74 dBm)
}

export interface ExpectedReading {
  temperature: number;
  pressure: number;
  humidity: number;
  tempTolerance: number;
  pressureTolerance: number;
  humidityTolerance: number;
}

export interface NearestNeighborComparison {
  stationId: string;
  location: string;
  distanceKm: number;
  observedValue: string;
  status: StationStatus;
  deviation: string;
}

export interface AnomalyRecord {
  id: string;
  stationId: string;
  stationName: string;
  location: string;
  state: string;
  parameter: AnomalyParameter;
  title: string;
  classification: string;
  actualValue: string;
  expectedValue: string;
  anomalyScore: number; // 0.00 to 1.00
  confidence: number; // percentage (e.g., 96%)
  severity: AnomalySeverity;
  timestamp: string;
  reason: string;
  rootCauseHypothesis: string;
  physicalLawValidation: string;
  recommendation: string;
  status: 'active' | 'investigating' | 'resolved';
  nearestNeighbors: NearestNeighborComparison[];
  historicalContext: string;
}

export interface SensorHealthBreakdown {
  tempSensorHealth: number; // percentage 0-100
  pressureSensorHealth: number; // percentage 0-100
  humiditySensorHealth: number; // percentage 0-100
  commsHealth: number; // percentage 0-100
  lastCalibrationDate: string;
  calibrationDueDays: number;
}

export interface TelemetryPoint {
  time: string;
  observedTemp: number;
  expectedTemp: number;
  observedPressure: number;
  expectedPressure: number;
  observedHumidity: number;
  expectedHumidity: number;
  isAnomaly?: boolean;
}

export interface AWSStation {
  id: string; // e.g., 'AWS-003'
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  elevationM: number;
  status: StationStatus;
  currentReadings: TelemetryReading;
  expectedReadings: ExpectedReading;
  trustScore: number; // 0 - 100%
  confidence?: number;
  lastPing: string;
  lastPacketReceivedAgo: string;
  sensorHealth: SensorHealthBreakdown;
  activeAnomaly?: AnomalyRecord;
  recentHistory: TelemetryPoint[];
  stationType: 'Primary Synoptic' | 'Agromet AWS' | 'High-Altitude AWS' | 'Urban Mesonet';
  installYear: number;
}

export interface NetworkOverviewStats {
  totalStations: number;
  healthyCount: number;
  suspiciousCount: number;
  anomalyCount: number;
  offlineCount: number;
  networkSensorHealthPercent: number;
  sensorTypeHealth: {
    temperature: { healthyPercent: number; count: number; degraded: number; critical: number };
    pressure: { healthyPercent: number; count: number; degraded: number; critical: number };
    humidity: { healthyPercent: number; count: number; degraded: number; critical: number };
  };
  totalPacketsProcessedToday: number;
  anomaliesDetectedToday: number;
}

export type NavigationSection = 
  | 'dashboard'
  | 'live_monitoring'
  | 'stations'
  | 'station_details'
  | 'anomalies'
  | 'anomaly_details'
  | 'analytics'
  | 'sensor_health'
  | 'settings';

export interface AuthUser {
  username: string;
  name: string;
  role: 'Admin';
  email: string;
  designation?: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
