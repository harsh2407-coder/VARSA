/**
 * VARSA — Adaptive Weather Intelligence Engine
 * Real Forecast Data Provider (Public API Adapter)
 * 
 * Step B implementation: Minimal real-data vertical slice.
 * Uses Open-Meteo's documented public weather forecast endpoint.
 * Requires NO secret API keys (safe for browser environments).
 * 
 * NOTE: This adapter fetches a single real forecast source (Open-Meteo operational model).
 * It is NOT a multi-model ensemble blend and does NOT invent model weights or verification metrics.
 */

export interface RealDataFetchOptions {
  latitude: number;
  longitude: number;
  forecastDays?: number; // 1 to 16 days, default 3 (72 hours)
  timeoutMs?: number;    // default 8000ms
}

export interface RealForecastPoint {
  timestamp: string;      // Verbatim ISO-8601 string from provider (e.g., "2026-10-24T14:00")
  leadHours: number;      // Hour offset relative to the first forecast point
  temperature: number;    // 2-metre temperature in °C
}

export interface RealForecastResult {
  provider: string;       // "Open-Meteo Public Weather API"
  endpoint: string;       // Request URL
  sourceNote: string;     // Transparent disclaimer on source identity
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  variable: 'temperature';
  unit: '°C';
  fetchedAt: string;      // Client ISO timestamp when response was received
  dataPoints: RealForecastPoint[];
}

/**
 * Validates and normalizes raw response from Open-Meteo API.
 */
function validateOpenMeteoPayload(
  json: unknown,
  endpoint: string
): { elevation: number; timezone: string; dataPoints: RealForecastPoint[] } {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid response: payload is not a JSON object.');
  }

  const payload = json as Record<string, unknown>;

  // Check for error response from Open-Meteo
  if (payload.error === true) {
    const reason = typeof payload.reason === 'string' ? payload.reason : 'Unknown provider error';
    throw new Error(`Open-Meteo API returned error: ${reason}`);
  }

  const hourly = payload.hourly as Record<string, unknown> | undefined;
  if (!hourly || typeof hourly !== 'object') {
    throw new Error('Invalid response: missing "hourly" forecast object.');
  }

  const times = hourly.time;
  const temps = hourly.temperature_2m;

  if (!Array.isArray(times) || !Array.isArray(temps)) {
    throw new Error('Invalid response: "hourly.time" and "hourly.temperature_2m" must be arrays.');
  }

  if (times.length === 0 || temps.length === 0) {
    throw new Error('Invalid response: received empty forecast time-series from provider.');
  }

  if (times.length !== temps.length) {
    throw new Error(
      `Invalid response: time-series dimension mismatch (${times.length} timestamps vs ${temps.length} temperatures).`
    );
  }

  // Validate unit: Open-Meteo returns "°C" for temperature_2m by default
  const hourlyUnits = payload.hourly_units as Record<string, unknown> | undefined;
  const tempUnit = hourlyUnits?.temperature_2m;
  if (tempUnit !== '°C') {
    // If unit differs, report explicitly rather than assuming conversion
    throw new Error(`Unexpected temperature unit from provider: expected "°C", received "${String(tempUnit)}".`);
  }

  const elevation = typeof payload.elevation === 'number' ? payload.elevation : 0;
  const timezone = typeof payload.timezone === 'string' ? payload.timezone : 'UTC';

  const dataPoints: RealForecastPoint[] = [];

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const val = temps[i];

    if (typeof t !== 'string' || t.trim() === '') {
      throw new Error(`Invalid data point at index ${i}: timestamp is missing or not a string.`);
    }

    if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
      throw new Error(`Invalid data point at index ${i} (${t}): temperature value is missing, null, or non-finite.`);
    }

    dataPoints.push({
      timestamp: t,
      leadHours: i,
      temperature: Math.round(val * 10) / 10 // maintain 1 decimal place consistent with VARSA specs
    });
  }

  return { elevation, timezone, dataPoints };
}

/**
 * Fetch real 2-metre temperature forecast from Open-Meteo.
 * 
 * - Lat/Lon: Target coordinates (e.g. representative Indian stations).
 * - Unit: Celsius (°C). Open-Meteo natively returns °C, matching VARSA's T2M spec.
 * - Horizon: Defaults to 3 days (72 hours).
 * - Timeout: Aborts request if the server does not respond within timeoutMs.
 */
export async function fetchRealTemperatureForecast(
  options: RealDataFetchOptions
): Promise<RealForecastResult> {
  const { latitude, longitude, forecastDays = 3, timeoutMs = 8000 } = options;

  if (typeof latitude !== 'number' || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
  }

  if (typeof longitude !== 'number' || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
  }

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&hourly=temperature_2m&forecast_days=${Math.min(Math.max(1, forecastDays), 16)}&timezone=Asia%2FKolkata`;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms while contacting Open-Meteo.`);
    }
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new Error(`Failed to reach Open-Meteo API: ${message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `Open-Meteo API responded with HTTP status ${response.status} (${response.statusText}).`
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error('Failed to parse JSON response from weather provider.');
  }

  const { elevation, timezone, dataPoints } = validateOpenMeteoPayload(json, endpoint);

  return {
    provider: 'Open-Meteo Weather Forecast API',
    endpoint,
    sourceNote: 'Single-source real operational weather forecast (Open-Meteo seamless model). Not an ensemble blend.',
    latitude,
    longitude,
    elevation,
    timezone,
    variable: 'temperature',
    unit: '°C',
    fetchedAt: new Date().toISOString(),
    dataPoints
  };
}
