import React, { useEffect, useState } from 'react';
import { PIPELINE_STEPS, RegionInfo, VariableInfo, LeadTimeInfo, WeatherRegimeInfo } from '../data/varsaData';
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';

interface BlendPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  region: RegionInfo;
  variable: VariableInfo;
  leadTime: LeadTimeInfo;
  regime: WeatherRegimeInfo;
}

export const BlendPipelineModal: React.FC<BlendPipelineModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  region,
  variable,
  leadTime,
  regime
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsFinished(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const runStep = (stepIdx: number) => {
      if (stepIdx >= PIPELINE_STEPS.length) {
        setIsFinished(true);
        timeoutId = setTimeout(() => {
          onComplete();
        }, 1400);
        return;
      }

      setCurrentStepIndex(stepIdx);
      const step = PIPELINE_STEPS[stepIdx];
      timeoutId = setTimeout(() => {
        runStep(stepIdx + 1);
      }, step.durationMs);
    };

    runStep(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">VARSA COMPUTATIONAL BLEND PIPELINE</h3>
              <p className="text-[11px] font-mono text-slate-300">
                {region.name} · {variable.name} · {leadTime.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
            title="Close Pipeline Execution"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pipeline Execution Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-2.5">
            {PIPELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex || isFinished;
              const isCurrent = index === currentStepIndex && !isFinished;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-2.5 rounded transition-all duration-200 ${
                    isCurrent
                      ? 'bg-sky-50/70 border border-sky-200 text-sky-950'
                      : isCompleted
                      ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                      : 'opacity-40 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                        {step.stepNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {step.stepNumber} <span className="font-sans font-semibold text-slate-900">{step.label}</span>
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {step.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Scientific Processing Progress</span>
              <span>{Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / PIPELINE_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / PIPELINE_STEPS.length) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>REGIME: {regime.name}</span>
          <span>LAT: {region.lat}°N | LON: {region.lon}°E</span>
        </div>
      </div>
    </div>
  );
};
