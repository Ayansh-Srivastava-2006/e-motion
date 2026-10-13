export interface ComponentLoad {
  id: string;
  name: string;
  mass: number; // in kg
  x: number;    // X coordinate in mm (relative to Front Axle centerline, X=0)
  y: number;    // Y coordinate in mm (relative to Chassis Centerline, Y=0)
  color?: string;
}

export interface ChassisParameters {
  length: number;    // Overall Length in mm (e.g. 4200)
  width: number;     // Overall Width in mm (e.g. 1900)
  wheelbase: number; // Wheelbase L in mm (e.g. 2650)
  trackF: number;    // Front Track Wf in mm (e.g. 1580)
  trackR: number;    // Rear Track Wr in mm (e.g. 1580)
  ohF: number;       // Front Overhang in mm (e.g. 850)
  ohR: number;       // Rear Overhang in mm (e.g. 700)
}

export interface AxleReactions {
  frontForce: number;      // Front axle reaction force in N
  rearForce: number;       // Rear axle reaction force in N
  frontPct: number;        // Front axle weight percentage (%)
  rearPct: number;         // Rear axle weight percentage (%)
}

export interface WheelLoads {
  fl: number;              // Front-Left wheel load in N
  fr: number;              // Front-Right wheel load in N
  rl: number;              // Rear-Left wheel load in N
  rr: number;              // Rear-Right wheel load in N
  flPct: number;           // FL load percentage (%)
  frPct: number;           // FR load percentage (%)
  rlPct: number;           // RL load percentage (%)
  rrPct: number;           // RR load percentage (%)
}

export interface CenterOfGravity {
  x: number;               // Longitudinal CG in mm (from Front Axle)
  y: number;               // Lateral CG in mm (from Centerline)
}

export interface EquilibriumValidation {
  isValid: boolean;
  totalWeightN: number;
  totalWheelReactionsN: number;
  errorForceN: number;
  errorPct: number;
  warningMessage?: string;
}

export interface CalculationResults {
  totalMassKg: number;
  totalWeightN: number;
  cg: CenterOfGravity;
  axleReactions: AxleReactions;
  wheelLoads: WheelLoads;
  equilibrium: EquilibriumValidation;
}

export interface StaticAssumptions {
  rigidChassis: boolean;
  staticEquilibrium: boolean;
  gravityAcceleration: number; // 9.81 m/s²
  noAcceleration: boolean;
  noBraking: boolean;
  noCornering: boolean;
  noAero: boolean;
  noSuspensionCompliance: boolean;
  noTireDeformation: boolean;
  noDynamicTransfer: boolean;
}
