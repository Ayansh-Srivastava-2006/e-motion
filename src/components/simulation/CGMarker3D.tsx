import React from 'react';
import { CenterOfGravity } from '../../types/chassis';
import { Html } from '@react-three/drei';

interface CGMarker3DProps {
  cg: CenterOfGravity;
  showCG?: boolean;
  showLabels?: boolean;
}

export const CGMarker3D: React.FC<CGMarker3DProps> = ({
  cg,
  showCG = true,
  showLabels = true,
}) => {
  if (!showCG && !showLabels) return null;

  const posX = (cg.y || 0) / 1000;
  const posZ = (cg.x || 0) / 1000;
  const posY = 0.35; // Center of gravity elevation
  const labelY = posY + 0.34;

  return (
    <group position={[posX, 0, posZ]}>
      {/* 1. 3D CENTER OF GRAVITY TARGET MARKER (Independent toggle: showCG) */}
      {showCG && (
        <group position={[0, posY, 0]}>
          {/* Glowing Cyan Core Target Sphere */}
          <mesh>
            <sphereGeometry args={[0.065, 24, 24]} />
            <meshStandardMaterial
              color="#00e3fd"
              emissive="#00e3fd"
              emissiveIntensity={0.8}
              wireframe
            />
          </mesh>

          {/* Internal Solid Nucleus */}
          <mesh>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial
              color="#00e3fd"
              emissive="#00e3fd"
              emissiveIntensity={1.0}
            />
          </mesh>

          {/* Gimbal Crosshair Ring XZ Plane */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.11, 0.125, 32]} />
            <meshBasicMaterial color="#00e3fd" side={2} />
          </mesh>

          {/* Gimbal Crosshair Ring XY Plane */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.11, 0.125, 32]} />
            <meshBasicMaterial color="#00e3fd" side={2} />
          </mesh>

          {/* Gimbal Crosshair Ring YZ Plane */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.11, 0.125, 32]} />
            <meshBasicMaterial color="#00e3fd" side={2} />
          </mesh>
        </group>
      )}

      {/* 2. GROUND PROJECTION PLUMB-LINE & FLOOR TARGET (Independent toggle: showCG) */}
      {showCG && (
        <group>
          {/* Vertical Laser Plumb-Line to Ground */}
          <mesh position={[0, posY / 2, 0]}>
            <cylinderGeometry args={[0.002, 0.002, posY, 8]} />
            <meshBasicMaterial color="#00e3fd" transparent opacity={0.6} />
          </mesh>

          {/* Ground Projection Target Ring */}
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.1, 24]} />
            <meshBasicMaterial color="#00e3fd" />
          </mesh>
        </group>
      )}

      {/* 3. VERTICAL STEM TO FLOATING LABEL (Independent toggle: showLabels) */}
      {showLabels && (
        <mesh position={[0, posY + (labelY - posY) / 2, 0]}>
          <cylinderGeometry args={[0.002, 0.002, labelY - posY, 8]} />
          <meshBasicMaterial color="#00e3fd" transparent opacity={0.6} />
        </mesh>
      )}

      {/* 4. FLOATING READOUT BADGE (Independent toggle: showLabels) */}
      {showLabels && (
        <Html
          position={[0, labelY, 0]}
          center
          distanceFactor={4.5}
          zIndexRange={[100, 0]}
          className="select-none pointer-events-none"
        >
          <div className="bg-slate-950/92 border border-cyan-400 text-cyan-300 px-2.5 py-0.5 rounded shadow-xl font-mono text-[10px] font-bold whitespace-nowrap backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#22d3ee]"></span>
            <span>
              🎯 CG ({Math.round(cg.x)}, {Math.round(cg.y)} mm)
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
