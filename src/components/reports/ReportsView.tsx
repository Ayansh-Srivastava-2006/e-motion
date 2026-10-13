import React, { useState } from 'react';
import { ChassisParameters, ComponentLoad, CalculationResults } from '../../types/chassis';
import { downloadChassisAnalysisCSV } from '../../utils/csvExport';
import {
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Play,
  LineChart,
} from 'lucide-react';

interface ReportsViewProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  results: CalculationResults;
  onNavigateToInputs: () => void;
  onNavigateToSimulation: () => void;
  onNavigateToAnalysis: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  chassis,
  components,
  results,
  onNavigateToInputs,
  onNavigateToSimulation,
  onNavigateToAnalysis,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const { totalMassKg, totalWeightN, cg, axleReactions, wheelLoads, equilibrium } = results;
  const totalWeightKn = totalWeightN / 1000;
  const frontForceKn = axleReactions.frontForce / 1000;
  const rearForceKn = axleReactions.rearForce / 1000;

  const flKn = wheelLoads.fl / 1000;
  const frKn = wheelLoads.fr / 1000;
  const rlKn = wheelLoads.rl / 1000;
  const rrKn = wheelLoads.rr / 1000;

  const leftSideKn = flKn + rlKn;
  const rightSideKn = frKn + rrKn;
  const leftPct = totalWeightKn > 0 ? (leftSideKn / totalWeightKn) * 100 : 0;
  const rightPct = totalWeightKn > 0 ? (rightSideKn / totalWeightKn) * 100 : 0;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleExportCSV = () => {
    try {
      const filename = `emotion_ev_chassis_report_${Date.now()}.csv`;
      downloadChassisAnalysisCSV(chassis, components, results, filename);
      setDownloadSuccess('CSV Export generated and downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono">
      {/* ======================================================== */}
      {/* 1. TOP EXPORT CONTROLS (HIDDEN DURING PRINT)             */}
      {/* ======================================================== */}
      <div className="print:hidden flex flex-col xl:flex-row xl:items-center justify-between bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-on-surface">CAE Engineering Report &amp; Documentation</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary-container/20 text-secondary-fixed border border-secondary-container/40">
              OFFICIAL CAE EXPORT
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-sans mt-1">
            Export complete vehicle load telemetry via CSV data file or generate a printable/PDF formal engineering report.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={onNavigateToInputs}
            title="Return to Project Inputs"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg border border-outline-variant/30 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Inputs
          </button>
          <button
            onClick={onNavigateToSimulation}
            title="Open 3D Simulation View"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg border border-outline-variant/30 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> 3D View
          </button>
          <button
            onClick={onNavigateToAnalysis}
            title="Open Detailed Analysis View"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg border border-outline-variant/30 transition-colors cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5" /> Analysis
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-highest hover:bg-surface-bright text-secondary-fixed font-bold rounded-lg border border-outline-variant/40 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary-container text-on-secondary-container hover:brightness-110 font-bold rounded-lg transition-all cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Success Feedback Banner */}
      {downloadSuccess && (
        <div className="print:hidden bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between text-emerald-400 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-on-surface-variant hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Warning Banner if Results Invalid */}
      {!equilibrium.isValid && (
        <div className="bg-error-container/40 border border-error/50 p-4 rounded-xl flex items-start gap-3 text-error text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Caution: Equilibrium Imbalance / Wheel Lift Detected</div>
            <div className="font-sans mt-0.5">
              {equilibrium.warningMessage || 'Load results cannot be verified under current component configuration.'}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FORMAL CAE ENGINEERING REPORT DOCUMENT CONTAINER       */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low print:bg-white print:text-black p-8 md:p-12 rounded-xl border border-outline-variant/30 print:border-none shadow-2xl space-y-8 text-on-surface print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-outline-variant/40 print:border-black pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-secondary-fixed print:text-gray-600 font-bold">
              E-MOTION AUTOMOTIVE ENGINEERING
            </div>
            <h2 className="text-2xl font-bold text-white print:text-black mt-1">
              EV Chassis Load Distribution Analysis Report
            </h2>
            <div className="text-xs text-on-surface-variant print:text-gray-600 mt-1 font-sans">
              Static Newtonian Weight &amp; Reaction Solver • Vehicle Configuration: <strong className="text-on-surface print:text-black font-mono">EV Chassis</strong>
            </div>
          </div>

          <div className="text-right text-xs text-on-surface-variant print:text-gray-700 space-y-1">
            <div><strong>Date:</strong> {currentDate}</div>
            <div><strong>Time:</strong> {currentTime}</div>
            <div><strong>Report ID:</strong> EM-CAE-{chassis.wheelbase}-{totalMassKg > 0 ? Math.round(totalMassKg) : '00'}</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-fixed print:text-black border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
            1. Executive Summary &amp; Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-surface-container print:bg-gray-100 p-3.5 rounded-lg border border-outline-variant/20 print:border-gray-300">
              <div className="text-on-surface-variant print:text-gray-600 text-[10px]">TOTAL MASS</div>
              <div className="text-lg font-bold text-white print:text-black mt-1">{totalMassKg.toFixed(1)} kg</div>
              <div className="text-[10px] text-secondary-fixed print:text-gray-700">{totalWeightKn.toFixed(3)} kN</div>
            </div>

            <div className="bg-surface-container print:bg-gray-100 p-3.5 rounded-lg border border-outline-variant/20 print:border-gray-300">
              <div className="text-on-surface-variant print:text-gray-600 text-[10px]">CENTER OF GRAVITY</div>
              <div className="text-lg font-bold text-white print:text-black mt-1">X: {Math.round(cg.x)} mm</div>
              <div className="text-[10px] text-secondary-fixed print:text-gray-700">Y: {cg.y >= 0 ? `+${Math.round(cg.y)}` : Math.round(cg.y)} mm</div>
            </div>

            <div className="bg-surface-container print:bg-gray-100 p-3.5 rounded-lg border border-outline-variant/20 print:border-gray-300">
              <div className="text-on-surface-variant print:text-gray-600 text-[10px]">AXLE DISTRIBUTION</div>
              <div className="text-lg font-bold text-white print:text-black mt-1">
                {axleReactions.frontPct.toFixed(1)}% / {axleReactions.rearPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-secondary-fixed print:text-gray-700">{frontForceKn.toFixed(2)} kN F / {rearForceKn.toFixed(2)} kN R</div>
            </div>

            <div className="bg-surface-container print:bg-gray-100 p-3.5 rounded-lg border border-outline-variant/20 print:border-gray-300">
              <div className="text-on-surface-variant print:text-gray-600 text-[10px]">EQUILIBRIUM STATUS</div>
              <div className={`text-base font-bold mt-1 ${equilibrium.isValid ? 'text-emerald-400 print:text-green-800' : 'text-error print:text-red-800'}`}>
                {equilibrium.isValid ? 'VERIFIED (ΣF=0)' : 'UNVERIFIED'}
              </div>
              <div className="text-[10px] text-on-surface-variant print:text-gray-600">Error: {equilibrium.errorPct.toFixed(4)}%</div>
            </div>
          </div>
        </div>

        {/* 2. Chassis Parameters Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-fixed print:text-black border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
            2. Chassis Geometry Specifications
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container print:bg-gray-100 text-on-surface-variant print:text-black border-b border-outline-variant/20 print:border-gray-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Parameter</th>
                  <th className="py-2 px-3 font-semibold text-right">Value</th>
                  <th className="py-2 px-3 font-semibold">Unit</th>
                  <th className="py-2 px-3 font-semibold font-sans">Engineering Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 print:divide-gray-200">
                <tr>
                  <td className="py-2 px-3 font-semibold">Overall Length</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.length}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Total bumper-to-bumper vehicle longitudinal envelope</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Overall Width</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.width}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Extreme lateral body / EV chassis envelope</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Wheelbase (L)</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.wheelbase}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Front axle centerline (X=0) to rear axle centerline (X=L)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Front Track Width (Wf)</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.trackF}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Lateral distance between front wheel contact patch centerlines</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Rear Track Width (Wr)</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.trackR}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Lateral distance between rear wheel contact patch centerlines</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Front Overhang (ohF)</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.ohF}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Front bumper beam forward of front axle centerline</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Rear Overhang (ohR)</td>
                  <td className="py-2 px-3 text-right font-mono">{chassis.ohR}</td>
                  <td className="py-2 px-3">mm</td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant print:text-gray-600">Rear bumper beam rearward of rear axle centerline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Applied Component Load Matrix Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-fixed print:text-black border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
            3. Applied Component Loads &amp; Mass Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container print:bg-gray-100 text-on-surface-variant print:text-black border-b border-outline-variant/20 print:border-gray-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Component</th>
                  <th className="py-2 px-3 font-semibold text-right">Mass (kg)</th>
                  <th className="py-2 px-3 font-semibold text-right">Weight (N)</th>
                  <th className="py-2 px-3 font-semibold text-right">X from Front Axle (mm)</th>
                  <th className="py-2 px-3 font-semibold text-right">Y from Centerline (mm)</th>
                  <th className="py-2 px-3 font-semibold text-right">Mass Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 print:divide-gray-200">
                {components.map((c) => {
                  const weightN = c.mass * 9.81;
                  const massPct = totalMassKg > 0 ? (c.mass / totalMassKg) * 100 : 0;
                  return (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-semibold">{c.name}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.mass.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-mono">{Math.round(weightN)}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.x}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.y >= 0 ? `+${c.y}` : c.y}</td>
                      <td className="py-2 px-3 text-right font-mono">{massPct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-surface-container/80 print:bg-gray-100 border-t-2 border-outline-variant/40 print:border-black font-bold">
                <tr>
                  <td className="py-2.5 px-3">TOTAL</td>
                  <td className="py-2.5 px-3 text-right font-mono">{totalMassKg.toFixed(1)} kg</td>
                  <td className="py-2.5 px-3 text-right font-mono">{Math.round(totalWeightN)} N</td>
                  <td className="py-2.5 px-3 text-right font-mono">CG_x: {Math.round(cg.x)} mm</td>
                  <td className="py-2.5 px-3 text-right font-mono">CG_y: {Math.round(cg.y)} mm</td>
                  <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Axle Reactions & 4-Corner Wheel Reactions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-fixed print:text-black border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
            4. Calculated Static Normal Reactions &amp; Corner Balancing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Axle Reactions */}
            <div className="bg-surface-container print:bg-gray-50 p-4 rounded-lg border border-outline-variant/20 print:border-gray-300 space-y-2 text-xs">
              <div className="font-bold border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
                Axle Reactions &amp; Longitudinal Distribution
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span>Front Axle Force:</span>
                <span className="font-mono font-bold">{frontForceKn.toFixed(3)} kN ({axleReactions.frontPct.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span>Rear Axle Force:</span>
                <span className="font-mono font-bold">{rearForceKn.toFixed(3)} kN ({axleReactions.rearPct.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface-variant print:text-gray-600 text-[11px]">
                <span>Longitudinal CG Ratio:</span>
                <span className="font-mono">{((cg.x / chassis.wheelbase) * 100).toFixed(1)}% of Wheelbase</span>
              </div>
            </div>

            {/* Individual Wheel Reactions */}
            <div className="bg-surface-container print:bg-gray-50 p-4 rounded-lg border border-outline-variant/20 print:border-gray-300 space-y-2 text-xs">
              <div className="font-bold border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
                4-Corner Wheel Normal Reaction Forces
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-high print:bg-white p-2 rounded">
                  <span className="text-on-surface-variant print:text-gray-600">FL:</span>{' '}
                  <strong className="font-mono">{flKn.toFixed(2)} kN</strong> ({wheelLoads.flPct.toFixed(1)}%)
                </div>
                <div className="bg-surface-container-high print:bg-white p-2 rounded">
                  <span className="text-on-surface-variant print:text-gray-600">FR:</span>{' '}
                  <strong className="font-mono">{frKn.toFixed(2)} kN</strong> ({wheelLoads.frPct.toFixed(1)}%)
                </div>
                <div className="bg-surface-container-high print:bg-white p-2 rounded">
                  <span className="text-on-surface-variant print:text-gray-600">RL:</span>{' '}
                  <strong className="font-mono">{rlKn.toFixed(2)} kN</strong> ({wheelLoads.rlPct.toFixed(1)}%)
                </div>
                <div className="bg-surface-container-high print:bg-white p-2 rounded">
                  <span className="text-on-surface-variant print:text-gray-600">RR:</span>{' '}
                  <strong className="font-mono">{rrKn.toFixed(2)} kN</strong> ({wheelLoads.rrPct.toFixed(1)}%)
                </div>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-on-surface-variant print:text-gray-600">
                <span>Lateral Track Split:</span>
                <span className="font-mono">Left: {leftPct.toFixed(1)}% | Right: {rightPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Static Assumptions and Methodological Limitations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-fixed print:text-black border-b border-outline-variant/20 print:border-gray-300 pb-1.5">
            5. Methodological Scope &amp; Engineering Assumptions
          </h3>
          <div className="bg-surface-container print:bg-gray-50 p-4 rounded-lg border border-outline-variant/20 print:border-gray-300 text-xs font-sans text-on-surface-variant print:text-gray-700 space-y-2 leading-relaxed">
            <p>
              <strong>1. Static Equilibrium Formulation:</strong> Calculations are performed under pure Newtonian 2D static equilibrium (ΣFz = 0, ΣMx = 0, ΣMy = 0) under standard gravitational acceleration of g = 9.81 m/s².
            </p>
            <p>
              <strong>2. Rigid-Body Chassis Assumption:</strong> The EV chassis frame rails, battery housing, and crossmembers are idealized as infinitely rigid structural bodies with zero elastic flexure or torsional deflection.
            </p>
            <p>
              <strong>3. Excluded Dynamic Effects:</strong> This model excludes dynamic longitudinal load transfer occurring under acceleration/braking, lateral load transfer during cornering roll, aerodynamic downforce, suspension spring kinematic compliance, and non-linear tire deformation.
            </p>
          </div>
        </div>

        {/* 6. Document Sign-off and Verification Block */}
        <div className="pt-6 border-t-2 border-outline-variant/30 print:border-black grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-4">
            <div className="text-on-surface-variant print:text-gray-600">PREPARED BY:</div>
            <div className="border-b border-outline-variant/40 print:border-gray-400 pb-1 font-bold">
              CAE Analysis Engineer
            </div>
            <div className="text-[10px] text-on-surface-variant print:text-gray-600">E-MOTION Project Team Alpha</div>
          </div>

          <div className="space-y-4">
            <div className="text-on-surface-variant print:text-gray-600">REVIEWED BY:</div>
            <div className="border-b border-outline-variant/40 print:border-gray-400 pb-1 font-bold">
              Engineering Faculty Evaluator
            </div>
            <div className="text-[10px] text-on-surface-variant print:text-gray-600">Department of Mechanical Engineering</div>
          </div>

          <div className="space-y-4">
            <div className="text-on-surface-variant print:text-gray-600">ANALYSIS VERIFICATION:</div>
            <div className={`border-b pb-1 font-bold ${equilibrium.isValid ? 'text-emerald-400 print:text-green-800 border-emerald-500/40' : 'text-error print:text-red-800 border-error/40'}`}>
              {equilibrium.isValid ? 'STATUS: VERIFIED & COMPLIANT' : 'STATUS: UNVERIFIED / WARNING'}
            </div>
            <div className="text-[10px] text-on-surface-variant print:text-gray-600">
              Residual Error: {equilibrium.errorPct.toFixed(4)}% | Datum: Front Axle (X=0)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
