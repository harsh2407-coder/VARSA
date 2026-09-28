import React from 'react';
import { X, Layers, Cpu, Compass, CheckCircle2, GitMerge } from 'lucide-react';

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
              <p className="text-xs text-slate-300">National Weather Intelligence / Meteorological Decision Support Concept</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* Core Statement Banner */}
          <div className="bg-slate-50 border-l-4 border-sky-600 p-4 rounded-r">
            <h4 className="text-xs font-mono uppercase tracking-wider text-sky-900 font-bold">The Core Principle</h4>
            <p className="text-sm font-semibold text-slate-900 mt-1 italic">
              “When weather models disagree, VARSA learns which forecast to trust — and how much.”
            </p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Global and regional Numerical Weather Prediction (NWP) models (NOAA GFS, ECMWF IFS, DWD ICON) possess systematic, regime-dependent strengths and biases. VARSA operates above these models as an intelligent meta-blending engine rather than replacing numerical atmospheric physics.
            </p>
          </div>

          {/* Architecture Pipeline Flow */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              1. End-to-End Data Harmonization & Weighting Pipeline
            </h3>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed space-y-1">
              <div className="text-sky-400">INPUT NWP MODELS: NOAA GFS (0.25°) | ECMWF IFS (0.1° HRES) | DWD ICON (13km)</div>
              <div className="text-slate-500 pl-4">↓ GRIB2 Ingestion & Temporal Synchronization</div>
              <div className="text-slate-300">DATA HARMONIZATION: Geodetic Bilinear Interpolation to Unified 0.1° Grid</div>
              <div className="text-slate-500 pl-4">↓ Terrain Masking & Diagnostic Elevation Adjustment</div>
              <div className="text-slate-300">CONTEXT EXTRACTION: Region (R), Lead Time (L), Synoptic Regime (θ), Recent 14-day Skill (S)</div>
              <div className="text-slate-500 pl-4">↓ Feature Vector into Contextual XGBoost Engine</div>
              <div className="text-emerald-400">VARSA ML ENGINE: Computes Optimal Normalized Weights: w_GFS + w_ECMWF + w_ICON = 1.0</div>
              <div className="text-slate-500 pl-4">↓ Dynamic Physical Blending</div>
              <div className="text-sky-300 font-bold">BLENDED FORECAST: F_VARSA(x, y, t) = Σ [w_m(R, L, θ) · F_m(x, y, t)]</div>
              <div className="text-slate-500 pl-4">↓ Automated Observational Verification</div>
              <div className="text-amber-300">OBSERVATIONAL FEEDBACK: AWS & Doppler Radar Skill Loop updates rolling error penalty</div>
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
                  Treats all models identically regardless of orography, lead time, or weather regime. If one model has a known 40% wet bias in the monsoon trough, the simple mean directly inherits that error.
                </p>
              </div>

              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded">
                <div className="font-semibold text-sky-950 mb-1">VARSA Adaptive Contextual Blending:</div>
                <div className="font-mono bg-white p-2 border border-sky-200 rounded text-sky-900 text-[11px] mb-2">
                  F_VARSA = Σ [ w_m(x, y, L, θ) · F_m ]
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Weights w_m are dynamically computed via gradient boosting loss minimization constrained to Σ w_m = 1. High-performing models in the specific meteorological regime receive higher weighting.
                </p>
              </div>
            </div>
          </div>

          {/* Why XGBoost for Contextual Weighting */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              3. The Machine Learning Engine (XGBoost Contextual Regressor)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In operational architecture, VARSA trains a multi-output gradient boosted tree ensemble (XGBoost) configured with a custom loss function designed to penalize absolute error and extreme false alarms:
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
              <li><strong>Terrain / Orographic Elevation Feature:</strong> Accounts for high-resolution barrier blocking along Western Ghats and Himalayan foothills where hydrostatic models fail.</li>
              <li><strong>Lead Time Decay Factor:</strong> At short range (T+24h to T+48h), mesoscale non-hydrostatic models (ICON) excel; at medium range (T+96h to T+120h), synoptic wave propagation (ECMWF IFS) takes precedence.</li>
              <li><strong>Physical Consistency Constraints:</strong> Ensures precipitation non-negativity and boundary layer temperature advection conservation.</li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Demonstration Scope (SIH 2026):</strong> This prototype visually and technically demonstrates the architectural concept and deterministic weighting mechanics. In this prototype, inference values and historical verification datasets are calibrated demonstration models representing South Asian climatology.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close System Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
