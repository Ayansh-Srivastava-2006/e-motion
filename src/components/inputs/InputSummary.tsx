import React from 'react';
import { CalculationResults } from '../../types/chassis';
import { Play } from 'lucide-react';

interface InputSummaryProps {
  results: CalculationResults;
  componentCount: number;
  onRunAnalysis: () => void;
  validationError?: string;
}

export const InputSummary: React.FC<InputSummaryProps> = ({
  results,
  componentCount,
  onRunAnalysis,
  validationError,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
        <h3 className="text-headline-sm font-mono text-on-surface border-b border-outline-variant/20 pb-3">
          Live Physics Summary
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between p-3 bg-surface-container rounded items-center">
            <span className="text-on-surface-variant">Active Load Elements</span>
            <span className="text-secondary-fixed font-bold text-sm">{componentCount} Elements</span>
          </div>

          <div className="flex justify-between p-3 bg-surface-container rounded items-center">
            <span className="text-on-surface-variant">Total Mass Sum</span>
            <span className="text-secondary-fixed font-bold text-sm">{results.totalMassKg.toFixed(1)} kg</span>
          </div>

          <div className="flex justify-between p-3 bg-surface-container rounded items-center">
            <span className="text-on-surface-variant">Total System Force</span>
            <span className="text-secondary-fixed font-bold text-sm">{(results.totalWeightN / 1000).toFixed(2)} kN</span>
          </div>

          <div className="flex justify-between p-3 bg-surface-container rounded items-center">
            <span className="text-on-surface-variant">Estimated CG X</span>
            <span className="text-secondary-fixed font-bold text-sm">{Math.round(results.cg.x)} mm</span>
          </div>

          <div className="flex justify-between p-3 bg-surface-container rounded items-center">
            <span className="text-on-surface-variant">Estimated CG Y</span>
            <span className="text-secondary-fixed font-bold text-sm">{Math.round(results.cg.y)} mm</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-3 text-center">
        <h3 className="text-headline-sm font-mono text-on-surface">Analysis Ready</h3>
        <p className="text-xs font-sans text-on-surface-variant">
          Input adjustments automatically re-evaluate the static load solver. Click below to view full 3D simulation telemetry.
        </p>

        {validationError && (
          <div className="p-3 bg-error-container text-on-error-container text-xs font-mono rounded border border-error/40 text-left">
            ⚠️ {validationError}
          </div>
        )}

        <button
          onClick={onRunAnalysis}
          className="w-full bg-secondary-container hover:brightness-110 text-on-secondary-container py-3 rounded font-mono font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" /> ▶ RUN ANALYSIS
        </button>
      </div>
    </div>
  );
};
