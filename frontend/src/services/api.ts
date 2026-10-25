/// <reference types="vite/client" />

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
export const ML_DIRECT_URL = (import.meta.env.VITE_ML_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface WeatherRequest {
  stationId: string;
  timestamp?: string;
  temperature: number;
  dewPointTemperature?: number;
  windDirection?: number;
  windSpeed?: number;
  relativeHumidity: number;
  visibility?: number;
  stationLevelPressure?: number;
  seaLevelPressure?: number;
  dataSource?: string;
}

export interface AnomalyResponse {
  anomaly: boolean;
  anomaly_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  status?: string;
  station_id: string;
  timestamp: string;
  reason?: string;
  confidence?: number;
  source?: 'SPRING_BOOT_BACKEND' | 'FASTAPI_ML';
}

export interface WeatherReadingRecord {
  id: number;
  stationId: string;
  timestamp: string;
  temperature: number | null;
  dewPointTemperature?: number | null;
  windDirection?: number | null;
  windSpeed?: number | null;
  relativeHumidity: number | null;
  visibility?: number | null;
  stationLevelPressure: number | null;
  seaLevelPressure?: number | null;
  anomaly: boolean;
  anomalyScore: number;
  status: string;
  severity: string;
  reason: string;
  dataSource?: string;
}

export interface BackendStatus {
  online: boolean;
  mlOnline: boolean;
  latencyMs: number;
  message: string;
}

/**
 * Check connectivity to Spring Boot Java Backend and Python ML Service
 */
export async function checkBackendStatus(): Promise<BackendStatus> {
  const startTime = Date.now();
  let springOnline = false;
  let mlOnline = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      springOnline = true;
    }
  } catch {
    springOnline = false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${ML_DIRECT_URL}/health`, {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      mlOnline = true;
    }
  } catch {
    mlOnline = false;
  }

  const latencyMs = Date.now() - startTime;

  return {
    online: springOnline || mlOnline,
    mlOnline,
    latencyMs,
    message: springOnline
      ? 'Spring Boot Backend (Port 8080) & PostgreSQL active'
      : mlOnline
      ? 'Direct FastAPI ML Engine (Port 8000) Active'
      : 'Backend offline',
  };
}

/**
 * Fetches live IMD AWS weather telemetry and trained ML predictions
 */
export async function fetchLiveAWSData(): Promise<{ stations: any[]; anomalies: any[]; stats: any } | null> {
  // Attempt 1: Spring Boot Backend /api/stations
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/api/stations`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { stations: data, anomalies: [], stats: null };
      }
    }
  } catch (e) {
    // Spring Boot endpoint unavailable
  }

  // Attempt 2: Direct FastAPI ML /live-aws
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${ML_DIRECT_URL}/live-aws`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.stations) return data;
    }
  } catch (e) {
    // Direct ML endpoint unavailable
  }

  return null;
}

/**
 * Direct Open-Meteo API query for the official AWS stations
 */
export async function fetchDirectOpenMeteoDataFor7Stations(targetStations: any[]): Promise<any[]> {
  const fetchPromises = targetStations.map(async (st) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${st.lat}&longitude=${st.lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const cur = json.current || {};
        const temp = cur.temperature_2m !== undefined && cur.temperature_2m !== null ? Math.round(cur.temperature_2m * 10) / 10 : st.currentReadings.temperature;
        const hum = cur.relative_humidity_2m !== undefined && cur.relative_humidity_2m !== null ? Math.round(cur.relative_humidity_2m) : st.currentReadings.humidity;
        const press = cur.surface_pressure !== undefined && cur.surface_pressure !== null ? Math.round(cur.surface_pressure * 10) / 10 : st.currentReadings.pressure;
        const wind = cur.wind_speed_10m !== undefined && cur.wind_speed_10m !== null ? Math.round((cur.wind_speed_10m / 3.6) * 10) / 10 : st.currentReadings.windSpeed;

        return {
          stationId: st.id,
          name: st.name,
          location: st.location,
          temperature: temp,
          pressure: press,
          humidity: hum,
          windSpeed: wind,
          isLiveFeed: true,
          fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
    } catch (e) {
      // Fallback to existing current readings
    }

    return {
      stationId: st.id,
      name: st.name,
      location: st.location,
      temperature: st.expectedReadings?.temperature ?? st.currentReadings.temperature,
      pressure: st.expectedReadings?.pressure ?? st.currentReadings.pressure,
      humidity: st.expectedReadings?.humidity ?? st.currentReadings.humidity,
      windSpeed: st.currentReadings.windSpeed,
      isLiveFeed: false,
      fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  });

  return Promise.all(fetchPromises);
}

/**
 * Sends weather telemetry data to the Spring Boot anomaly detection service
 */
export async function checkAnomaly(data: WeatherRequest): Promise<AnomalyResponse> {
  const isDemo = data.dataSource === 'DEMO';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api/anomaly/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return {
        ...result,
        source: 'SPRING_BOOT_BACKEND',
      };
    } else {
      const errText = await response.text().catch(() => '');
      if (errText.includes('Unable to save the demo observation')) {
        throw new Error('Unable to save the demo observation.');
      } else if (response.status === 503 || errText.includes('unavailable') || errText.includes('ML')) {
        throw new Error('Anomaly detection service is currently unavailable.');
      }
      throw new Error(errText || 'Anomaly detection service error.');
    }
  } catch (err: any) {
    if (err.message === 'Unable to save the demo observation.' || err.message === 'Anomaly detection service is currently unavailable.') {
      throw err;
    }
    if (!isDemo) {
      console.warn('Spring Boot endpoint unreachable, attempting direct ML API...', err);
    }
  }

  // Direct Python FastAPI fallback for live telemetry checks
  if (!isDemo) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const mlPayload = {
        station_id: data.stationId,
        timestamp: data.timestamp,
        temperature: data.temperature,
        dew_point_temperature: data.dewPointTemperature,
        station_level_pressure: data.stationLevelPressure,
        sea_level_pressure: data.seaLevelPressure,
        wind_direction: data.windDirection,
        wind_speed: data.windSpeed,
        relative_humidity: data.relativeHumidity,
        visibility: data.visibility || 10.0,
      };

      const mlResponse = await fetch(`${ML_DIRECT_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (mlResponse.ok) {
        const result = await mlResponse.json();
        return {
          anomaly: result.anomaly,
          anomaly_score: result.anomaly_score,
          severity: result.severity,
          status: result.status,
          station_id: result.station_id,
          timestamp: result.timestamp,
          reason: result.reason,
          source: 'FASTAPI_ML',
        };
      }
    } catch (err) {
      console.warn('FastAPI direct ML endpoint unreachable.', err);
    }
  }

  throw new Error('Anomaly detection service is currently unavailable.');
}

/**
 * Fetches real historical weather readings from PostgreSQL database
 */
export async function fetchWeatherHistory(
  stationId?: string,
  from?: string,
  to?: string
): Promise<WeatherReadingRecord[]> {
  try {
    const params = new URLSearchParams();
    if (stationId && stationId !== 'all') {
      params.append('stationId', stationId);
    }
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const isAll = !stationId || stationId === 'all';
    const endpoint = isAll ? '/api/weather/history/all' : '/api/weather/history';
    const url = `${API_BASE_URL}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error fetching weather history from backend:', err);
  }
  return [];
}

/**
 * Triggers backend download for filtered historical weather data.
 */
export async function downloadHistoricalData(
  stationId: string,
  from: string,
  to: string,
  format: 'csv' | 'psv' = 'csv'
): Promise<void> {
  const params = new URLSearchParams();
  if (stationId && stationId !== 'all') {
    params.append('station', stationId);
  } else {
    params.append('station', 'all');
  }
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  params.append('format', format);

  const url = `${API_BASE_URL}/api/weather/download?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error('Historical data service is currently unavailable.');
  }

  if (res.status === 404) {
    throw new Error('No historical observations found for the selected period.');
  }

  if (!res.ok) {
    throw new Error('Unable to generate download.');
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  let filename = `skyguard_historical_${from || 'start'}_to_${to || 'end'}.${format}`;

  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}
