import React, { useState } from 'react';
import { EXTREME_WEATHER_EVENTS, ExtremeWeatherEvent } from '../data/varsaData';
import { AlertTriangle, CloudRain, Sun, Wind, ShieldAlert, CheckCircle2, MapPin, Clock } from 'lucide-react';

export const ExtremeWeatherScreen: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'heavy_rain' | 'heat' | 'high_wind'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'Severe Warning' | 'Warning' | 'Watch'>('all');

  const filteredEvents = EXTREME_WEATHER_EVENTS.filter((evt) => {
    if (filterType !== 'all' && evt.type !== filterType) return false;
    if (filterSeverity !== 'all' && evt.severity !== filterSeverity) return false;
    return true;
  });

  const getEventIcon = (type: ExtremeWeatherEvent['type']) => {
    switch (type) {
      case 'heavy_rain':
        return <CloudRain className="w-5 h-5 text-sky-600" />;
      case 'heat':
        return <Sun className="w-5 h-5 text-amber-600" />;
      case 'high_wind':
        return <Wind className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getSeverityBadge = (severity: ExtremeWeatherEvent['severity']) => {
    switch (severity) {
      case 'Severe Warning':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Watch':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">EXTREME WEATHER GUIDANCE</h2>
            <span className="text-xs font-mono text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Operational Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hazard detection and actionable early warnings calibrated from VARSA multi-model consensus
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              All Hazards
            </button>
            <button
              onClick={() => setFilterType('heavy_rain')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'heavy_rain' ? 'bg-white text-sky-800 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Heavy Rain
            </button>
            <button
              onClick={() => setFilterType('heat')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'heat' ? 'bg-white text-amber-800 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Heatwave
            </button>
            <button
              onClick={() => setFilterType('high_wind')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterType === 'high_wind' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              High Wind
            </button>
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Alert Levels</option>
            <option value="Severe Warning">Severe Warning (Red)</option>
            <option value="Warning">Warning (Amber)</option>
            <option value="Watch">Watch (Yellow)</option>
          </select>
        </div>
      </div>

      {/* Extreme Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    {getEventIcon(evt.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      {evt.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                <span className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-bold shrink-0 ${getSeverityBadge(evt.severity)}`}>
                  {evt.severity}
                </span>
              </div>

              {/* Geographic & Lead-Time Metadata */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-3 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.regionName}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead Time: T+{evt.leadTime}</span>
                </div>
                <span>·</span>
                <div>
                  Probability: <strong className="text-slate-800">{evt.probability}%</strong>
                </div>
              </div>
            </div>

            {/* Signal & Threshold Metric Strip */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase text-slate-400">VARSA Blended Signal</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                  {evt.signalValue}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400">Meteorological Threshold</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  {evt.threshold}
                </div>
              </div>
            </div>

            {/* Model Consensus Analysis */}
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-800 font-mono text-[11px] uppercase tracking-wider">
                Multi-Model Consensus:
              </div>
              <p className="text-slate-600 leading-relaxed">
                {evt.modelConsensus}
              </p>
            </div>

            {/* Operational Action Protocols */}
            <div className="space-y-1 text-xs bg-slate-900 text-slate-200 p-3 rounded">
              <div className="font-semibold text-sky-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Civil Defense / Disaster Management Advisory:
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {evt.operationalGuidance}
              </p>
            </div>

            {/* Affected Districts */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
              <span className="text-[11px] font-mono text-slate-400 shrink-0">Districts on Alert:</span>
              <div className="flex flex-wrap gap-1">
                {evt.affectedDistricts.map((d, i) => (
                  <span key={d} className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                    {d}{i < evt.affectedDistricts.length - 1 ? '' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Protocol Note */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
          Operational Integration Standard:
        </div>
        <p className="leading-relaxed">
          Guidance thresholds are aligned with Indian Meteorological Department (IMD) color-coded warning scales (Red: Action Required, Orange: Be Prepared, Yellow: Be Aware). VARSA reduces false alarms by dynamically damping single-model over-predictive outliers while preserving critical heavy-tail threat signals.
        </p>
      </div>
    </div>
  );
};
