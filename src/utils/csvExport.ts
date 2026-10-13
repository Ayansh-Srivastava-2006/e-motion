import { ChassisParameters, ComponentLoad, CalculationResults } from '../types/chassis';

/**
 * Escapes a single CSV value according to RFC 4180 rules.
 */
export function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates structured, RFC 4180-compliant CSV content containing
 * project metadata, geometry, component matrices, and calculated load telemetry.
 */
export function generateChassisAnalysisCSV(
  chassis: ChassisParameters,
  components: ComponentLoad[],
  results: CalculationResults,
  timestamp: string = new Date().toISOString()
): string {
  const lines: string[] = [];

  // 1. PROJECT METADATA
  lines.push('E-MOTION EV CHASSIS LOAD DISTRIBUTION ANALYZER - ENGINEERING REPORT');
  lines.push(`Export Date,${escapeCSV(timestamp)}`);
  lines.push('Software Version,v2.4.1-CAE');
  lines.push('Solver Mode,Static 2D Rigid-Body Equilibrium');
  lines.push(`Equilibrium Status,${results.equilibrium.isValid ? 'VERIFIED' : 'WARNING / UNBALANCED'}`);
  lines.push('');

  // 2. CHASSIS PARAMETERS
  lines.push('CHASSIS GEOMETRY PARAMETERS');
  lines.push('Parameter,Value,Unit,Description');
  lines.push(`Overall Length,${escapeCSV(chassis.length)},mm,Front bumper to rear bumper span`);
  lines.push(`Overall Width,${escapeCSV(chassis.width)},mm,Extreme lateral body/chassis width`);
  lines.push(`Wheelbase (L),${escapeCSV(chassis.wheelbase)},mm,Front axle to rear axle longitudinal span`);
  lines.push(`Front Track Width (Wf),${escapeCSV(chassis.trackF)},mm,Lateral distance between front tire centerlines`);
  lines.push(`Rear Track Width (Wr),${escapeCSV(chassis.trackR)},mm,Lateral distance between rear tire centerlines`);
  lines.push(`Front Overhang (ohF),${escapeCSV(chassis.ohF)},mm,Front bumper to front axle centerline`);
  lines.push(`Rear Overhang (ohR),${escapeCSV(chassis.ohR)},mm,Rear axle to rear bumper centerline`);
  lines.push('');

  // 3. APPLIED COMPONENT LOADS
  lines.push('APPLIED COMPONENT LOAD MATRIX');
  lines.push('Component Name,Mass (kg),Weight (N),Weight (kN),X from Front Axle (mm),Y from Centerline (mm),Mass Share (%),Longitudinal Moment (kg*m),Lateral Moment (kg*m)');
  
  components.forEach((c) => {
    const weightN = c.mass * 9.81;
    const weightKn = weightN / 1000;
    const massSharePct = results.totalMassKg > 0 ? (c.mass / results.totalMassKg) * 100 : 0;
    const momentX = (c.mass * (c.x / 1000)).toFixed(3);
    const momentY = (c.mass * (c.y / 1000)).toFixed(3);

    lines.push([
      escapeCSV(c.name),
      escapeCSV(c.mass.toFixed(2)),
      escapeCSV(weightN.toFixed(2)),
      escapeCSV(weightKn.toFixed(3)),
      escapeCSV(c.x),
      escapeCSV(c.y),
      escapeCSV(massSharePct.toFixed(2)),
      escapeCSV(momentX),
      escapeCSV(momentY),
    ].join(','));
  });

  // Summary Row for Components
  lines.push([
    'TOTAL COMPONENTS',
    escapeCSV(results.totalMassKg.toFixed(2)),
    escapeCSV(results.totalWeightN.toFixed(2)),
    escapeCSV((results.totalWeightN / 1000).toFixed(3)),
    '-',
    '-',
    '100.00',
    escapeCSV((results.totalMassKg * (results.cg.x / 1000)).toFixed(3)),
    escapeCSV((results.totalMassKg * (results.cg.y / 1000)).toFixed(3)),
  ].join(','));
  lines.push('');

  // 4. CENTER OF GRAVITY (CG)
  lines.push('CALCULATED CENTER OF GRAVITY (CG)');
  lines.push('Metric,Value,Unit,Reference Datum');
  lines.push(`Total Vehicle Mass,${escapeCSV(results.totalMassKg.toFixed(2))},kg,Sum of applied static components`);
  lines.push(`Total Gravitational Weight,${escapeCSV(results.totalWeightN.toFixed(2))},N,M * 9.81 m/s^2`);
  lines.push(`Total Gravitational Weight,${escapeCSV((results.totalWeightN / 1000).toFixed(3))},kN,M * 9.81 / 1000`);
  lines.push(`Longitudinal CG (X),${escapeCSV(results.cg.x.toFixed(2))},mm,Relative to Front Axle (X=0)`);
  lines.push(`Lateral CG (Y),${escapeCSV(results.cg.y.toFixed(2))},mm,Relative to Chassis Centerline (Y=0, Left Positive)`);
  lines.push('');

  // 5. AXLE LOAD DISTRIBUTION
  lines.push('AXLE LOAD REACTIONS & DISTRIBUTION');
  lines.push('Axle,Reaction Force (N),Reaction Force (kN),Axle Weight Share (%)');
  lines.push(`Front Axle,${escapeCSV(results.axleReactions.frontForce.toFixed(2))},${escapeCSV((results.axleReactions.frontForce / 1000).toFixed(3))},${escapeCSV(results.axleReactions.frontPct.toFixed(2))}`);
  lines.push(`Rear Axle,${escapeCSV(results.axleReactions.rearForce.toFixed(2))},${escapeCSV((results.axleReactions.rearForce / 1000).toFixed(3))},${escapeCSV(results.axleReactions.rearPct.toFixed(2))}`);
  lines.push('');

  // 6. FOUR CORNER WHEEL NORMAL REACTIONS
  lines.push('INDIVIDUAL WHEEL NORMAL REACTIONS');
  lines.push('Wheel Position,Reaction Force (N),Reaction Force (kN),Total Weight Share (%)');
  lines.push(`Front-Left (FL),${escapeCSV(results.wheelLoads.fl.toFixed(2))},${escapeCSV((results.wheelLoads.fl / 1000).toFixed(3))},${escapeCSV(results.wheelLoads.flPct.toFixed(2))}`);
  lines.push(`Front-Right (FR),${escapeCSV(results.wheelLoads.fr.toFixed(2))},${escapeCSV((results.wheelLoads.fr / 1000).toFixed(3))},${escapeCSV(results.wheelLoads.frPct.toFixed(2))}`);
  lines.push(`Rear-Left (RL),${escapeCSV(results.wheelLoads.rl.toFixed(2))},${escapeCSV((results.wheelLoads.rl / 1000).toFixed(3))},${escapeCSV(results.wheelLoads.rlPct.toFixed(2))}`);
  lines.push(`Rear-Right (RR),${escapeCSV(results.wheelLoads.rr.toFixed(2))},${escapeCSV((results.wheelLoads.rr / 1000).toFixed(3))},${escapeCSV(results.wheelLoads.rrPct.toFixed(2))}`);
  lines.push('');

  // 7. CORNER BALANCE & LATERAL RATIOS
  const leftSideForce = results.wheelLoads.fl + results.wheelLoads.rl;
  const rightSideForce = results.wheelLoads.fr + results.wheelLoads.rr;
  const diag1Force = results.wheelLoads.fl + results.wheelLoads.rr; // Cross-weight 1
  const diag2Force = results.wheelLoads.fr + results.wheelLoads.rl; // Cross-weight 2
  const leftPct = results.totalWeightN > 0 ? (leftSideForce / results.totalWeightN) * 100 : 0;
  const rightPct = results.totalWeightN > 0 ? (rightSideForce / results.totalWeightN) * 100 : 0;
  const diag1Pct = results.totalWeightN > 0 ? (diag1Force / results.totalWeightN) * 100 : 0;

  lines.push('CORNER BALANCING & LATERAL ASYMMETRY');
  lines.push('Metric,Normal Force (N),Normal Force (kN),Share (%)');
  lines.push(`Left Track (FL + RL),${escapeCSV(leftSideForce.toFixed(2))},${escapeCSV((leftSideForce / 1000).toFixed(3))},${escapeCSV(leftPct.toFixed(2))}`);
  lines.push(`Right Track (FR + RR),${escapeCSV(rightSideForce.toFixed(2))},${escapeCSV((rightSideForce / 1000).toFixed(3))},${escapeCSV(rightPct.toFixed(2))}`);
  lines.push(`Diagonal Cross-Weight (FL + RR),${escapeCSV(diag1Force.toFixed(2))},${escapeCSV((diag1Force / 1000).toFixed(3))},${escapeCSV(diag1Pct.toFixed(2))}`);
  lines.push(`Diagonal Cross-Weight (FR + RL),${escapeCSV(diag2Force.toFixed(2))},${escapeCSV((diag2Force / 1000).toFixed(3))},${escapeCSV((100 - diag1Pct).toFixed(2))}`);
  lines.push('');

  // 8. EQUILIBRIUM VALIDATION
  lines.push('STATIC EQUILIBRIUM VERIFICATION');
  lines.push('Metric,Value,Unit');
  lines.push(`Total Applied Weight,${escapeCSV(results.equilibrium.totalWeightN.toFixed(2))},N`);
  lines.push(`Sum of Wheel Reactions,${escapeCSV(results.equilibrium.totalWheelReactionsN.toFixed(2))},N`);
  lines.push(`Residual Error Force,${escapeCSV(results.equilibrium.errorForceN.toFixed(4))},N`);
  lines.push(`Equilibrium Error Percentage,${escapeCSV(results.equilibrium.errorPct.toFixed(4))},%`);
  lines.push(`Equilibrium Status,${results.equilibrium.isValid ? 'VERIFIED (Sum Fz = 0, No Wheel Lift)' : 'FAILED'}`);
  if (results.equilibrium.warningMessage) {
    lines.push(`Warning Notice,${escapeCSV(results.equilibrium.warningMessage)},-`);
  }
  lines.push('');

  // 9. ENGINEERING ASSUMPTIONS & DISCLAIMER
  lines.push('STATIC CAE SOLVER ASSUMPTIONS & LIMITATIONS');
  lines.push('Assumption,Description');
  lines.push('Rigid Body Model,Chassis frame and subframe compliance are assumed infinitely rigid.');
  lines.push('1G Downward Gravity,Standard gravitational acceleration g = 9.81 m/s^2 acts along -Z.');
  lines.push('No Dynamic Load Transfer,Analysis applies purely to static vehicle conditions (no longitudinal acceleration, braking, or lateral cornering).');
  lines.push('No Suspension Compliance,Suspension springs and dampers are considered locked in nominal ride height.');
  lines.push('Scope Limitation,Static load distribution solver only; does not predict stress, strain, modal frequencies, or fatigue.');

  return lines.join('\r\n');
}

/**
 * Triggers a browser file download of the generated CSV string with UTF-8 BOM.
 */
export function downloadChassisAnalysisCSV(
  chassis: ChassisParameters,
  components: ComponentLoad[],
  results: CalculationResults,
  filename: string = 'emotion_ev_chassis_load_analysis.csv'
): void {
  const csvContent = generateChassisAnalysisCSV(chassis, components, results);
  // Prepend UTF-8 BOM for Microsoft Excel / Numbers compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
