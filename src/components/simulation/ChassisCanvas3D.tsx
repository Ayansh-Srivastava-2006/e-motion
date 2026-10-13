import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ChassisParameters, ComponentLoad, CalculationResults } from '../../types/chassis';
import { ProceduralEVChassis } from './ProceduralEVChassis';
import { ComponentLoad3D } from './ComponentLoad3D';
import { CGMarker3D } from './CGMarker3D';
import { WheelReactions3D } from './WheelReactions3D';
import { DimensionLines3D } from './DimensionLines3D';

export type CameraPreset = 'isometric' | 'top' | 'side' | 'front';

interface ChassisCanvas3DProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  results: CalculationResults;
  showLoadArrows?: boolean;
  showLoadLabels?: boolean;
  showWheelArrows?: boolean;
  showWheelLabels?: boolean;
  showCG?: boolean;
  showCGLabel?: boolean;
  showDimensions?: boolean;
  showValues?: boolean;
  cameraPreset?: CameraPreset;
  resetKey?: number;
}

// Controller component to smoothly reposition OrbitControls and Camera on preset changes or reset
const CameraController: React.FC<{
  preset: CameraPreset;
  chassis: ChassisParameters;
  resetKey?: number;
}> = ({ preset, chassis, resetKey = 0 }) => {
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const L = (chassis.wheelbase || 2650) / 1000;
  const ohF = (chassis.ohF || 850) / 1000;
  const ohR = (chassis.ohR || 700) / 1000;
  const zFrontBumper = -ohF;
  const zRearBumper = L + ohR;
  const zCenter = (zFrontBumper + zRearBumper) / 2;

  // Aspect correction for narrower viewports (Three.js fixed vertical FOV crops sides on narrow aspect ratios)
  const aspect = size.width / Math.max(1, size.height);
  const aspectCorrection = aspect < 1.45 ? Math.min(1.35, Math.max(1.0, 1.48 / aspect)) : 1.0;

  const xTarget = preset === 'isometric' ? -0.16 : 0;
  const yTarget = preset === 'top' ? 0 : preset === 'isometric' ? 0.22 : 0.35;
  const zTarget = preset === 'isometric' ? zCenter + 0.05 : zCenter;

  const targetVector: [number, number, number] = [xTarget, yTarget, zTarget];

  useEffect(() => {
    if (preset === 'isometric') {
      camera.position.set(
        4.1 * aspectCorrection,
        2.55 * aspectCorrection,
        zCenter + 3.7 * aspectCorrection
      );
    } else if (preset === 'top') {
      camera.position.set(0, 7.6 * aspectCorrection, zCenter + 0.001);
    } else if (preset === 'side') {
      camera.position.set(6.8 * aspectCorrection, 0.35, zCenter);
    } else if (preset === 'front') {
      camera.position.set(0, 0.35, zCenter - 6.5 * aspectCorrection);
    }

    if (controlsRef.current) {
      controlsRef.current.target.set(xTarget, yTarget, zTarget);
      controlsRef.current.update();
    } else {
      camera.lookAt(new THREE.Vector3(xTarget, yTarget, zTarget));
    }
  }, [preset, chassis, camera, aspectCorrection, xTarget, yTarget, zTarget, zCenter, resetKey]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={targetVector}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.01}
      minDistance={1.0}
      maxDistance={22.0}
    />
  );
};

export const ChassisCanvas3D: React.FC<ChassisCanvas3DProps> = ({
  chassis,
  components,
  results,
  showLoadArrows = true,
  showLoadLabels = false,
  showWheelArrows = true,
  showWheelLabels = false,
  showCG = true,
  showCGLabel = false,
  showDimensions = false,
  showValues = true,
  cameraPreset = 'isometric',
  resetKey = 0,
}) => {
  const L = (chassis.wheelbase || 2650) / 1000;
  const ohF = (chassis.ohF || 850) / 1000;
  const ohR = (chassis.ohR || 700) / 1000;
  const zFrontBumper = -ohF;
  const zRearBumper = L + ohR;
  const zCenter = (zFrontBumper + zRearBumper) / 2;

  return (
    <div className="w-full h-full relative bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl">
      <Canvas
        camera={{
          position: [4.1, 2.55, zCenter + 3.7],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#081425' }}
      >
        {/* ======================================================== */}
        {/* 1. PROFESSIONAL AUTOMOTIVE CAE STUDIO LIGHTING           */}
        {/* ======================================================== */}
        {/* Bright ambient base illumination */}
        <ambientLight intensity={0.9} color="#f8fafc" />

        {/* Primary Key Light */}
        <directionalLight position={[8, 14, 8]} intensity={1.7} castShadow />

        {/* Secondary Fill Light */}
        <directionalLight position={[-8, 10, -8]} intensity={1.0} color="#cbd5e1" />

        {/* Front Axle & Bumper Illumination */}
        <directionalLight position={[0, 4, zCenter - 6]} intensity={0.9} color="#e2e8f0" />

        {/* Rear Axle & Bumper Illumination */}
        <directionalLight position={[0, 4, zCenter + 6]} intensity={0.9} color="#e2e8f0" />

        {/* Underbody Chassis Uplight (illuminates battery tray underside & suspension arms) */}
        <directionalLight position={[0, -2, zCenter]} intensity={0.7} color="#94a3b8" />

        {/* Cyan Automotive Rim Accent Light */}
        <directionalLight position={[0, 5, zCenter - 7]} intensity={0.75} color="#00e3fd" />

        {/* Hemisphere Sky / Ground bounce */}
        <hemisphereLight args={['#38bdf8', '#0f172a', 0.85]} />

        {/* ======================================================== */}
        {/* 2. CAMERA CONTROLLER & ORBIT CONTROLS                    */}
        {/* ======================================================== */}
        <CameraController
          preset={cameraPreset}
          chassis={chassis}
          resetKey={resetKey}
        />

        {/* ======================================================== */}
        {/* 3. STUDIO GROUND GRID & CONTACT SHADOWS                  */}
        {/* ======================================================== */}
        <Grid
          args={[20, 20]}
          sectionSize={1}
          sectionColor="#1e3a8a"
          cellColor="#0d1829"
          position={[0, -0.002, zCenter]}
          fadeDistance={25}
          infiniteGrid
        />

        {/* Datum Origin Axis crosshairs at Front Axle Centerline (0, 0, 0) */}
        <group position={[0, 0.005, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.095, 32]} />
            <meshBasicMaterial color="#00e3fd" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.24, 0.002, 0.004]} />
            <meshBasicMaterial color="#00e3fd" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.004, 0.002, 0.24]} />
            <meshBasicMaterial color="#00e3fd" />
          </mesh>
        </group>

        {/* Soft Contact Shadows on Ground */}
        <ContactShadows
          position={[0, 0.002, zCenter]}
          opacity={0.65}
          scale={8}
          blur={1.8}
          far={3.5}
        />

        {/* ======================================================== */}
        {/* 4. PROCEDURAL REALISTIC EV SKATEBOARD CHASSIS            */}
        {/* ======================================================== */}
        <ProceduralEVChassis chassis={chassis} showDimensions={showDimensions} />

        {/* ======================================================== */}
        {/* 5. 3D COMPONENT LOAD VECTORS & ANTI-OVERLAP LABELS       */}
        {/* ======================================================== */}
        <ComponentLoad3D
          components={components}
          showArrows={showLoadArrows}
          showLabels={showLoadLabels}
          showValues={showValues}
        />

        {/* ======================================================== */}
        {/* 6. 3D CENTER OF GRAVITY TARGET & GROUND PLUMB-LINE       */}
        {/* ======================================================== */}
        <CGMarker3D
          cg={results.cg}
          showCG={showCG}
          showLabels={showCGLabel}
        />

        {/* ======================================================== */}
        {/* 7. 3D UPWARD WHEEL REACTIONS & OUTWARD CARDS             */}
        {/* ======================================================== */}
        <WheelReactions3D
          wheelLoads={results.wheelLoads}
          chassis={chassis}
          showReactions={showWheelArrows}
          showLabels={showWheelLabels}
          showValues={showValues}
        />

        {/* ======================================================== */}
        {/* 8. 3D DIMENSION EXTENSION LINES & SPAN BADGES           */}
        {/* ======================================================== */}
        <DimensionLines3D chassis={chassis} showDimensions={showDimensions} />
      </Canvas>

      {/* Viewport Floating Info Pill */}
      <div className="absolute bottom-3 left-4 text-[11px] font-mono text-on-surface-variant bg-surface-container-lowest/90 px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-outline-variant/40 flex items-center gap-4 select-none shadow-xl">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
          E-MOTION EV Chassis Simulation
        </span>
        <span className="text-secondary-fixed/90 hidden sm:inline">
          Left Drag: Rotate | Right Drag: Pan | Scroll: Zoom
        </span>
      </div>
    </div>
  );
};
