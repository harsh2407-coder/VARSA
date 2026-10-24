/**
 * VARSA — Adaptive Weather Intelligence Engine
 * Real Forecast Data Provider (Public Multi-Model API Adapter)
 * 
 * Task 2: Real Multi-Model NWP Ingestion (GFS, ECMWF, ICON)
 * Uses Open-Meteo's documented public weather forecast endpoint with distinct named model outputs:
 * - NOAA GFS (gfs_seamless)
 * - ECMWF IFS 0.25° (ecmwf_ifs025)
 * - DWD ICON (icon_seamless)
 * 
 * Strict Scientific Standards:
 * - Validates all three member arrays, exact timestamp alignment, and finite numbers.
 * - Weights are transparently fixed: GFS 20%, ECMWF 50%, ICON 30% (Initial heuristic baseline).
 *   Explicitly NOT described as learned or adaptive.
 * - Computes equal-weight baseline (GFS + ECMWF + ICON) / 3.
 * - Computes member spread: max(gfs, ecmwf, icon) - min(gfs, ecmwf, icon).
 * - Identifies live vs cached status.
 * - Provides clearly labeled synthetic simulation for testing extreme divergence (Assam Cloudburst).
 */

export interface RealDataFetchOptions {
  latitude: number;
  longitude: number;
  forecastDays?: number; // 1 to 16 days, default 3 (72 hours)
  timeoutMs?: number;    // default 8000ms
  bypassCache?: boolean; // force network reload
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

export interface MultiModelForecastPoint {
  timestamp: string;          // Verbatim ISO-8601 string from provider
  leadHours: number;          // 0 to 71
  gfs: number;                // NOAA GFS 0.25° (°C)
  ecmwf: number;              // ECMWF IFS 0.25° (°C)
  icon: number;               // DWD ICON seamless (°C)
  weightedBlend: number;      // Fixed weight: (0.20 * GFS) + (0.50 * ECMWF) + (0.30 * ICON)
  equalWeight: number;        // Equal weight: (GFS + ECMWF + ICON) / 3
  disagreementSpread: number; // max(gfs, ecmwf, icon) - min(gfs, ecmwf, icon)
}

export interface MultiModelForecastResult {
  provider: string;
  endpoint: string;
  sourceNote: string;
  weightStrategyNote: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  variable: 'temperature';
  unit: '°C';
  fetchedAt: string;
  isCached: boolean;
  cachedAt?: string;
  isSimulation?: boolean;
  simulationTitle?: string;
  dataPoints: MultiModelForecastPoint[];
}

// In-memory response cache to respect public API rate-limits and indicate live vs cached data
const memoryCache = new Map<string, { result: MultiModelForecastResult; cachedTimeMs: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache validity

/**
 * Validates and normalizes multi-model raw response from Open-Meteo API.
 */
function validateMultiModelPayload(
  json: unknown,
  endpoint: string
): { elevation: number; timezone: string; dataPoints: MultiModelForecastPoint[] } {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid response: payload is not a JSON object.');
  }

  const payload = json as Record<string, unknown>;

  if (payload.error === true) {
    const reason = typeof payload.reason === 'string' ? payload.reason : 'Unknown provider error';
    throw new Error(`Open-Meteo API returned error: ${reason}`);
  }

  const hourly = payload.hourly as Record<string, unknown> | undefined;
  if (!hourly || typeof hourly !== 'object') {
    throw new Error('Invalid response: missing "hourly" forecast object.');
  }

  const times = hourly.time;
  const gfsTemps = hourly.temperature_2m_gfs_seamless;
  const ecmwfTemps = hourly.temperature_2m_ecmwf_ifs025;
  const iconTemps = hourly.temperature_2m_icon_seamless;

  if (
    !Array.isArray(times) ||
    !Array.isArray(gfsTemps) ||
    !Array.isArray(ecmwfTemps) ||
    !Array.isArray(iconTemps)
  ) {
    throw new Error(
      'Invalid response: Expected arrays for time, temperature_2m_gfs_seamless, temperature_2m_ecmwf_ifs025, and temperature_2m_icon_seamless.'
    );
  }

  if (times.length === 0) {
    throw new Error('Invalid response: Received empty time series from provider.');
  }

  // Dimension validation
  if (
    times.length !== gfsTemps.length ||
    times.length !== ecmwfTemps.length ||
    times.length !== iconTemps.length
  ) {
    throw new Error(
      `Dimension mismatch across models: times=${times.length}, GFS=${gfsTemps.length}, ECMWF=${ecmwfTemps.length}, ICON=${iconTemps.length}.`
    );
  }

  // Validate unit declarations if present
  const hourlyUnits = payload.hourly_units as Record<string, unknown> | undefined;
  if (hourlyUnits) {
    const gfsUnit = hourlyUnits.temperature_2m_gfs_seamless;
    const ecmwfUnit = hourlyUnits.temperature_2m_ecmwf_ifs025;
    const iconUnit = hourlyUnits.temperature_2m_icon_seamless;
    if (gfsUnit !== '°C' || ecmwfUnit !== '°C' || iconUnit !== '°C') {
      throw new Error(
        `Unexpected model unit: GFS="${String(gfsUnit)}", ECMWF="${String(ecmwfUnit)}", ICON="${String(iconUnit)}". Expected "°C".`
      );
    }
  }

  const elevation = typeof payload.elevation === 'number' ? payload.elevation : 0;
  const timezone = typeof payload.timezone === 'string' ? payload.timezone : 'UTC';

  const dataPoints: MultiModelForecastPoint[] = [];

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const g = gfsTemps[i];
    const e = ecmwfTemps[i];
    const ic = iconTemps[i];

    if (typeof t !== 'string' || t.trim() === '') {
      throw new Error(`Invalid timestamp at index ${i}: missing or empty string.`);
    }

    if (
      typeof g !== 'number' || !Number.isFinite(g) ||
      typeof e !== 'number' || !Number.isFinite(e) ||
      typeof ic !== 'number' || !Number.isFinite(ic)
    ) {
      throw new Error(
        `Missing or null forecast value at index ${i} (${t}): GFS=${g}, ECMWF=${e}, ICON=${ic}. Missing values are rejected to prevent fabricated data.`
      );
    }

    const gVal = Math.round(g * 10) / 10;
    const eVal = Math.round(e * 10) / 10;
    const icVal = Math.round(ic * 10) / 10;

    // Configured initial fixed weights: GFS 20%, ECMWF 50%, ICON 30%
    const rawBlend = (gVal * 0.20) + (eVal * 0.50) + (icVal * 0.30);
    const weightedBlend = Math.round(rawBlend * 10) / 10;

    // Equal-weight baseline: (GFS + ECMWF + ICON) / 3
    const rawEqual = (gVal + eVal + icVal) / 3;
    const equalWeight = Math.round(rawEqual * 10) / 10;

    // Model disagreement: max - min across the 3 models
    const spread = Math.round((Math.max(gVal, eVal, icVal) - Math.min(gVal, eVal, icVal)) * 10) / 10;

    dataPoints.push({
      timestamp: t,
      leadHours: i,
      gfs: gVal,
      ecmwf: eVal,
      icon: icVal,
      weightedBlend,
      equalWeight,
      disagreementSpread: spread
    });
  }

  return { elevation, timezone, dataPoints };
}

/**
 * Fetch real multi-model 2m temperature forecast (GFS, ECMWF, ICON) from Open-Meteo.
 */
export async function fetchRealMultiModelForecast(
  options: RealDataFetchOptions
): Promise<MultiModelForecastResult> {
  const { latitude, longitude, forecastDays = 3, timeoutMs = 8000, bypassCache = false } = options;

  if (typeof latitude !== 'number' || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
  }

  if (typeof longitude !== 'number' || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
  }

  const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${forecastDays}`;
  const nowMs = Date.now();

  // Check cache first if not bypassing
  if (!bypassCache && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (nowMs - cached.cachedTimeMs < CACHE_TTL_MS) {
      return {
        ...cached.result,
        isCached: true,
        cachedAt: new Date(cached.cachedTimeMs).toISOString()
      };
    }
  }

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&hourly=temperature_2m&models=gfs_seamless,ecmwf_ifs025,icon_seamless&forecast_days=${Math.min(Math.max(1, forecastDays), 16)}&timezone=Asia%2FKolkata`;

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
    throw new Error(`Open-Meteo API returned HTTP ${response.status} (${response.statusText}).`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error('Failed to parse JSON response from weather provider.');
  }

  const { elevation, timezone, dataPoints } = validateMultiModelPayload(json, endpoint);

  const result: MultiModelForecastResult = {
    provider: 'Open-Meteo Multi-Model NWP API',
    endpoint,
    sourceNote: 'Live multi-model operational forecast ingesting distinct NOAA GFS, ECMWF IFS 0.25°, and DWD ICON outputs.',
    weightStrategyNote: 'Configured fixed initial weights: GFS 20%, ECMWF 50%, ICON 30%. (Transparent fixed-weight baseline; not adaptive or ML-learned).',
    latitude,
    longitude,
    elevation,
    timezone,
    variable: 'temperature',
    unit: '°C',
    fetchedAt: new Date().toISOString(),
    isCached: false,
    dataPoints
  };

  // Update memory cache
  memoryCache.set(cacheKey, {
    result,
    cachedTimeMs: nowMs
  });

  return result;
}

/**
 * Generate a clearly-labeled synthetic simulation of extreme multi-model divergence.
 * Scenario: Assam Cloudburst Convective Disagreement
 * Location: Guwahati / Brahmaputra Valley (Lat: 26.14°N, Lon: 91.73°E, Elev: 55m)
 * 
 * Demonstrates high divergence under extreme orographic convection:
 * - High-res ICON resolves localized convective cold pool plunge
 * - ECMWF resolves synoptic cooling
 * - Coarse GFS smooths convective signal
 */
export function generateAssamCloudburstSimulation(): MultiModelForecastResult {
  const points: MultiModelForecastPoint[] = [];
  const baseTime = new Date();
  baseTime.setMinutes(0, 0, 0);

  for (let i = 0; i < 72; i++) {
    const ptDate = new Date(baseTime.getTime() + i * 3600 * 1000);
    const dateStr = ptDate.toISOString().slice(0, 16);

    // Diurnal temperature wave (base ~27°C, daytime peak ~31°C, nighttime ~23°C)
    const diurnal = Math.sin((i / 24) * 2 * Math.PI - 0.5) * 4.2;
    const nominalTemp = 26.5 + diurnal;

    let gfs = nominalTemp;
    let ecmwf = nominalTemp - 0.5;
    let icon = nominalTemp + 0.3;

    // Simulate extreme convective storm signature between T+18h and T+36h
    if (i >= 18 && i <= 36) {
      const stormProgress = Math.sin(((i - 18) / 18) * Math.PI);
      // ICON drops sharply by up to 8.5°C due to intense convective downdraft / rain-cooling
      icon -= stormProgress * 8.5;
      // ECMWF drops moderately by 4.2°C
      ecmwf -= stormProgress * 4.2;
      // GFS has coarse resolution, only drops by 1.1°C
      gfs -= stormProgress * 1.1;
    }

    const gVal = Math.round(gfs * 10) / 10;
    const eVal = Math.round(ecmwf * 10) / 10;
    const icVal = Math.round(icon * 10) / 10;

    const rawBlend = (gVal * 0.20) + (eVal * 0.50) + (icVal * 0.30);
    const weightedBlend = Math.round(rawBlend * 10) / 10;
    const rawEqual = (gVal + eVal + icVal) / 3;
    const equalWeight = Math.round(rawEqual * 10) / 10;
    const spread = Math.round((Math.max(gVal, eVal, icVal) - Math.min(gVal, eVal, icVal)) * 10) / 10;

    points.push({
      timestamp: dateStr,
      leadHours: i,
      gfs: gVal,
      ecmwf: eVal,
      icon: icVal,
      weightedBlend,
      equalWeight,
      disagreementSpread: spread
    });
  }

  return {
    provider: 'VARSA Meteorological Research Sandbox',
    endpoint: 'INTERNAL_SIMULATION://scenarios/assam_cloudburst_divergence',
    sourceNote: 'SYNTHETIC CONVECTIVE SIMULATION: Demonstrates extreme NWP divergence over Brahmaputra orography. NOT a live forecast or official IMD advisory.',
    weightStrategyNote: 'Initial fixed weights: GFS 20%, ECMWF 50%, ICON 30% compared against (GFS+ECMWF+ICON)/3 equal-weight baseline.',
    latitude: 26.14,
    longitude: 91.73,
    elevation: 55,
    timezone: 'Asia/Kolkata',
    variable: 'temperature',
    unit: '°C',
    fetchedAt: new Date().toISOString(),
    isCached: false,
    isSimulation: true,
    simulationTitle: 'Simulate Assam Cloudburst (Synthetic Divergence Scenario)',
    dataPoints: points
  };
}

/**
 * Backward compatibility: Single temperature series fetcher from Task 1.
 */
export async function fetchRealTemperatureForecast(
  options: RealDataFetchOptions
): Promise<RealForecastResult> {
  const multi = await fetchRealMultiModelForecast(options);
  return {
    provider: multi.provider,
    endpoint: multi.endpoint,
    sourceNote: multi.sourceNote,
    latitude: multi.latitude,
    longitude: multi.longitude,
    elevation: multi.elevation,
    timezone: multi.timezone,
    variable: multi.variable,
    unit: multi.unit,
    fetchedAt: multi.fetchedAt,
    dataPoints: multi.dataPoints.map(p => ({
      timestamp: p.timestamp,
      leadHours: p.leadHours,
      temperature: p.ecmwf // default to ECMWF member
    }))
  };
}
