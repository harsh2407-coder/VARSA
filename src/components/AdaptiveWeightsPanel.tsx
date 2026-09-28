import React from 'react';
import { ModelWeights, RegionInfo, LeadTimeInfo, WeatherRegimeInfo, VariableInfo } from '../data/varsaData';

interface AdaptiveWeightsPanelProps {
  weights: ModelWeights;
  region: RegionInfo;
  leadTime: LeadTimeInfo;
  regime: WeatherRegimeInfo;
  variable: VariableInfo;
}

export const AdaptiveWeightsPanel: React.FC<AdaptiveWeightsPanelProps> = ({
  weights,
  region,
  leadTime,
  regime,
  variable
}) => {
  const gfsPct = Math.round(weights.gfs * 100);
  const ecmwfPct = Math.round(weights.ecmwf * 100);
  const iconPct = Math.round(weights.icon * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">ADAPTIVE MODEL WEIGHTS</h3>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              {leadTime.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic weighting calibrated for {region.name} under {regime.name}
          </p>
        </div>

        {/* Prototype Inference Label */}
        <div className="text-right">
          <span className="text-[11px] font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
            Prototype Adaptive Weights · Demo Inference
          </span>
        </div>
      </div>

      {/* Horizontal Multi-Segmented Contribution Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Ensemble Allocation:</span>
          <span className="text-slate-700 font-semibold">Σ = {gfsPct + ecmwfPct + iconPct}% (Normalized 1.00)</span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded flex overflow-hidden border border-slate-200 shadow-inner">
          <div
            style={{ width: `${ecmwfPct}%` }}
            className="bg-blue-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-mono font-bold"
            title={`ECMWF: ${ecmwfPct}%`}
          >
            {ecmwfPct > 18 ? `ECMWF ${ecmwfPct}%` : `${ecmwfPct}%`}
          </div>
          <div
            style={{ width: `${iconPct}%` }}
            className="bg-emerald-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-mono font-bold"
            title={`ICON: ${iconPct}%`}
          >
            {iconPct > 18 ? `ICON ${iconPct}%` : `${iconPct}%`}
          </div>
          <div
            style={{ width: `${gfsPct}%` }}
            className="bg-amber-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-mono font-bold"
            title={`GFS: ${gfsPct}%`}
          >
            {gfsPct > 18 ? `GFS ${gfsPct}%` : `${gfsPct}%`}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block"></span>
            ECMWF IFS (0.1° HRES)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block"></span>
            ICON (13km Global)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs inline-block"></span>
            NOAA GFS (0.25°)
          </span>
        </div>
      </div>

      {/* Model Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* ECMWF */}
        <div className={`p-2.5 rounded border transition-colors ${
          weights.dominantModel === 'ecmwf' ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">ECMWF</span>
            {weights.dominantModel === 'ecmwf' && (
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider">Primary</span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-bold text-blue-900 tabular-nums">{ecmwfPct}%</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({ecmwfPct > 33 ? `+${ecmwfPct - 33}%` : `${ecmwfPct - 33}%`} vs Eq)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Synoptic scale moisture & pressure advection
          </p>
        </div>

        {/* ICON */}
        <div className={`p-2.5 rounded border transition-colors ${
          weights.dominantModel === 'icon' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">ICON (DWD)</span>
            {weights.dominantModel === 'icon' && (
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Primary</span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-bold text-emerald-900 tabular-nums">{iconPct}%</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({iconPct > 33 ? `+${iconPct - 33}%` : `${iconPct - 33}%`} vs Eq)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Non-hydrostatic boundary & complex orography
          </p>
        </div>

        {/* GFS */}
        <div className={`p-2.5 rounded border transition-colors ${
          weights.dominantModel === 'gfs' ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">NOAA GFS</span>
            {weights.dominantModel === 'gfs' && (
              <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">Primary</span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-bold text-amber-900 tabular-nums">{gfsPct}%</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({gfsPct > 33 ? `+${gfsPct - 33}%` : `${gfsPct - 33}%`} vs Eq)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Upper-air thermodynamics & thermal low cycle
          </p>
        </div>
      </div>

      {/* Rationale & Mathematical Context */}
      <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
        <div className="flex items-start gap-2">
          <div className="text-xs font-semibold text-slate-700 shrink-0 mt-0.5">METEOROLOGICAL RATIONALE:</div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {weights.weightRationale}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-500">
          <span>MODEL DISAGREEMENT INDEX:</span>
          <span className="font-bold text-slate-800">
            {weights.disagreementIndex} / 10 · {weights.disagreementIndex > 6 ? 'High Divergence' : weights.disagreementIndex > 4 ? 'Moderate Spread' : 'High Consensus'}
          </span>
        </div>
      </div>
    </div>
  );
};
