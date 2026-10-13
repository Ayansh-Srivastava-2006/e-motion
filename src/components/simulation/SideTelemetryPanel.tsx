import React from 'react';
import { ComponentLoad, CalculationResults } from '../../types/chassis';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface SideTelemetryPanelProps {
  results: CalculationResults;
  components: ComponentLoad[];
  onUpdateMass: (id: string, mass: number) => void;
}

export const SideTelemetryPanel: React.FC<SideTelemetryPanelProps> = ({
  results,
  components,
  onUpdateMass,
}) => {
  const { axleReactions, wheelLoads, equilibrium, cg } = results;

  const frontWeightKn = (axleReactions.frontForce / 1000).toFixed(2);
  const rearWeightKn = (axleReactions.rearForce / 1000).toFixed(2);
  const totalWeightKn = (results.totalWeightN / 1000).toFixed(2);
  const totalReactionsKn = (equilibrium.totalWheelReactionsN / 1000).toFixed(2);

  return (
    <div className="h-full bg-surface-container-low rounded-xl p-5 flex flex-col justify-between shadow-xl border border-outline-variant/30 gap-5 font-mono text-xs overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <span className="text-sm font-bold text-on-surface">Load &amp; CG Analysis</span>
          <span className="text-[11px] font-bold text-secondary-fixed bg-surface-container-high px-2.5 py-1 rounded">
            LIVE SOLVER
          </span>
        </div>

        {/* CG Coordinates Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container p-3 rounded-lg">
            <div className="text-[10px] text-on-surface-variant">CG POSITION X</div>
            <div className="text-base font-bold text-secondary-fixed mt-1">
              {Math.round(cg.x)} mm
            </div>
          </div>
          <div className="bg-surface-container p-3 rounded-lg">
            <div className="text-[10px] text-on-surface-variant">CG POSITION Y</div>
            <div className="text-base font-bold text-secondary-fixed mt-1">
              {Math.round(cg.y)} mm
            </div>
          </div>
        </div>

        {/* Axle Load Distribution Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-on-surface">Front Axle Load</span>
              <span className="text-secondary-fixed font-bold">
                {axleReactions.frontPct.toFixed(1)}% ({frontWeightKn} kN)
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
              <div
                className="bg-secondary-container h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, axleReactions.frontPct))}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-on-surface">Rear Axle Load</span>
              <span className="text-tertiary font-bold">
                {axleReactions.rearPct.toFixed(1)}% ({rearWeightKn} kN)
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
              <div
                className="bg-tertiary h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, axleReactions.rearPct))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 4 Wheel Loads Readout Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container p-2.5 rounded flex justify-between items-center">
            <span className="text-on-surface-variant">FL Wheel</span>
            <span className="text-secondary font-bold">{(wheelLoads.fl / 1000).toFixed(2)} kN</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded flex justify-between items-center">
            <span className="text-on-surface-variant">FR Wheel</span>
            <span className="text-secondary font-bold">{(wheelLoads.fr / 1000).toFixed(2)} kN</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded flex justify-between items-center">
            <span className="text-on-surface-variant">RL Wheel</span>
            <span className="text-secondary font-bold">{(wheelLoads.rl / 1000).toFixed(2)} kN</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded flex justify-between items-center">
            <span className="text-on-surface-variant">RR Wheel</span>
            <span className="text-secondary font-bold">{(wheelLoads.rr / 1000).toFixed(2)} kN</span>
          </div>
        </div>

        {/* Force Equilibrium Verification Diagnostic Card */}
        <div className="bg-surface-container p-3 rounded.lg border border-outline-variant/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Applied Weight</span>
            <span className="text-secondary-fixed font-bold">{totalWeightKn} kN</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Wheel Reactions</span>
            <span className="text-secondary-fixed font-bold">{totalReactionsKn} kN</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Equilibrium Error</span>
            <span className="text-secondary-fixed font-bold">{equilibrium.errorPct.toFixed(2)}%</span>
          </div>
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-on-surface-variant">Status</span>
            {equilibrium.isValid ? (
              <span className="text-secondary-fixed font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-secondary-fixed" /> EQUILIBRIUM VERIFIED
              </span>
            ) : (
              <span className="text-error font-bold flex items-center gap-1 text-[10px]">
                <AlertTriangle className="w-4 h-4 text-error" /> WHEEL LIFT WARNING
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Component Mass Adjuster List */}
      <div className="border-t border-outline-variant/30 pt-4 space-y-3">
        <div className="text-xs font-bold text-on-surface flex items-center justify-between">
          <span>Component Mass &amp; Pos</span>
          <span className="text-on-surface-variant font-normal">{components.length} Active Elements</span>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {components.map((comp) => (
            <div
              key={comp.id}
              className="bg-surface-container p-2.5 rounded flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-on-surface font-semibold truncate text-[11px]">{comp.name}</div>
                <div className="text-on-surface-variant text-[10px]">
                  X: {comp.x}mm | Y: {comp.y}mm
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] text-on-surface-variant">Mass (kg)</span>
                <input
                  type="number"
                  value={comp.mass}
                  onChange={(e) => onUpdateMass(comp.id, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-surface-container-highest text-secondary-fixed text-right px-1.5 py-0.5 rounded text-xs border border-outline-variant/50 focus:border-secondary-fixed outline-none font-bold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
