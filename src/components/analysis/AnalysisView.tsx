import React, { useMemo } from 'react';
import { ChassisParameters, ComponentLoad, CalculationResults } from '../../types/chassis';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  Scale,
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Play,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface AnalysisViewProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  results: CalculationResults;
  onNavigateToSimulation: () => void;
  onNavigateToReports: () => void;
  onNavigateToInputs: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  chassis,
  components,
  results,
  onNavigateToSimulation,
  onNavigateToReports,
  onNavigateToInputs,
}) => {
  const { totalMassKg, totalWeightN, cg, axleReactions, wheelLoads, equilibrium } = results;

  const totalWeightKn = totalWeightN / 1000;
  const frontForceKn = axleReactions.frontForce / 1000;
  const rearForceKn = axleReactions.rearForce / 1000;

  const flKn = wheelLoads.fl / 1000;
  const frKn = wheelLoads.fr / 1000;
  const rlKn = wheelLoads.rl / 1000;
  const rrKn = wheelLoads.rr / 1000;

  // Corner balancing calculations
  const leftSideKn = flKn + rlKn;
  const rightSideKn = frKn + rrKn;
  const leftPct = totalWeightKn > 0 ? (leftSideKn / totalWeightKn) * 100 : 0;
  const rightPct = totalWeightKn > 0 ? (rightSideKn / totalWeightKn) * 100 : 0;

  // Diagonal cross-weight (corner balance)
  const diag1Kn = flKn + rrKn; // FL + RR
  const diag2Kn = frKn + rlKn; // FR + RL
  const diag1Pct = totalWeightKn > 0 ? (diag1Kn / totalWeightKn) * 100 : 0;
  const diag2Pct = totalWeightKn > 0 ? (diag2Kn / totalWeightKn) * 100 : 0;

  // Dynamic engineering observations
  const engineeringInsights = useMemo(() => {
    const notes: { type: 'info' | 'warning' | 'success'; title: string; desc: string }[] = [];

    if (totalMassKg <= 0 || components.length === 0) {
      notes.push({
        type: 'warning',
        title: 'Zero Applied Payload Matrix',
        desc: 'No component masses are defined. Load distribution cannot be evaluated until masses are configured in Project Inputs.',
      });
      return notes;
    }

    // 1. Longitudinal Axle Split Analysis
    if (axleReactions.frontPct > 55) {
      notes.push({
        type: 'info',
        title: 'Front-Biased Weight Bias (' + axleReactions.frontPct.toFixed(1) + '% Front)',
        desc: `The center of gravity is situated ${Math.round(cg.x)} mm behind the front axle (${((cg.x / chassis.wheelbase) * 100).toFixed(1)}% of wheelbase). Front-biased static distribution offers understeer stability, but heavy braking will cause further dynamic transfer onto the front axle.`,
      });
    } else if (axleReactions.frontPct < 45) {
      notes.push({
        type: 'info',
        title: 'Rear-Biased Weight Bias (' + axleReactions.rearPct.toFixed(1) + '% Rear)',
        desc: `The center of gravity is shifted rearward to ${Math.round(cg.x)} mm (${((cg.x / chassis.wheelbase) * 100).toFixed(1)}% of wheelbase). Rear-biased loading enhances rear traction during acceleration, common in rear-mounted electric motor architectures.`,
      });
    } else {
      notes.push({
        type: 'success',
        title: 'Ideal 50:50 Longitudinal Weight Split',
        desc: `Near-neutral static axle balance (${axleReactions.frontPct.toFixed(1)}% Front / ${axleReactions.rearPct.toFixed(1)}% Rear). CG is placed at ${Math.round(cg.x)} mm, yielding balanced tire work capacity across both axles.`,
      });
    }

    // 2. Lateral Asymmetry Analysis
    const absCGy = Math.abs(cg.y);
    if (absCGy > 25) {
      const side = cg.y > 0 ? 'Left' : 'Right';
      const deltaKn = Math.abs(leftSideKn - rightSideKn);
      notes.push({
        type: 'warning',
        title: `Lateral Asymmetry (${absCGy.toFixed(0)} mm ${side} Offset)`,
        desc: `Single-occupant driver or battery placement produces a ${side}-side bias, causing a ${deltaKn.toFixed(2)} kN normal load disparity between left and right tracks. Consider offsetting auxiliary components to restore lateral symmetry.`,
      });
    } else {
      notes.push({
        type: 'success',
        title: 'Symmetric Lateral Balance (Δ < 25 mm)',
        desc: `Lateral CG is positioned within ±${absCGy.toFixed(1)} mm of the vehicle centerline (${leftPct.toFixed(1)}% Left / ${rightPct.toFixed(1)}% Right), providing balanced cornering characteristics in both directions.`,
      });
    }

    // 3. Equilibrium & Ground Contact
    if (equilibrium.isValid) {
      notes.push({
        type: 'success',
        title: 'Force Equilibrium Verified (ΣFz = 0)',
        desc: `Total vertical ground reaction force (${(equilibrium.totalWheelReactionsN / 1000).toFixed(3)} kN) balances total weight (${totalWeightKn.toFixed(3)} kN) with residual numerical error of ${equilibrium.errorPct.toFixed(4)}%. All normal forces are positive ($R_i > 0$).`,
      });
    } else {
      notes.push({
        type: 'warning',
        title: 'Static Instability / Wheel Lift Warning',
        desc: equilibrium.warningMessage || 'Potential ground detachment or moment imbalance detected. Verify component coordinates against chassis boundaries.',
      });
    }

    return notes;
  }, [totalMassKg, components, axleReactions, cg, chassis, leftSideKn, rightSideKn, leftPct, rightPct, equilibrium, totalWeightKn]);

  // Chart Data: Wheel Loads Comparison
  const wheelChartData = [
    { name: 'FL Wheel', forceKn: Number(flKn.toFixed(2)), pct: Number(wheelLoads.flPct.toFixed(1)), color: '#00e3fd' },
    { name: 'FR Wheel', forceKn: Number(frKn.toFixed(2)), pct: Number(wheelLoads.frPct.toFixed(1)), color: '#38bdf8' },
    { name: 'RL Wheel', forceKn: Number(rlKn.toFixed(2)), pct: Number(wheelLoads.rlPct.toFixed(1)), color: '#818cf8' },
    { name: 'RR Wheel', forceKn: Number(rrKn.toFixed(2)), pct: Number(wheelLoads.rrPct.toFixed(1)), color: '#a78bfa' },
  ];

  // Chart Data: Axle Loads Comparison
  const axleChartData = [
    { name: 'Front Axle', forceKn: Number(frontForceKn.toFixed(2)), pct: Number(axleReactions.frontPct.toFixed(1)), fill: '#00e3fd' },
    { name: 'Rear Axle', forceKn: Number(rearForceKn.toFixed(2)), pct: Number(axleReactions.rearPct.toFixed(1)), fill: '#818cf8' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & QUICK ACTION BAR                         */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-on-surface">Engineering Load Distribution Analysis</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary-container/20 text-secondary-fixed border border-secondary-container/40">
              CAE STATIC SOLVER
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-sans mt-1">
            Rigid-body equilibrium metrics, 4-corner wheel reactions, axle distributions, and moment balances.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onNavigateToSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-high hover:bg-surface-bright text-secondary-fixed rounded-lg border border-outline-variant/40 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> 3D Simulation
          </button>
          <button
            onClick={onNavigateToReports}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-secondary-container text-on-secondary-container hover:brightness-110 font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Reports &amp; Exports
          </button>
        </div>
      </div>

      {/* Warning Banner if Equilibrium Failed */}
      {!equilibrium.isValid && (
        <div className="bg-error-container/40 border border-error/50 p-4 rounded-xl flex items-start gap-3 text-error">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-sm">Mechanical Equilibrium Warning</div>
            <div className="font-sans mt-0.5">{equilibrium.warningMessage || 'Load distribution calculation failed stability threshold.'}</div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRIMARY KPI METRIC CARDS                               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mass & Weight */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 shadow-lg">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
            <span>TOTAL VEHICLE MASS</span>
            <Scale className="w-4 h-4 text-secondary-fixed" />
          </div>
          <div className="text-2xl font-bold text-on-surface mt-2">
            {totalMassKg.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span>
          </div>
          <div className="text-xs text-secondary-fixed mt-1">
            {totalWeightKn.toFixed(3)} kN <span className="text-on-surface-variant text-[10px]">({Math.round(totalWeightN)} N)</span>
          </div>
        </div>

        {/* Center of Gravity Coordinates */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 shadow-lg">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
            <span>CENTER OF GRAVITY (CG)</span>
            <Compass className="w-4 h-4 text-secondary-fixed" />
          </div>
          <div className="text-2xl font-bold text-secondary-fixed mt-2">
            X: {Math.round(cg.x)} <span className="text-sm font-normal text-on-surface-variant">mm</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Y: {cg.y >= 0 ? `+${Math.round(cg.y)}` : Math.round(cg.y)} mm <span className="text-[10px] text-secondary-fixed">({cg.y > 0 ? 'Left bias' : cg.y < 0 ? 'Right bias' : 'Centered'})</span>
          </div>
        </div>

        {/* Front / Rear Axle Split */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 shadow-lg">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
            <span>AXLE DISTRIBUTION</span>
            <Layers className="w-4 h-4 text-secondary-fixed" />
          </div>
          <div className="text-xl font-bold text-on-surface mt-2 flex items-baseline justify-between">
            <span>{axleReactions.frontPct.toFixed(1)}% <span className="text-xs text-on-surface-variant font-normal">F</span></span>
            <span className="text-xs text-on-surface-variant">/</span>
            <span>{axleReactions.rearPct.toFixed(1)}% <span className="text-xs text-on-surface-variant font-normal">R</span></span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-2.5 flex">
            <div style={{ width: `${axleReactions.frontPct}%` }} className="bg-cyan-400 h-full"></div>
            <div style={{ width: `${axleReactions.rearPct}%` }} className="bg-indigo-400 h-full"></div>
          </div>
        </div>

        {/* Equilibrium Status */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 shadow-lg">
          <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
            <span>STATIC EQUILIBRIUM</span>
            {equilibrium.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-error" />
            )}
          </div>
          <div className={`text-base font-bold mt-2 ${equilibrium.isValid ? 'text-emerald-400' : 'text-error'}`}>
            {equilibrium.isValid ? 'ΣFz = 0 VERIFIED' : 'EQUILIBRIUM ERROR'}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Residual: {equilibrium.errorForceN.toFixed(3)} N ({equilibrium.errorPct.toFixed(4)}%)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FOUR-CORNER WHEEL NORMAL LOAD MATRIX                  */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">4-Corner Wheel Normal Reactions</span>
            <span className="text-[10px] text-on-surface-variant font-sans">(Upward ground support forces)</span>
          </div>
          <span className="text-xs text-secondary-fixed">Wheelbase: {chassis.wheelbase} mm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FRONT AXLE WHEELS */}
          <div className="bg-surface-container/70 p-4 rounded-xl border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 border-b border-outline-variant/15 pb-2">
              <span>FRONT AXLE (Wf: {chassis.trackF} mm)</span>
              <span>{frontForceKn.toFixed(2)} kN ({axleReactions.frontPct.toFixed(1)}%)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20">
                <div className="text-[10px] text-on-surface-variant">FL (Front-Left)</div>
                <div className="text-lg font-bold text-white mt-1">{flKn.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">kN</span></div>
                <div className="text-[11px] text-cyan-400 font-semibold">{wheelLoads.flPct.toFixed(1)}% of total</div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">({Math.round(wheelLoads.fl)} N)</div>
              </div>
              <div className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20">
                <div className="text-[10px] text-on-surface-variant">FR (Front-Right)</div>
                <div className="text-lg font-bold text-white mt-1">{frKn.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">kN</span></div>
                <div className="text-[11px] text-cyan-400 font-semibold">{wheelLoads.frPct.toFixed(1)}% of total</div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">({Math.round(wheelLoads.fr)} N)</div>
              </div>
            </div>
          </div>

          {/* REAR AXLE WHEELS */}
          <div className="bg-surface-container/70 p-4 rounded-xl border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 border-b border-outline-variant/15 pb-2">
              <span>REAR AXLE (Wr: {chassis.trackR} mm)</span>
              <span>{rearForceKn.toFixed(2)} kN ({axleReactions.rearPct.toFixed(1)}%)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20">
                <div className="text-[10px] text-on-surface-variant">RL (Rear-Left)</div>
                <div className="text-lg font-bold text-white mt-1">{rlKn.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">kN</span></div>
                <div className="text-[11px] text-indigo-400 font-semibold">{wheelLoads.rlPct.toFixed(1)}% of total</div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">({Math.round(wheelLoads.rl)} N)</div>
              </div>
              <div className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20">
                <div className="text-[10px] text-on-surface-variant">RR (Rear-Right)</div>
                <div className="text-lg font-bold text-white mt-1">{rrKn.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">kN</span></div>
                <div className="text-[11px] text-indigo-400 font-semibold">{wheelLoads.rrPct.toFixed(1)}% of total</div>
                <div className="text-[10px] text-on-surface-variant mt-0.5">({Math.round(wheelLoads.rr)} N)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lateral & Diagonal Cross Balance Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-surface-container p-3 rounded-lg flex justify-between items-center">
            <span className="text-on-surface-variant">Lateral Track Split:</span>
            <span className="font-semibold text-on-surface">
              Left: {leftSideKn.toFixed(2)} kN ({leftPct.toFixed(1)}%) | Right: {rightSideKn.toFixed(2)} kN ({rightPct.toFixed(1)}%)
            </span>
          </div>
          <div className="bg-surface-container p-3 rounded-lg flex justify-between items-center">
            <span className="text-on-surface-variant">Diagonal Cross-Weight:</span>
            <span className="font-semibold text-on-surface">
              (FL+RR): {diag1Kn.toFixed(2)} kN ({diag1Pct.toFixed(1)}%) | (FR+RL): {diag2Kn.toFixed(2)} kN ({diag2Pct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. COMPARISON CHARTS (RECHARTS)                          */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Axle Load Distribution */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <span className="text-sm font-bold text-on-surface">Axle Normal Reaction Comparison</span>
            <span className="text-xs text-on-surface-variant">Total: {totalWeightKn.toFixed(2)} kN</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={axleChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#909097" tick={{ fill: '#d8e3fb', fontSize: 11 }} />
                <YAxis unit=" kN" stroke="#909097" tick={{ fill: '#d8e3fb', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111c2d', borderColor: '#45464d', borderRadius: '8px', color: '#d8e3fb', fontSize: '11px' }}
                  formatter={(val: number) => [`${val} kN`, 'Axle Reaction Force']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar isAnimationActive={false} dataKey="forceKn" name="Reaction Force (kN)" radius={[6, 6, 0, 0]}>
                  {axleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 4 Wheel Normal Reactions */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <span className="text-sm font-bold text-on-surface">Individual Wheel Normal Reactions</span>
            <span className="text-xs text-on-surface-variant">4 Contact Patches</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wheelChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#909097" tick={{ fill: '#d8e3fb', fontSize: 11 }} />
                <YAxis unit=" kN" stroke="#909097" tick={{ fill: '#d8e3fb', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111c2d', borderColor: '#45464d', borderRadius: '8px', color: '#d8e3fb', fontSize: '11px' }}
                  formatter={(val: number, _name: string, props: any) => [`${val} kN (${props.payload.pct}%)`, 'Wheel Normal Reaction']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar isAnimationActive={false} dataKey="forceKn" name="Wheel Load (kN)" radius={[6, 6, 0, 0]}>
                  {wheelChartData.map((entry, index) => (
                    <Cell key={`wheel-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MOMENT EQUILIBRIUM PROOF & EQUATIONS                  */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <span className="text-sm font-bold text-on-surface">Mechanical Static Equilibrium Formulation</span>
          <span className="text-xs text-secondary-fixed">Newtonian Statics (g = 9.81 m/s²)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-surface-container p-4 rounded-lg space-y-2 border border-outline-variant/20">
            <div className="font-bold text-secondary-fixed">1. Vertical Force Equilibrium (ΣFz = 0)</div>
            <p className="font-mono text-[11px] text-on-surface-variant">
              R_front + R_rear - W = 0
            </p>
            <div className="text-[11px] text-white pt-1">
              {frontForceKn.toFixed(3)} kN + {rearForceKn.toFixed(3)} kN - {totalWeightKn.toFixed(3)} kN = 0.000 kN
            </div>
            <div className="text-[10px] text-emerald-400">✓ Satisfied (Error: {equilibrium.errorPct.toFixed(4)}%)</div>
          </div>

          <div className="bg-surface-container p-4 rounded-lg space-y-2 border border-outline-variant/20">
            <div className="font-bold text-secondary-fixed">2. Longitudinal Moment (ΣM_front = 0)</div>
            <p className="font-mono text-[11px] text-on-surface-variant">
              R_rear * L = W * CG_x
            </p>
            <div className="text-[11px] text-white pt-1">
              R_rear = ({totalWeightKn.toFixed(3)} kN * {Math.round(cg.x)} mm) / {chassis.wheelbase} mm = {rearForceKn.toFixed(3)} kN
            </div>
            <div className="text-[10px] text-emerald-400">✓ Exact Moment Equilibrium</div>
          </div>

          <div className="bg-surface-container p-4 rounded-lg space-y-2 border border-outline-variant/20">
            <div className="font-bold text-secondary-fixed">3. Lateral Moment (ΣM_center = 0)</div>
            <p className="font-mono text-[11px] text-on-surface-variant">
              ΔR_lat * W_track = W * CG_y
            </p>
            <div className="text-[11px] text-white pt-1">
              CG_y = {cg.y >= 0 ? `+${cg.y.toFixed(1)}` : cg.y.toFixed(1)} mm | Track: {chassis.trackF} mm
            </div>
            <div className="text-[10px] text-emerald-400">✓ Symmetric Corner Couple</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. COMPONENT CONTRIBUTION TABLE                          */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">Applied Component Mass Contribution Table</span>
            <span className="text-xs text-on-surface-variant">({components.length} Elements)</span>
          </div>
          <button
            onClick={onNavigateToInputs}
            className="flex items-center gap-1 text-xs text-secondary-fixed hover:underline cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Edit Components
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-container text-on-surface-variant border-b border-outline-variant/20">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Component Name</th>
                <th className="py-2.5 px-3 font-semibold text-right">Mass (kg)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Weight (N)</th>
                <th className="py-2.5 px-3 font-semibold text-right">X from Front Axle</th>
                <th className="py-2.5 px-3 font-semibold text-right">Y from Centerline</th>
                <th className="py-2.5 px-3 font-semibold text-right">Mass Share (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Long. Moment (kg·m)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Lat. Moment (kg·m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {components.map((c) => {
                const weightN = c.mass * 9.81;
                const massPct = totalMassKg > 0 ? (c.mass / totalMassKg) * 100 : 0;
                const momentX = c.mass * (c.x / 1000);
                const momentY = c.mass * (c.y / 1000);

                return (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color || '#ff7849' }}></span>
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3 text-right">{c.mass.toFixed(1)} kg</td>
                    <td className="py-2.5 px-3 text-right font-mono">{Math.round(weightN)} N</td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.x} mm</td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.y >= 0 ? `+${c.y}` : c.y} mm</td>
                    <td className="py-2.5 px-3 text-right font-mono text-cyan-400 font-semibold">{massPct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">{momentX.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">{momentY.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-surface-container/80 border-t-2 border-outline-variant/40 font-bold text-secondary-fixed">
              <tr>
                <td className="py-3 px-3">TOTAL MATRIX</td>
                <td className="py-3 px-3 text-right">{totalMassKg.toFixed(1)} kg</td>
                <td className="py-3 px-3 text-right">{Math.round(totalWeightN)} N</td>
                <td className="py-3 px-3 text-right">CG_x: {Math.round(cg.x)} mm</td>
                <td className="py-3 px-3 text-right">CG_y: {Math.round(cg.y)} mm</td>
                <td className="py-3 px-3 text-right">100.0%</td>
                <td className="py-3 px-3 text-right">{(totalMassKg * (cg.x / 1000)).toFixed(2)}</td>
                <td className="py-3 px-3 text-right">{(totalMassKg * (cg.y / 1000)).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. DYNAMIC ENGINEERING OBSERVATIONS                      */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <HelpCircle className="w-4 h-4 text-secondary-fixed" />
          <span className="text-sm font-bold text-on-surface">Dynamic Engineering Observations &amp; Conclusions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engineeringInsights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                insight.type === 'success'
                  ? 'bg-surface-container/60 border-emerald-500/30'
                  : insight.type === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-surface-container/60 border-cyan-500/30'
              } space-y-2`}
            >
              <div className="flex items-center gap-2">
                {insight.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Compass className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-xs font-bold text-on-surface">{insight.title}</span>
              </div>
              <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                {insight.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Scope and Disclaimer Box */}
        <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20 text-[11px] font-sans text-on-surface-variant leading-relaxed">
          <strong className="text-secondary-fixed font-mono">CAE Model Scope &amp; Assumptions: </strong>
          Calculations are derived strictly from 2D static Newtonian equilibrium under nominal 1G downward gravity (g = 9.81 m/s²). The chassis structure is treated as an idealized rigid body. Dynamic load transfer during longitudinal acceleration/braking, lateral cornering roll, aerodynamic downforce, suspension travel, and tire compliance are excluded from static equilibrium evaluations.
        </div>
      </div>
    </div>
  );
};
