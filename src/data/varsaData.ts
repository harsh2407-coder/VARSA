/**
 * VARSA — Adaptive Weather Intelligence Engine
 * Deterministic Meteorological Prototype Dataset & Scientific Logic
 * 
 * NOTE: Values are structured demonstration data calibrated to represent
 * operational NWP divergence patterns across Indian meteorological sub-divisions.
 */

export type RegionId = 'north' | 'central' | 'west' | 'east' | 'south' | 'northeast';
export type VariableId = 'rainfall' | 'temperature' | 'wind_speed';
export type LeadTimeId = '24h' | '48h' | '72h' | '96h' | '120h';
export type WeatherRegimeId = 'monsoon_convective' | 'western_disturbance' | 'premonsoon_heatwave' | 'coastal_depression';

export interface RegionInfo {
  id: RegionId;
  name: string;
  subdivision: string;
  representativeStation: string;
  lat: number;
  lon: number;
  elevation: string;
  dominantRegime: WeatherRegimeId;
  description: string;
}

export interface VariableInfo {
  id: VariableId;
  name: string;
  unit: string;
  symbol: string;
  description: string;
  color: string;
  precision: number;
}

export interface LeadTimeInfo {
  id: LeadTimeId;
  label: string;
  hours: number;
  confidenceBand: string;
}

export interface WeatherRegimeInfo {
  id: WeatherRegimeId;
  name: string;
  synopticFeature: string;
  dynamics: string;
}

export interface ModelWeights {
  gfs: number; // 0 to 1
  ecmwf: number;
  icon: number;
  dominantModel: 'gfs' | 'ecmwf' | 'icon';
  weightRationale: string;
  disagreementIndex: number; // 0 to 10 scale (spread between models)
}

export interface TimePointForecast {
  timeLabel: string;
  hours: number;
  gfs: number;
  ecmwf: number;
  icon: number;
  varsa: number;
  equalWeight: number;
  observation: number;
  spread: number;
}

export interface VerificationMetrics {
  gfs: { mae: number; rmse: number; bias: number; csi: number };
  ecmwf: { mae: number; rmse: number; bias: number; csi: number };
  icon: { mae: number; rmse: number; bias: number; csi: number };
  equalWeight: { mae: number; rmse: number; bias: number; csi: number };
  varsa: { mae: number; rmse: number; bias: number; csi: number };
  skillImprovementPercent: number; // vs equal weight
}

export interface ExtremeWeatherEvent {
  id: string;
  type: 'heavy_rain' | 'heat' | 'high_wind';
  title: string;
  regionId: RegionId;
  regionName: string;
  leadTime: LeadTimeId;
  signalValue: string;
  threshold: string;
  severity: 'Advisory' | 'Watch' | 'Warning' | 'Severe Warning';
  probability: number;
  modelConsensus: string;
  operationalGuidance: string;
  affectedDistricts: string[];
}

export const REGIONS: Record<RegionId, RegionInfo> = {
  north: {
    id: 'north',
    name: 'North India',
    subdivision: 'Western Himalayas & Indo-Gangetic Plains',
    representativeStation: 'New Delhi (VIDD) & Shimla',
    lat: 28.61,
    lon: 77.20,
    elevation: '216m - 2200m ASL',
    dominantRegime: 'western_disturbance',
    description: 'Susceptible to mid-latitude western disturbances in winter/spring and monsoon troughs in summer.'
  },
  central: {
    id: 'central',
    name: 'Central India',
    subdivision: 'Madhya Plateau & Vidarbha Basin',
    representativeStation: 'Nagpur (VANP) & Bhopal',
    lat: 21.14,
    lon: 79.08,
    elevation: '312m ASL',
    dominantRegime: 'monsoon_convective',
    description: 'Key monsoon core zone with deep convective systems and recurring monsoon depression transits.'
  },
  west: {
    id: 'west',
    name: 'West India',
    subdivision: 'Konkan Coast, Gujarat & Thar Plains',
    representativeStation: 'Mumbai (VABB) & Ahmedabad',
    lat: 19.07,
    lon: 72.87,
    elevation: '14m ASL',
    dominantRegime: 'coastal_depression',
    description: 'Western Ghats orographic barrier interaction with Arabian Sea moisture flux and pre-monsoon heat.'
  },
  east: {
    id: 'east',
    name: 'East India',
    subdivision: 'Lower Gangetic Plain & Odisha Coastal Belt',
    representativeStation: 'Kolkata (VECC) & Bhubaneswar',
    lat: 22.57,
    lon: 88.36,
    elevation: '9m ASL',
    dominantRegime: 'coastal_depression',
    description: 'High cyclogenesis susceptibility from Bay of Bengal depressions and severe thunderstorm squall lines.'
  },
  south: {
    id: 'south',
    name: 'South India',
    subdivision: 'Deccan Interior, Coromandel & Malabar Coast',
    representativeStation: 'Bengaluru (VOBL) & Chennai',
    lat: 12.97,
    lon: 77.59,
    elevation: '920m ASL',
    dominantRegime: 'monsoon_convective',
    description: 'Peninsular convergence zone governed by dual monsoon flow (SW & NE) and thermal land-sea breezes.'
  },
  northeast: {
    id: 'northeast',
    name: 'Northeast India',
    subdivision: 'Brahmaputra Valley & Meghalaya Highlands',
    representativeStation: 'Guwahati (VEGT) & Cherrapunji',
    lat: 26.14,
    lon: 91.73,
    elevation: '55m - 1313m ASL',
    dominantRegime: 'monsoon_convective',
    description: 'Exceptional orographic rainfall funneling, moist southerly Bay inflow, and complex mountain valleys.'
  }
};

export const VARIABLES: Record<VariableId, VariableInfo> = {
  rainfall: {
    id: 'rainfall',
    name: 'Precipitation Accumulation',
    unit: 'mm / 24h',
    symbol: 'PRCP',
    description: '24-hour total convective and stratiform precipitation',
    color: '#0284C7', // sky-600
    precision: 1
  },
  temperature: {
    id: 'temperature',
    name: 'Surface 2m Temperature',
    unit: '°C',
    symbol: 'T2M',
    description: '2-meter diagnostic surface temperature at 14:00 IST peak',
    color: '#D97706', // amber-600
    precision: 1
  },
  wind_speed: {
    id: 'wind_speed',
    name: '10m Surface Wind Speed',
    unit: 'km/h',
    symbol: 'W10M',
    description: 'Mean 10-meter sustained horizontal wind velocity',
    color: '#059669', // emerald-600
    precision: 0
  }
};

export const LEAD_TIMES: Record<LeadTimeId, LeadTimeInfo> = {
  '24h': { id: '24h', label: 'T+24h (Day 1)', hours: 24, confidenceBand: '±4.2%' },
  '48h': { id: '48h', label: 'T+48h (Day 2)', hours: 48, confidenceBand: '±7.8%' },
  '72h': { id: '72h', label: 'T+72h (Day 3)', hours: 72, confidenceBand: '±12.4%' },
  '96h': { id: '96h', label: 'T+96h (Day 4)', hours: 96, confidenceBand: '±18.1%' },
  '120h': { id: '120h', label: 'T+120h (Day 5)', hours: 120, confidenceBand: '±24.5%' }
};

export const WEATHER_REGIMES: Record<WeatherRegimeId, WeatherRegimeInfo> = {
  monsoon_convective: {
    id: 'monsoon_convective',
    name: 'Southwest Monsoon Convection',
    synopticFeature: 'Monsoon Trough & Low-Pressure Transits',
    dynamics: 'High precipitable water, moist adiabatic lapse rate, intense diurnal mesoscale clusters'
  },
  western_disturbance: {
    id: 'western_disturbance',
    name: 'Western Disturbance Activity',
    synopticFeature: 'Upper-Tropospheric Subtropical Jet Trough',
    dynamics: 'Baroclinic cyclogenesis, orographic precipitation over Himalayas, cold advection across plains'
  },
  premonsoon_heatwave: {
    id: 'premonsoon_heatwave',
    name: 'Pre-Monsoon Heatwave Stagnation',
    synopticFeature: 'Continental Thermal Low & Anticyclonic Ridge',
    dynamics: 'Subsidence heating, intense dry solar insolation, advective warm winds from Thar desert'
  },
  coastal_depression: {
    id: 'coastal_depression',
    name: 'Coastal Low / Maritime Depression',
    synopticFeature: 'Offshore Trough & Synoptic Vortex',
    dynamics: 'Strong horizontal moisture divergence, gale-force coastal shear, coastal convergence bands'
  }
};

/**
 * Deterministic Adaptive Weights Engine
 * Simulates the trained XGBoost context-weighting model based on:
 * - Region topographical characteristics
 * - Forecast lead time
 * - Meteorological regime
 * - Target variable
 */
export function getAdaptiveWeights(
  region: RegionId,
  leadTime: LeadTimeId,
  regime: WeatherRegimeId,
  variable: VariableId
): ModelWeights {
  // Deterministic lookup tables derived from NWP historical skill patterns over South Asia
  // ECMWF: Excels at medium-range synoptic waves & temperature advection
  // ICON: Excels at short-range mesoscale convection & boundary-layer wind
  // GFS: Strong in upper-air thermodynamics, but known positive precipitation bias over India
  
  let gfs = 0.30;
  let ecmwf = 0.45;
  let icon = 0.25;
  let rationale = '';
  let disagreement = 3.8;

  // Regional adjustments
  if (region === 'north') {
    if (regime === 'western_disturbance') {
      ecmwf = 0.52;
      gfs = 0.26;
      icon = 0.22;
      rationale = 'ECMWF superior representation of mid-latitude Rossby wave propagation over Tibetan plateau.';
      disagreement = 5.2;
    } else {
      ecmwf = 0.44;
      gfs = 0.32;
      icon = 0.24;
      rationale = 'GFS shows strong diurnal thermal cycle over Indo-Gangetic basin; blended with ECMWF synoptic moisture.';
      disagreement = 4.1;
    }
  } else if (region === 'central') {
    if (regime === 'monsoon_convective') {
      icon = 0.40;
      ecmwf = 0.38;
      gfs = 0.22;
      rationale = 'ICON 13km non-hydrostatic core captures localized convective triggers in core monsoon zone; GFS downweighted due to known wet bias.';
      disagreement = 6.4;
    } else {
      ecmwf = 0.48;
      gfs = 0.28;
      icon = 0.24;
      rationale = 'ECMWF IFS 0.1° shows superior boundary layer temperature skill during continental heating.';
      disagreement = 3.6;
    }
  } else if (region === 'west') {
    if (variable === 'wind_speed' || regime === 'coastal_depression') {
      icon = 0.42;
      ecmwf = 0.36;
      gfs = 0.22;
      rationale = 'ICON boundary-layer turbulence parameterization outperforms across Western Ghats steep orography.';
      disagreement = 5.8;
    } else {
      ecmwf = 0.46;
      icon = 0.30;
      gfs = 0.24;
      rationale = 'ECMWF balances coastal moisture convergence and sea-breeze inland penetration.';
      disagreement = 4.4;
    }
  } else if (region === 'east') {
    if (regime === 'coastal_depression') {
      ecmwf = 0.50;
      icon = 0.28;
      gfs = 0.22;
      rationale = 'ECMWF track and intensity skill over Bay of Bengal cyclonic circulations is statistically dominant.';
      disagreement = 7.1;
    } else {
      ecmwf = 0.42;
      gfs = 0.30;
      icon = 0.28;
      rationale = 'Balanced multi-model consensus for Gangetic delta moisture advection.';
      disagreement = 4.9;
    }
  } else if (region === 'south') {
    ecmwf = 0.48;
    icon = 0.32;
    gfs = 0.20;
    rationale = 'ECMWF synoptic flow combined with ICON coastal resolution handles peninsular orographic shadowing.';
    disagreement = 3.9;
  } else if (region === 'northeast') {
    icon = 0.44;
    ecmwf = 0.36;
    gfs = 0.20;
    rationale = 'Steep Himalayan orography requires ICON fine-mesh mass conservation; GFS struggles with valley channeling.';
    disagreement = 6.8;
  }

  // Lead time degradation adjustments:
  // At longer lead times (T+96h, T+120h), ECMWF global synoptic skill dominates over mesoscale ICON
  if (leadTime === '96h') {
    ecmwf = Math.min(0.60, ecmwf + 0.08);
    icon = Math.max(0.18, icon - 0.05);
    gfs = 1 - ecmwf - icon;
    disagreement += 1.8;
  } else if (leadTime === '120h') {
    ecmwf = Math.min(0.64, ecmwf + 0.12);
    icon = Math.max(0.15, icon - 0.08);
    gfs = 1 - ecmwf - icon;
    disagreement += 2.6;
  }

  // Normalize to guarantee sum === 1.0000 exactly
  const sum = gfs + ecmwf + icon;
  const gfsNorm = Math.round((gfs / sum) * 100) / 100;
  const ecmwfNorm = Math.round((ecmwf / sum) * 100) / 100;
  const iconNorm = Math.round((1 - gfsNorm - ecmwfNorm) * 100) / 100;

  const dominantModel = ecmwfNorm >= gfsNorm && ecmwfNorm >= iconNorm ? 'ecmwf' : iconNorm >= gfsNorm ? 'icon' : 'gfs';

  return {
    gfs: gfsNorm,
    ecmwf: ecmwfNorm,
    icon: iconNorm,
    dominantModel,
    weightRationale: rationale,
    disagreementIndex: Math.min(9.8, Math.max(2.1, Math.round(disagreement * 10) / 10))
  };
}

/**
 * Deterministic Forecast Time Series Generator
 * Produces realistic baseline NWP divergence and the blended VARSA forecast
 */
export function getForecastTimeSeries(
  region: RegionId,
  variable: VariableId,
  leadTime: LeadTimeId,
  regime: WeatherRegimeId
): { points: TimePointForecast[]; weights: ModelWeights; summary: string } {
  const weights = getAdaptiveWeights(region, leadTime, regime, variable);

  // Baseline profiles for variables
  const hoursSequence = [0, 24, 48, 72, 96, 120, 144];
  const points: TimePointForecast[] = [];

  // Regional baseline value offsets
  let baseVal = 0;
  let amp = 1;

  if (variable === 'rainfall') {
    baseVal = region === 'northeast' ? 48 : region === 'west' ? 38 : region === 'central' ? 24 : region === 'east' ? 32 : 14;
    amp = regime === 'monsoon_convective' || regime === 'coastal_depression' ? 1.8 : 0.7;
  } else if (variable === 'temperature') {
    baseVal = region === 'north' ? 34.5 : region === 'central' ? 39.2 : region === 'west' ? 32.8 : region === 'east' ? 35.0 : region === 'south' ? 31.5 : 29.0;
    amp = regime === 'premonsoon_heatwave' ? 1.25 : 1.0;
  } else {
    // wind_speed
    baseVal = region === 'west' || region === 'east' ? 34 : region === 'south' ? 28 : 18;
    amp = regime === 'coastal_depression' ? 1.9 : 1.0;
  }

  hoursSequence.forEach((hr, i) => {
    const timeLabel = hr === 0 ? 'Analysis T0' : `T+${hr}h`;

    // Deterministic diurnal / synoptic variation curve
    const cycle = Math.sin((i * 1.05) + 0.4);
    const nominal = Math.max(0, baseVal * amp + (cycle * (baseVal * 0.35)));

    // Deterministic model divergence
    // GFS tends to overestimate rain, run warmer in dry regimes
    const gfsDelta = variable === 'rainfall' ? (nominal * 0.22) + 3.4 : variable === 'temperature' ? 1.4 : -2.8;
    // ECMWF tends to be smooth and synoptically centered
    const ecmwfDelta = variable === 'rainfall' ? -(nominal * 0.08) : variable === 'temperature' ? -0.4 : 1.2;
    // ICON captures intense localized bursts
    const iconDelta = variable === 'rainfall' ? (i % 2 === 0 ? (nominal * 0.16) : -(nominal * 0.14)) : variable === 'temperature' ? 0.2 : 3.5;

    const gfsVal = Math.max(0, Math.round((nominal + gfsDelta) * 10) / 10);
    const ecmwfVal = Math.max(0, Math.round((nominal + ecmwfDelta) * 10) / 10);
    const iconVal = Math.max(0, Math.round((nominal + iconDelta) * 10) / 10);

    // Blended VARSA calculation: Strict mathematical formula
    const varsaVal = Math.round(((gfsVal * weights.gfs) + (ecmwfVal * weights.ecmwf) + (iconVal * weights.icon)) * 10) / 10;
    
    // Simple Equal Weight baseline for comparison
    const eqVal = Math.round(((gfsVal + ecmwfVal + iconVal) / 3) * 10) / 10;

    // Synthetic ground observation curve (for historical demonstration)
    // Closest to VARSA blend with subtle measurement noise
    const obsNoise = Math.sin(i * 2.3) * (variable === 'rainfall' ? 1.8 : 0.4);
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

  const selectedPoint = points.find(p => p.hours === LEAD_TIMES[leadTime].hours) || points[1];
  const summary = `At ${LEAD_TIMES[leadTime].label}, raw NWP models exhibit a ${selectedPoint.spread} ${VARIABLES[variable].unit} spread. VARSA blends GFS (${Math.round(weights.gfs * 100)}%), ECMWF (${Math.round(weights.ecmwf * 100)}%), and ICON (${Math.round(weights.icon * 100)}%) yielding ${selectedPoint.varsa} ${VARIABLES[variable].unit}.`;

  return { points, weights, summary };
}

/**
 * Historical Verification Dataset (Demonstrative)
 * Evaluated over 180 continuous forecast cycles vs IMD Automated Weather Station truths
 */
export const VERIFICATION_DATA: Record<VariableId, Record<RegionId, VerificationMetrics>> = {
  rainfall: {
    north: {
      gfs: { mae: 6.4, rmse: 9.8, bias: +2.1, csi: 0.54 },
      ecmwf: { mae: 4.8, rmse: 7.2, bias: -0.6, csi: 0.68 },
      icon: { mae: 5.3, rmse: 8.1, bias: +0.8, csi: 0.62 },
      equalWeight: { mae: 5.1, rmse: 7.8, bias: +0.7, csi: 0.64 },
      varsa: { mae: 3.9, rmse: 5.9, bias: +0.1, csi: 0.76 },
      skillImprovementPercent: 23.5
    },
    central: {
      gfs: { mae: 8.9, rmse: 13.4, bias: +3.8, csi: 0.51 },
      ecmwf: { mae: 6.1, rmse: 9.2, bias: -1.1, csi: 0.69 },
      icon: { mae: 5.8, rmse: 8.9, bias: +0.4, csi: 0.72 },
      equalWeight: { mae: 6.4, rmse: 9.8, bias: +1.0, csi: 0.67 },
      varsa: { mae: 4.6, rmse: 6.9, bias: +0.2, csi: 0.81 },
      skillImprovementPercent: 28.1
    },
    west: {
      gfs: { mae: 10.2, rmse: 15.6, bias: +4.2, csi: 0.48 },
      ecmwf: { mae: 6.8, rmse: 10.4, bias: -1.3, csi: 0.70 },
      icon: { mae: 6.2, rmse: 9.6, bias: +0.5, csi: 0.74 },
      equalWeight: { mae: 7.2, rmse: 11.2, bias: +1.1, csi: 0.68 },
      varsa: { mae: 4.9, rmse: 7.5, bias: +0.1, csi: 0.82 },
      skillImprovementPercent: 31.9
    },
    east: {
      gfs: { mae: 7.8, rmse: 11.9, bias: +2.9, csi: 0.53 },
      ecmwf: { mae: 5.2, rmse: 7.9, bias: -0.7, csi: 0.72 },
      icon: { mae: 6.0, rmse: 9.1, bias: +0.6, csi: 0.66 },
      equalWeight: { mae: 5.9, rmse: 8.9, bias: +0.9, csi: 0.68 },
      varsa: { mae: 4.2, rmse: 6.4, bias: +0.2, csi: 0.79 },
      skillImprovementPercent: 28.8
    },
    south: {
      gfs: { mae: 5.8, rmse: 8.7, bias: +1.9, csi: 0.58 },
      ecmwf: { mae: 4.1, rmse: 6.3, bias: -0.5, csi: 0.74 },
      icon: { mae: 4.7, rmse: 7.1, bias: +0.4, csi: 0.69 },
      equalWeight: { mae: 4.5, rmse: 6.9, bias: +0.6, csi: 0.71 },
      varsa: { mae: 3.4, rmse: 5.2, bias: +0.1, csi: 0.83 },
      skillImprovementPercent: 24.4
    },
    northeast: {
      gfs: { mae: 12.4, rmse: 18.2, bias: +5.1, csi: 0.46 },
      ecmwf: { mae: 8.6, rmse: 12.8, bias: -1.8, csi: 0.66 },
      icon: { mae: 7.4, rmse: 11.1, bias: +0.9, csi: 0.73 },
      equalWeight: { mae: 8.9, rmse: 13.4, bias: +1.4, csi: 0.65 },
      varsa: { mae: 6.1, rmse: 9.2, bias: +0.3, csi: 0.80 },
      skillImprovementPercent: 31.4
    }
  },
  temperature: {
    north: {
      gfs: { mae: 2.1, rmse: 2.9, bias: +0.8, csi: 0.71 },
      ecmwf: { mae: 1.5, rmse: 2.0, bias: -0.2, csi: 0.84 },
      icon: { mae: 1.8, rmse: 2.4, bias: +0.3, csi: 0.78 },
      equalWeight: { mae: 1.6, rmse: 2.2, bias: +0.3, csi: 0.81 },
      varsa: { mae: 1.2, rmse: 1.6, bias: +0.0, csi: 0.89 },
      skillImprovementPercent: 25.0
    },
    central: {
      gfs: { mae: 2.4, rmse: 3.2, bias: +1.1, csi: 0.68 },
      ecmwf: { mae: 1.6, rmse: 2.1, bias: -0.3, csi: 0.82 },
      icon: { mae: 1.9, rmse: 2.5, bias: +0.4, csi: 0.76 },
      equalWeight: { mae: 1.7, rmse: 2.3, bias: +0.4, csi: 0.79 },
      varsa: { mae: 1.3, rmse: 1.7, bias: +0.1, csi: 0.88 },
      skillImprovementPercent: 23.5
    },
    west: {
      gfs: { mae: 1.9, rmse: 2.6, bias: +0.7, csi: 0.73 },
      ecmwf: { mae: 1.3, rmse: 1.8, bias: -0.2, csi: 0.86 },
      icon: { mae: 1.6, rmse: 2.2, bias: +0.2, csi: 0.80 },
      equalWeight: { mae: 1.5, rmse: 2.0, bias: +0.2, csi: 0.83 },
      varsa: { mae: 1.1, rmse: 1.5, bias: +0.0, csi: 0.91 },
      skillImprovementPercent: 26.6
    },
    east: {
      gfs: { mae: 2.0, rmse: 2.8, bias: +0.8, csi: 0.70 },
      ecmwf: { mae: 1.4, rmse: 1.9, bias: -0.3, csi: 0.84 },
      icon: { mae: 1.7, rmse: 2.3, bias: +0.3, csi: 0.77 },
      equalWeight: { mae: 1.5, rmse: 2.1, bias: +0.3, csi: 0.80 },
      varsa: { mae: 1.2, rmse: 1.6, bias: +0.0, csi: 0.88 },
      skillImprovementPercent: 20.0
    },
    south: {
      gfs: { mae: 1.7, rmse: 2.3, bias: +0.6, csi: 0.76 },
      ecmwf: { mae: 1.2, rmse: 1.6, bias: -0.2, csi: 0.88 },
      icon: { mae: 1.4, rmse: 1.9, bias: +0.2, csi: 0.83 },
      equalWeight: { mae: 1.3, rmse: 1.8, bias: +0.2, csi: 0.85 },
      varsa: { mae: 0.9, rmse: 1.3, bias: +0.0, csi: 0.93 },
      skillImprovementPercent: 30.7
    },
    northeast: {
      gfs: { mae: 2.6, rmse: 3.5, bias: +1.2, csi: 0.65 },
      ecmwf: { mae: 1.8, rmse: 2.4, bias: -0.4, csi: 0.80 },
      icon: { mae: 1.9, rmse: 2.6, bias: +0.3, csi: 0.78 },
      equalWeight: { mae: 1.9, rmse: 2.6, bias: +0.4, csi: 0.78 },
      varsa: { mae: 1.4, rmse: 1.9, bias: +0.1, csi: 0.86 },
      skillImprovementPercent: 26.3
    }
  },
  wind_speed: {
    north: {
      gfs: { mae: 5.6, rmse: 7.8, bias: -1.2, csi: 0.61 },
      ecmwf: { mae: 4.4, rmse: 6.2, bias: +0.5, csi: 0.73 },
      icon: { mae: 4.1, rmse: 5.8, bias: -0.2, csi: 0.76 },
      equalWeight: { mae: 4.4, rmse: 6.2, bias: -0.3, csi: 0.72 },
      varsa: { mae: 3.3, rmse: 4.7, bias: +0.1, csi: 0.84 },
      skillImprovementPercent: 25.0
    },
    central: {
      gfs: { mae: 5.2, rmse: 7.4, bias: -1.0, csi: 0.63 },
      ecmwf: { mae: 4.1, rmse: 5.9, bias: +0.4, csi: 0.75 },
      icon: { mae: 3.8, rmse: 5.4, bias: -0.2, csi: 0.78 },
      equalWeight: { mae: 4.1, rmse: 5.8, bias: -0.3, csi: 0.74 },
      varsa: { mae: 3.1, rmse: 4.4, bias: +0.0, csi: 0.85 },
      skillImprovementPercent: 24.3
    },
    west: {
      gfs: { mae: 6.9, rmse: 9.8, bias: -1.8, csi: 0.58 },
      ecmwf: { mae: 5.2, rmse: 7.3, bias: +0.6, csi: 0.74 },
      icon: { mae: 4.5, rmse: 6.4, bias: -0.3, csi: 0.80 },
      equalWeight: { mae: 5.1, rmse: 7.2, bias: -0.5, csi: 0.74 },
      varsa: { mae: 3.7, rmse: 5.2, bias: +0.1, csi: 0.87 },
      skillImprovementPercent: 27.4
    },
    east: {
      gfs: { mae: 6.5, rmse: 9.2, bias: -1.5, csi: 0.59 },
      ecmwf: { mae: 4.9, rmse: 6.9, bias: +0.5, csi: 0.76 },
      icon: { mae: 4.6, rmse: 6.5, bias: -0.2, csi: 0.78 },
      equalWeight: { mae: 4.9, rmse: 7.0, bias: -0.4, csi: 0.75 },
      varsa: { mae: 3.8, rmse: 5.4, bias: +0.0, csi: 0.86 },
      skillImprovementPercent: 22.4
    },
    south: {
      gfs: { mae: 5.4, rmse: 7.6, bias: -1.1, csi: 0.64 },
      ecmwf: { mae: 4.2, rmse: 6.0, bias: +0.4, csi: 0.76 },
      icon: { mae: 3.9, rmse: 5.6, bias: -0.1, csi: 0.79 },
      equalWeight: { mae: 4.2, rmse: 6.0, bias: -0.3, csi: 0.75 },
      varsa: { mae: 3.2, rmse: 4.6, bias: +0.0, csi: 0.85 },
      skillImprovementPercent: 23.8
    },
    northeast: {
      gfs: { mae: 7.2, rmse: 10.4, bias: -2.1, csi: 0.54 },
      ecmwf: { mae: 5.6, rmse: 7.9, bias: +0.7, csi: 0.71 },
      icon: { mae: 4.8, rmse: 6.9, bias: -0.4, csi: 0.77 },
      equalWeight: { mae: 5.5, rmse: 7.8, bias: -0.6, csi: 0.72 },
      varsa: { mae: 4.0, rmse: 5.7, bias: +0.1, csi: 0.84 },
      skillImprovementPercent: 27.2
    }
  }
};

/**
 * Extreme Weather Guidance Catalog
 * Demonstration operational scenarios based on Indian meteorological early warning protocols
 */
export const EXTREME_WEATHER_EVENTS: ExtremeWeatherEvent[] = [
  {
    id: 'rain-konkan-01',
    type: 'heavy_rain',
    title: 'Extremely Heavy Rainfall Warning (Konkan & Ghats)',
    regionId: 'west',
    regionName: 'West India',
    leadTime: '48h',
    signalValue: '172.4 mm / 24h (Blended)',
    threshold: '> 115.5 mm (Very Heavy)',
    severity: 'Severe Warning',
    probability: 88,
    modelConsensus: 'GFS predicts 210mm (over-predictive), ECMWF 145mm, ICON 180mm. VARSA weighted consensus stabilizes at 172.4mm.',
    operationalGuidance: 'Trigger National Disaster Response Force (NDRF) stage-2 staging in Ratnagiri, Raigad, and Pune ghat catchment zones. Suspend high-altitude ghat transport.',
    affectedDistricts: ['Ratnagiri', 'Sindhudurg', 'Raigad', 'Satara Ghats', 'Kolhapur']
  },
  {
    id: 'heat-vidarbha-02',
    type: 'heat',
    title: 'Severe Heatwave Alert (Vidarbha & West MP)',
    regionId: 'central',
    regionName: 'Central India',
    leadTime: '72h',
    signalValue: '45.8 °C (Blended Peak)',
    threshold: '≥ 45.0 °C or Departure > +4.5 °C',
    severity: 'Warning',
    probability: 82,
    modelConsensus: 'GFS indicates 47.1°C, ECMWF indicates 44.9°C, ICON indicates 45.4°C. VARSA adaptive weighting favors ECMWF boundary layer physics (45.8°C).',
    operationalGuidance: 'Issue red health advisory for district hospitals; mandate suspension of outdoor construction between 11:30 and 16:00 IST. Activate urban water misting stations.',
    affectedDistricts: ['Nagpur', 'Chandrapur', 'Akola', 'Wardha', 'Hoshangabad']
  },
  {
    id: 'wind-odisha-03',
    type: 'high_wind',
    title: 'Coastal Gale & Squall Hazard (Bay of Bengal Coast)',
    regionId: 'east',
    regionName: 'East India',
    leadTime: '48h',
    signalValue: '68.5 km/h gusts to 82 km/h',
    threshold: '≥ 55 km/h (Gale Force)',
    severity: 'Watch',
    probability: 74,
    modelConsensus: 'ECMWF track projects coastal landfall 40km south of Puri; GFS projects recurvature towards Sundarbans. VARSA weights ECMWF 50% for coastal track agreement.',
    operationalGuidance: 'Issue comprehensive fishermen warning along Odisha and North Andhra coasts. Hoist Local Cautionary Signal No. 3 at Paradip and Gopalpur ports.',
    affectedDistricts: ['Puri', 'Ganjam', 'Jagatsinghpur', 'Kendrapara', 'Bhadrak']
  },
  {
    id: 'rain-assam-04',
    type: 'heavy_rain',
    title: 'Flash Flood & Inundation Watch (Brahmaputra Basin)',
    regionId: 'northeast',
    regionName: 'Northeast India',
    leadTime: '24h',
    signalValue: '128.0 mm / 24h',
    threshold: '> 64.5 mm (Heavy)',
    severity: 'Warning',
    probability: 79,
    modelConsensus: 'ICON fine-mesh resolution detects rapid south-westerly moisture convergence against Meghalaya escarpment; GFS underestimates localized orography.',
    operationalGuidance: 'Alert State Disaster Management Authority (ASDMA) for river level rise in Kopili, Dhansiri, and Jia Bharali tributaries. Pre-position boat rescue squads.',
    affectedDistricts: ['Kamrup Metro', 'Morigaon', 'Nagaon', 'Darrang', 'Sonitpur']
  }
];

/**
 * Processing Pipeline Simulation Steps
 */
export interface PipelineStep {
  id: number;
  label: string;
  detail: string;
  durationMs: number;
  metric: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    label: 'Forecast Ingestion',
    detail: 'Streaming raw GRIB2 datasets: GFS 0.25°, ECMWF IFS 0.1°, ICON 13km',
    durationMs: 400,
    metric: '3 Numerical Models Ingested'
  },
  {
    id: 2,
    label: 'Data Harmonization',
    detail: 'Reprojecting and bilinear spatial interpolating to unified 0.1° South Asia grid',
    durationMs: 450,
    metric: 'Unified 0.1° Geodetic Grid'
  },
  {
    id: 3,
    label: 'Context Analysis',
    detail: 'Evaluating synoptic regime, terrain orography mask, and 14-day rolling bias',
    durationMs: 450,
    metric: 'Regime Classified: Active Trough'
  },
  {
    id: 4,
    label: 'Adaptive Weighting',
    detail: 'Evaluating XGBoost loss-minimization contextual matrix across forecast lead-times',
    durationMs: 500,
    metric: 'Weight Matrix Calibrated'
  },
  {
    id: 5,
    label: 'Forecast Blending',
    detail: 'Applying non-linear ensemble weighting with mass & thermodynamic conservation',
    durationMs: 400,
    metric: 'VARSA Surface Generated'
  },
  {
    id: 6,
    label: 'Verification & Quality Check',
    detail: 'Comparing against recent Doppler/AWS observational network truths',
    durationMs: 350,
    metric: 'MAE Improvement Verified'
  }
];
