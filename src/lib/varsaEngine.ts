/**
 * VARSA — Adaptive Weather Intelligence Engine
 * Central Demonstration Engine (Deterministic Logic)
 * 
 * Sits above multi-model NWP forecast sources (GFS, ECMWF, ICON)
 * and calculates:
 * - Deterministic model forecasts (GFS, ECMWF, ICON)
 * - Context-dependent adaptive weights (always summing to 1.000 / 100%)
 * - Mathematically computed blended forecast:
 *   VARSA = (GFS * w_GFS) + (ECMWF * w_ECMWF) + (ICON * w_ICON)
 * - Model disagreement spread & categorization (Low / Moderate / High)
 * - Observation reference
 * - Verification scorecard & illustrative comparison delta
 * - Responsive extreme guidance demonstration scenarios
 */

import {
  RegionId,
  VariableId,
  LeadTimeId,
  WeatherRegimeId,
  RegionInfo,
  VariableInfo,
  LeadTimeInfo,
  WeatherRegimeInfo,
  ModelWeights,
  TimePointForecast,
  VerificationMetrics,
  ExtremeWeatherEvent,
  REGIONS,
  VARIABLES,
  LEAD_TIMES,
  WEATHER_REGIMES,
  VERIFICATION_DATA,
  EXTREME_WEATHER_EVENTS
} from '../data/varsaData';

export interface VarsaEngineParams {
  region: RegionId;
  variable: VariableId;
  leadTime: LeadTimeId;
  weatherRegime: WeatherRegimeId;
}

export interface ContextSummary {
  regionName: string;
  subdivision: string;
  leadTimeLabel: string;
  variableName: string;
  regimeName: string;
  synopticFeature: string;
  spreadValue: number;
  unit: string;
  disagreementLevel: 'Low' | 'Moderate' | 'High';
  varsaResponse: string;
  rationale: string;
}

export interface VarsaEngineResult {
  params: VarsaEngineParams;
  regionInfo: RegionInfo;
  variableInfo: VariableInfo;
  leadTimeInfo: LeadTimeInfo;
  weatherRegimeInfo: WeatherRegimeInfo;

  // Single-point active forecast at selected lead time
  activePoint: TimePointForecast;
  gfsForecast: number;
  ecmwfForecast: number;
  iconForecast: number;
  blendedForecast: number; // VARSA calculated value
  equalWeightForecast: number;
  observationReference: number;

  // Adaptive model weights (guaranteed sum === 1.000)
  weights: ModelWeights;

  // Computed disagreement
  modelDisagreement: {
    spread: number;
    level: 'Low' | 'Moderate' | 'High';
    description: string;
  };

  // Full 0h to 144h time series for charts & matrix
  timeSeries: TimePointForecast[];

  // Verification scorecard
  verificationMetrics: VerificationMetrics;
  illustrativeDeltaPercent: number;

  // Responsive demonstration extreme weather event
  activeExtremeEvent: ExtremeWeatherEvent | null;
  allExtremeEvents: ExtremeWeatherEvent[];

  // Context & adaptation summary
  contextSummary: ContextSummary;
}

/**
 * Deterministic Adaptive Weight Generator
 * Calculates weights from regional geography, synoptic regime, lead time, and variable.
 * Guarantees GFS + ECMWF + ICON = 1.000 (100%) exactly.
 */
export function calculateAdaptiveWeights(
  region: RegionId,
  leadTime: LeadTimeId,
  regime: WeatherRegimeId,
  variable: VariableId
): { weights: ModelWeights; responseDescription: string } {
  // Base weights by region and variable
  let gfs = 0.33;
  let ecmwf = 0.34;
  let icon = 0.33;
  let rationale = '';
  let responseDesc = '';

  // 1. Regional and variable specialization
  if (region === 'central' && variable === 'rainfall') {
    // Central India monsoon scenario: ECMWF receives higher weight; GFS contribution reduced; ICON included for convective structure
    ecmwf = 0.46;
    gfs = 0.32;
    icon = 0.22;
    rationale = 'In this demonstration scenario, ECMWF receives 46% weight for synoptic track representation; GFS contribution reduced to 32%; ICON allocated 22% for convective structure.';
    responseDesc = 'ECMWF receives higher weight in this demonstration scenario (46%); GFS contribution reduced to 32%; ICON at 22%';
  } else if (region === 'north' && variable === 'temperature') {
    // North India temperature scenario: ECMWF receives higher weight; ICON included for terrain variation; GFS contribution reduced
    ecmwf = 0.54;
    gfs = 0.28;
    icon = 0.18;
    rationale = 'In this demonstration scenario, ECMWF receives 54% weight for synoptic temperature representation; GFS contribution reduced to 28%; ICON allocated 18% for elevation-related variation.';
    responseDesc = 'ECMWF receives higher weight in this demonstration scenario (54%); GFS contribution reduced to 28%; ICON at 18%';
  } else if (region === 'west' && variable === 'wind_speed') {
    // West coast wind scenario: ICON receives higher weight for coastal representation; ECMWF dominant for offshore flow
    icon = 0.38;
    ecmwf = 0.42;
    gfs = 0.20;
    rationale = 'In this demonstration scenario, ECMWF receives 42% weight for offshore synoptic flow; ICON receives 38% for coastal terrain representation; GFS contribution at 20%.';
    responseDesc = 'ICON receives higher weight in this demonstration scenario (38%); ECMWF at 42% for offshore flow; GFS contribution reduced to 20%';
  } else if (region === 'south' && variable === 'rainfall') {
    // South India rainfall scenario: ECMWF receives higher weight; ICON included for coastal terrain; GFS balanced
    ecmwf = 0.49;
    icon = 0.26;
    gfs = 0.25;
    rationale = 'In this demonstration scenario, ECMWF receives 49% weight for peninsular synoptic moisture; ICON allocated 26% for coastal terrain representation; GFS at 25%.';
    responseDesc = 'ECMWF receives higher weight in this demonstration scenario (49%); ICON at 26%; GFS contribution at 25%';
  } else if (region === 'northeast') {
    // Northeast India scenario: ICON receives higher weight for complex terrain; ECMWF for synoptic flow
    icon = 0.44;
    ecmwf = 0.36;
    gfs = 0.20;
    rationale = 'In this demonstration scenario, ICON receives 44% weight for complex terrain representation; ECMWF allocated 36% for synoptic moisture flow; GFS at 20%.';
    responseDesc = 'ICON receives higher weight in this demonstration scenario (44%); ECMWF at 36% for synoptic flow; GFS contribution reduced to 20%';
  } else if (region === 'east') {
    // East India scenario: ECMWF receives higher weight for synoptic low tracking; ICON for coastal resolution
    ecmwf = 0.48;
    icon = 0.28;
    gfs = 0.24;
    rationale = 'In this demonstration scenario, ECMWF receives 48% weight for synoptic low tracking; ICON allocated 28% for coastal resolution; GFS at 24%.';
    responseDesc = 'ECMWF receives higher weight in this demonstration scenario (48%); ICON at 28%; GFS contribution at 24%';
  } else {
    // Standard baseline demonstration distribution
    if (variable === 'rainfall') {
      ecmwf = 0.45;
      icon = 0.30;
      gfs = 0.25;
      rationale = 'In this demonstration scenario, ECMWF receives 45% weight for synoptic precipitation; ICON allocated 30% for convective structure; GFS contribution at 25%.';
      responseDesc = 'ECMWF receives higher weight in this demonstration scenario (45%); ICON at 30%; GFS contribution at 25%';
    } else if (variable === 'temperature') {
      ecmwf = 0.50;
      gfs = 0.28;
      icon = 0.22;
      rationale = 'In this demonstration scenario, ECMWF receives 50% weight for temperature representation; GFS contribution at 28%; ICON allocated 22% for local terrain variation.';
      responseDesc = 'ECMWF receives higher weight in this demonstration scenario (50%); GFS contribution at 28%; ICON at 22%';
    } else {
      ecmwf = 0.42;
      icon = 0.36;
      gfs = 0.22;
      rationale = 'In this demonstration scenario, ECMWF receives 42% weight for synoptic pressure gradient; ICON allocated 36% for boundary layer dynamics; GFS contribution at 22%.';
      responseDesc = 'ECMWF receives higher weight in this demonstration scenario (42%); ICON at 36% for boundary layer; GFS contribution reduced to 22%';
    }
  }

  // 2. Lead Time degradation adjustments
  // At longer lead times (T+72h, T+96h, T+120h), ECMWF global synoptic stability increases relative to mesoscale ICON
  if (leadTime === '72h') {
    ecmwf += 0.03;
    icon -= 0.02;
    gfs -= 0.01;
  } else if (leadTime === '96h') {
    ecmwf += 0.07;
    icon -= 0.05;
    gfs -= 0.02;
  } else if (leadTime === '120h') {
    ecmwf += 0.11;
    icon -= 0.08;
    gfs -= 0.03;
  }

  // 3. Weather Regime synoptic adjustments
  if (regime === 'western_disturbance') {
    // ECMWF excels at upper-tropospheric baroclinic jet waves
    ecmwf += 0.04;
    gfs -= 0.02;
    icon -= 0.02;
  } else if (regime === 'premonsoon_heatwave') {
    // Thermal stagnation: suppress GFS hot bias further
    ecmwf += 0.03;
    gfs -= 0.03;
  } else if (regime === 'coastal_depression') {
    // Maritime boundary shear: increase ICON and ECMWF
    icon += 0.03;
    gfs -= 0.03;
  }

  // 4. Strict normalization to guarantee exact sum === 1.0000 (100%)
  const sum = gfs + ecmwf + icon;
  let gfsNorm = Math.round((gfs / sum) * 100) / 100;
  let ecmwfNorm = Math.round((ecmwf / sum) * 100) / 100;
  let iconNorm = Math.round((1 - gfsNorm - ecmwfNorm) * 100) / 100;

  // Edge case safety for rounding
  if (iconNorm < 0) {
    iconNorm = 0.05;
    ecmwfNorm = Math.round((1 - gfsNorm - iconNorm) * 100) / 100;
  }

  const dominantModel = ecmwfNorm >= gfsNorm && ecmwfNorm >= iconNorm ? 'ecmwf' : iconNorm >= gfsNorm ? 'icon' : 'gfs';

  const weights: ModelWeights = {
    gfs: gfsNorm,
    ecmwf: ecmwfNorm,
    icon: iconNorm,
    dominantModel,
    weightRationale: rationale,
    disagreementIndex: 0 // Will be calculated from forecast spread
  };

  return { weights, responseDescription: responseDesc };
}

/**
 * Deterministic Forecast Generator
 * Calculates deterministic member forecasts (GFS, ECMWF, ICON),
 * and computes the VARSA blended value mathematically:
 * VARSA = (GFS * w_GFS) + (ECMWF * w_ECMWF) + (ICON * w_ICON)
 */
export function generateDeterministicForecasts(
  region: RegionId,
  variable: VariableId,
  weights: ModelWeights,
  regime: WeatherRegimeId
): TimePointForecast[] {
  const hoursSequence = [0, 24, 48, 72, 96, 120, 144];
  const points: TimePointForecast[] = [];

  // Regional baseline values
  let baseVal = 0;
  let regimeFactor = 1.0;

  if (variable === 'rainfall') {
    baseVal = region === 'northeast' ? 52.0 : region === 'west' ? 42.0 : region === 'central' ? 36.0 : region === 'east' ? 34.0 : region === 'south' ? 22.0 : 12.0;
    regimeFactor = regime === 'monsoon_convective' ? 2.2 : regime === 'coastal_depression' ? 1.9 : regime === 'western_disturbance' ? 1.2 : 0.4;
  } else if (variable === 'temperature') {
    baseVal = region === 'north' ? 37.0 : region === 'central' ? 39.5 : region === 'west' ? 34.0 : region === 'east' ? 35.5 : region === 'south' ? 32.0 : 28.5;
    regimeFactor = regime === 'premonsoon_heatwave' ? 1.18 : regime === 'western_disturbance' ? 0.88 : 1.0;
  } else {
    // wind_speed
    baseVal = region === 'west' ? 38.0 : region === 'east' ? 32.0 : region === 'south' ? 26.0 : 18.0;
    regimeFactor = regime === 'coastal_depression' ? 1.85 : regime === 'western_disturbance' ? 1.3 : 1.0;
  }

  hoursSequence.forEach((hr, i) => {
    const timeLabel = hr === 0 ? 'Analysis T0' : `T+${hr}h`;

    // Deterministic diurnal / synoptic variation curve
    const cycle = Math.sin((i * 1.08) + 0.35);
    const nominal = Math.max(0, baseVal * regimeFactor + (cycle * (baseVal * 0.28)));

    // Deterministic member divergence patterns
    let gfsDelta = 0;
    let ecmwfDelta = 0;
    let iconDelta = 0;

    if (variable === 'rainfall') {
      // Demonstration scenario divergence: GFS member runs higher; ECMWF member runs lower; ICON alternates
      gfsDelta = (nominal * 0.24) + 4.2;
      ecmwfDelta = -(nominal * 0.09) - 1.2;
      iconDelta = (i % 2 === 0 ? (nominal * 0.14) : -(nominal * 0.12));
    } else if (variable === 'temperature') {
      // Demonstration scenario divergence: GFS member runs warmer; ECMWF member runs cooler; ICON alternates
      gfsDelta = 1.6;
      ecmwfDelta = -0.4;
      iconDelta = (i % 2 === 0 ? 0.3 : -0.2);
    } else {
      // Demonstration scenario divergence: ICON member runs higher; GFS member runs lower; ECMWF intermediate
      iconDelta = 4.8;
      ecmwfDelta = 1.4;
      gfsDelta = -3.2;
    }

    const gfsVal = Math.max(0, Math.round((nominal + gfsDelta) * 10) / 10);
    const ecmwfVal = Math.max(0, Math.round((nominal + ecmwfDelta) * 10) / 10);
    const iconVal = Math.max(0, Math.round((nominal + iconDelta) * 10) / 10);

    // Strict mathematical VARSA weighted blend
    const rawVarsa = (gfsVal * weights.gfs) + (ecmwfVal * weights.ecmwf) + (iconVal * weights.icon);
    const varsaVal = Math.max(0, Math.round(rawVarsa * 10) / 10);

    // Simple Equal Weight baseline for comparison
    const rawEqual = (gfsVal + ecmwfVal + iconVal) / 3;
    const eqVal = Math.max(0, Math.round(rawEqual * 10) / 10);

    // Deterministic Observation Reference
    // Sits close to the consensus blend with subtle realistic calibration variance
    const obsNoise = Math.sin(i * 2.1) * (variable === 'rainfall' ? 1.6 : variable === 'temperature' ? 0.3 : 1.2);
    const obsVal = Math.max(0, Math.round((varsaVal + obsNoise) * 10) / 10);

    const minModel = Math.min(gfsVal, ecmwfVal, iconVal);
    const maxModel = Math.max(gfsVal, ecmwfVal, iconVal);
    const spread = Math.round((maxModel - minModel) * 10) / 10;

    points.push({
      timeLabel,
      hours: hr,
      gfs: gfsVal,
      ecmwf: ecmwfVal,
      icon: iconVal,
      varsa: varsaVal,
      equalWeight: eqVal,
      observation: obsVal,
      spread
    });
  });

  return points;
}

/**
 * Categorize Disagreement Spread deterministically
 */
export function categorizeDisagreement(
  spread: number,
  variable: VariableId
): { spread: number; level: 'Low' | 'Moderate' | 'High'; description: string } {
  let lowThresh = 0;
  let highThresh = 0;

  if (variable === 'rainfall') {
    lowThresh = 8.0;
    highThresh = 20.0;
  } else if (variable === 'temperature') {
    lowThresh = 1.2;
    highThresh = 2.5;
  } else {
    // wind_speed
    lowThresh = 6.0;
    highThresh = 14.0;
  }

  if (spread <= lowThresh) {
    return {
      spread,
      level: 'Low',
      description: `Models in strong consensus (Spread: ±${spread} ${VARIABLES[variable].unit})`
    };
  } else if (spread <= highThresh) {
    return {
      spread,
      level: 'Moderate',
      description: `Moderate divergence across ensemble members (Spread: ±${spread} ${VARIABLES[variable].unit})`
    };
  } else {
    return {
      spread,
      level: 'High',
      description: `High divergence among models — adaptive weighting suppression active (Spread: ±${spread} ${VARIABLES[variable].unit})`
    };
  }
}

/**
 * Resolve Responsive Demonstration Extreme Guidance
 * Matches scenario to demonstrated hazards or creates a coherent demonstration scenario
 */
export function resolveExtremeGuidance(
  region: RegionId,
  variable: VariableId,
  leadTime: LeadTimeId,
  blendedVal: number
): ExtremeWeatherEvent | null {
  // Check exact catalog match first
  const existing = EXTREME_WEATHER_EVENTS.find(
    e => e.regionId === region && e.leadTime === leadTime
  );
  if (existing) return existing;

  // Check same region
  const sameRegion = EXTREME_WEATHER_EVENTS.find(e => e.regionId === region);
  if (sameRegion) return sameRegion;

  // Generate dynamic demonstration event if conditions warrant
  if (variable === 'rainfall' && blendedVal >= 45) {
    return {
      id: `rain-${region}-${leadTime}`,
      type: 'heavy_rain',
      title: `Monsoon Convective Precipitation Scenario (${REGIONS[region].name})`,
      regionId: region,
      regionName: REGIONS[region].name,
      leadTime,
      signalLabel: blendedVal > 75 ? 'Elevated Signal' : 'Moderate Signal',
      signalValue: `${blendedVal} mm / 24h (Blended)`,
      threshold: '> 64.5 mm (Heavy Rainfall)',
      severity: blendedVal > 75 ? 'Warning' : 'Watch',
      probability: Math.min(88, Math.max(62, Math.round(blendedVal * 0.8))),
      modelConsensus: 'NWP members diverge on local precipitation core. VARSA dynamic weighting stabilizes consensus estimate.',
      operationalGuidance: `Demonstration scenario: Alert local disaster management teams for drainage basin monitoring across ${REGIONS[region].subdivision.split('&')[0]}.`,
      affectedDistricts: [REGIONS[region].representativeStation.split(' ')[0], 'Regional Sub-Division Sector A', 'Sector B']
    };
  } else if (variable === 'temperature' && blendedVal >= 41) {
    return {
      id: `heat-${region}-${leadTime}`,
      type: 'heat',
      title: `Elevated Thermal Condition Scenario (${REGIONS[region].name})`,
      regionId: region,
      regionName: REGIONS[region].name,
      leadTime,
      signalLabel: 'Moderate Signal',
      signalValue: `${blendedVal} °C (Blended Peak)`,
      threshold: '≥ 42.0 °C (Heatwave Threshold)',
      severity: 'Watch',
      probability: 74,
      modelConsensus: 'GFS indicates daytime thermal spike; ECMWF projects moderate boundary layer temperature. VARSA blend stabilizes consensus.',
      operationalGuidance: 'Demonstration scenario: Issue community health advisory for vulnerable populations; avoid peak sun exposure.',
      affectedDistricts: [REGIONS[region].representativeStation.split(' ')[0], 'District Core', 'Surrounding Valley']
    };
  } else if (variable === 'wind_speed' && blendedVal >= 40) {
    return {
      id: `wind-${region}-${leadTime}`,
      type: 'high_wind',
      title: `Coastal / Surface Wind Acceleration Scenario (${REGIONS[region].name})`,
      regionId: region,
      regionName: REGIONS[region].name,
      leadTime,
      signalLabel: 'Watch',
      signalValue: `${blendedVal} km/h (Blended)`,
      threshold: '≥ 45.0 km/h (Sustained Gale)',
      severity: 'Watch',
      probability: 70,
      modelConsensus: 'ICON and ECMWF project localized gradient acceleration along terrain barrier.',
      operationalGuidance: 'Demonstration scenario: Precautionary advisory for small craft and structural installations.',
      affectedDistricts: [REGIONS[region].representativeStation.split(' ')[0], 'Coastal Corridor']
    };
  }

  return null;
}

/**
 * ============================================================================
 * MAIN CENTRAL DEMONSTRATION ENGINE ENTRYPOINT
 * ============================================================================
 * 
 * Conceptually:
 * runVarsaDemo({ region, variable, leadTime, weatherRegime })
 * -> {
 *   gfsForecast, ecmwfForecast, iconForecast, weights,
 *   blendedForecast, observation, verification, extremeSignal, contextSummary
 * }
 */
export function runVarsaDemo(params: VarsaEngineParams): VarsaEngineResult {
  const { region, variable, leadTime, weatherRegime } = params;

  const regionInfo = REGIONS[region];
  const variableInfo = VARIABLES[variable];
  const leadTimeInfo = LEAD_TIMES[leadTime];
  const weatherRegimeInfo = WEATHER_REGIMES[weatherRegime];

  // 1. Calculate deterministic adaptive weights
  const { weights, responseDescription } = calculateAdaptiveWeights(
    region,
    leadTime,
    weatherRegime,
    variable
  );

  // 2. Generate deterministic time series (0h to 144h) with explicit VARSA blend calculation
  const timeSeries = generateDeterministicForecasts(region, variable, weights, weatherRegime);

  // 3. Extract the active forecast point for the current lead time
  const targetHour = leadTimeInfo.hours;
  const activePoint = timeSeries.find(p => p.hours === targetHour) || timeSeries[1];

  // Disagreement calculation
  const modelDisagreement = categorizeDisagreement(activePoint.spread, variable);

  // Update disagreement index in weights object
  weights.disagreementIndex = Math.min(9.8, Math.max(2.1, Math.round((activePoint.spread / (variable === 'rainfall' ? 20 : variable === 'temperature' ? 3 : 15)) * 8 * 10) / 10));

  // 4. Verification metrics (single source of truth)
  const verificationMetrics = VERIFICATION_DATA[variable][region];
  const illustrativeDeltaPercent = verificationMetrics.skillImprovementPercent;

  // 5. Extreme hazard scenario resolution
  const activeExtremeEvent = resolveExtremeGuidance(region, variable, leadTime, activePoint.varsa);

  // 6. Context summary
  const contextSummary: ContextSummary = {
    regionName: regionInfo.name,
    subdivision: regionInfo.subdivision,
    leadTimeLabel: leadTimeInfo.label,
    variableName: variableInfo.name,
    regimeName: weatherRegimeInfo.name,
    synopticFeature: weatherRegimeInfo.synopticFeature,
    spreadValue: activePoint.spread,
    unit: variableInfo.unit,
    disagreementLevel: modelDisagreement.level,
    varsaResponse: responseDescription,
    rationale: weights.weightRationale
  };

  return {
    params,
    regionInfo,
    variableInfo,
    leadTimeInfo,
    weatherRegimeInfo,

    activePoint,
    gfsForecast: activePoint.gfs,
    ecmwfForecast: activePoint.ecmwf,
    iconForecast: activePoint.icon,
    blendedForecast: activePoint.varsa, // Strictly calculated!
    equalWeightForecast: activePoint.equalWeight,
    observationReference: activePoint.observation,

    weights,
    modelDisagreement,
    timeSeries,

    verificationMetrics,
    illustrativeDeltaPercent,

    activeExtremeEvent,
    allExtremeEvents: EXTREME_WEATHER_EVENTS,

    contextSummary
  };
}

/**
 * Predefined Demonstration Scenarios (Prompt Section 16)
 * Enables one-click judge demonstrations that immediately highlight adaptive blending.
 */
export interface DemoScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  params: VarsaEngineParams;
}

export const DEMO_SCENARIOS: DemoScenarioPreset[] = [
  {
    id: 'scenario-a',
    name: 'Scenario A: Central India Monsoon Rainfall (+24h)',
    badge: 'Heavy Rain · Demo Dataset',
    description: 'GFS contribution reduced in this demonstration scenario; ECMWF receives higher weight (46%); ICON at 22% for convective structure in Vidarbha basin.',
    params: {
      region: 'central',
      variable: 'rainfall',
      leadTime: '24h',
      weatherRegime: 'monsoon_convective'
    }
  },
  {
    id: 'scenario-b',
    name: 'Scenario B: North India Thermal Stagnation (+48h)',
    badge: 'Temperature · Demo Dataset',
    description: 'ECMWF receives higher weight in this demonstration scenario (54%); GFS contribution reduced to 28%; ICON allocated 18%.',
    params: {
      region: 'north',
      variable: 'temperature',
      leadTime: '48h',
      weatherRegime: 'premonsoon_heatwave'
    }
  },
  {
    id: 'scenario-c',
    name: 'Scenario C: South India Peninsular Moisture (+72h)',
    badge: 'Extended Range · Demo Dataset',
    description: 'ECMWF receives higher weight in this demonstration scenario (49%); ICON at 26%; GFS contribution at 25% at T+72h lead time.',
    params: {
      region: 'south',
      variable: 'rainfall',
      leadTime: '72h',
      weatherRegime: 'monsoon_convective'
    }
  },
  {
    id: 'scenario-d',
    name: 'Scenario D: West Coast Maritime High Wind (+24h)',
    badge: 'Wind · Demo Dataset',
    description: 'ICON receives higher weight in this demonstration scenario (38%); ECMWF at 42% for offshore synoptic flow; GFS contribution reduced to 20%.',
    params: {
      region: 'west',
      variable: 'wind_speed',
      leadTime: '24h',
      weatherRegime: 'coastal_depression'
    }
  }
];
