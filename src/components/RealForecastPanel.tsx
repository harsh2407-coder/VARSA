import React from 'react';
import { RealForecastResult } from '../lib/realDataProvider';
import { RegionInfo } from '../data/varsaData';
import { Radio, RefreshCw, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface RealForecastPanelProps {
  region: RegionInfo;
  realData: RealForecastResult | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onClose: () => void;
}

export const RealForecastPanel: React.FC<RealForecastPanelProps> = ({
  region,
  realData,
  isLoading,
  error,
  onRefresh,
  onClose
}) => {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  return (
    <div className="bg-white border-2 border-sky-500 rounded-lg shadow-md p-5 space-y-4 transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600"></span>
            </span>
            <h3 className="text-sm font-bold font-mono tracking-tight text-slate-900 uppercase">
              LIVE REAL FORECAST FEED (SINGLE PROVIDER)
            </h3>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold border border-sky-300">
              Real Network Data
            </span>
          </div>
          <p className="text-xs text-slate-600 font-sans">
            Target location: <strong className="text-slate-900">{region.name}</strong> ({region.representativeStation}) · Coordinates: <span className="font-mono text-slate-700">{region.lat}°N, {region.lon}°E</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-fetch latest forecast from Open-Meteo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : 'text-slate-600'}`} />
            <span>{isLoading ? 'Fetching...' : 'Refresh'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Close live view and return to demonstration mode"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
            <span>Return to Demo</span>
          </button>
        </div>
      </div>

      {/* Scientific Transparency Disclaimer */}
      <div className="bg-amber-50/90 border border-amber-300 rounded p-3 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Scientific Transparency & Provenance Notice</span>
        </div>
        <p className="leading-relaxed">
          This series contains <strong>real 2-metre temperature forecast values</strong> retrieved live from the Open-Meteo public API. This is a <strong>single-source operational forecast</strong>, not a multi-model ensemble blend. In accordance with meteorological standards, synthetic multi-model weights, simulated disagreement indices, and mock verification scores from the demonstration engine are suppressed for this feed.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 rounded p-4 text-xs text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold font-mono">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Error Fetching Live Weather Data</span>
          </div>
          <p className="font-mono text-[11px] bg-rose-100/60 p-2 rounded text-rose-800">
            {error}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onRefresh}
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
            Contacting Open-Meteo API for coordinates ({region.lat}°N, {region.lon}°E)...
          </p>
        </div>
      )}

      {/* Real Data Loaded View */}
      {realData && !isLoading && !error && (
        <div className="space-y-4">
          {/* Metadata banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Provider</span>
              <span className="font-bold text-slate-900">{realData.provider}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Elevation</span>
              <span className="font-bold text-slate-900">{realData.elevation}m ASL</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Horizon</span>
              <span className="font-bold text-slate-900">{realData.dataPoints.length} hours (3 days)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Retrieved At</span>
              <span className="font-bold text-slate-900">
                {new Date(realData.fetchedAt).toLocaleTimeString()} IST
              </span>
            </div>
          </div>

          {/* Real Data SVG Time-Series Chart */}
          {(() => {
            const points = realData.dataPoints;
            const temps = points.map(p => p.temperature);
            const minTemp = Math.floor(Math.min(...temps) - 1);
            const maxTemp = Math.ceil(Math.max(...temps) + 1);

            const width = 800;
            const height = 260;
            const padding = { top: 20, right: 25, bottom: 40, left: 50 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            const getX = (i: number) => padding.left + (i / (points.length - 1)) * chartWidth;
            const getY = (t: number) => {
              const ratio = (t - minTemp) / (maxTemp - minTemp || 1);
              return padding.top + chartHeight - ratio * chartHeight;
            };

            const pathD = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.temperature)}`)
              .join(' ');

            const areaD = `${pathD} L ${getX(points.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

            // Y ticks
            const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => {
              const val = minTemp + pct * (maxTemp - minTemp);
              return {
                val: Math.round(val * 10) / 10,
                y: getY(val)
              };
            });

            // Sample X ticks every 12 hours
            const xTicks = points.filter((_, i) => i % 12 === 0);

            const activePt = hoverIndex !== null ? points[hoverIndex] : points[0];

            return (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
                    <span className="font-bold text-slate-900">Real 2m Temperature (°C)</span>
                    <span className="text-slate-400">·</span>
                    <span>Range: {Math.min(...temps)}°C – {Math.max(...temps)}°C</span>
                  </div>

                  {activePt && (
                    <div className="bg-sky-50 px-2.5 py-1 rounded border border-sky-200 text-sky-900 font-semibold">
                      Time: {activePt.timestamp.replace('T', ' ')} · Temp: <span className="text-sm font-bold text-sky-700">{activePt.temperature}°C</span> (T+{activePt.leadHours}h)
                    </div>
                  )}
                </div>

                <div className="relative w-full overflow-hidden bg-slate-50/70 rounded border border-slate-200">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto block select-none"
                  >
                    <defs>
                      <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

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
                      const dateShort = parts[0].slice(5); // "10-24"
                      const timeShort = parts[1];          // "00:00"
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

                    {/* Area under curve */}
                    <path d={areaD} fill="url(#realGradient)" />

                    {/* Temperature Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {points.map((p, i) => {
                      const isHovered = hoverIndex === i;
                      if (!isHovered && i % 4 !== 0) return null;
                      return (
                        <circle
                          key={p.timestamp}
                          cx={getX(i)}
                          cy={getY(p.temperature)}
                          r={isHovered ? 5 : 2.5}
                          fill={isHovered ? '#0369a1' : '#0284c7'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      );
                    })}

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
              </div>
            );
          })()}

          {/* Raw Values Sample Strip */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block mb-2">
              Verified Hourly Milestones (First 24 Hours Sample)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
              {realData.dataPoints.slice(0, 6).map((pt) => (
                <div key={pt.timestamp} className="p-2 rounded bg-slate-100/70 border border-slate-200">
                  <div className="text-[10px] text-slate-500">{pt.timestamp.replace('T', ' ')}</div>
                  <div className="text-sm font-bold text-sky-900 mt-0.5">{pt.temperature}°C</div>
                  <div className="text-[10px] text-slate-500">T+{pt.leadHours}h</div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Reference */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 gap-2">
            <div className="truncate max-w-xl">
              Source URL: <span className="text-slate-600">{realData.endpoint}</span>
            </div>
            <a
              href="https://open-meteo.com/en/docs"
              target="_blank"
              rel="noreferrer"
              className="text-sky-700 hover:text-sky-900 underline flex items-center gap-1"
            >
              <span>Provider Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
