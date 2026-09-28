import React, { useState } from 'react';
import {
  RegionId,
  VariableId,
  LeadTimeId,
  WeatherRegimeId,
  REGIONS,
  VARIABLES,
  LEAD_TIMES,
  WEATHER_REGIMES,
  getForecastTimeSeries
} from '../data/varsaData';
import { ForecastChart } from './ForecastChart';
import { ArrowRight, Layers, HelpCircle } from 'lucide-react';

interface ForecastBlendingScreenProps {
  region: RegionId;
  variable: VariableId;
  leadTime: LeadTimeId;
  regime: WeatherRegimeId;
  onSelectLeadTime: (id: LeadTimeId) => void;
  onSelectVariable: (id: VariableId) => void;
}

export const ForecastBlendingScreen: React.FC<ForecastBlendingScreenProps> = ({
  region,
  variable,
  leadTime,
  regime,
  onSelectLeadTime,
  onSelectVariable
}) => {
  const currentRegion = REGIONS[region];
  const currentVariable = VARIABLES[variable];
  const currentRegime = WEATHER_REGIMES[regime];
  const currentLeadTime = LEAD_TIMES[leadTime];

  const [selectedLeadHour, setSelectedLeadHour] = useState<number>(currentLeadTime.hours);

  const { points, weights, summary } = getForecastTimeSeries(
    region,
    variable,
    leadTime,
    regime
  );

  const selectedPoint = points.find(p => p.hours === selectedLeadHour) || points[1];

  return (
    <div className="space-y-6">
      {/* Title & Control Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">MULTI-MODEL FORECAST BLENDING</h2>
            <span className="text-xs font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
              Time-Series Convergence Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing NWP member divergence across forecast horizon for {currentRegion.name} ({currentRegion.subdivision})
          </p>
        </div>

        {/* Quick Variable Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          {(Object.keys(VARIABLES) as VariableId[]).map((vId) => {
            const v = VARIABLES[vId];
            const isActive = variable === vId;
            return (
              <button
                key={vId}
                onClick={() => onSelectVariable(vId)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v.symbol} ({v.unit.split(' ')[0]})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {currentVariable.name} Evolution (0h to 144h)
            </h3>
            <p className="text-xs text-slate-500">
              Click any timestep or axis column to inspect member divergence and ground truth delta
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Selected Timestep:</span>
            <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              {selectedPoint.timeLabel}
            </span>
          </div>
        </div>

        <ForecastChart
          data={points}
          weights={weights}
          variable={currentVariable}
          height={340}
          showObservation={true}
          selectedLeadHour={selectedLeadHour}
          onSelectLeadHour={(hr) => setSelectedLeadHour(hr)}
        />

        {/* Equation & Weight Transformation Strip */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-slate-900">BLENDING EQUATION:</span>
            <span className="font-mono text-[11px] bg-white px-2 py-1 border border-slate-200 rounded">
              VARSA = ({weights.gfs} × GFS) + ({weights.ecmwf} × ECMWF) + ({weights.icon} × ICON)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
            <span>GFS: {Math.round(weights.gfs * 100)}%</span>
            <span className="text-slate-300">|</span>
            <span>ECMWF: {Math.round(weights.ecmwf * 100)}%</span>
            <span className="text-slate-300">|</span>
            <span>ICON: {Math.round(weights.icon * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Member Ingestion to Blended Forecast Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          Member Divergence at {selectedPoint.timeLabel} ({currentRegion.name})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* GFS Card */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded">
            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span>NOAA GFS</span>
              <span className="font-mono text-[10px]">w = {Math.round(weights.gfs * 100)}%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-amber-950 mt-1 tabular-nums">
              {selectedPoint.gfs} <span className="text-xs font-normal text-amber-800">{currentVariable.unit}</span>
            </div>
            <div className="text-[11px] text-amber-800/80 mt-1">
              Delta vs Truth: {Math.round((selectedPoint.gfs - selectedPoint.observation) * 10) / 10 > 0 ? `+${Math.round((selectedPoint.gfs - selectedPoint.observation) * 10) / 10}` : Math.round((selectedPoint.gfs - selectedPoint.observation) * 10) / 10}
            </div>
          </div>

          {/* ECMWF Card */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded">
            <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
              <span>ECMWF IFS</span>
              <span className="font-mono text-[10px]">w = {Math.round(weights.ecmwf * 100)}%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-950 mt-1 tabular-nums">
              {selectedPoint.ecmwf} <span className="text-xs font-normal text-blue-800">{currentVariable.unit}</span>
            </div>
            <div className="text-[11px] text-blue-800/80 mt-1">
              Delta vs Truth: {Math.round((selectedPoint.ecmwf - selectedPoint.observation) * 10) / 10 > 0 ? `+${Math.round((selectedPoint.ecmwf - selectedPoint.observation) * 10) / 10}` : Math.round((selectedPoint.ecmwf - selectedPoint.observation) * 10) / 10}
            </div>
          </div>

          {/* ICON Card */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span>DWD ICON</span>
              <span className="font-mono text-[10px]">w = {Math.round(weights.icon * 100)}%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-950 mt-1 tabular-nums">
              {selectedPoint.icon} <span className="text-xs font-normal text-emerald-800">{currentVariable.unit}</span>
            </div>
            <div className="text-[11px] text-emerald-800/80 mt-1">
              Delta vs Truth: {Math.round((selectedPoint.icon - selectedPoint.observation) * 10) / 10 > 0 ? `+${Math.round((selectedPoint.icon - selectedPoint.observation) * 10) / 10}` : Math.round((selectedPoint.icon - selectedPoint.observation) * 10) / 10}
            </div>
          </div>

          {/* Equal Weight Baseline Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
              <span>Equal Weight</span>
              <span className="font-mono text-[10px]">33/33/33%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-800 mt-1 tabular-nums">
              {selectedPoint.equalWeight} <span className="text-xs font-normal text-slate-500">{currentVariable.unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Delta vs Truth: {Math.round((selectedPoint.equalWeight - selectedPoint.observation) * 10) / 10 > 0 ? `+${Math.round((selectedPoint.equalWeight - selectedPoint.observation) * 10) / 10}` : Math.round((selectedPoint.equalWeight - selectedPoint.observation) * 10) / 10}
            </div>
          </div>

          {/* VARSA Result Card (Dominant focal) */}
          <div className="p-3 bg-sky-950 text-white rounded border border-sky-900 shadow-sm">
            <div className="flex items-center justify-between text-xs text-sky-300 font-bold">
              <span>VARSA BLENDED</span>
              <span className="font-mono text-[10px] text-emerald-400">OPTIMAL</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1 tabular-nums">
              {selectedPoint.varsa} <span className="text-xs font-normal text-sky-200">{currentVariable.unit}</span>
            </div>
            <div className="text-[11px] text-sky-200 mt-1 font-mono">
              Delta vs Truth: {Math.round((selectedPoint.varsa - selectedPoint.observation) * 10) / 10 > 0 ? `+${Math.round((selectedPoint.varsa - selectedPoint.observation) * 10) / 10}` : Math.round((selectedPoint.varsa - selectedPoint.observation) * 10) / 10} (Lowest Error)
            </div>
          </div>
        </div>

        {/* Full Tabular Matrix */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3">GFS (0.25°)</th>
                <th className="py-2.5 px-3">ECMWF (0.1°)</th>
                <th className="py-2.5 px-3">ICON (13km)</th>
                <th className="py-2.5 px-3">Disagreement</th>
                <th className="py-2.5 px-3">Simple Mean</th>
                <th className="py-2.5 px-3 font-bold text-sky-900">VARSA Blend</th>
                <th className="py-2.5 px-3">Truth (AWS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {points.map((pt) => {
                const isSelected = pt.hours === selectedLeadHour;
                return (
                  <tr
                    key={pt.timeLabel}
                    onClick={() => setSelectedLeadHour(pt.hours)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{pt.timeLabel}</td>
                    <td className="py-2 px-3 text-amber-800">{pt.gfs}</td>
                    <td className="py-2 px-3 text-blue-800">{pt.ecmwf}</td>
                    <td className="py-2 px-3 text-emerald-800">{pt.icon}</td>
                    <td className="py-2 px-3 text-slate-600 font-semibold">±{pt.spread}</td>
                    <td className="py-2 px-3 text-slate-600">{pt.equalWeight}</td>
                    <td className="py-2 px-3 text-sky-950 font-bold bg-sky-100/50">{pt.varsa}</td>
                    <td className="py-2 px-3 text-purple-700">{pt.observation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
