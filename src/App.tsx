/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  getAdaptiveWeights,
  getForecastTimeSeries,
  EXTREME_WEATHER_EVENTS
} from './data/varsaData';

import { IndiaMap } from './components/IndiaMap';
import { ForecastChart } from './components/ForecastChart';
import { AdaptiveWeightsPanel } from './components/AdaptiveWeightsPanel';
import { BlendPipelineModal } from './components/BlendPipelineModal';
import { MethodologyModal } from './components/MethodologyModal';
import { ForecastBlendingScreen } from './components/ForecastBlendingScreen';
import { ModelWeightMapScreen } from './components/ModelWeightMapScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { ExtremeWeatherScreen } from './components/ExtremeWeatherScreen';

import {
  Play,
  RotateCw,
  Info,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

type TabId = 'command' | 'blending' | 'weight_map' | 'verification' | 'extreme_weather';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('command');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('central');
  const [selectedVariable, setSelectedVariable] = useState<VariableId>('rainfall');
  const [selectedLeadTime, setSelectedLeadTime] = useState<LeadTimeId>('48h');
  const [selectedRegime, setSelectedRegime] = useState<WeatherRegimeId>('monsoon_convective');

  // Modals & execution states
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [hasRunBlend, setHasRunBlend] = useState<boolean>(true);
  const [lastBlendTime, setLastBlendTime] = useState<string>('Cycle 00Z +48h Verified');

  // Selected entities
  const region = REGIONS[selectedRegion];
  const variable = VARIABLES[selectedVariable];
  const leadTime = LEAD_TIMES[selectedLeadTime];
  const regime = WEATHER_REGIMES[selectedRegime];

  // Compute time-series & weights
  const { points, weights, summary } = getForecastTimeSeries(
    selectedRegion,
    selectedVariable,
    selectedLeadTime,
    selectedRegime
  );

  const selectedPoint = points.find(p => p.hours === leadTime.hours) || points[1];

  // Active extreme weather alerts in this region
  const regionalAlerts = EXTREME_WEATHER_EVENTS.filter(e => e.regionId === selectedRegion);

  const handleRunBlend = () => {
    setIsPipelineOpen(true);
  };

  const handlePipelineComplete = () => {
    setIsPipelineOpen(false);
    setHasRunBlend(true);
    setLastBlendTime(`Cycle 00Z +${leadTime.hours}h Calibrated`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      {/* =========================================================================
          ZONE 1, 2, 3: TOP BAR CONTRACT (Single-line, 3 zones, zero-pill discipline)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-slate-955 font-sans">
              VARSA
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              Adaptive Weather Intelligence Engine
            </span>
          </div>

          {/* Zone 2: Navigation Links (Text with subtle active underline) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('command')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'command'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-800 pb-0.5'
                  : 'hover:text-slate-900'
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => setActiveTab('blending')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'blending'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-800 pb-0.5'
                  : 'hover:text-slate-900'
              }`}
            >
              Forecast Blending
            </button>
            <button
              onClick={() => setActiveTab('weight_map')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'weight_map'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-800 pb-0.5'
                  : 'hover:text-slate-900'
              }`}
            >
              Model Weight Map
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'verification'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-800 pb-0.5'
                  : 'hover:text-slate-900'
              }`}
            >
              Verification Matrix
            </button>
            <button
              onClick={() => setActiveTab('extreme_weather')}
              className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'extreme_weather'
                  ? 'text-sky-900 font-bold border-b-2 border-sky-800 pb-0.5'
                  : 'hover:text-slate-900'
              }`}
            >
              Extreme Weather
              {EXTREME_WEATHER_EVENTS.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300/80 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-600" />
              <span>Technical Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 bg-white border-b border-slate-200 text-xs font-medium">
        {(['command', 'blending', 'weight_map', 'verification', 'extreme_weather'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === tab ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            {tab === 'command' ? 'Command' : tab === 'blending' ? 'Blending' : tab === 'weight_map' ? 'Weight Map' : tab === 'verification' ? 'Verification' : 'Extreme Weather'}
          </button>
        ))}
      </div>

      {/* =========================================================================
          CONTROL STRIP / COMMAND RIBBON (Region, Variable, Lead Time, Regime, RUN BLEND)
          ========================================================================= */}
      <section className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Region Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-400 font-semibold">REGION:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as RegionId)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 cursor-pointer"
              >
                {(Object.keys(REGIONS) as RegionId[]).map((id) => (
                  <option key={id} value={id}>
                    {REGIONS[id].name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Variable Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-400 font-semibold">VARIABLE:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
                {(Object.keys(VARIABLES) as VariableId[]).map((vId) => (
                  <button
                    key={vId}
                    onClick={() => setSelectedVariable(vId)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      selectedVariable === vId
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {VARIABLES[vId].symbol}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Lead Time Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-400 font-semibold">LEAD:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
                {(Object.keys(LEAD_TIMES) as LeadTimeId[]).map((ltId) => (
                  <button
                    key={ltId}
                    onClick={() => setSelectedLeadTime(ltId)}
                    className={`px-2 py-1 rounded text-xs transition-colors whitespace-nowrap font-mono cursor-pointer ${
                      selectedLeadTime === ltId
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    +{ltId}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Weather Regime Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-400 font-semibold">REGIME:</span>
              <select
                value={selectedRegime}
                onChange={(e) => setSelectedRegime(e.target.value as WeatherRegimeId)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-sky-600 cursor-pointer"
              >
                {(Object.keys(WEATHER_REGIMES) as WeatherRegimeId[]).map((rId) => (
                  <option key={rId} value={rId}>
                    {WEATHER_REGIMES[rId].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Execution CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col text-right font-mono text-[11px] text-slate-500">
              <span>{lastBlendTime}</span>
              <span className="text-emerald-700 font-semibold">Harmonized 0.1° Grid</span>
            </div>

            <button
              onClick={handleRunBlend}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 active:bg-sky-900 rounded shadow-xs transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN VARSA BLEND</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTENT VIEWPORT (Desktop 1440px Baseline Container)
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Render Tab Screens */}
        {activeTab === 'command' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Meteorological Overview Ribbon */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="text-xs">
                  <span className="font-mono text-slate-400">ACTIVE REGION: </span>
                  <strong className="text-slate-900 font-semibold">{region.name}</strong>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-slate-600">{region.subdivision}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-mono text-slate-500">{region.elevation}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <div>
                  STATION: <span className="font-semibold text-slate-800">{region.representativeStation}</span>
                </div>
                <span>|</span>
                <div>
                  SYNOPTIC DYNAMICS: <span className="font-semibold text-sky-800">{regime.synopticFeature}</span>
                </div>
              </div>
            </div>

            {/* Asymmetric Core Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Col-span 7): India Forecast Map & Time-Series Preview */}
              <div className="lg:col-span-7 space-y-6">
                {/* Map Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        METEOROLOGICAL REGIONS & DOMINANT NWP WEIGHT
                      </h3>
                      <p className="text-xs text-slate-500">
                        Interactive geodetic subdivision map · Click to shift regional inference
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('weight_map')}
                      className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <span>Full Map View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full h-[400px] flex items-center justify-center bg-slate-50/50 rounded border border-slate-100">
                    <IndiaMap
                      selectedRegion={selectedRegion}
                      onSelectRegion={(r) => setSelectedRegion(r)}
                      leadTime={selectedLeadTime}
                      regime={selectedRegime}
                      variable={selectedVariable}
                      mode="command"
                    />
                  </div>
                </div>

                {/* Integrated Forecast Time-Series Chart */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        MULTI-MODEL ENSEMBLE EVOLUTION ({variable.name})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Comparing raw NWP member forecasts vs VARSA Blended Surface
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('blending')}
                      className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <span>Detailed Convergence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ForecastChart
                    data={points}
                    weights={weights}
                    variable={variable}
                    height={280}
                    showObservation={true}
                    selectedLeadHour={leadTime.hours}
                  />
                </div>
              </div>

              {/* Right Column (Col-span 5): Live Forecast Metric, Adaptive Weights & Alerts */}
              <div className="lg:col-span-5 space-y-6">
                {/* Primary Forecast Convergence Readout Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-mono uppercase text-slate-500 font-semibold">
                      Forecast Lead: {leadTime.label}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Harmonized Blend
                    </span>
                  </div>

                  {/* Main Metric Banner */}
                  <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-sky-300">
                        VARSA Blended Forecast
                      </span>
                      <div className="text-3xl font-mono font-bold text-white mt-1 tabular-nums">
                        {selectedPoint.varsa}{' '}
                        <span className="text-sm font-normal text-sky-200 font-sans">
                          {variable.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-1">
                        Confidence Interval: {leadTime.confidenceBand}
                      </div>
                    </div>

                    <div className="text-right border-l border-slate-700/80 pl-4 space-y-1 text-xs font-mono">
                      <div className="text-slate-400">Raw Spread:</div>
                      <div className="text-base font-bold text-amber-400 tabular-nums">
                        ±{selectedPoint.spread} {variable.unit.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {weights.disagreementIndex > 5 ? 'High Member Divergence' : 'Model Consensus'}
                      </div>
                    </div>
                  </div>

                  {/* Individual Raw Model Comparison Strip */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded">
                      <div className="text-[10px] text-amber-800">NOAA GFS (0.25°)</div>
                      <div className="text-base font-bold text-amber-950 mt-0.5 tabular-nums">
                        {selectedPoint.gfs}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Weight: {Math.round(weights.gfs * 100)}%
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded">
                      <div className="text-[10px] text-blue-800">ECMWF IFS (0.1°)</div>
                      <div className="text-base font-bold text-blue-950 mt-0.5 tabular-nums">
                        {selectedPoint.ecmwf}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Weight: {Math.round(weights.ecmwf * 100)}%
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded">
                      <div className="text-[10px] text-emerald-800">DWD ICON (13km)</div>
                      <div className="text-base font-bold text-emerald-950 mt-0.5 tabular-nums">
                        {selectedPoint.icon}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Weight: {Math.round(weights.icon * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adaptive Model Weights Panel */}
                <AdaptiveWeightsPanel
                  weights={weights}
                  region={region}
                  leadTime={leadTime}
                  regime={regime}
                  variable={variable}
                />

                {/* Regional Weather Advisory Ticker */}
                {regionalAlerts.length > 0 && (
                  <div className="bg-white border border-rose-200 rounded-lg p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>ACTIVE REGIONAL HAZARD SIGNAL</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('extreme_weather')}
                        className="text-[11px] font-mono text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                      >
                        Details &rarr;
                      </button>
                    </div>

                    {regionalAlerts.map(alert => (
                      <div key={alert.id} className="text-xs bg-rose-50/70 p-2.5 rounded border border-rose-100 space-y-1">
                        <div className="flex items-center justify-between font-semibold text-rose-950">
                          <span>{alert.title}</span>
                          <span className="font-mono text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.2 rounded">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-800/90 leading-snug">
                          {alert.operationalGuidance}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Executive Briefing & Pipeline Status Ribbon */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Operational Meteorological Briefing
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  National Weather Intelligence Framework
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {summary} Based on historical verification over 180 continuous forecast cycles, the adaptive blend eliminates individual model systematic dry/wet bias and stabilizes forecast variance across complex Indian topography.
              </p>

              {/* Process Status Indicators */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Forecast Ingestion: Nominal (3 NWP Streams)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data Harmonization: Unified 0.1° Grid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Adaptive Weighting: XGBoost Context Evaluated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skill Verification: MAE -25.4% vs Equal Mean</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Forecast Blending */}
        {activeTab === 'blending' && (
          <ForecastBlendingScreen
            region={selectedRegion}
            variable={selectedVariable}
            leadTime={selectedLeadTime}
            regime={selectedRegime}
            onSelectLeadTime={(lt) => setSelectedLeadTime(lt)}
            onSelectVariable={(v) => setSelectedVariable(v)}
          />
        )}

        {/* Screen 3: Model Weight Map */}
        {activeTab === 'weight_map' && (
          <ModelWeightMapScreen
            region={selectedRegion}
            leadTime={selectedLeadTime}
            regime={selectedRegime}
            variable={selectedVariable}
            onSelectRegion={(r) => setSelectedRegion(r)}
            onSelectLeadTime={(lt) => setSelectedLeadTime(lt)}
            onSelectRegime={(reg) => setSelectedRegime(reg)}
          />
        )}

        {/* Screen 4: Verification Screen */}
        {activeTab === 'verification' && (
          <VerificationScreen
            region={selectedRegion}
            variable={selectedVariable}
            onSelectRegion={(r) => setSelectedRegion(r)}
            onSelectVariable={(v) => setSelectedVariable(v)}
          />
        )}

        {/* Screen 5: Extreme Weather Guidance */}
        {activeTab === 'extreme_weather' && (
          <ExtremeWeatherScreen />
        )}
      </main>

      {/* =========================================================================
          FOOTER (Quiet, zero fake telemetry tickers, domain authoritative)
          ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span className="font-bold text-slate-700">VARSA</span> — Smart India Hackathon 2026 Showcase Prototype
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Deterministic Demo Datasets</span>
            <span>·</span>
            <span>Non-Operational Demonstration</span>
            <span>·</span>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Methodology Brief
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Processing Pipeline Modal */}
      <BlendPipelineModal
        isOpen={isPipelineOpen}
        onClose={() => setIsPipelineOpen(false)}
        onComplete={handlePipelineComplete}
        region={region}
        variable={variable}
        leadTime={leadTime}
        regime={regime}
      />

      {/* Technical Architecture & Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
