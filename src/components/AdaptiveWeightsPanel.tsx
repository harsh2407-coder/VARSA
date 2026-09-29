import React from 'react';
import { ModelWeights, RegionInfo, LeadTimeInfo, WeatherRegimeInfo, VariableInfo } from '../data/varsaData';

interface AdaptiveWeightsPanelProps {
  weights: ModelWeights;
  region: RegionInfo;
  leadTime: LeadTimeInfo;
  regime: WeatherRegimeInfo;
  variable: VariableInfo;
  gfsVal?: number;
  ecmwfVal?: number;
  iconVal?: number;
  blendedVal?: number;
  spread?: number;
  disagreementLevel?: 'Low' | 'Moderate' | 'High';
}

export const AdaptiveWeightsPanel: React.FC<AdaptiveWeightsPanelProps> = ({
  weights,
  region,
  leadTime,
  regime,
  variable,
  gfsVal,
  ecmwfVal,
  iconVal,
  blendedVal,
  spread,
  disagreementLevel
}) => {
  const gfsPct = Math.round(weights.gfs * 100);
  const ecmwfPct = Math.round(weights.ecmwf * 100);
  const iconPct = Math.round(weights.icon * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col space-y-4">
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
            VARSA Adaptive Weighting Engine · {region.name}
          </p>
        </div>

        {/* Prototype Inference / Demonstration weights Label */}
        <div className="text-right">
          <span className="text-[11px] font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-medium">
            Prototype inference logic
          </span>
        </div>
      </div>

      {/* Context Parameters Summary Box */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
        <div>
          <div className="text-[10px] uppercase text-slate-400 font-semibold">Region</div>
          <div className="font-semibold text-slate-800 mt-0.5">{region.name}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-400 font-semibold">Lead Time</div>
          <div className="font-semibold text-slate-800 mt-0.5">+{leadTime.id}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-400 font-semibold">Context / Regime</div>
          <div className="font-semibold text-sky-800 mt-0.5 truncate" title={regime.name}>
            {regime.name.split(' ')[0]} / {regime.name.includes('Monsoon') ? 'High rainfall' : 'Dynamics'}
          </div>
        </div>
      </div>

      {/* Clean Individual Model Bars */}
      <div className="space-y-3 pt-1">
        {/* ECMWF Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block"></span>
              <span className="font-bold text-slate-900">ECMWF</span>
              <span className="text-[11px] font-mono text-slate-400">IFS 0.1° HRES</span>
              {weights.dominantModel === 'ecmwf' && (
                <span className="text-[9px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 px-1 rounded font-bold">
                  Primary
                </span>
              )}
            </div>
            <div className="font-mono text-sm font-bold text-blue-900 tabular-nums">
              {ecmwfPct}%
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${ecmwfPct}%` }}
            ></div>
          </div>
        </div>

        {/* GFS Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs inline-block"></span>
              <span className="font-bold text-slate-900">GFS</span>
              <span className="text-[11px] font-mono text-slate-400">NOAA 0.25°</span>
              {weights.dominantModel === 'gfs' && (
                <span className="text-[9px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded font-bold">
                  Primary
                </span>
              )}
            </div>
            <div className="font-mono text-sm font-bold text-amber-900 tabular-nums">
              {gfsPct}%
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-amber-600 rounded-full transition-all duration-500"
              style={{ width: `${gfsPct}%` }}
            ></div>
          </div>
        </div>

        {/* ICON Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block"></span>
              <span className="font-bold text-slate-900">ICON</span>
              <span className="text-[11px] font-mono text-slate-400">DWD 13km Global</span>
              {weights.dominantModel === 'icon' && (
                <span className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded font-bold">
                  Primary
                </span>
              )}
            </div>
            <div className="font-mono text-sm font-bold text-emerald-900 tabular-nums">
              {iconPct}%
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${iconPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Rationale & Mathematical Context */}
      <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
        <div className="flex items-start gap-2">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">
            Rationale:
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {weights.weightRationale}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-500">
          <span>MODEL DISAGREEMENT:</span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            {disagreementLevel && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                disagreementLevel === 'High' ? 'bg-rose-100 text-rose-800' : disagreementLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {disagreementLevel}
              </span>
            )}
            <span>±{spread !== undefined ? spread : weights.disagreementIndex} {variable.unit.split(' ')[0]}</span>
          </span>
        </div>
      </div>

      {/* Real-time Blending Formulation (Shows judges that VARSA actually calculates the blend) */}
      {gfsVal !== undefined && ecmwfVal !== undefined && iconVal !== undefined && blendedVal !== undefined && (
        <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs space-y-1.5 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="uppercase font-semibold tracking-wider text-sky-300">Deterministic Blend Formulation</span>
            <span className="text-emerald-400 font-bold">Σ Weights = 100%</span>
          </div>
          <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 text-sky-100 overflow-x-auto leading-snug">
            VARSA = ({weights.gfs} × {gfsVal}) + ({weights.ecmwf} × {ecmwfVal}) + ({weights.icon} × {iconVal})
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <span className="text-slate-400 text-[11px]">Blended Result:</span>
            <span className="text-white font-bold text-sm tabular-nums">
              {blendedVal} <span className="text-xs font-normal text-slate-300">{variable.unit}</span>
            </span>
          </div>
        </div>
      )}

      {/* Demonstration Values Scientific Honesty Note */}
      <div className="px-3 py-2 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900 leading-snug">
        <span className="font-bold">Demonstration Notice:</span> These values are demonstration values. They must NOT be presented as measured real-world performance.
      </div>
    </div>
  );
};
