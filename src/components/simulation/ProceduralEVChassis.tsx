import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChassisParameters } from '../../types/chassis';

interface ProceduralEVChassisProps {
  chassis: ChassisParameters;
  showDimensions?: boolean;
}

// Helical Coil Spring Component
const HelicalSpring: React.FC<{
  turns?: number;
  height?: number;
  radius?: number;
  wireRadius?: number;
  color?: string;
}> = ({
  turns = 6,
  height = 0.26,
  radius = 0.044,
  wireRadius = 0.008,
  color = '#ef4444',
}) => {
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = turns * 20;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * turns * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          t * height - height / 2,
          Math.sin(angle) * radius
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, [turns, height, radius]);

  return (
    <group>
      {/* 3D Helical Coil Spring (Restrained Red Accent) */}
      <mesh>
        <tubeGeometry args={[curve, 80, wireRadius, 8, false]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Polished Chrome Damper Piston Shaft */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, height * 1.3, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.05} />
      </mesh>
      {/* Top Shock Mount Eyelet */}
      <mesh position={[0, height * 0.65, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.035, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Bottom Shock Mount Eyelet */}
      <mesh position={[0, -height * 0.65, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.035, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.88} roughness={0.22} />
      </mesh>
    </group>
  );
};

export const ProceduralEVChassis: React.FC<ProceduralEVChassisProps> = ({ chassis }) => {
  // Convert mm to meters (1 Three.js unit = 1 meter)
  const L = (chassis.wheelbase || 2650) / 1000;
  const Wf = (chassis.trackF || 1580) / 1000;
  const Wr = (chassis.trackR || 1580) / 1000;
  const totalLength = (chassis.length || 4200) / 1000;
  const totalWidth = (chassis.width || 1900) / 1000;
  const ohF = (chassis.ohF || 850) / 1000;
  const ohR = (chassis.ohR || 700) / 1000;

  // Frame Z bounds: Front bumper at -ohF, Rear bumper at L + ohR
  const zFrontBumper = -ohF;
  const zRearBumper = L + ohR;
  const zCenter = (zFrontBumper + zRearBumper) / 2;
  const frameY = 0.22; // Frame elevation off ground

  // Wheel & Tire dimensions
  const tireRadius = 0.35; // 350 mm radius
  const tireWidth = 0.24;  // 240 mm width
  const rimRadius = 0.22;  // 220 mm rim radius

  // Skateboard Battery tray dimensions
  const batteryWidth = Math.max(0.7, totalWidth * 0.58);
  const batteryLength = Math.max(1.2, L * 0.72);
  const batteryZCenter = L / 2;

  // Frame rail width spacing
  const railSpacingX = Math.max(0.65, totalWidth * 0.48);

  // ==========================================================
  // PHASE 4.2 AUTOMOTIVE ENGINEERING METALLIC GREY & SILVER PALETTE
  // ==========================================================

  // 1. Main chassis frame and rails: satin metallic medium grey (#94A3B8)
  const frameMaterialProps = useMemo(() => ({
    color: '#94a3b8',
    metalness: 0.85,
    roughness: 0.28,
  }), []);

  // 2. Crossmembers and structural tubes: slightly lighter steel grey (#A8B4C4)
  const crossmemberProps = useMemo(() => ({
    color: '#a8b4c4',
    metalness: 0.86,
    roughness: 0.26,
  }), []);

  // 3. Central battery tray/platform: brushed aluminium silver (#CBD5E1)
  const batteryPlateProps = useMemo(() => ({
    color: '#cbd5e1',
    metalness: 0.82,
    roughness: 0.25,
  }), []);

  // Top cover plate: light brushed aluminium (#D6DEE7)
  const batteryCoverProps = useMemo(() => ({
    color: '#d6dee7',
    metalness: 0.84,
    roughness: 0.22,
  }), []);

  // 4. Structural brackets and suspension arms: titanium grey (#9CA3AF)
  const suspensionMetalProps = useMemo(() => ({
    color: '#9ca3af',
    metalness: 0.88,
    roughness: 0.22,
  }), []);

  // 5. Wheels and tires:
  // Tires: dark charcoal (#303741)
  const tireMaterialProps = useMemo(() => ({
    color: '#303741',
    roughness: 0.84,
    metalness: 0.08,
  }), []);

  // Silver alloy rims: (#D1D5DB)
  const rimMaterialProps = useMemo(() => ({
    color: '#d1d5db',
    metalness: 0.95,
    roughness: 0.12,
  }), []);

  // 6. Brake discs: metallic silver-grey (#E2E8F0)
  const brakeDiscProps = useMemo(() => ({
    color: '#e2e8f0',
    metalness: 0.96,
    roughness: 0.18,
  }), []);

  // Brake calipers: restrained performance red (#DC2626)
  const brakeCaliperProps = useMemo(() => ({
    color: '#dc2626',
    metalness: 0.55,
    roughness: 0.25,
  }), []);

  // Electric motors and power electronics: metallic gunmetal/grey (#64748B)
  const motorHousingProps = useMemo(() => ({
    color: '#64748b',
    metalness: 0.88,
    roughness: 0.24,
  }), []);

  // Restrained cyan diagnostic joint nodes (#00E3FD)
  const jointMaterialProps = useMemo(() => ({
    color: '#00e3fd',
    emissive: '#00e3fd',
    emissiveIntensity: 0.65,
    metalness: 0.5,
    roughness: 0.2,
  }), []);

  // Safety high-voltage cables: Vivid orange
  const hvCableProps = useMemo(() => ({
    color: '#f97316',
    emissive: '#ea580c',
    emissiveIntensity: 0.45,
    metalness: 0.2,
    roughness: 0.4,
  }), []);

  return (
    <group>
      {/* ======================================================== */}
      {/* 1. CENTRAL LOW-MOUNTED EV SKATEBOARD BATTERY PLATFORM     */}
      {/* ======================================================== */}
      <group position={[0, frameY - 0.03, batteryZCenter]}>
        {/* Main Brushed Aluminium Silver Battery Enclosure Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[batteryWidth, 0.14, batteryLength]} />
          <meshStandardMaterial {...batteryPlateProps} />
        </mesh>

        {/* Top Cover Stamped Plate with Light Brushed Sheen */}
        <mesh position={[0, 0.071, 0]}>
          <boxGeometry args={[batteryWidth - 0.02, 0.005, batteryLength - 0.02]} />
          <meshStandardMaterial {...batteryCoverProps} />
        </mesh>

        {/* Lower Underbody Skid Plate (Contrasting Darker Shadow Plate) */}
        <mesh position={[0, -0.073, 0]}>
          <boxGeometry args={[batteryWidth + 0.04, 0.012, batteryLength + 0.04]} />
          <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.3} />
        </mesh>

        {/* Left Side Extruded Aluminium Rocker Crash Sill */}
        <mesh position={[batteryWidth / 2 + 0.045, 0, 0]}>
          <boxGeometry args={[0.09, 0.16, batteryLength + 0.08]} />
          <meshStandardMaterial {...frameMaterialProps} />
        </mesh>
        {/* Right Side Extruded Aluminium Rocker Crash Sill */}
        <mesh position={[-batteryWidth / 2 - 0.045, 0, 0]}>
          <boxGeometry args={[0.09, 0.16, batteryLength + 0.08]} />
          <meshStandardMaterial {...frameMaterialProps} />
        </mesh>

        {/* Longitudinal Internal Shear Ribs along top cover */}
        {[-0.25, 0, 0.25].map((xRatio, idx) => (
          <mesh key={`long-${idx}`} position={[xRatio * batteryWidth, 0.076, 0]}>
            <boxGeometry args={[0.025, 0.016, batteryLength - 0.04]} />
            <meshStandardMaterial {...crossmemberProps} />
          </mesh>
        ))}

        {/* Transverse Stiffener Ribs across pack */}
        {[-0.35, -0.2, -0.05, 0.1, 0.25, 0.4].map((relZ, idx) => (
          <mesh key={`trans-${idx}`} position={[0, 0.076, relZ * batteryLength]}>
            <boxGeometry args={[batteryWidth - 0.04, 0.016, 0.038]} />
            <meshStandardMaterial {...crossmemberProps} />
          </mesh>
        ))}

        {/* High Voltage Junction Box */}
        <mesh position={[0, 0.085, -batteryLength / 2 + 0.08]}>
          <boxGeometry args={[0.24, 0.09, 0.15]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 2. CHASSIS STRUCTURAL FRAME RAILS & SUBFRAMES             */}
      {/* ======================================================== */}
      {/* Left Upper Frame Rail (#94A3B8) */}
      <mesh position={[railSpacingX / 2, frameY + 0.09, zCenter]}>
        <boxGeometry args={[0.085, 0.085, totalLength - 0.12]} />
        <meshStandardMaterial {...frameMaterialProps} />
      </mesh>
      {/* Right Upper Frame Rail (#94A3B8) */}
      <mesh position={[-railSpacingX / 2, frameY + 0.09, zCenter]}>
        <boxGeometry args={[0.085, 0.085, totalLength - 0.12]} />
        <meshStandardMaterial {...frameMaterialProps} />
      </mesh>

      {/* Front Subframe Tower Cradle (Lighter Steel Grey #A8B4C4) */}
      <group position={[0, frameY + 0.12, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[Wf * 0.76, 0.12, 0.15]} />
          <meshStandardMaterial {...crossmemberProps} />
        </mesh>
        {/* Front Steering Rack Assembly */}
        <mesh position={[0, -0.08, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, Wf * 0.65, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Front Anti-Roll (Sway) Bar */}
        <mesh position={[0, -0.05, -0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, Wf * 0.72, 16]} />
          <meshStandardMaterial color="#00e3fd" metalness={0.75} roughness={0.2} />
        </mesh>
      </group>

      {/* Rear Subframe Tower Cradle (Lighter Steel Grey #A8B4C4) */}
      <group position={[0, frameY + 0.12, L]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[Wr * 0.76, 0.12, 0.15]} />
          <meshStandardMaterial {...crossmemberProps} />
        </mesh>
        {/* Rear Anti-Roll (Sway) Bar */}
        <mesh position={[0, -0.05, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, Wr * 0.72, 16]} />
          <meshStandardMaterial color="#00e3fd" metalness={0.75} roughness={0.2} />
        </mesh>
      </group>

      {/* Front Crumple Crash Cans (Accordion crush boxes #A8B4C4) */}
      <mesh position={[railSpacingX / 2, frameY + 0.06, zFrontBumper + 0.12]}>
        <boxGeometry args={[0.095, 0.095, 0.17]} />
        <meshStandardMaterial {...crossmemberProps} />
      </mesh>
      <mesh position={[-railSpacingX / 2, frameY + 0.06, zFrontBumper + 0.12]}>
        <boxGeometry args={[0.095, 0.095, 0.17]} />
        <meshStandardMaterial {...crossmemberProps} />
      </mesh>

      {/* Front Bumper Impact Crossmember Beam (#94A3B8) */}
      <mesh position={[0, frameY + 0.06, zFrontBumper + 0.04]}>
        <boxGeometry args={[railSpacingX + 0.3, 0.12, 0.08]} />
        <meshStandardMaterial {...frameMaterialProps} />
      </mesh>

      {/* Rear Crumple Crash Cans (#A8B4C4) */}
      <mesh position={[railSpacingX / 2, frameY + 0.06, zRearBumper - 0.12]}>
        <boxGeometry args={[0.095, 0.095, 0.17]} />
        <meshStandardMaterial {...crossmemberProps} />
      </mesh>
      <mesh position={[-railSpacingX / 2, frameY + 0.06, zRearBumper - 0.12]}>
        <boxGeometry args={[0.095, 0.095, 0.17]} />
        <meshStandardMaterial {...crossmemberProps} />
      </mesh>

      {/* Rear Bumper Impact Crossmember Beam (#94A3B8) */}
      <mesh position={[0, frameY + 0.06, zRearBumper - 0.04]}>
        <boxGeometry args={[railSpacingX + 0.3, 0.12, 0.08]} />
        <meshStandardMaterial {...frameMaterialProps} />
      </mesh>

      {/* Restrained Cyan Diagnostic Structural Joint Nodes */}
      {[
        [railSpacingX / 2, frameY + 0.14, 0],
        [-railSpacingX / 2, frameY + 0.14, 0],
        [railSpacingX / 2, frameY + 0.14, L],
        [-railSpacingX / 2, frameY + 0.14, L],
        [railSpacingX / 2, frameY + 0.14, batteryZCenter],
        [-railSpacingX / 2, frameY + 0.14, batteryZCenter],
      ].map(([xPos, yPos, zPos], idx) => (
        <mesh key={`node-${idx}`} position={[xPos, yPos, zPos]}>
          <boxGeometry args={[0.095, 0.095, 0.095]} />
          <meshStandardMaterial {...jointMaterialProps} />
        </mesh>
      ))}

      {/* ======================================================== */}
      {/* 3. FOUR WHEEL & INDEPENDENT SUSPENSION ASSEMBLIES        */}
      {/* ======================================================== */}
      {[
        { name: 'FL', x: Wf / 2, z: 0, isLeft: true },
        { name: 'FR', x: -Wf / 2, z: 0, isLeft: false },
        { name: 'RL', x: Wr / 2, z: L, isLeft: true },
        { name: 'RR', x: -Wr / 2, z: L, isLeft: false },
      ].map((w) => {
        const sideSign = w.isLeft ? 1 : -1;
        return (
          <group key={w.name} position={[w.x, tireRadius, w.z]}>
            {/* 3.1 RUBBER TIRE WITH DARK CHARCOAL SATIN FINISH (#303741) */}
            {/* Main Center Tire Tread */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[tireRadius, tireRadius, tireWidth * 0.85, 32]} />
              <meshStandardMaterial {...tireMaterialProps} />
            </mesh>
            {/* Outer Sidewall Bevel Rounding */}
            <mesh position={[sideSign * (tireWidth * 0.44), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[tireRadius * 0.96, tireRadius, tireWidth * 0.15, 32]} />
              <meshStandardMaterial {...tireMaterialProps} />
            </mesh>
            {/* Inner Sidewall Bevel Rounding */}
            <mesh position={[-sideSign * (tireWidth * 0.44), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[tireRadius, tireRadius * 0.96, tireWidth * 0.15, 32]} />
              <meshStandardMaterial {...tireMaterialProps} />
            </mesh>

            {/* 3.2 DETAILED SILVER ALLOY RIM (#D1D5DB) */}
            {/* Rim Outer Barrel */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[rimRadius, rimRadius, tireWidth + 0.012, 28]} />
              <meshStandardMaterial {...rimMaterialProps} />
            </mesh>
            {/* Rim Inner Drop Center Ring */}
            <mesh position={[sideSign * (tireWidth * 0.42), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <ringGeometry args={[rimRadius * 0.88, rimRadius, 32]} />
              <meshStandardMaterial {...rimMaterialProps} side={THREE.DoubleSide} />
            </mesh>

            {/* 10-Spoke Aerodynamic Alloy Turbine Pattern (#D1D5DB) */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, sIdx) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <mesh
                  key={sIdx}
                  position={[
                    sideSign * (tireWidth / 2 + 0.01),
                    Math.sin(rad) * (rimRadius * 0.46),
                    Math.cos(rad) * (rimRadius * 0.46),
                  ]}
                  rotation={[rad, 0, sideSign * 0.06]}
                >
                  <boxGeometry args={[0.02, rimRadius * 0.72, 0.036]} />
                  <meshStandardMaterial {...rimMaterialProps} />
                </mesh>
              );
            })}

            {/* Central Wheel Hub Cap */}
            <mesh position={[sideSign * (tireWidth / 2 + 0.016), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.052, 0.052, 0.022, 20]} />
              <meshStandardMaterial color="#4b5563" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* 5 Wheel Lug Nuts (Polished Steel #F3F4F6) */}
            {[0, 72, 144, 216, 288].map((angle, lIdx) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <mesh
                  key={`lug-${lIdx}`}
                  position={[
                    sideSign * (tireWidth / 2 + 0.024),
                    Math.sin(rad) * 0.033,
                    Math.cos(rad) * 0.033,
                  ]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.008, 0.008, 0.016, 6]} />
                  <meshStandardMaterial color="#f3f4f6" metalness={0.98} roughness={0.08} />
                </mesh>
              );
            })}

            {/* 3.3 METALLIC SILVER-GREY BRAKE ROTOR DISC & RED PERFORMANCE CALIPER */}
            {/* Ventilated Brake Rotor Disc (#E2E8F0) */}
            <mesh position={[-sideSign * 0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.165, 0.165, 0.024, 28]} />
              <meshStandardMaterial {...brakeDiscProps} />
            </mesh>
            {/* Brake Disc Center Mounting Hat (Titanium Grey #9CA3AF) */}
            <mesh position={[-sideSign * 0.035, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.082, 0.082, 0.038, 20]} />
              <meshStandardMaterial {...suspensionMetalProps} />
            </mesh>

            {/* Performance Red Brake Caliper (#DC2626) */}
            <group position={[-sideSign * 0.045, 0.11, 0.07]} rotation={[0, 0, sideSign * 0.15]}>
              <mesh>
                <boxGeometry args={[0.058, 0.098, 0.135]} />
                <meshStandardMaterial {...brakeCaliperProps} />
              </mesh>
              {/* Caliper Piston Emboss */}
              <mesh position={[sideSign * 0.032, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.012, 16]} />
                <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>

            {/* 3.4 SUSPENSION WISHBONES, UPRIGHT & DRIVE AXLE (Titanium Grey #9CA3AF) */}
            <group position={[-sideSign * 0.15, -0.05, 0]}>
              {/* Upper A-Arm Wishbone (Tubular A-Frame) */}
              <group position={[0, 0.08, 0]}>
                <mesh position={[0, 0, 0.06]} rotation={[0, sideSign * 0.2, sideSign * 0.12]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
                  <meshStandardMaterial {...suspensionMetalProps} />
                </mesh>
                <mesh position={[0, 0, -0.06]} rotation={[0, -sideSign * 0.2, sideSign * 0.12]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
                  <meshStandardMaterial {...suspensionMetalProps} />
                </mesh>
                {/* Upper Ball Joint */}
                <mesh position={[sideSign * 0.08, 0, 0]}>
                  <sphereGeometry args={[0.022, 12, 12]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
                </mesh>
              </group>

              {/* Lower A-Arm Wishbone (Heavy Duty Box A-Frame) */}
              <group position={[0, -0.08, 0]}>
                <mesh position={[0, 0, 0.08]} rotation={[0, sideSign * 0.22, sideSign * 0.06]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.25, 12]} />
                  <meshStandardMaterial {...suspensionMetalProps} />
                </mesh>
                <mesh position={[0, 0, -0.08]} rotation={[0, -sideSign * 0.22, sideSign * 0.06]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.25, 12]} />
                  <meshStandardMaterial {...suspensionMetalProps} />
                </mesh>
                {/* Lower Ball Joint */}
                <mesh position={[sideSign * 0.09, 0, 0]}>
                  <sphereGeometry args={[0.024, 12, 12]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
                </mesh>
              </group>

              {/* Cast Steering Knuckle / Upright Spindle (#9CA3AF) */}
              <mesh position={[sideSign * 0.08, 0, 0]}>
                <boxGeometry args={[0.038, 0.18, 0.048]} />
                <meshStandardMaterial {...suspensionMetalProps} />
              </mesh>

              {/* Drive Half-Shaft Axle with CV Boot Sleeves */}
              <group>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.28, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
                </mesh>
                {/* Outer CV Boot Bellows */}
                <mesh position={[sideSign * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.024, 0.05, 12]} />
                  <meshStandardMaterial {...tireMaterialProps} />
                </mesh>
                {/* Inner CV Boot Bellows */}
                <mesh position={[-sideSign * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.024, 0.032, 0.05, 12]} />
                  <meshStandardMaterial {...tireMaterialProps} />
                </mesh>
              </group>
            </group>

            {/* 3.5 REAL 3D HELICAL COIL SPRING & DAMPER STRUT ASSEMBLY */}
            <group
              position={[-sideSign * 0.15, 0.04, 0]}
              rotation={[0, 0, -sideSign * 0.2]}
            >
              <HelicalSpring
                turns={6}
                height={0.25}
                radius={0.044}
                wireRadius={0.008}
                color="#ef4444"
              />
            </group>
          </group>
        );
      })}

      {/* ======================================================== */}
      {/* 4. FRONT & REAR ELECTRIC DRIVE UNITS & POWER INVERTERS   */}
      {/* ======================================================== */}
      {/* Front Electric Motor & Inverter Unit */}
      <group position={[0, frameY + 0.05, 0]}>
        {/* Cylindrical Motor Stator Housing with Cooling Ribs (#64748B) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.155, 0.155, 0.44, 28]} />
          <meshStandardMaterial {...motorHousingProps} />
        </mesh>
        {/* Motor Cooling Rib Collar */}
        {[-0.12, 0, 0.12].map((xOffset, idx) => (
          <mesh key={`frib-${idx}`} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.165, 0.165, 0.02, 24]} />
            <meshStandardMaterial {...crossmemberProps} />
          </mesh>
        ))}
        {/* Front Inverter Power Module on top (#94A3B8) */}
        <mesh position={[0, 0.11, -0.04]}>
          <boxGeometry args={[0.26, 0.11, 0.22]} />
          <meshStandardMaterial {...frameMaterialProps} />
        </mesh>
        {/* Orange HV Cables from Battery */}
        <mesh position={[0.07, 0.05, 0.14]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.22, 12]} />
          <meshStandardMaterial {...hvCableProps} />
        </mesh>
        <mesh position={[-0.07, 0.05, 0.14]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.22, 12]} />
          <meshStandardMaterial {...hvCableProps} />
        </mesh>
      </group>

      {/* Rear High-Performance Electric Drive Unit */}
      <group position={[0, frameY + 0.06, L]}>
        {/* Larger Rear Drive Motor Housing (#64748B) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.19, 0.19, 0.52, 28]} />
          <meshStandardMaterial {...motorHousingProps} />
        </mesh>
        {/* Rear Differential Gearbox Housing */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial {...crossmemberProps} />
        </mesh>
        {/* Rear Inverter Power Electronics with Cooling Fins */}
        <mesh position={[0, 0.13, 0.04]}>
          <boxGeometry args={[0.34, 0.13, 0.26]} />
          <meshStandardMaterial {...frameMaterialProps} />
        </mesh>
        {/* High Voltage Shielded Cables Routing to Skateboard Pack */}
        <mesh position={[0.09, 0.06, -0.18]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.28, 12]} />
          <meshStandardMaterial {...hvCableProps} />
        </mesh>
        <mesh position={[-0.09, 0.06, -0.18]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.28, 12]} />
          <meshStandardMaterial {...hvCableProps} />
        </mesh>
      </group>
    </group>
  );
};
