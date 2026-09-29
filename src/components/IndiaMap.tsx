import React from 'react';
import { RegionId, REGIONS, ModelWeights, LeadTimeId, WeatherRegimeId, VariableId } from '../data/varsaData';
import { calculateAdaptiveWeights } from '../lib/varsaEngine';

interface IndiaMapProps {
  selectedRegion: RegionId;
  onSelectRegion: (id: RegionId) => void;
  leadTime: LeadTimeId;
  regime: WeatherRegimeId;
  variable: VariableId;
  mode?: 'command' | 'weight_choropleth';
  weightLayer?: 'dominant' | 'ecmwf' | 'icon' | 'gfs';
}

// Geometric coordinates approximating India's meteorological macro-regions on a 600x700 viewBox
const REGION_PATHS: Record<RegionId, { path: string; labelX: number; labelY: number; stationName: string }> = {
  north: {
    // Kashmir, Himachal, Punjab, Haryana, Delhi, Uttarakhand, UP
    path: 'M 250,55 L 290,40 L 320,65 L 340,110 L 310,135 L 345,160 L 320,205 L 270,220 L 220,195 L 210,150 L 220,110 Z',
    labelX: 270,
    labelY: 130,
    stationName: 'Delhi / Shimla'
  },
  west: {
    // Rajasthan, Gujarat, Western Maharashtra / Konkan
    path: 'M 210,150 L 220,195 L 200,230 L 155,240 L 140,285 L 180,315 L 185,360 L 215,390 L 210,430 L 175,410 L 170,360 L 130,300 L 145,220 L 180,175 Z',
    labelX: 180,
    labelY: 260,
    stationName: 'Mumbai / Ahmedabad'
  },
  central: {
    // Madhya Pradesh, Chhattisgarh, Vidarbha
    path: 'M 270,220 L 320,205 L 350,235 L 360,285 L 340,340 L 285,365 L 235,350 L 215,390 L 185,360 L 180,315 L 200,230 Z',
    labelX: 275,
    labelY: 285,
    stationName: 'Nagpur / Bhopal'
  },
  east: {
    // Bihar, Jharkhand, West Bengal, Odisha
    path: 'M 320,205 L 375,200 L 400,230 L 420,280 L 395,330 L 365,370 L 340,340 L 360,285 L 350,235 Z',
    labelX: 375,
    labelY: 270,
    stationName: 'Kolkata / Bhubaneswar'
  },
  south: {
    // Karnataka, Andhra Pradesh, Telangana, Tamil Nadu, Kerala
    path: 'M 215,390 L 235,350 L 285,365 L 340,340 L 365,370 L 330,440 L 310,500 L 270,590 L 245,550 L 225,480 L 210,430 Z',
    labelX: 270,
    labelY: 460,
    stationName: 'Bengaluru / Chennai'
  },
  northeast: {
    // Sikkim, Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura
    path: 'M 400,200 L 440,185 L 485,170 L 515,190 L 490,230 L 460,240 L 450,275 L 425,260 L 420,230 Z',
    labelX: 465,
    labelY: 215,
    stationName: 'Guwahati / Cherrapunji'
  }
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedRegion,
  onSelectRegion,
  leadTime,
  regime,
  variable,
  mode = 'command',
  weightLayer = 'dominant'
}) => {
  // Precompute weights for all regions using central engine
  const regionalWeights: Record<RegionId, ModelWeights> = {
    north: calculateAdaptiveWeights('north', leadTime, regime, variable).weights,
    central: calculateAdaptiveWeights('central', leadTime, regime, variable).weights,
    west: calculateAdaptiveWeights('west', leadTime, regime, variable).weights,
    east: calculateAdaptiveWeights('east', leadTime, regime, variable).weights,
    south: calculateAdaptiveWeights('south', leadTime, regime, variable).weights,
    northeast: calculateAdaptiveWeights('northeast', leadTime, regime, variable).weights,
  };

  const getRegionFill = (regionId: RegionId, isSelected: boolean) => {
    const w = regionalWeights[regionId];

    if (mode === 'command') {
      if (isSelected) {
        return '#0284C7'; // sky-600 active
      }
      return '#E2E8F0'; // slate-200 base
    }

    // Weight choropleth mode
    if (weightLayer === 'dominant') {
      if (w.dominantModel === 'ecmwf') return isSelected ? '#1D4ED8' : '#3B82F6'; // blue-600/500
      if (w.dominantModel === 'icon') return isSelected ? '#047857' : '#10B981'; // emerald-600/500
      return isSelected ? '#B45309' : '#F59E0B'; // amber-600/500
    }

    if (weightLayer === 'ecmwf') {
      // Shading by ECMWF weight
      const opacity = Math.max(0.2, (w.ecmwf - 0.25) * 2.5);
      return `rgba(37, 99, 235, ${Math.min(0.9, opacity)})`;
    }

    if (weightLayer === 'icon') {
      // Shading by ICON weight
      const opacity = Math.max(0.2, (w.icon - 0.15) * 2.5);
      return `rgba(5, 150, 105, ${Math.min(0.9, opacity)})`;
    }

    // GFS layer
    const opacity = Math.max(0.2, (w.gfs - 0.15) * 2.5);
    return `rgba(217, 119, 6, ${Math.min(0.9, opacity)})`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 select-none">
      <svg
        viewBox="100 20 440 600"
        className="w-full h-auto max-h-[460px] drop-shadow-sm transition-all duration-300"
      >
        <defs>
          {/* Subtle grid pattern for meteorological map coordinate backing */}
          <pattern id="metGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="2 2" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect x="100" y="20" width="440" height="600" fill="url(#metGrid)" opacity="0.35" />

        {/* Ocean Coastline Indicators */}
        <text x="120" y="440" className="text-[11px] font-mono fill-slate-400 select-none tracking-widest uppercase">Arabian Sea</text>
        <text x="390" y="440" className="text-[11px] font-mono fill-slate-400 select-none tracking-widest uppercase">Bay of Bengal</text>
        <text x="240" y="605" className="text-[11px] font-mono fill-slate-400 select-none tracking-widest uppercase">Indian Ocean</text>

        {/* Regional Boundaries */}
        {(Object.keys(REGION_PATHS) as RegionId[]).map((regionId) => {
          const region = REGIONS[regionId];
          const pathMeta = REGION_PATHS[regionId];
          const isSelected = selectedRegion === regionId;
          const weights = regionalWeights[regionId];
          const fillColor = getRegionFill(regionId, isSelected);

          return (
            <g
              key={regionId}
              onClick={() => onSelectRegion(regionId)}
              className="cursor-pointer group transition-transform duration-200"
            >
              <path
                d={pathMeta.path}
                fill={fillColor}
                stroke={isSelected ? '#0F172A' : '#94A3B8'}
                strokeWidth={isSelected ? '2.5' : '1.2'}
                strokeLinejoin="round"
                className="transition-colors duration-200 hover:brightness-95"
              />

              {/* Station Marker */}
              <circle
                cx={pathMeta.labelX}
                cy={pathMeta.labelY}
                r={isSelected ? '5' : '3.5'}
                fill={isSelected ? '#FFFFFF' : '#0F172A'}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="transition-all"
              />

              {/* Region Label */}
              <text
                x={pathMeta.labelX}
                y={pathMeta.labelY - 10}
                textAnchor="middle"
                className={`text-[12px] font-semibold tracking-tight transition-all pointer-events-none ${
                  isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-700'
                }`}
              >
                {region.name}
              </text>

              {/* Dominant Model or Weights Pill-free metadata */}
              <text
                x={pathMeta.labelX}
                y={pathMeta.labelY + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-600 pointer-events-none"
              >
                {mode === 'command'
                  ? pathMeta.stationName.split(' / ')[0]
                  : `${weights.dominantModel.toUpperCase()} ${Math.round(weights[weights.dominantModel] * 100)}%`}
              </text>
            </g>
          );
        })}

        {/* Active Region Pin Target */}
        {REGION_PATHS[selectedRegion] && (
          <g transform={`translate(${REGION_PATHS[selectedRegion].labelX}, ${REGION_PATHS[selectedRegion].labelY})`}>
            <circle r="12" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="3 2" className="animate-spin" />
            <circle r="3" fill="#0284C7" />
          </g>
        )}
      </svg>

      {/* Floating Coordinate HUD */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-slate-200">
        <div>
          <span>ZONE: </span>
          <span className="font-semibold text-slate-800">{REGIONS[selectedRegion].name}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>STATION: </span>
          <span className="text-slate-800">{REGIONS[selectedRegion].representativeStation}</span>
        </div>
        <div>
          <span>COORDS: </span>
          <span className="tabular-nums text-slate-700">{REGIONS[selectedRegion].lat}°N, {REGIONS[selectedRegion].lon}°E</span>
        </div>
      </div>
    </div>
  );
};
