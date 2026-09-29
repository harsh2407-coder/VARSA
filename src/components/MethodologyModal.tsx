import React from 'react';
import { X, Layers, Cpu, Compass, CheckCircle2, GitMerge, AlertCircle, ArrowDown } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">VARSA System Architecture & ML Methodology</h2>
              <p className="text-xs text-slate-300">Technical Briefing · Prototype vs. Intended Operational Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* Core Principle Banner */}
          <div className="bg-slate-50 border-l-4 border-sky-600 p-4 rounded-r">
            <h4 className="text-xs font-mono uppercase tracking-wider text-sky-900 font-bold">The Core Principle</h4>
            <p className="text-sm font-semibold text-slate-900 mt-1 italic">
              “When weather models disagree, VARSA learns which forecast to trust — and how much.”
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Global and regional Numerical Weather Prediction (NWP) models (NOAA GFS, ECMWF IFS, DWD ICON) possess systematic, regime-dependent strengths and biases. VARSA sits above these models as an adaptive forecast intelligence and blending layer rather than replacing numerical atmospheric physics.
            </p>
          </div>

          {/* Critical Architectural Distinction: Current Prototype vs Intended Operational System */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                1. System Architecture: Prototype vs. Intended Operational System
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                Architecture Roadmap
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: CURRENT PROTOTYPE */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                    Current Prototype
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                    Showcase Demonstrator
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-slate-700">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    Deterministic demonstration inputs
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    Prototype harmonization
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    Context-aware weighting logic
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="p-2 rounded bg-white border border-slate-200 font-semibold text-sky-950">
                    Weighted forecast blend
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    Demonstration verification
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug pt-1">
                  * Operates entirely on deterministic local scenarios structured to demonstrate the multi-model intelligence workflow without live cloud/API dependencies.
                </p>
              </div>

              {/* Box 2: INTENDED OPERATIONAL ARCHITECTURE */}
              <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
                  <span className="text-xs font-mono font-bold text-sky-950 uppercase">
                    Intended Operational Architecture
                  </span>
                  <span className="text-[10px] font-mono text-sky-800 bg-white border border-sky-200 px-1.5 py-0.2 rounded font-semibold">
                    Production Target
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-slate-700">
                  <div className="p-2 rounded bg-white border border-sky-100">
                    GFS / ECMWF / ICON / other compatible NWP sources
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100">
                    Data harmonization
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100">
                    Historical forecast skill & context features
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100 font-semibold text-sky-900">
                    XGBoost adaptive weighting
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100 font-semibold text-slate-900">
                    Forecast blending
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100">
                    Observation-based verification
                  </div>
                  <div className="text-center text-sky-400">↓</div>
                  <div className="p-2 rounded bg-white border border-sky-100 text-amber-900">
                    Skill feedback loop
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug pt-1">
                  * Planned production system incorporating real-time telemetry, automated spatial regridding, and rolling skill feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Formulation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-sky-600" />
              2. Mathematical Blending Formulation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
                <div className="font-semibold text-slate-900 mb-1">Standard Simple Ensemble Mean:</div>
                <div className="font-mono bg-white p-2 border border-slate-200 rounded text-slate-700 text-[11px] mb-2">
                  F_equal = (1/N) · Σ F_m
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Treats all models identically regardless of orography, lead time, or weather regime. If one model has a known positive precipitation bias in a monsoon trough, the simple mean directly inherits that error.
                </p>
              </div>

              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded">
                <div className="font-semibold text-sky-950 mb-1">VARSA Adaptive Contextual Blending:</div>
                <div className="font-mono bg-white p-2 border border-sky-200 rounded text-sky-900 text-[11px] mb-2">
                  F_VARSA = Σ [ w_m(x, y, L, θ) · F_m ]
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Weights w_m are dynamically evaluated based on terrain, forecast horizon, and regime conditions, constrained to Σ w_m = 1. High-performing models in the specific meteorological regime receive higher weighting.
                </p>
              </div>
            </div>
          </div>

          {/* Proposed ML Approach */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              3. Proposed Production ML Approach (XGBoost Contextual Weighting)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In the intended production architecture, VARSA proposes a multi-output gradient boosted tree ensemble (XGBoost) trained on historical NWP verification cycles to estimate contextual weights:
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
              <li><strong>Terrain / Orographic Features:</strong> Accounts for high-resolution barrier blocking along Western Ghats and Himalayan foothills where coarser models diverge.</li>
              <li><strong>Lead Time Decay Factors:</strong> Balances mesoscale convective fidelity at short lead times (+24h to +48h) with synoptic wave accuracy at medium range (+96h to +120h).</li>
              <li><strong>Context-Aware Weighted Synthesis:</strong> Prevents systematic bias accumulation across diverse synoptic regimes without asserting unvalidated physical claims.</li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Demonstration Scope (SIH 2026):</strong> This prototype visually and technically demonstrates the architectural concept and deterministic weighting mechanics. In this prototype, inference values and verification datasets are structured demonstration models representing South Asian climatology.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close System Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
