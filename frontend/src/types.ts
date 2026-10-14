export type StationStatus = 'healthy' | 'suspicious' | 'anomaly' | 'offline';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export type AnomalyParameter = 'temperature' | 'pressure' | 'humidity' | 'multi_sensor' | 'signal_loss';

export interface TelemetryReading {
  temperature: number | null; // in °C
  pressure: number | null; // in hPa
  humidity: number | null; // in %
  windSpeed?: number | null; // in m/s
  rainfall?: number | null; // in mm (last 1h)
  solarRadiation?: number | null; // in W/m²
  batteryVoltage?: number | null; // in V
  signalDbm?: number | null; // in dBm
}

export interface ExpectedReading {
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
  tempTolerance?: number;
  pressureTolerance?: number;
  humidityTolerance?: number;
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
  anomalyScore: number;
  confidence: number;
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
  tempSensorHealth: number;
  pressureSensorHealth: number;
  humiditySensorHealth: number;
  commsHealth: number;
  lastCalibrationDate: string;
  calibrationDueDays: number;
}

export interface TelemetryPoint {
  time: string;
  observedTemp: number | null;
  expectedTemp: number | null;
  observedPressure: number | null;
  expectedPressure: number | null;
  observedHumidity: number | null;
  expectedHumidity: number | null;
  isAnomaly?: boolean;
}

export interface AWSStation {
  id: string; // e.g. 'station_01'
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  elevationM: number;
  status: StationStatus;
  currentReadings: TelemetryReading;
  expectedReadings: ExpectedReading;
  trustScore: number;
  confidence?: number;
  lastPing: string;
  lastPacketReceivedAgo: string;
  sensorHealth: SensorHealthBreakdown;
  activeAnomaly?: AnomalyRecord;
  recentHistory: TelemetryPoint[];
  stationType: string;
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
  | 'stations'
  | 'anomalies'
  | 'history'
  | 'about';

export interface AuthUser {
  id?: string;
  username?: string;
  name: string;
  role: 'Admin' | 'OPERATOR';
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
