import React, { useState } from 'react';
import {
  RegionId,
  VariableId,
  LeadTimeId,
  WeatherRegimeId,
  REGIONS,
  LEAD_TIMES,
  WEATHER_REGIMES,
  VARIABLES,
  getAdaptiveWeights,
  ModelWeights
} from '../data/varsaData';
import { IndiaMap } from './IndiaMap';
import { Map, Layers, Info } from 'lucide-react';

interface ModelWeightMapScreenProps {
  region: RegionId;
  leadTime: LeadTimeId;
  regime: WeatherRegimeId;
  variable: VariableId;
  onSelectRegion: (id: RegionId) => void;
  onSelectLeadTime: (id: LeadTimeId) => void;
  onSelectRegime: (id: WeatherRegimeId) => void;
}

export const ModelWeightMapScreen: React.FC<ModelWeightMapScreenProps> = ({
  region,
  leadTime,
  regime,
  variable,
  onSelectRegion,
  onSelectLeadTime,
  onSelectRegime
}) => {
  const [weightLayer, setWeightLayer] = useState<'dominant' | 'ecmwf' | 'icon' | 'gfs'>('dominant');

  const allRegionWeights: Record<RegionId, ModelWeights> = {
    north: getAdaptiveWeights('north', leadTime, regime, variable),
    central: getAdaptiveWeights('central', leadTime, regime, variable),
    west: getAdaptiveWeights('west', leadTime, regime, variable),
    east: getAdaptiveWeights('east', leadTime, regime, variable),
    south: getAdaptiveWeights('south', leadTime, regime, variable),
    northeast: getAdaptiveWeights('northeast', leadTime, regime, variable),
  };

  const selectedWeights = allRegionWeights[region];

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">ADAPTIVE MODEL CONTRIBUTION</h2>
            <span className="text-xs font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
              Geographic Allocation Surface
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prototype inference by region and forecast lead time ({LEAD_TIMES[leadTime].label} · {WEATHER_REGIMES[regime].name})
          </p>
        </div>

        {/* Layer View Segmented Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setWeightLayer('dominant')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              weightLayer === 'dominant' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dominant NWP
          </button>
          <button
            onClick={() => setWeightLayer('ecmwf')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              weightLayer === 'ecmwf' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ECMWF (0.1°)
          </button>
          <button
            onClick={() => setWeightLayer('icon')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              weightLayer === 'icon' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ICON (13km)
          </button>
          <button
            onClick={() => setWeightLayer('gfs')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              weightLayer === 'gfs' ? 'bg-amber-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GFS (0.25°)
          </button>
        </div>
      </div>

      {/* Main Map & Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Map View (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">National Model Weight Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Click any zone to inspect
            </span>
          </div>

          <div className="w-full h-[460px] flex items-center justify-center bg-slate-50/50 rounded border border-slate-100">
            <IndiaMap
              selectedRegion={region}
              onSelectRegion={onSelectRegion}
              leadTime={leadTime}
              regime={regime}
              variable={variable}
              mode="weight_choropleth"
              weightLayer={weightLayer}
            />
          </div>

          {/* Choropleth Legend */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800 mb-1.5 font-mono text-[11px] uppercase tracking-wider">
              {weightLayer === 'dominant' ? 'Dominant NWP Model by Region:' : `Color Intensity Scale (${weightLayer.toUpperCase()} Weight):`}
            </div>

            {weightLayer === 'dominant' ? (
              <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-blue-600 rounded-xs"></span>
                  <div>
                    <div className="font-bold text-blue-900">ECMWF Dominant</div>
                    <div className="text-[10px] text-slate-500">Synoptic & medium-range</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-emerald-600 rounded-xs"></span>
                  <div>
                    <div className="font-bold text-emerald-900">ICON Dominant</div>
                    <div className="text-[10px] text-slate-500">Orography & coastal wind</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-amber-600 rounded-xs"></span>
                  <div>
                    <div className="font-bold text-amber-900">GFS Dominant</div>
                    <div className="text-[10px] text-slate-500">Upper thermodynamics</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-500">Lower Weight (15%)</span>
                <div className="flex-1 h-2.5 rounded bg-gradient-to-r from-slate-200 to-sky-700"></div>
                <span className="text-[11px] font-mono text-slate-700 font-bold">Higher Weight (65%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Regional Details & Synoptic Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Inspected Region Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-mono text-sky-800 uppercase tracking-wider font-semibold">Active Region Inspection</span>
                <h3 className="text-base font-bold text-slate-900">{REGIONS[region].name}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                Dominant: {selectedWeights.dominantModel.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {REGIONS[region].description}
            </p>

            {/* Weights Breakdown */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span>
                  ECMWF IFS (0.1° HRES)
                </span>
                <span className="font-bold text-slate-900">{Math.round(selectedWeights.ecmwf * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${selectedWeights.ecmwf * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
                  DWD ICON (13km)
                </span>
                <span className="font-bold text-slate-900">{Math.round(selectedWeights.icon * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${selectedWeights.icon * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs"></span>
                  NOAA GFS (0.25°)
                </span>
                <span className="font-bold text-slate-900">{Math.round(selectedWeights.gfs * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: `${selectedWeights.gfs * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Contextual Learning Logic:</div>
              <p className="leading-relaxed">
                {selectedWeights.weightRationale}
              </p>
            </div>
          </div>

          {/* Quick Select All 6 Regions Matrix */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              All Meteorological Macro-Zones ({LEAD_TIMES[leadTime].label})
            </h4>

            <div className="space-y-1.5 text-xs">
              {(Object.keys(REGIONS) as RegionId[]).map((rId) => {
                const r = REGIONS[rId];
                const w = allRegionWeights[rId];
                const isSelected = rId === region;

                return (
                  <div
                    key={rId}
                    onClick={() => onSelectRegion(rId)}
                    className={`p-2 rounded border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 font-semibold text-sky-950'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.subdivision.split('&')[0]}</div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-blue-700">{Math.round(w.ecmwf * 100)}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-emerald-700">{Math.round(w.icon * 100)}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-amber-700">{Math.round(w.gfs * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
