import { describe, it, expect } from 'vitest';
import {
  solveChassisLoadDistribution,
  calculateCenterOfGravity,
  calculateAxleReactions,
  calculateWheelLoads,
  GRAVITY_ACCELERATION
} from './calculator';
import { ChassisParameters, ComponentLoad } from '../types/chassis';

const defaultChassis: ChassisParameters = {
  length: 4200,
  width: 1900,
  wheelbase: 2650,
  trackF: 1580,
  trackR: 1580,
  ohF: 850,
  ohR: 700
};

describe('Physics Calculation Engine - EV Chassis Load Distribution', () => {

  // 1. Single centered load
  it('Case 1: Single centered load at exact midpoint (L/2, 0)', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Center Mass', mass: 100, x: 1325, y: 0 } // 1325 is 2650/2
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.totalMassKg).toBe(100);
    expect(results.totalWeightN).toBeCloseTo(981, 4);
    expect(results.cg.x).toBeCloseTo(1325, 4);
    expect(results.cg.y).toBeCloseTo(0, 4);

    // Front/Rear split should be 50% / 50%
    expect(results.axleReactions.frontForce).toBeCloseTo(490.5, 4);
    expect(results.axleReactions.rearForce).toBeCloseTo(490.5, 4);
    expect(results.axleReactions.frontPct).toBeCloseTo(50, 4);
    expect(results.axleReactions.rearPct).toBeCloseTo(50, 4);

    // All 4 wheels equal (25% each)
    expect(results.wheelLoads.fl).toBeCloseTo(245.25, 4);
    expect(results.wheelLoads.fr).toBeCloseTo(245.25, 4);
    expect(results.wheelLoads.rl).toBeCloseTo(245.25, 4);
    expect(results.wheelLoads.rr).toBeCloseTo(245.25, 4);

    expect(results.equilibrium.isValid).toBe(true);
  });

  // 2. Symmetric front/rear loads
  it('Case 2: Symmetric front and rear equal loads', () => {
    const components: ComponentLoad[] = [
      { id: 'f', name: 'Front Mass', mass: 50, x: 0, y: 0 },
      { id: 'r', name: 'Rear Mass', mass: 50, x: 2650, y: 0 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.totalMassKg).toBe(100);
    expect(results.cg.x).toBeCloseTo(1325, 4);
    expect(results.cg.y).toBeCloseTo(0, 4);
    expect(results.axleReactions.frontForce).toBeCloseTo(490.5, 4);
    expect(results.axleReactions.rearForce).toBeCloseTo(490.5, 4);
    expect(results.equilibrium.isValid).toBe(true);
  });

  // 3. Rear-heavy load
  it('Case 3: Rear-heavy load (75% mass at rear axle)', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Rear Motor', mass: 75, x: 2650, y: 0 },
      { id: '2', name: 'Front Electronics', mass: 25, x: 0, y: 0 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.totalMassKg).toBe(100);
    expect(results.cg.x).toBeCloseTo(1987.5, 4); // 75% of 2650
    expect(results.axleReactions.frontPct).toBeCloseTo(25, 4);
    expect(results.axleReactions.rearPct).toBeCloseTo(75, 4);
    expect(results.wheelLoads.fl).toBeCloseTo(122.625, 4);
    expect(results.wheelLoads.rl).toBeCloseTo(367.875, 4);
    expect(results.equilibrium.isValid).toBe(true);
  });

  // 4. Front-heavy load
  it('Case 4: Front-heavy load (80% mass at front axle)', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Heavy Front Motor', mass: 80, x: 0, y: 0 },
      { id: '2', name: 'Rear Gear', mass: 20, x: 2650, y: 0 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.cg.x).toBeCloseTo(530, 4); // 20% of 2650
    expect(results.axleReactions.frontPct).toBeCloseTo(80, 4);
    expect(results.axleReactions.rearPct).toBeCloseTo(20, 4);
  });

  // 5. Left-offset load
  it('Case 5: Left-offset load (Y = +395 mm, half track width)', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Driver Left', mass: 100, x: 1325, y: 395 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.cg.y).toBeCloseTo(395, 4);
    // Track width is 1580. Y = +395 is +395/1580 = +25% shift towards left.
    // Left wheels should carry 75% of axle load, right wheels 25%.
    expect(results.wheelLoads.flPct).toBeCloseTo(37.5, 4);
    expect(results.wheelLoads.frPct).toBeCloseTo(12.5, 4);
    expect(results.wheelLoads.rlPct).toBeCloseTo(37.5, 4);
    expect(results.wheelLoads.rrPct).toBeCloseTo(12.5, 4);
  });

  // 6. Right-offset load
  it('Case 6: Right-offset load (Y = -395 mm)', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Passenger Right', mass: 100, x: 1325, y: -395 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.cg.y).toBeCloseTo(-395, 4);
    expect(results.wheelLoads.flPct).toBeCloseTo(12.5, 4);
    expect(results.wheelLoads.frPct).toBeCloseTo(37.5, 4);
    expect(results.wheelLoads.rlPct).toBeCloseTo(12.5, 4);
    expect(results.wheelLoads.rrPct).toBeCloseTo(37.5, 4);
  });

  // 7. Multiple asymmetric loads
  it('Case 7: Multiple asymmetric loads across X and Y', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Driver', mass: 70, x: 850, y: 350 },
      { id: '2', name: 'Rear Motor', mass: 45, x: 1550, y: -200 },
      { id: '3', name: 'Inverter', mass: 15, x: 500, y: 100 }
    ];

    const totalMass = 70 + 45 + 15; // 130 kg
    const totalWeight = totalMass * GRAVITY_ACCELERATION; // 1275.3 N
    const expectedCgx = (70 * 850 + 45 * 1550 + 15 * 500) / 130; // 1051.923 mm
    const expectedCgy = (70 * 350 + 45 * (-200) + 15 * 100) / 130; // 130.769 mm

    const results = solveChassisLoadDistribution(defaultChassis, components);

    expect(results.totalMassKg).toBe(130);
    expect(results.totalWeightN).toBeCloseTo(totalWeight, 4);
    expect(results.cg.x).toBeCloseTo(expectedCgx, 4);
    expect(results.cg.y).toBeCloseTo(expectedCgy, 4);
    expect(results.equilibrium.isValid).toBe(true);
  });

  // 8. CG calculation unit function
  it('Case 8: Direct test of calculateCenterOfGravity', () => {
    const components: ComponentLoad[] = [
      { id: 'a', name: 'A', mass: 10, x: 100, y: 200 },
      { id: 'b', name: 'B', mass: 30, x: 300, y: -100 }
    ];
    const cg = calculateCenterOfGravity(components, 40);
    expect(cg.x).toBe((10 * 100 + 30 * 300) / 40); // (1000 + 9000)/40 = 250
    expect(cg.y).toBe((10 * 200 + 30 * (-100)) / 40); // (2000 - 3000)/40 = -25
  });

  // 9. Axle reactions unit function
  it('Case 9: Direct test of calculateAxleReactions', () => {
    const L = 2000;
    const W = 10000;
    const cgX = 500; // 25% from front
    const reactions = calculateAxleReactions(L, W, cgX);

    expect(reactions.frontForce).toBe(7500); // 75%
    expect(reactions.rearForce).toBe(2500);  // 25%
    expect(reactions.frontPct + reactions.rearPct).toBe(100);
  });

  // 10. Wheel reactions unit function
  it('Case 10: Direct test of calculateWheelLoads', () => {
    const axle = { frontForce: 6000, rearForce: 4000, frontPct: 60, rearPct: 40 };
    const trackF = 1500;
    const trackR = 1500;
    const cgY = 0; // centerline
    const W = 10000;

    const wheels = calculateWheelLoads(trackF, trackR, axle, cgY, W);

    expect(wheels.fl).toBe(3000);
    expect(wheels.fr).toBe(3000);
    expect(wheels.rl).toBe(2000);
    expect(wheels.rr).toBe(2000);
  });

  // 11. Force equilibrium validation (FL + FR + RL + RR = W)
  it('Case 11: Exact Force Equilibrium FL + FR + RL + RR = Total Weight', () => {
    const components: ComponentLoad[] = [
      { id: '1', name: 'Load 1', mass: 82.5, x: 1200, y: 310 },
      { id: '2', name: 'Load 2', mass: 43.1, x: 2100, y: -180 },
      { id: '3', name: 'Load 3', mass: 64.4, x: 450, y: 90 }
    ];
    const results = solveChassisLoadDistribution(defaultChassis, components);

    const wheelSum = results.wheelLoads.fl + results.wheelLoads.fr + results.wheelLoads.rl + results.wheelLoads.rr;
    const frontSum = results.wheelLoads.fl + results.wheelLoads.fr;
    const rearSum = results.wheelLoads.rl + results.wheelLoads.rr;

    expect(wheelSum).toBeCloseTo(results.totalWeightN, 4);
    expect(frontSum).toBeCloseTo(results.axleReactions.frontForce, 4);
    expect(rearSum).toBeCloseTo(results.axleReactions.rearForce, 4);
    expect(results.equilibrium.errorPct).toBeLessThan(0.0001);
    expect(results.equilibrium.isValid).toBe(true);
  });

  // 12. Invalid inputs / tipping warning
  it('Case 12: Invalid input handling (zero mass & extreme offset causing wheel lift)', () => {
    // Zero mass case
    const emptyResults = solveChassisLoadDistribution(defaultChassis, []);
    expect(emptyResults.totalMassKg).toBe(0);
    expect(emptyResults.totalWeightN).toBe(0);
    expect(emptyResults.axleReactions.frontForce).toBe(0);

    // Extreme lateral offset causing tipping (Y offset > half track width)
    const extremeOffset: ComponentLoad[] = [
      { id: '1', name: 'Extreme Outboard Load', mass: 100, x: 1325, y: 1000 } // track is 1580, half track is 790
    ];
    const tippingResults = solveChassisLoadDistribution(defaultChassis, extremeOffset);

    // FR & RR wheel loads will be negative because load is way beyond left wheels
    expect(tippingResults.wheelLoads.fr).toBeLessThan(0);
    expect(tippingResults.wheelLoads.rr).toBeLessThan(0);
    expect(tippingResults.equilibrium.isValid).toBe(false);
    expect(tippingResults.equilibrium.warningMessage).toContain('wheel lift');
  });

});
