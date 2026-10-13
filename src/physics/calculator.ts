import {
  ComponentLoad,
  ChassisParameters,
  CalculationResults,
  CenterOfGravity,
  AxleReactions,
  WheelLoads,
  EquilibriumValidation,
  StaticAssumptions
} from '../types/chassis';

export const GRAVITY_ACCELERATION = 9.81; // m/s²

export const DEFAULT_STATIC_ASSUMPTIONS: StaticAssumptions = {
  rigidChassis: true,
  staticEquilibrium: true,
  gravityAcceleration: GRAVITY_ACCELERATION,
  noAcceleration: true,
  noBraking: true,
  noCornering: true,
  noAero: true,
  noSuspensionCompliance: true,
  noTireDeformation: true,
  noDynamicTransfer: true,
};

/**
 * Calculates total mass in kilograms.
 */
export function calculateTotalMass(components: ComponentLoad[]): number {
  return components.reduce((sum, comp) => sum + (comp.mass || 0), 0);
}

/**
 * Calculates total weight in Newtons (W = M * g).
 */
export function calculateTotalWeight(totalMassKg: number): number {
  return totalMassKg * GRAVITY_ACCELERATION;
}

/**
 * Calculates 2D Center of Gravity (CGx, CGy) in mm.
 * X is relative to Front Axle centerline (0 = Front Axle, positive rearward).
 * Y is relative to Chassis Centerline (0 = Centerline, positive leftward).
 */
export function calculateCenterOfGravity(components: ComponentLoad[], totalMassKg: number): CenterOfGravity {
  if (totalMassKg <= 0 || components.length === 0) {
    return { x: 0, y: 0 };
  }

  const sumMx = components.reduce((sum, comp) => sum + comp.mass * comp.x, 0);
  const sumMy = components.reduce((sum, comp) => sum + comp.mass * comp.y, 0);

  return {
    x: sumMx / totalMassKg,
    y: sumMy / totalMassKg,
  };
}

/**
 * Calculates front and rear axle reactions in Newtons and percentages based on longitudinal CGx.
 */
export function calculateAxleReactions(
  wheelbase: number,
  totalWeightN: number,
  cgX: number
): AxleReactions {
  if (wheelbase <= 0 || totalWeightN <= 0) {
    return { frontForce: 0, rearForce: 0, frontPct: 0, rearPct: 0 };
  }

  // Moment equilibrium about Rear Axle (X = L):
  // R_front * L = W * (L - CGx) => R_front = W * (L - CGx) / L
  const frontForce = (totalWeightN * (wheelbase - cgX)) / wheelbase;

  // Moment equilibrium about Front Axle (X = 0):
  // R_rear * L = W * CGx => R_rear = W * CGx / L
  const rearForce = (totalWeightN * cgX) / wheelbase;

  const frontPct = (frontForce / totalWeightN) * 100;
  const rearPct = (rearForce / totalWeightN) * 100;

  return {
    frontForce,
    rearForce,
    frontPct,
    rearPct,
  };
}

/**
 * Calculates 4 individual wheel reaction loads in Newtons and percentages,
 * incorporating lateral CGy offset relative to track widths.
 */
export function calculateWheelLoads(
  trackF: number,
  trackR: number,
  axleReactions: AxleReactions,
  cgY: number,
  totalWeightN: number
): WheelLoads {
  if (totalWeightN <= 0) {
    return {
      fl: 0, fr: 0, rl: 0, rr: 0,
      flPct: 0, frPct: 0, rlPct: 0, rrPct: 0
    };
  }

  const { frontForce, rearForce } = axleReactions;

  // Lateral distribution:
  // Left wheel (+) gets half axle force + (axleForce * CGy / track)
  // Right wheel (-) gets half axle force - (axleForce * CGy / track)
  const fl = trackF > 0 ? (frontForce / 2) + (frontForce * cgY / trackF) : frontForce / 2;
  const fr = trackF > 0 ? (frontForce / 2) - (frontForce * cgY / trackF) : frontForce / 2;

  const rl = trackR > 0 ? (rearForce / 2) + (rearForce * cgY / trackR) : rearForce / 2;
  const rr = trackR > 0 ? (rearForce / 2) - (rearForce * cgY / trackR) : rearForce / 2;

  const flPct = (fl / totalWeightN) * 100;
  const frPct = (fr / totalWeightN) * 100;
  const rlPct = (rl / totalWeightN) * 100;
  const rrPct = (rr / totalWeightN) * 100;

  return {
    fl,
    fr,
    rl,
    rr,
    flPct,
    frPct,
    rlPct,
    rrPct
  };
}

/**
 * Validates force equilibrium and flags wheel lift / tipping warnings.
 */
export function validateEquilibrium(
  totalWeightN: number,
  wheelLoads: WheelLoads
): EquilibriumValidation {
  const totalWheelReactionsN = wheelLoads.fl + wheelLoads.fr + wheelLoads.rl + wheelLoads.rr;
  const errorForceN = Math.abs(totalWheelReactionsN - totalWeightN);
  const errorPct = totalWeightN > 0 ? (errorForceN / totalWeightN) * 100 : 0;

  const hasNegativeWheelLoad =
    wheelLoads.fl < -0.001 ||
    wheelLoads.fr < -0.001 ||
    wheelLoads.rl < -0.001 ||
    wheelLoads.rr < -0.001;

  let warningMessage: string | undefined = undefined;

  if (hasNegativeWheelLoad) {
    warningMessage = 'Warning: Static load distribution causes wheel lift (negative wheel reaction force). Vehicle is unstable under current load configuration.';
  } else if (errorPct > 0.01) {
    warningMessage = `Warning: Force equilibrium imbalance detected (${errorPct.toFixed(3)}% error).`;
  }

  const isValid = errorPct <= 0.01 && !hasNegativeWheelLoad;

  return {
    isValid,
    totalWeightN,
    totalWheelReactionsN,
    errorForceN,
    errorPct,
    warningMessage,
  };
}

/**
 * Master solver function taking chassis params and component matrix,
 * returning complete, strongly typed calculation results.
 */
export function solveChassisLoadDistribution(
  chassis: ChassisParameters,
  components: ComponentLoad[]
): CalculationResults {
  const totalMassKg = calculateTotalMass(components);
  const totalWeightN = calculateTotalWeight(totalMassKg);
  const cg = calculateCenterOfGravity(components, totalMassKg);
  const axleReactions = calculateAxleReactions(chassis.wheelbase, totalWeightN, cg.x);
  const wheelLoads = calculateWheelLoads(chassis.trackF, chassis.trackR, axleReactions, cg.y, totalWeightN);
  const equilibrium = validateEquilibrium(totalWeightN, wheelLoads);

  return {
    totalMassKg,
    totalWeightN,
    cg,
    axleReactions,
    wheelLoads,
    equilibrium,
  };
}
