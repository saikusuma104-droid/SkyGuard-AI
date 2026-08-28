export const API_BASE_URL = 'http://localhost:8080';
export const ML_DIRECT_URL = 'http://localhost:8000';

export interface WeatherRequest {
  stationId: string;
  timestamp: string;
  temperature: number;
  dewPointTemperature: number;
  windDirection: number;
  windSpeed: number;
  relativeHumidity: number;
  visibility: number;
}

export interface AnomalyResponse {
  anomaly: boolean;
  anomaly_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  station_id: string;
  timestamp: string;
  reason?: string;
  confidence?: number;
  source?: 'SPRING_BOOT_BACKEND' | 'FASTAPI_ML' | 'CLIENT_FALLBACK_HEURISTIC';
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

    const res = await fetch(`${API_BASE_URL}/api/anomaly/check`, {
      method: 'OPTIONS',
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && (res.ok || res.status === 405 || res.status === 200)) {
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
      ? 'Spring Boot Backend (Port 8080) & FastAPI ML (Port 8000) Active'
      : mlOnline
      ? 'Direct FastAPI ML Engine (Port 8000) Active'
      : 'Backend offline — Using local Isolation Forest simulation',
  };
}

/**
 * Fetches live IMD AWS weather telemetry and trained ML predictions
 */
export async function fetchLiveAWSData(): Promise<{ stations: any[]; anomalies: any[]; stats: any } | null> {
  // Attempt 1: Spring Boot Backend /api/anomaly/live
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/api/anomaly/live`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.stations) return data;
    }
  } catch (e) {
    // Spring Boot endpoint unavailable, fallback to FastAPI ML
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
 * Direct Open-Meteo API query for the 7 official AWS stations
 * Fetches real live weather data (temperature, pressure, humidity, wind) for every 1-hour refresh interval.
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
        const temp = cur.temperature_2m !== undefined ? Math.round(cur.temperature_2m * 10) / 10 : st.currentReadings.temperature;
        const hum = cur.relative_humidity_2m !== undefined ? Math.round(cur.relative_humidity_2m) : st.currentReadings.humidity;
        const press = cur.surface_pressure !== undefined ? Math.round(cur.surface_pressure * 10) / 10 : st.currentReadings.pressure;
        const wind = cur.wind_speed_10m !== undefined ? Math.round((cur.wind_speed_10m / 3.6) * 10) / 10 : st.currentReadings.windSpeed;

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
      // Fallback
    }

    return {
      stationId: st.id,
      name: st.name,
      location: st.location,
      temperature: st.expectedReadings?.temperature || st.currentReadings.temperature,
      pressure: st.expectedReadings?.pressure || st.currentReadings.pressure,
      humidity: st.expectedReadings?.humidity || st.currentReadings.humidity,
      windSpeed: st.currentReadings.windSpeed,
      isLiveFeed: false,
      fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  });

  return Promise.all(fetchPromises);
}

/**
 * Sends weather telemetry data to the backend anomaly detection service
 */
export async function checkAnomaly(data: WeatherRequest): Promise<AnomalyResponse> {
  try {
    // Attempt 1: Spring Boot Backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

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
    }
  } catch (err) {
    console.warn('Spring Boot endpoint unreachable, attempting direct ML API...', err);
  }

  try {
    // Attempt 2: Direct Python FastAPI ML Endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const mlPayload = {
      station_id: data.stationId,
      timestamp: data.timestamp,
      temperature: data.temperature,
      dew_point_temperature: data.dewPointTemperature,
      wind_direction: data.windDirection,
      wind_speed: data.windSpeed,
      relative_humidity: data.relativeHumidity,
      visibility: data.visibility,
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
        station_id: result.station_id,
        timestamp: result.timestamp,
        reason: result.reason,
        source: 'FASTAPI_ML',
      };
    }
  } catch (err) {
    console.warn('FastAPI direct ML endpoint unreachable.', err);
  }

  const isAnomaly = data.temperature > 50 || data.temperature < -20 || data.relativeHumidity > 100 || data.relativeHumidity < 0;
  const score = isAnomaly ? -0.15 : 0.10;
  const severity = isAnomaly ? 'CRITICAL' : 'NORMAL';

  return {
    anomaly: isAnomaly,
    anomaly_score: score,
    severity: severity as any,
    station_id: data.stationId,
    timestamp: data.timestamp,
    reason: isAnomaly
      ? `Temperature ${data.temperature}°C violates thermodynamic physical limits for synoptic station ${data.stationId}.`
      : `Telemetry nominal. Parameters match physical reference limits.`,
    source: 'CLIENT_FALLBACK_HEURISTIC',
  };
}
