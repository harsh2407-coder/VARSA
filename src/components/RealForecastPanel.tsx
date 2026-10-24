import React, { useState } from 'react';
import { MultiModelForecastResult } from '../lib/realDataProvider';
import { RegionInfo } from '../data/varsaData';
import {
  Radio,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  HelpCircle,
  Database
} from 'lucide-react';

interface RealForecastPanelProps {
  region: RegionInfo;
  realData: MultiModelForecastResult | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: (bypassCache?: boolean) => void;
  onSimulateAssam: () => void;
  onClose: () => void;
}

export const RealForecastPanel: React.FC<RealForecastPanelProps> = ({
  region,
  realData,
  isLoading,
  error,
  onRefresh,
  onSimulateAssam,
  onClose
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Trace toggles
  const [traces, setTraces] = useState({
    blend: true,
    equal: true,
    ecmwf: true,
    gfs: true,
    icon: true,
    spreadArea: true
  });

  const toggleTrace = (key: keyof typeof traces) => {
    setTraces(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 space-y-4 transition-all border-2 ${
      realData?.isSimulation ? 'border-amber-500 bg-amber-50/10' : 'border-sky-500'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                realData?.isSimulation ? 'bg-amber-400' : 'bg-sky-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                realData?.isSimulation ? 'bg-amber-600' : 'bg-sky-600'
              }`}></span>
            </span>
            <h3 className="text-sm font-bold font-mono tracking-tight text-slate-900 uppercase">
              {realData?.isSimulation
                ? 'SYNTHETIC SIMULATION: MULTI-MODEL DIVERGENCE'
                : 'REAL MULTI-MODEL FORECAST BLEND (GFS · ECMWF · ICON)'}
            </h3>

            {/* Live vs Cached vs Simulation Badge */}
            {realData && (
              realData.isSimulation ? (
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300">
                  SYNTHETIC SIMULATION ONLY
                </span>
              ) : realData.isCached ? (
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold border border-emerald-300 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-700" />
                  <span>CACHED (Within 5m TTL)</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-bold border border-sky-300 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-sky-700" />
                  <span>LIVE OPEN-METEO FEED</span>
                </span>
              )
            )}
          </div>

          <p className="text-xs text-slate-600 font-sans">
            {realData?.isSimulation ? (
              <span>Scenario: <strong className="text-amber-900">{realData.simulationTitle}</strong> · Northeast India (Guwahati / Brahmaputra basin)</span>
            ) : (
              <span>Location: <strong className="text-slate-900">{region.name}</strong> ({region.representativeStation}) · Coordinates: <span className="font-mono text-slate-700">{region.lat}°N, {region.lon}°E</span></span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simulation Toggle */}
          {!realData?.isSimulation ? (
            <button
              onClick={onSimulateAssam}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulate Assam Cloudburst extreme divergence scenario (Synthetic data)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span>Simulate Assam Cloudburst</span>
            </button>
          ) : (
            <button
              onClick={() => onRefresh(true)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Switch back to live Open-Meteo multi-model feed"
            >
              <Radio className="w-3.5 h-3.5 text-sky-700" />
              <span>Back to Live NWP Feed</span>
            </button>
          )}

          {/* Refresh button */}
          {!realData?.isSimulation && (
            <button
              onClick={() => onRefresh(true)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Force live network fetch (bypass cache)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : 'text-slate-600'}`} />
              <span>{isLoading ? 'Fetching...' : 'Force Refresh'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Close real-data panel and return to demonstration mode"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
            <span>Return to Demo</span>
          </button>
        </div>
      </div>

      {/* Scientific Transparency & Strategy Disclaimer */}
      <div className={`rounded p-3 text-xs space-y-1.5 border ${
        realData?.isSimulation
          ? 'bg-amber-100/70 border-amber-300 text-amber-950'
          : 'bg-slate-50 border-slate-300 text-slate-800'
      }`}>
        <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase">
          <ShieldCheck className={`w-4 h-4 ${realData?.isSimulation ? 'text-amber-700' : 'text-sky-700'}`} />
          <span>Scientific Transparency & Formulation Notice</span>
        </div>
        <p className="leading-relaxed">
          {realData?.isSimulation ? (
            <span><strong>SYNTHETIC SCENARIO ONLY:</strong> This data represents an extreme orographic convective divergence event (Assam Cloudburst scenario) created for testing multi-model disagreement. It is <strong>NOT</strong> live meteorological data or an official IMD warning.</span>
          ) : (
            <span>Ingesting 3 distinct NWP models via Open-Meteo: <strong>NOAA GFS (0.25°)</strong>, <strong>ECMWF IFS (0.25°)</strong>, and <strong>DWD ICON (seamless)</strong>. Validated across synchronized hourly timestamps.</span>
          )}
        </p>
        <div className="pt-1 border-t border-slate-200/80 font-mono text-[11px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span><strong>Blending Strategy:</strong> Fixed initial weights: GFS 20% + ECMWF 50% + ICON 30% (Transparent baseline heuristic; not ML-learned).</span>
          <span><strong>Comparison Baseline:</strong> Equal-weight (GFS + ECMWF + ICON) / 3.</span>
          <span><strong>Spread Metric:</strong> max(GFS, ECMWF, ICON) − min(GFS, ECMWF, ICON) — full range, not ±half-range.</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 rounded p-4 text-xs text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold font-mono">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Error Fetching Multi-Model NWP Data</span>
          </div>
          <p className="font-mono text-[11px] bg-rose-100/60 p-2 rounded text-rose-800">
            {error}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onRefresh(true)}
              className="px-3 py-1 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700 cursor-pointer text-xs"
            >
              Retry Live Request
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white text-slate-700 border border-slate-300 font-semibold rounded hover:bg-slate-100 cursor-pointer text-xs"
            >
              Return to Demonstration Mode
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-600">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-xs font-mono">
            Contacting Open-Meteo for NOAA GFS, ECMWF IFS, and DWD ICON outputs...
          </p>
        </div>
      )}

      {/* Loaded View */}
      {realData && !isLoading && !error && (
        <div className="space-y-4">
          {/* Metadata & Disagreement Summary Cards */}
          {(() => {
            const spreads = realData.dataPoints.map(p => p.disagreementSpread);
            const minSpread = Math.min(...spreads);
            const maxSpread = Math.max(...spreads);
            const avgSpread = Math.round((spreads.reduce((a, b) => a + b, 0) / spreads.length) * 10) / 10;
            const currentSpread = realData.dataPoints[0].disagreementSpread;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Elevation</span>
                  <span className="font-bold text-slate-900">{realData.elevation}m ASL</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Horizon</span>
                  <span className="font-bold text-slate-900">{realData.dataPoints.length}h (3 Days)</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Initial T0 Spread</span>
                  <span className={`font-bold ${currentSpread > 4 ? 'text-rose-700' : currentSpread > 2 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {currentSpread}°C range
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Avg Horizon Spread</span>
                  <span className="font-bold text-slate-900">{avgSpread}°C range</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Max Divergence</span>
                  <span className="font-bold text-rose-700">{maxSpread}°C range</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Cache Status</span>
                  <span className="font-bold text-slate-900">
                    {realData.isSimulation ? 'Synthetic' : realData.isCached ? 'Cached' : 'Live Net'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Interactive Chart & Visibility Toggles */}
          <div className="space-y-2">
            {/* Trace Toggle Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. VARSA Weighted Blend */}
                <button
                  type="button"
                  onClick={() => toggleTrace('blend')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.blend
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
                  }`}
                  title="Configured Fixed Blend: (0.20*GFS) + (0.50*ECMWF) + (0.30*ICON)"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-950 inline-block border border-white"></span>
                  <span>VARSA Weighted Blend (20/50/30)</span>
                </button>

                {/* 2. Equal Weight */}
                <button
                  type="button"
                  onClick={() => toggleTrace('equal')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.equal
                      ? 'bg-purple-50 text-purple-900 font-bold border-purple-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
                  }`}
                  title="Equal-Weight Baseline: (GFS + ECMWF + ICON) / 3"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  <span>Equal-Weight Baseline</span>
                </button>

                {/* 3. ECMWF */}
                <button
                  type="button"
                  onClick={() => toggleTrace('ecmwf')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.ecmwf
                      ? 'bg-blue-50 text-blue-900 font-semibold border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  <span>ECMWF IFS (50%)</span>
                </button>

                {/* 4. GFS */}
                <button
                  type="button"
                  onClick={() => toggleTrace('gfs')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.gfs
                      ? 'bg-amber-50 text-amber-900 font-semibold border-amber-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
                  <span>GFS 0.25° (20%)</span>
                </button>

                {/* 5. ICON */}
                <button
                  type="button"
                  onClick={() => toggleTrace('icon')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.icon
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>ICON Seamless (30%)</span>
                </button>

                {/* Spread Area Toggle */}
                <button
                  type="button"
                  onClick={() => toggleTrace('spreadArea')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer border ${
                    traces.spreadArea
                      ? 'bg-slate-100 text-slate-800 font-medium border-slate-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block"></span>
                  <span>Spread Band</span>
                </button>
              </div>

              {/* Active Hover / Lead-time Readout */}
              {(() => {
                const activePt = hoverIndex !== null ? realData.dataPoints[hoverIndex] : realData.dataPoints[0];
                if (!activePt) return null;
                return (
                  <div className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold">
                    <span>T+{activePt.leadHours}h ({activePt.timestamp.replace('T', ' ')})</span>
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span>Spread: <strong className="text-rose-700">{activePt.disagreementSpread}°C range</strong></span>
                  </div>
                );
              })()}
            </div>

            {/* SVG Multi-Model Chart */}
            {(() => {
              const points = realData.dataPoints;
              const allValues = points.flatMap(p => [p.gfs, p.ecmwf, p.icon, p.weightedBlend, p.equalWeight]);
              const minVal = Math.floor(Math.min(...allValues) - 1.5);
              const maxVal = Math.ceil(Math.max(...allValues) + 1.5);

              const width = 800;
              const height = 280;
              const padding = { top: 20, right: 30, bottom: 45, left: 50 };
              const chartWidth = width - padding.left - padding.right;
              const chartHeight = height - padding.top - padding.bottom;

              const getX = (i: number) => padding.left + (i / (points.length - 1)) * chartWidth;
              const getY = (val: number) => {
                const ratio = (val - minVal) / (maxVal - minVal || 1);
                return padding.top + chartHeight - ratio * chartHeight;
              };

              const buildLinePath = (key: 'gfs' | 'ecmwf' | 'icon' | 'weightedBlend' | 'equalWeight') => {
                return points
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p[key])}`)
                  .join(' ');
              };

              // Spread Area Path (min to max across GFS, ECMWF, ICON)
              const topSpread = points.map((p, i) => {
                const maxModel = Math.max(p.gfs, p.ecmwf, p.icon);
                return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(maxModel)}`;
              }).join(' ');

              const bottomSpread = points
                .slice()
                .reverse()
                .map((p, i) => {
                  const revIdx = points.length - 1 - i;
                  const minModel = Math.min(p.gfs, p.ecmwf, p.icon);
                  return `L ${getX(revIdx)} ${getY(minModel)}`;
                }).join(' ');

              const spreadAreaD = `${topSpread} ${bottomSpread} Z`;

              // Y-ticks
              const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => {
                const val = minVal + pct * (maxVal - minVal);
                return {
                  val: Math.round(val * 10) / 10,
                  y: getY(val)
                };
              });

              // X-ticks every 12 hours
              const xTicks = points.filter((_, i) => i % 12 === 0);

              const activePt = hoverIndex !== null ? points[hoverIndex] : null;

              return (
                <div className="relative w-full overflow-hidden bg-slate-50/70 rounded border border-slate-200">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto block select-none"
                  >
                    {/* Y Gridlines and labels */}
                    {yTicks.map((tick, i) => (
                      <g key={i}>
                        <line
                          x1={padding.left}
                          y1={tick.y}
                          x2={width - padding.right}
                          y2={tick.y}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding.left - 8}
                          y={tick.y + 4}
                          fontSize="10"
                          textAnchor="end"
                          fill="#64748B"
                          fontFamily="monospace"
                        >
                          {tick.val}°C
                        </text>
                      </g>
                    ))}

                    {/* X Ticks & Labels */}
                    {xTicks.map(pt => {
                      const idx = pt.leadHours;
                      const x = getX(idx);
                      const parts = pt.timestamp.split('T');
                      const dateShort = parts[0].slice(5);
                      const timeShort = parts[1];
                      return (
                        <g key={pt.timestamp}>
                          <line
                            x1={x}
                            y1={padding.top}
                            x2={x}
                            y2={padding.top + chartHeight}
                            stroke="#E2E8F0"
                            strokeWidth="1"
                          />
                          <text
                            x={x}
                            y={padding.top + chartHeight + 15}
                            fontSize="9"
                            textAnchor="middle"
                            fill="#64748B"
                            fontFamily="monospace"
                          >
                            T+{pt.leadHours}h
                          </text>
                          <text
                            x={x}
                            y={padding.top + chartHeight + 27}
                            fontSize="8"
                            textAnchor="middle"
                            fill="#94A3B8"
                            fontFamily="monospace"
                          >
                            {dateShort} {timeShort}
                          </text>
                        </g>
                      );
                    })}

                    {/* Spread Envelope */}
                    {traces.spreadArea && (
                      <path
                        d={spreadAreaD}
                        fill="#cbd5e1"
                        fillOpacity="0.35"
                      />
                    )}

                    {/* GFS Line */}
                    {traces.gfs && (
                      <path
                        d={buildLinePath('gfs')}
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* ECMWF Line */}
                    {traces.ecmwf && (
                      <path
                        d={buildLinePath('ecmwf')}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* ICON Line */}
                    {traces.icon && (
                      <path
                        d={buildLinePath('icon')}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Equal Weight Baseline (Dashed Purple) */}
                    {traces.equal && (
                      <path
                        d={buildLinePath('equalWeight')}
                        fill="none"
                        stroke="#9333EA"
                        strokeWidth="2"
                        strokeDasharray="5 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* VARSA Weighted Blend Line (Thick Dark) */}
                    {traces.blend && (
                      <path
                        d={buildLinePath('weightedBlend')}
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Active vertical hover marker */}
                    {activePt && (
                      <line
                        x1={getX(activePt.leadHours)}
                        y1={padding.top}
                        x2={getX(activePt.leadHours)}
                        y2={padding.top + chartHeight}
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Interactive hover overlay columns */}
                    {points.map((_, i) => {
                      const colWidth = chartWidth / points.length;
                      const colX = getX(i) - colWidth / 2;
                      return (
                        <rect
                          key={i}
                          x={colX}
                          y={padding.top}
                          width={colWidth}
                          height={chartHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoverIndex(i)}
                        />
                      );
                    })}
                  </svg>
                </div>
              );
            })()}

            {/* Hover Values Inspector Card */}
            {(() => {
              const activePt = hoverIndex !== null ? realData.dataPoints[hoverIndex] : realData.dataPoints[0];
              if (!activePt) return null;
              return (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 text-white">
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">VARSA Blend</span>
                    <span className="text-base font-bold text-white">{activePt.weightedBlend}°C</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">20G / 50E / 30I</span>
                  </div>

                  <div className="p-2 rounded bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-700 uppercase block font-semibold">Equal-Weight</span>
                    <span className="text-base font-bold text-purple-950">{activePt.equalWeight}°C</span>
                    <span className="text-[9px] text-purple-600 block mt-0.5">(G+E+I) / 3</span>
                  </div>

                  <div className="p-2 rounded bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-700 uppercase block font-semibold">ECMWF IFS</span>
                    <span className="text-base font-bold text-blue-950">{activePt.ecmwf}°C</span>
                    <span className="text-[9px] text-blue-600 block mt-0.5">0.25° Synoptic</span>
                  </div>

                  <div className="p-2 rounded bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 uppercase block font-semibold">NOAA GFS</span>
                    <span className="text-base font-bold text-amber-950">{activePt.gfs}°C</span>
                    <span className="text-[9px] text-amber-600 block mt-0.5">0.25° Global</span>
                  </div>

                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 uppercase block font-semibold">DWD ICON</span>
                    <span className="text-base font-bold text-emerald-950">{activePt.icon}°C</span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5">Seamless Meso</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sample Timestep Milestones (T0, T+12, T+24, T+36, T+48, T+72) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block mb-2">
              Multi-Model Convergence Milestones
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
              {[0, 12, 24, 36, 48, Math.min(71, realData.dataPoints.length - 1)].map(hr => {
                const pt = realData.dataPoints[hr];
                if (!pt) return null;
                return (
                  <div key={pt.timestamp} className="p-2 rounded bg-slate-100/70 border border-slate-200 space-y-0.5">
                    <div className="text-[10px] text-slate-500">T+{pt.leadHours}h ({pt.timestamp.slice(11)})</div>
                    <div className="font-bold text-slate-900 text-sm">
                      {pt.weightedBlend}°C <span className="text-[9px] font-normal text-slate-500">Blend</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Eq: {pt.equalWeight}°C · Spread: {pt.disagreementSpread}°C
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Source Note */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 gap-2">
            <div className="truncate max-w-xl">
              Source: <span className="text-slate-600">{realData.provider}</span> · URL: <span className="text-slate-500">{realData.endpoint}</span>
            </div>
            <a
              href="https://open-meteo.com/en/docs"
              target="_blank"
              rel="noreferrer"
              className="text-sky-700 hover:text-sky-900 underline flex items-center gap-1"
            >
              <span>Open-Meteo Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
