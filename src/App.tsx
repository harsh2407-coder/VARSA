/**
 * VARSA — Adaptive Weather Intelligence Engine
 * Smart India Hackathon 2026 Showcase Prototype
 * 
 * Desktop-first Command-Center Architecture:
 * - Top Header: VARSA | Adaptive Weather Intelligence Engine | System Status | Demo Mode
 * - LEFT: Compact Sidebar Navigation (Overview, Forecast Blend, Model Weights, Verification, Extreme Guidance)
 * - CENTER: Primary weather / map visualization (India Forecast Map - visual anchor)
 * - RIGHT: Adaptive Model Weights panel (Demonstration weights, clean bars, contextual rationale)
 * - BOTTOM: Forecast Blend & Verification visualizations
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
  EXTREME_WEATHER_EVENTS
} from './data/varsaData';

import { runVarsaDemo, DEMO_SCENARIOS } from './lib/varsaEngine';

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
  Compass,
  TrendingUp,
  Layers,
  Award,
  AlertTriangle,
  Play,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Cpu
} from 'lucide-react';

type NavTabId = 'overview' | 'blending' | 'weight_map' | 'verification' | 'extreme_guidance';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('central');
  const [selectedVariable, setSelectedVariable] = useState<VariableId>('rainfall');
  const [selectedLeadTime, setSelectedLeadTime] = useState<LeadTimeId>('24h');
  const [selectedRegime, setSelectedRegime] = useState<WeatherRegimeId>('monsoon_convective');

  // Modals & execution states
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [lastBlendTime, setLastBlendTime] = useState<string>('Demo Run: Cycle 00Z +24h');

  // Active entities
  const region = REGIONS[selectedRegion];
  const variable = VARIABLES[selectedVariable];
  const leadTime = LEAD_TIMES[selectedLeadTime];
  const regime = WEATHER_REGIMES[selectedRegime];

  // Run Central VARSA Demonstration Engine (Strict Deterministic Computation)
  const engineResult = runVarsaDemo({
    region: selectedRegion,
    variable: selectedVariable,
    leadTime: selectedLeadTime,
    weatherRegime: selectedRegime
  });

  const {
    timeSeries: points,
    weights,
    activePoint: selectedPoint,
    modelDisagreement,
    contextSummary,
    activeExtremeEvent
  } = engineResult;

  // Active extreme weather alerts in this region
  const regionalAlerts = activeExtremeEvent
    ? [activeExtremeEvent]
    : EXTREME_WEATHER_EVENTS.filter((e) => e.regionId === selectedRegion);

  const handleApplyScenario = (scenarioId: string) => {
    const sc = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      setSelectedRegion(sc.params.region);
      setSelectedVariable(sc.params.variable);
      setSelectedLeadTime(sc.params.leadTime);
      setSelectedRegime(sc.params.weatherRegime);
    }
  };

  const handleRunBlend = () => {
    setIsPipelineOpen(true);
  };

  const handlePipelineComplete = () => {
    setIsPipelineOpen(false);
    setLastBlendTime('VARSA DEMONSTRATION RUN COMPLETE');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* =========================================================================
          TOP COMMAND-CENTER HEADER
          Left: VARSA Wordmark & Engine Subtitle
          Right: System Status & Demo Mode Indicator
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 shrink-0 shadow-xs">
        <div className="w-full mx-auto flex items-center justify-between gap-4">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-950 font-sans">
                VARSA
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 font-mono border-l border-slate-300 pl-2.5">
                Adaptive Weather Intelligence Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
              SIH 2026 Showcase
            </span>
          </div>

          {/* Right: System Status & Demo Mode */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* System Status */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden md:inline text-slate-500">System Status:</span>
              <span className="font-semibold text-slate-900">Prototype Grid · Deterministic Data</span>
            </div>

            {/* Demo Mode Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 border border-sky-200 text-sky-900 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
              <span>VARSA DEMONSTRATION</span>
              <span className="hidden sm:inline text-[10px] text-sky-700 font-normal">
                · Deterministic Prototype Dataset
              </span>
            </div>

            {/* Architecture Modal Trigger */}
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Inspect Technical Architecture"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN COMMAND-CENTER LAYOUT
          LEFT: Compact Navigation Sidebar
          RIGHT: Main Content Viewport
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row w-full mx-auto">
        {/* =========================================================================
            LEFT COMPACT SIDEBAR NAVIGATION
            - Overview
            - Forecast Blend
            - Model Weights
            - Verification
            - Extreme Guidance
            ========================================================================= */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 p-4 space-y-6">
          <div className="space-y-5">
            {/* Sidebar Navigation Title */}
            <div className="px-2">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                Command Navigation
              </span>
            </div>

            {/* Navigation Buttons */}
            <nav className="space-y-1">
              {/* 1. Overview */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className={`w-4 h-4 ${activeTab === 'overview' ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>Overview</span>
                </div>
                {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* 2. Forecast Blend */}
              <button
                onClick={() => setActiveTab('blending')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'blending'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className={`w-4 h-4 ${activeTab === 'blending' ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>Forecast Blend</span>
                </div>
                {activeTab === 'blending' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* 3. Model Weights */}
              <button
                onClick={() => setActiveTab('weight_map')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'weight_map'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === 'weight_map' ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>Model Weights</span>
                </div>
                {activeTab === 'weight_map' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* 4. Verification */}
              <button
                onClick={() => setActiveTab('verification')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'verification'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`w-4 h-4 ${activeTab === 'verification' ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>Verification</span>
                </div>
                {activeTab === 'verification' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* 5. Extreme Guidance */}
              <button
                onClick={() => setActiveTab('extreme_guidance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'extreme_guidance'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={`w-4 h-4 ${activeTab === 'extreme_guidance' ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>Extreme Guidance</span>
                </div>
                <span className="text-[10px] font-mono bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                  {EXTREME_WEATHER_EVENTS.length}
                </span>
              </button>
            </nav>

            {/* Core Product Scientific Statement Card */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold font-mono text-[11px] uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-sky-700" />
                <span>NWP Blending Concept</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-snug font-sans italic">
                “When weather models disagree, VARSA learns which forecast to trust — and how much.”
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                GFS + ECMWF + ICON &rarr; VARSA Adaptive Layer
              </div>
            </div>
          </div>

          {/* Sidebar Footer Info */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span>Cycle Context:</span>
              <span className="font-bold text-slate-700">00Z Demonstration</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Grid Representation:</span>
              <span className="font-bold text-slate-700">Harmonized 0.1° Rep</span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="text-sky-700 hover:text-sky-900 underline font-sans text-xs cursor-pointer block"
              >
                Scientific Architecture &rarr;
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN VIEWPORT (RIGHT OF SIDEBAR)
            ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* =======================================================================
              VIEW 1: OVERVIEW (THE COMMAND CENTER)
              Controls: Region, Variable, Lead Time, Weather Regime, RUN VARSA BLEND
              Center: INDIA FORECAST MAP (visual anchor)
              Right: ADAPTIVE MODEL WEIGHTS
              Bottom: FORECAST BLEND & Verification Briefing
              ======================================================================= */}
          {activeTab === 'overview' && (
            <div className="flex-1 flex flex-col">
              {/* Command Ribbon / Operational Controls Bar */}
              <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs shrink-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* Controls Selectors */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Region Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-400 font-semibold uppercase text-[11px]">Region:</span>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value as RegionId)}
                        className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 cursor-pointer text-xs"
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
                      <span className="font-mono text-slate-400 font-semibold uppercase text-[11px]">Variable:</span>
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
                      <span className="font-mono text-slate-400 font-semibold uppercase text-[11px]">Lead Time:</span>
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
                      <span className="font-mono text-slate-400 font-semibold uppercase text-[11px]">Weather Regime:</span>
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

                  {/* Primary Action Button: RUN VARSA BLEND */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden md:flex flex-col text-right font-mono text-[11px] text-slate-500">
                      <span>{lastBlendTime}</span>
                      <span className="text-emerald-700 font-semibold">Demo Grid · Harmonized Representation</span>
                    </div>

                    <button
                      onClick={handleRunBlend}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded shadow-xs transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer border border-slate-700"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
                      <span>RUN VARSA BLEND</span>
                    </button>
                  </div>
                </div>

                {/* Quick Demonstration Scenario Presets (Prompt Section 16) */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-100 text-xs font-mono">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Demo Scenarios:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {DEMO_SCENARIOS.map((sc) => {
                      const isScenarioActive =
                        selectedRegion === sc.params.region &&
                        selectedVariable === sc.params.variable &&
                        selectedLeadTime === sc.params.leadTime &&
                        selectedRegime === sc.params.weatherRegime;

                      return (
                        <button
                          key={sc.id}
                          onClick={() => handleApplyScenario(sc.id)}
                          className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer border ${
                            isScenarioActive
                              ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950 border-slate-200'
                          }`}
                          title={sc.description}
                        >
                          <span className="font-semibold">{sc.name.split(':')[0]}</span>
                          <span className={`ml-1 text-[10px] ${isScenarioActive ? 'text-sky-300' : 'text-slate-400'}`}>
                            ({sc.badge})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main Command Workspace */}
              <div className="p-6 space-y-6">
                {/* Active Sub-Division Operational Sub-Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <div className="text-xs">
                      <span className="font-mono text-slate-400 font-semibold uppercase">ACTIVE REGION: </span>
                      <strong className="text-slate-900 font-semibold text-sm">{region.name}</strong>
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
                      SYNOPTIC FEATURE: <span className="font-semibold text-sky-800">{regime.synopticFeature}</span>
                    </div>
                  </div>
                </div>

                {/* CURRENT CONTEXT & VARSA ADAPTIVE RESPONSE STRIP (Prompt Section 11 & 12) */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Left (5 cols): Current Context */}
                  <div className="lg:col-span-5 space-y-1.5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:pr-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        CURRENT CONTEXT
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Model Disagreement:</span>
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                          modelDisagreement.level === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : modelDisagreement.level === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {modelDisagreement.level} (±{selectedPoint.spread} {variable.unit.split(' ')[0]})
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 font-mono space-y-0.5">
                      <div>
                        Region: <strong className="text-slate-900">{region.name}</strong> · Lead: <strong className="text-slate-900">+{leadTime.id}</strong> · Var: <strong className="text-slate-900">{variable.symbol}</strong>
                      </div>
                      <div className="truncate text-slate-500">
                        Regime: <span className="text-sky-800 font-medium">{regime.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right (7 cols): VARSA Adaptive Response */}
                  <div className="lg:col-span-7 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-sky-950 uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-sky-700" />
                        <span>VARSA ADAPTIVE RESPONSE</span>
                      </span>
                      <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                        Demonstration scenario
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      <strong className="text-slate-900 font-semibold">{contextSummary.varsaResponse}.</strong>{' '}
                      <span className="text-slate-600">{contextSummary.rationale}</span>
                    </p>
                  </div>
                </div>

                {/* 2-Column Split: Center (India Map) & Right (Adaptive Weights) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* ===================================================================
                      CENTER: PRIMARY WEATHER / MAP VISUALIZATION (Col-span 7)
                      INDIA FORECAST MAP — Visual Anchor
                      =================================================================== */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 tracking-tight font-mono uppercase">
                            INDIA FORECAST MAP
                          </h2>
                          <p className="text-xs text-slate-500">
                            Meteorological macro-regions & regional forecast signals · Visual anchor
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400">
                            Click any zone to select
                          </span>
                          <button
                            onClick={() => setActiveTab('weight_map')}
                            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono cursor-pointer"
                          >
                            <span>Model Weight Surface</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Map Container */}
                      <div className="w-full h-[410px] flex items-center justify-center bg-slate-50/60 rounded border border-slate-100">
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

                    {/* Regional Multi-Model Forecast Quick Strip */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 text-xs font-mono gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700 uppercase">
                            Forecast Readout: {region.name} (+{leadTime.id})
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                            Disagreement: ±{selectedPoint.spread} {variable.unit.split(' ')[0]} ({modelDisagreement.level})
                          </span>
                        </div>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          VARSA Blended: {selectedPoint.varsa} {variable.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-2 rounded bg-slate-900 text-white">
                          <div className="text-[10px] uppercase text-sky-300 font-bold">VARSA Blended</div>
                          <div className="text-lg font-bold mt-0.5 tabular-nums text-white">
                            {selectedPoint.varsa} <span className="text-[10px] font-normal text-slate-300">{variable.unit.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-blue-50/70 border border-blue-200">
                          <div className="text-[10px] uppercase text-blue-800 font-semibold">ECMWF (0.1°)</div>
                          <div className="text-lg font-bold mt-0.5 tabular-nums text-blue-950">
                            {selectedPoint.ecmwf}
                          </div>
                          <div className="text-[10px] text-slate-500">Weight: {Math.round(weights.ecmwf * 100)}%</div>
                        </div>

                        <div className="p-2 rounded bg-amber-50/70 border border-amber-200">
                          <div className="text-[10px] uppercase text-amber-800 font-semibold">GFS (0.25°)</div>
                          <div className="text-lg font-bold mt-0.5 tabular-nums text-amber-950">
                            {selectedPoint.gfs}
                          </div>
                          <div className="text-[10px] text-slate-500">Weight: {Math.round(weights.gfs * 100)}%</div>
                        </div>

                        <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200">
                          <div className="text-[10px] uppercase text-emerald-800 font-semibold">ICON (13km)</div>
                          <div className="text-lg font-bold mt-0.5 tabular-nums text-emerald-950">
                            {selectedPoint.icon}
                          </div>
                          <div className="text-[10px] text-slate-500">Weight: {Math.round(weights.icon * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===================================================================
                      RIGHT: ADAPTIVE MODEL INTELLIGENCE PANEL (Col-span 5)
                      Demonstration weights, clean bars, contextual rationale, regional alert
                      =================================================================== */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Adaptive Model Weights Component */}
                    <AdaptiveWeightsPanel
                      weights={weights}
                      region={region}
                      leadTime={leadTime}
                      regime={regime}
                      variable={variable}
                      gfsVal={selectedPoint.gfs}
                      ecmwfVal={selectedPoint.ecmwf}
                      iconVal={selectedPoint.icon}
                      blendedVal={selectedPoint.varsa}
                      spread={selectedPoint.spread}
                      disagreementLevel={modelDisagreement.level}
                    />

                    {/* Regional Hazard Advisory Card (if active in this region) */}
                    {regionalAlerts.length > 0 && (
                      <div className="bg-white border border-rose-200 rounded-lg p-4 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>ACTIVE REGIONAL HAZARD SIGNAL</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('extreme_guidance')}
                            className="text-[11px] font-mono text-rose-700 hover:text-rose-900 font-semibold cursor-pointer underline"
                          >
                            All Hazards &rarr;
                          </button>
                        </div>

                        {regionalAlerts.map((alert) => (
                          <div key={alert.id} className="text-xs bg-rose-50/70 p-2.5 rounded border border-rose-100 space-y-1">
                            <div className="flex items-center justify-between font-semibold text-rose-950">
                              <span>{alert.title}</span>
                              <span className="font-mono text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                                {alert.signalLabel || alert.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-800 leading-snug">
                              {alert.operationalGuidance}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ===================================================================
                    BOTTOM: FORECAST / VERIFICATION VISUALIZATIONS
                    Scientific line chart: GFS, ECMWF, ICON, VARSA, Observation
                    Title: FORECAST BLEND
                    Subtitle: "Model forecasts vs VARSA blended estimate"
                    =================================================================== */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight font-mono uppercase">
                        FORECAST BLEND
                      </h2>
                      <p className="text-xs text-slate-500">
                        Model forecasts vs VARSA blended estimate ({variable.name} · {region.name})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        Observation reference enabled
                      </span>
                      <button
                        onClick={() => setActiveTab('blending')}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <span>Detailed Convergence Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scientific Line Chart */}
                  <ForecastChart
                    data={points}
                    weights={weights}
                    variable={variable}
                    height={290}
                    showObservation={true}
                    selectedLeadHour={leadTime.hours}
                  />

                  {/* Operational Meteorological Briefing & Quality Check Ribbon */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-700 uppercase text-[11px]">
                        Operational Meteorological Summary — Demonstration
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Illustrative demonstration dataset over simulated seasonal test cycles
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {contextSummary.rationale} Based on demonstration evaluation, the adaptive weighting scheme dampens individual NWP systematic biases across {region.subdivision} and produces an optimal consensus trajectory for disaster risk reduction.
                    </p>

                    {/* Pipeline Status Indicators */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>01 Demonstration Inputs: Loaded</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>02 Field Harmonization: Demo Grid</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>04 Adaptive Weights: Prototype Engine</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>06 Verification: Observation Reference Checked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================================
              VIEW 2: FORECAST BLEND SCREEN
              ======================================================================= */}
          {activeTab === 'blending' && (
            <div className="p-6">
              <ForecastBlendingScreen
                region={selectedRegion}
                variable={selectedVariable}
                leadTime={selectedLeadTime}
                regime={selectedRegime}
                onSelectLeadTime={(lt) => setSelectedLeadTime(lt)}
                onSelectVariable={(v) => setSelectedVariable(v)}
              />
            </div>
          )}

          {/* =======================================================================
              VIEW 3: MODEL WEIGHT MAP SCREEN (ADAPTIVE MODEL CONTRIBUTION)
              ======================================================================= */}
          {activeTab === 'weight_map' && (
            <div className="p-6">
              <ModelWeightMapScreen
                region={selectedRegion}
                leadTime={selectedLeadTime}
                regime={selectedRegime}
                variable={selectedVariable}
                onSelectRegion={(r) => setSelectedRegion(r)}
                onSelectLeadTime={(lt) => setSelectedLeadTime(lt)}
                onSelectRegime={(reg) => setSelectedRegime(reg)}
              />
            </div>
          )}

          {/* =======================================================================
              VIEW 4: VERIFICATION SCREEN (FORECAST VERIFICATION)
              ======================================================================= */}
          {activeTab === 'verification' && (
            <div className="p-6">
              <VerificationScreen
                region={selectedRegion}
                variable={selectedVariable}
                onSelectRegion={(r) => setSelectedRegion(r)}
                onSelectVariable={(v) => setSelectedVariable(v)}
              />
            </div>
          )}

          {/* =======================================================================
              VIEW 5: EXTREME GUIDANCE SCREEN
              ======================================================================= */}
          {activeTab === 'extreme_guidance' && (
            <div className="p-6">
              <ExtremeWeatherScreen
                onSelectScenario={handleApplyScenario}
              />
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          GLOBAL FOOTER (Domain Authoritative, Scientific Disclosure)
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3.5 text-xs text-slate-500 shrink-0">
        <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span className="font-bold text-slate-800">VARSA</span> — Smart India Hackathon 2026 Showcase Prototype
            <span className="ml-3 text-slate-400">· PROTOTYPE / ILLUSTRATIVE — NOT AN OPERATIONAL PERFORMANCE CLAIM</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Deterministic Demo Datasets</span>
            <span>·</span>
            <span>Non-Operational Demonstration</span>
            <span>·</span>
            <span className="text-slate-500 italic">Next step: Historical NWP + observation validation</span>
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

      {/* =========================================================================
          INTERACTIVE PROCESSING PIPELINE MODAL (RUN VARSA BLEND)
          01 Model forecast ingestion
          02 Data harmonization
          03 Context analysis
          04 Adaptive weighting
          05 Forecast blending
          06 Verification
          ========================================================================= */}
      <BlendPipelineModal
        isOpen={isPipelineOpen}
        onClose={() => setIsPipelineOpen(false)}
        onComplete={handlePipelineComplete}
        region={region}
        variable={variable}
        leadTime={leadTime}
        regime={regime}
        weights={weights}
        blendedForecast={selectedPoint.varsa}
      />

      {/* =========================================================================
          TECHNICAL ARCHITECTURE & METHODOLOGY MODAL
          ========================================================================= */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
