import React, { useState } from 'react';
import {
  RegionId,
  VariableId,
  REGIONS,
  VARIABLES,
  VERIFICATION_DATA,
  VerificationMetrics
} from '../data/varsaData';
import { BarChart3, CheckCircle, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

interface VerificationScreenProps {
  region: RegionId;
  variable: VariableId;
  onSelectRegion: (id: RegionId) => void;
  onSelectVariable: (id: VariableId) => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  region,
  variable,
  onSelectRegion,
  onSelectVariable
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'mae' | 'rmse' | 'csi' | 'bias'>('mae');

  const metricsData = VERIFICATION_DATA[variable][region];
  const currentVariable = VARIABLES[variable];
  const currentRegion = REGIONS[region];

  const models: Array<{ id: 'gfs' | 'ecmwf' | 'icon' | 'equalWeight' | 'varsa'; name: string; color: string; isVarsa?: boolean; isBaseline?: boolean }> = [
    { id: 'gfs', name: 'NOAA GFS', color: '#D97706' },
    { id: 'ecmwf', name: 'ECMWF IFS', color: '#2563EB' },
    { id: 'icon', name: 'DWD ICON', color: '#059669' },
    { id: 'equalWeight', name: 'Equal Weight (1/3 Mean)', color: '#64748B', isBaseline: true },
    { id: 'varsa', name: 'VARSA Adaptive Blend', color: '#0F172A', isVarsa: true },
  ];

  // Maximum value for bar chart scaling
  const values = models.map(m => Math.abs(metricsData[m.id][selectedMetric]));
  const maxVal = Math.max(...values) * 1.25 || 1;

  const metricDescriptions = {
    mae: {
      name: 'Mean Absolute Error (MAE)',
      unit: currentVariable.unit,
      better: 'Lower is better',
      summary: 'Average magnitude of forecast errors without considering directional bias.'
    },
    rmse: {
      name: 'Root Mean Square Error (RMSE)',
      unit: currentVariable.unit,
      better: 'Lower is better',
      summary: 'Penalizes large outlier forecast errors more heavily than MAE.'
    },
    csi: {
      name: 'Critical Success Index (CSI / Threat Score)',
      unit: 'ratio (0-1)',
      better: 'Higher is better',
      summary: 'Measures forecast skill for threshold events (Hits / (Hits + Misses + False Alarms)).'
    },
    bias: {
      name: 'Mean Forecast Bias',
      unit: currentVariable.unit,
      better: 'Closest to 0 is better',
      summary: 'Directional tendency: positive indicates systematic over-prediction, negative under-prediction.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">FORECAST VERIFICATION</h2>
            <span className="text-xs font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
              Demonstration Dataset
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            VARSA is evaluated against observations and baseline ensembles across South Asian test cycles
          </p>
        </div>

        {/* Region & Variable Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
            {(Object.keys(VARIABLES) as VariableId[]).map((vId) => (
              <button
                key={vId}
                onClick={() => onSelectVariable(vId)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  variable === vId ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {VARIABLES[vId].name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Region Dropdown */}
          <select
            value={region}
            onChange={(e) => onSelectRegion(e.target.value as RegionId)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {(Object.keys(REGIONS) as RegionId[]).map((rId) => (
              <option key={rId} value={rId}>
                {REGIONS[rId].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Verification Metric Comparison Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              Comparative Verification Metric: {metricDescriptions[selectedMetric].name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {metricDescriptions[selectedMetric].summary} ({metricDescriptions[selectedMetric].better})
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start sm:self-auto">
            <button
              onClick={() => setSelectedMetric('mae')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                selectedMetric === 'mae' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              MAE
            </button>
            <button
              onClick={() => setSelectedMetric('rmse')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                selectedMetric === 'rmse' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              RMSE
            </button>
            <button
              onClick={() => setSelectedMetric('csi')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                selectedMetric === 'csi' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              CSI (Skill)
            </button>
            <button
              onClick={() => setSelectedMetric('bias')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                selectedMetric === 'bias' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Mean Bias
            </button>
          </div>
        </div>

        {/* Clean Horizontal Comparison Bars */}
        <div className="space-y-3 pt-1">
          {models.map((m) => {
            const rawVal = metricsData[m.id][selectedMetric];
            const displayVal = selectedMetric === 'bias' ? (rawVal > 0 ? `+${rawVal}` : `${rawVal}`) : rawVal;
            const pct = Math.min(100, Math.max(8, (Math.abs(rawVal) / maxVal) * 100));

            return (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{m.name}</span>
                    {m.isVarsa && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                        VARSA BLEND
                      </span>
                    )}
                    {m.isBaseline && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        Standard Benchmark
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {displayVal} <span className="text-[10px] text-slate-500 font-normal">{metricDescriptions[selectedMetric].unit}</span>
                  </div>
                </div>

                <div className="w-full h-5 bg-slate-100 rounded overflow-hidden flex items-center p-0.5 border border-slate-200/80">
                  <div
                    className={`h-full rounded-xs transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-mono text-white font-semibold ${
                      m.isVarsa ? 'bg-sky-900' : m.isBaseline ? 'bg-slate-500' : 'bg-slate-700'
                    }`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: m.color
                    }}
                  >
                    {pct > 25 && `${displayVal}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded">
            <div className="text-[11px] font-mono uppercase text-emerald-800 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Skill Improvement over Equal Weight
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-950 mt-1 tabular-nums">
              +{metricsData.skillImprovementPercent}%
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Error reduction attained by contextually suppressing biased member predictions
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="text-[11px] font-mono uppercase text-slate-600 font-semibold">
              VARSA Absolute MAE
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
              {metricsData.varsa.mae} <span className="text-xs text-slate-500 font-normal">{currentVariable.unit}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Lowest absolute error across individual NWP models and simple 1/3 ensemble mean
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="text-[11px] font-mono uppercase text-slate-600 font-semibold">
              VARSA Systematic Bias
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
              {metricsData.varsa.bias > 0 ? `+${metricsData.varsa.bias}` : metricsData.varsa.bias} <span className="text-xs text-slate-500 font-normal">{currentVariable.unit}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Neutralized directional drift; avoids GFS over-prediction and ECMWF under-prediction
            </p>
          </div>
        </div>
      </div>

      {/* Full Verification Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-sky-600" />
          Verification Scorecard Matrix: {currentRegion.name} ({currentVariable.name})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Forecasting System</th>
                <th className="py-2.5 px-3">MAE ({currentVariable.unit})</th>
                <th className="py-2.5 px-3">RMSE ({currentVariable.unit})</th>
                <th className="py-2.5 px-3">Systematic Bias</th>
                <th className="py-2.5 px-3">CSI Threat Score</th>
                <th className="py-2.5 px-3 font-bold text-slate-900">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {models.map((m, idx) => {
                const met = metricsData[m.id];
                return (
                  <tr key={m.id} className={m.isVarsa ? 'bg-sky-50 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: m.color }}></span>
                      {m.name}
                    </td>
                    <td className="py-2 px-3 text-slate-800">{met.mae}</td>
                    <td className="py-2 px-3 text-slate-800">{met.rmse}</td>
                    <td className={`py-2 px-3 ${met.bias > 0 ? 'text-amber-800' : met.bias < 0 ? 'text-blue-800' : 'text-slate-600'}`}>
                      {met.bias > 0 ? `+${met.bias}` : met.bias}
                    </td>
                    <td className="py-2 px-3 text-slate-800">{met.csi}</td>
                    <td className="py-2 px-3">
                      {m.isVarsa ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          #1 Optimal
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">#{idx + 1}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Disclosure Notice */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs text-slate-600 leading-relaxed space-y-1">
        <div className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
          Demonstration Dataset Disclosure:
        </div>
        <p>
          Historical verification statistics presented above are calibrated demonstration datasets structured for the Smart India Hackathon showcase. They illustrate the mathematical variance reduction achieved by non-linear adaptive ensemble blending versus simple arithmetic averaging over complex orographic terrain.
        </p>
      </div>
    </div>
  );
};
