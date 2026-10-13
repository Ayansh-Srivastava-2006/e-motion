import React from 'react';
import { ChassisParameters } from '../../types/chassis';
import { Html } from '@react-three/drei';

interface DimensionLines3DProps {
  chassis: ChassisParameters;
  showDimensions?: boolean;
}

export const DimensionLines3D: React.FC<DimensionLines3DProps> = ({
  chassis,
  showDimensions = true,
}) => {
  if (!showDimensions) return null;

  const L = (chassis.wheelbase || 2650) / 1000;
  const Wf = (chassis.trackF || 1580) / 1000;
  const Wr = (chassis.trackR || 1580) / 1000;
  const totalLength = (chassis.length || 4200) / 1000;
  const ohF = (chassis.ohF || 850) / 1000;
  const ohR = (chassis.ohR || 700) / 1000;

  // Separation strategy:
  // Wheelbase line on Left (+X)
  // Overall Length line on Right (-X)
  // Track width lines at Front and Rear axles on the ground
  const wbSideX = Wf / 2 + 0.28;
  const lenSideX = -(Wf / 2 + 0.28);
  const groundY = 0.04;

  const zFrontBumper = -ohF;
  const zRearBumper = L + ohR;

  return (
    <group>
      {/* ======================================================== */}
      {/* 1. WHEELBASE DIMENSION (Left side: +X)                   */}
      {/* ======================================================== */}
      <group position={[wbSideX, groundY, 0]}>
        {/* Span Bar */}
        <mesh position={[0, 0, L / 2]}>
          <boxGeometry args={[0.008, 0.008, L]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Front Axle Witness Tick */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.12, 0.008, 0.016]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Rear Axle Witness Tick */}
        <mesh position={[0, 0, L]}>
          <boxGeometry args={[0.12, 0.008, 0.016]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Wheelbase Label */}
        <Html
          position={[0.12, 0.04, L / 2]}
          center
          distanceFactor={4.5}
          zIndexRange={[100, 0]}
          className="select-none"
        >
          <div className="bg-slate-950/92 border border-sky-400/80 text-sky-300 px-2.5 py-0.5 rounded shadow-xl font-mono text-[10px] font-semibold whitespace-nowrap backdrop-blur-md">
            Wheelbase: {(chassis.wheelbase || 2650).toLocaleString()} mm
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 2. OVERALL LENGTH DIMENSION (Right side: -X)             */}
      {/* ======================================================== */}
      <group position={[lenSideX, groundY, 0]}>
        {/* Span Bar */}
        <mesh position={[0, 0, (zFrontBumper + zRearBumper) / 2]}>
          <boxGeometry args={[0.008, 0.008, totalLength]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        {/* Front Bumper Witness Tick */}
        <mesh position={[0, 0, zFrontBumper]}>
          <boxGeometry args={[0.12, 0.008, 0.016]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        {/* Rear Bumper Witness Tick */}
        <mesh position={[0, 0, zRearBumper]}>
          <boxGeometry args={[0.12, 0.008, 0.016]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        {/* Length Label */}
        <Html
          position={[-0.12, 0.04, (zFrontBumper + zRearBumper) / 2]}
          center
          distanceFactor={4.5}
          zIndexRange={[100, 0]}
          className="select-none"
        >
          <div className="bg-slate-950/92 border border-slate-500/80 text-slate-300 px-2.5 py-0.5 rounded shadow-xl font-mono text-[10px] font-semibold whitespace-nowrap backdrop-blur-md">
            Length: {(chassis.length || 4200).toLocaleString()} mm
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 3. FRONT TRACK WIDTH (Front Axle Z = -0.12)              */}
      {/* ======================================================== */}
      <group position={[0, groundY, -0.12]}>
        {/* Track Span Bar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[Wf, 0.006, 0.006]} />
          <meshBasicMaterial color="#00e3fd" transparent opacity={0.7} />
        </mesh>
        {/* Left Wheel Tick */}
        <mesh position={[Wf / 2, 0, 0]}>
          <boxGeometry args={[0.012, 0.006, 0.08]} />
          <meshBasicMaterial color="#00e3fd" />
        </mesh>
        {/* Right Wheel Tick */}
        <mesh position={[-Wf / 2, 0, 0]}>
          <boxGeometry args={[0.012, 0.006, 0.08]} />
          <meshBasicMaterial color="#00e3fd" />
        </mesh>
        {/* Front Track Label */}
        <Html
          position={[0, 0.03, -0.08]}
          center
          distanceFactor={4.5}
          zIndexRange={[100, 0]}
          className="select-none"
        >
          <div className="bg-slate-950/90 border border-cyan-500/60 text-cyan-300 px-2 py-0.5 rounded shadow-lg font-mono text-[9px] font-bold whitespace-nowrap backdrop-blur-md">
            Track (F): {(chassis.trackF || 1580).toLocaleString()} mm
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 4. REAR TRACK WIDTH (Rear Axle Z = L + 0.12)             */}
      {/* ======================================================== */}
      <group position={[0, groundY, L + 0.12]}>
        {/* Track Span Bar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[Wr, 0.006, 0.006]} />
          <meshBasicMaterial color="#00e3fd" transparent opacity={0.7} />
        </mesh>
        {/* Left Wheel Tick */}
        <mesh position={[Wr / 2, 0, 0]}>
          <boxGeometry args={[0.012, 0.006, 0.08]} />
          <meshBasicMaterial color="#00e3fd" />
        </mesh>
        {/* Right Wheel Tick */}
        <mesh position={[-Wr / 2, 0, 0]}>
          <boxGeometry args={[0.012, 0.006, 0.08]} />
          <meshBasicMaterial color="#00e3fd" />
        </mesh>
        {/* Rear Track Label */}
        <Html
          position={[0, 0.03, 0.08]}
          center
          distanceFactor={4.5}
          zIndexRange={[100, 0]}
          className="select-none"
        >
          <div className="bg-slate-950/90 border border-cyan-500/60 text-cyan-300 px-2 py-0.5 rounded shadow-lg font-mono text-[9px] font-bold whitespace-nowrap backdrop-blur-md">
            Track (R): {(chassis.trackR || 1580).toLocaleString()} mm
          </div>
        </Html>
      </group>
    </group>
  );
};
