import { describe, it, expect } from 'vitest';
import { escapeCSV, generateChassisAnalysisCSV } from './csvExport';
import { solveChassisLoadDistribution } from '../physics/calculator';
import { ChassisParameters, ComponentLoad } from '../types/chassis';

describe('csvExport Utility', () => {
  it('correctly escapes values with commas, quotes, and newlines', () => {
    expect(escapeCSV('standard')).toBe('standard');
    expect(escapeCSV('Front, Axle')).toBe('"Front, Axle"');
    expect(escapeCSV('10" Rims')).toBe('"10"" Rims"');
    expect(escapeCSV('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    expect(escapeCSV(123.45)).toBe('123.45');
    expect(escapeCSV(null)).toBe('');
    expect(escapeCSV(undefined)).toBe('');
  });

  it('generates a full structured CSV engineering report with headers and calculations', () => {
    const chassis: ChassisParameters = {
      length: 4200,
      width: 1900,
      wheelbase: 2650,
      trackF: 1580,
      trackR: 1580,
      ohF: 850,
      ohR: 700,
    };

    const components: ComponentLoad[] = [
      { id: 'driver', name: 'Driver, Front', mass: 70, x: 850, y: 350 },
      { id: 'motor', name: 'Rear "Dual" Motor', mass: 45, x: 1550, y: -200 },
    ];

    const results = solveChassisLoadDistribution(chassis, components);
    const csv = generateChassisAnalysisCSV(chassis, components, results, '2026-10-13T00:00:00.000Z');

    expect(csv).toContain('E-MOTION EV CHASSIS LOAD DISTRIBUTION ANALYZER - ENGINEERING REPORT');
    expect(csv).toContain('CHASSIS GEOMETRY PARAMETERS');
    expect(csv).toContain('APPLIED COMPONENT LOAD MATRIX');
    expect(csv).toContain('"Driver, Front"');
    expect(csv).toContain('"Rear ""Dual"" Motor"');
    expect(csv).toContain('CALCULATED CENTER OF GRAVITY (CG)');
    expect(csv).toContain('AXLE LOAD REACTIONS & DISTRIBUTION');
    expect(csv).toContain('INDIVIDUAL WHEEL NORMAL REACTIONS');
    expect(csv).toContain('CORNER BALANCING & LATERAL ASYMMETRY');
    expect(csv).toContain('STATIC EQUILIBRIUM VERIFICATION');
    expect(csv).toContain('STATIC CAE SOLVER ASSUMPTIONS & LIMITATIONS');
    expect(csv).toContain('VERIFIED');
  });

  it('handles empty component matrix with zero mass gracefully', () => {
    const chassis: ChassisParameters = {
      length: 4000,
      width: 1800,
      wheelbase: 2500,
      trackF: 1500,
      trackR: 1500,
      ohF: 800,
      ohR: 700,
    };
    const components: ComponentLoad[] = [];
    const results = solveChassisLoadDistribution(chassis, components);
    const csv = generateChassisAnalysisCSV(chassis, components, results);

    expect(csv).toContain('Total Vehicle Mass,0.00,kg');
    expect(csv).toContain('Front Axle,0.00,0.000,0.00');
    expect(csv).toContain('TOTAL COMPONENTS,0.00,0.00,0.000');
  });

  it('flags warning state in CSV when load causes wheel lift', () => {
    const chassis: ChassisParameters = {
      length: 4200,
      width: 1900,
      wheelbase: 2650,
      trackF: 1580,
      trackR: 1580,
      ohF: 850,
      ohR: 700,
    };
    // Extreme overhang load causing front axle lift (negative load)
    const components: ComponentLoad[] = [
      { id: 'rear_ballast', name: 'Extreme Rear Overhang Load', mass: 1000, x: 3800, y: 0 },
    ];
    const results = solveChassisLoadDistribution(chassis, components);
    const csv = generateChassisAnalysisCSV(chassis, components, results);

    expect(csv).toContain('WARNING / UNBALANCED');
    expect(csv).toContain('wheel lift');
  });
});
