import { ChassisParameters, ComponentLoad } from '../types/chassis';

export interface ChassisValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export function validateChassisParameters(chassis: ChassisParameters): ChassisValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!chassis.length || chassis.length <= 0) {
    errors.length = 'Overall length must be greater than 0 mm.';
  }

  if (!chassis.width || chassis.width <= 0) {
    errors.width = 'Overall width must be greater than 0 mm.';
  }

  if (!chassis.wheelbase || chassis.wheelbase <= 0) {
    errors.wheelbase = 'Wheelbase must be greater than 0 mm.';
  } else if (chassis.length && chassis.wheelbase > chassis.length) {
    errors.wheelbase = 'Wheelbase cannot exceed overall chassis length.';
  }

  if (!chassis.trackF || chassis.trackF <= 0) {
    errors.trackF = 'Front track width must be greater than 0 mm.';
  } else if (chassis.width && chassis.trackF > chassis.width) {
    errors.trackF = 'Front track width cannot exceed overall chassis width.';
  }

  if (!chassis.trackR || chassis.trackR <= 0) {
    errors.trackR = 'Rear track width must be greater than 0 mm.';
  } else if (chassis.width && chassis.trackR > chassis.width) {
    errors.trackR = 'Rear track width cannot exceed overall chassis width.';
  }

  if (chassis.ohF < 0) {
    errors.ohF = 'Front overhang cannot be negative.';
  }

  if (chassis.ohR < 0) {
    errors.ohR = 'Rear overhang cannot be negative.';
  }

  if (chassis.length && chassis.wheelbase && chassis.ohF >= 0 && chassis.ohR >= 0) {
    const sumSpan = chassis.ohF + chassis.wheelbase + chassis.ohR;
    if (sumSpan > chassis.length) {
      warnings.push(`Front overhang (${chassis.ohF}mm) + Wheelbase (${chassis.wheelbase}mm) + Rear overhang (${chassis.ohR}mm) = ${sumSpan}mm, which exceeds overall length (${chassis.length}mm).`);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

export function validateComponentMatrix(components: ComponentLoad[]): { isValid: boolean; error?: string } {
  if (!components || components.length === 0) {
    return { isValid: false, error: 'At least one component load element is required for analysis.' };
  }

  const hasNegativeMass = components.some(c => c.mass < 0);
  if (hasNegativeMass) {
    return { isValid: false, error: 'Component masses cannot be negative.' };
  }

  const totalMass = components.reduce((sum, c) => sum + c.mass, 0);
  if (totalMass <= 0) {
    return { isValid: false, error: 'Total system mass must be greater than 0 kg.' };
  }

  return { isValid: true };
}
