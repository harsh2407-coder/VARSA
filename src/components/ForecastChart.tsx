import React, { useState } from 'react';
import { TimePointForecast, ModelWeights, VariableInfo } from '../data/varsaData';

interface ForecastChartProps {
  data: TimePointForecast[];
  weights: ModelWeights;
  variable: VariableInfo;
  height?: number;
  showObservation?: boolean;
  selectedLeadHour?: number;
  onSelectLeadHour?: (hour: number) => void;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  weights,
  variable,
  height = 320,
  showObservation = true,
  selectedLeadHour,
  onSelectLeadHour
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [visibleTraces, setVisibleTraces] = useState({
    gfs: true,
    ecmwf: true,
    icon: true,
    varsa: true,
    observation: showObservation,
    spread: true
  });

  if (!data || data.length === 0) return null;

  // Chart bounds & scaling
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const width = 800; // SVG viewBox width

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute min and max across all visible points
  const allValues = data.flatMap(d => [d.gfs, d.ecmwf, d.icon, d.varsa, d.observation]);
  const minValue = Math.max(0, Math.floor(Math.min(...allValues) * 0.85));
  const maxValue = Math.ceil(Math.max(...allValues) * 1.15) || 10;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - minValue) / (maxValue - minValue || 1);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  // Build SVG path strings
  const buildLinePath = (key: 'gfs' | 'ecmwf' | 'icon' | 'varsa' | 'observation') => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`)
      .join(' ');
  };

  // Build spread area between min and max model values
  const buildSpreadArea = () => {
    const topPoints = data.map((d, i) => {
      const maxVal = Math.max(d.gfs, d.ecmwf, d.icon);
      return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(maxVal)}`;
    }).join(' ');

    const bottomPoints = data
      .slice()
      .reverse()
      .map((d, i) => {
        const originalIndex = data.length - 1 - i;
        const minVal = Math.min(d.gfs, d.ecmwf, d.icon);
        return `L ${getX(originalIndex)} ${getY(minVal)}`;
      }).join(' ');

    return `${topPoints} ${bottomPoints} Z`;
  };

  // Y-axis grid ticks (4 divisions)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const val = minValue + pct * (maxValue - minValue);
    return {
      val: Math.round(val * (variable.precision === 0 ? 1 : 10)) / (variable.precision === 0 ? 1 : 10),
      y: getY(val)
    };
  });

  const activePoint = hoverIndex !== null ? data[hoverIndex] : (selectedLeadHour !== undefined ? data.find(d => d.hours === selectedLeadHour) || data[1] : data[1]);

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Chart Legend & Visibility Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-2.5">
        <div className="flex flex-wrap items-center gap-4">
          {/* VARSA */}
          <button
            type="button"
            onClick={() => setVisibleTraces(p => ({ ...p, varsa: !p.varsa }))}
            className={`flex items-center gap-1.5 font-medium transition-opacity ${visibleTraces.varsa ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3.5 h-1 bg-slate-900 rounded-sm inline-block"></span>
            <span className="text-slate-900 font-semibold">VARSA Blended</span>
          </button>

          {/* ECMWF */}
          <button
            type="button"
            onClick={() => setVisibleTraces(p => ({ ...p, ecmwf: !p.ecmwf }))}
            className={`flex items-center gap-1.5 font-medium transition-opacity ${visibleTraces.ecmwf ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3.5 h-0.5 bg-blue-600 inline-block"></span>
            <span className="text-blue-700">ECMWF IFS ({Math.round(weights.ecmwf * 100)}%)</span>
          </button>

          {/* ICON */}
          <button
            type="button"
            onClick={() => setVisibleTraces(p => ({ ...p, icon: !p.icon }))}
            className={`flex items-center gap-1.5 font-medium transition-opacity ${visibleTraces.icon ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3.5 h-0.5 bg-emerald-600 inline-block"></span>
            <span className="text-emerald-700">ICON ({Math.round(weights.icon * 100)}%)</span>
          </button>

          {/* GFS */}
          <button
            type="button"
            onClick={() => setVisibleTraces(p => ({ ...p, gfs: !p.gfs }))}
            className={`flex items-center gap-1.5 font-medium transition-opacity ${visibleTraces.gfs ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-3.5 h-0.5 border-b border-dashed border-amber-600 inline-block"></span>
            <span className="text-amber-700">GFS ({Math.round(weights.gfs * 100)}%)</span>
          </button>

          {/* Observations */}
          <button
            type="button"
            onClick={() => setVisibleTraces(p => ({ ...p, observation: !p.observation }))}
            className={`flex items-center gap-1.5 font-medium transition-opacity ${visibleTraces.observation ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="w-2 h-2 rounded-full border border-purple-600 bg-purple-100 inline-block"></span>
            <span className="text-purple-700">Observation Reference</span>
          </button>
        </div>

        {/* Model Disagreement Envelope Toggle */}
        <button
          type="button"
          onClick={() => setVisibleTraces(p => ({ ...p, spread: !p.spread }))}
          className={`text-slate-500 font-mono text-[11px] flex items-center gap-1.5 ${visibleTraces.spread ? 'opacity-100' : 'opacity-40'}`}
        >
          <span className="w-3 h-2 bg-blue-100 border border-blue-200 inline-block"></span>
          <span>Disagreement Spread</span>
        </button>
      </div>

      {/* Main SVG Chart Container */}
      <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Background horizontal grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Y Axis Unit Label */}
          <text
            x={padding.left}
            y={padding.top - 8}
            className="text-[10px] font-mono font-medium fill-slate-500"
          >
            {variable.unit}
          </text>

          {/* Model Spread Envelope */}
          {visibleTraces.spread && (
            <path
              d={buildSpreadArea()}
              fill="#E0F2FE"
              opacity="0.6"
              stroke="#BAE6FD"
              strokeWidth="0.5"
            />
          )}

          {/* X Axis Timestep Lines & Labels */}
          {data.map((d, i) => {
            const x = getX(i);
            const isSelected = selectedLeadHour === d.hours;
            return (
              <g key={d.timeLabel} onClick={() => onSelectLeadHour?.(d.hours)} className="cursor-pointer">
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={isSelected ? '#0284C7' : '#F1F5F9'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  strokeDasharray={isSelected ? undefined : '2 2'}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors ${
                    isSelected ? 'fill-sky-700 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {d.timeLabel}
                </text>
              </g>
            );
          })}

          {/* GFS Trace */}
          {visibleTraces.gfs && (
            <path
              d={buildLinePath('gfs')}
              fill="none"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}

          {/* ICON Trace */}
          {visibleTraces.icon && (
            <path
              d={buildLinePath('icon')}
              fill="none"
              stroke="#059669"
              strokeWidth="1.8"
              strokeDasharray="6 2 2 2"
            />
          )}

          {/* ECMWF Trace */}
          {visibleTraces.ecmwf && (
            <path
              d={buildLinePath('ecmwf')}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
            />
          )}

          {/* Ground Observation Truth Trace */}
          {visibleTraces.observation && (
            <g>
              <path
                d={buildLinePath('observation')}
                fill="none"
                stroke="#9333EA"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(d.observation)}
                  r="3"
                  fill="#FAF5FF"
                  stroke="#9333EA"
                  strokeWidth="1.2"
                />
              ))}
            </g>
          )}

          {/* VARSA Blended Forecast Trace (Dominant Anchor) */}
          {visibleTraces.varsa && (
            <g>
              <path
                d={buildLinePath('varsa')}
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(d.varsa)}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                />
              ))}
            </g>
          )}

          {/* Interactive Hover Probe & Target Indicator */}
          {activePoint && (
            <g>
              {(() => {
                const activeIdx = data.findIndex(d => d.hours === activePoint.hours);
                if (activeIdx === -1) return null;
                const x = getX(activeIdx);
                return (
                  <g pointerEvents="none">
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke="#0F172A"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle cx={x} cy={getY(activePoint.varsa)} r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                  </g>
                );
              })()}
            </g>
          )}

          {/* Invisible interactive hover columns */}
          {data.map((d, i) => {
            const x = getX(i);
            const stepWidth = chartWidth / (data.length - 1);
            return (
              <rect
                key={i}
                x={x - stepWidth / 2}
                y={padding.top}
                width={stepWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
                onClick={() => onSelectLeadHour?.(d.hours)}
              />
            );
          })}
        </svg>

        {/* Live HUD Readout Overlay for Active Timestep */}
        {activePoint && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{activePoint.timeLabel}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">Disagreement Spread:</span>
              <span className="font-semibold text-amber-700">{activePoint.spread} {variable.unit}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className="text-amber-700">GFS: <strong className="tabular-nums">{activePoint.gfs}</strong></span>
              <span className="text-blue-700">ECMWF: <strong className="tabular-nums">{activePoint.ecmwf}</strong></span>
              <span className="text-emerald-700">ICON: <strong className="tabular-nums">{activePoint.icon}</strong></span>
              <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-bold">
                VARSA: <span className="tabular-nums text-sky-800">{activePoint.varsa}</span> {variable.unit}
              </span>
              {visibleTraces.observation && (
                <span className="text-purple-700">Ref: <strong className="tabular-nums">{activePoint.observation}</strong></span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
