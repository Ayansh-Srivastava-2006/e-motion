import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ComponentLoad } from '../../types/chassis';
import { Html } from '@react-three/drei';

interface ComponentLoad3DProps {
  components: ComponentLoad[];
  showArrows?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
}

// Helper to draw a 3D leader line between two points
const LeaderLine: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({
  start,
  end,
}) => {
  const { curve, distance } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const line = new THREE.LineCurve3(p1, p2);
    return { curve: line, distance: p1.distanceTo(p2) };
  }, [start, end]);

  if (distance < 0.01) return null;

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 8, 0.002, 6, false]} />
        <meshBasicMaterial color="#ff7849" transparent opacity={0.7} />
      </mesh>
      {/* End anchor dot at label attachment */}
      <mesh position={end}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#ff7849" />
      </mesh>
    </group>
  );
};

export const ComponentLoad3D: React.FC<ComponentLoad3DProps> = ({
  components,
  showArrows = true,
  showLabels = false,
  showValues = true,
}) => {
  return (
    <group>
      {components.map((comp, idx) => {
        // Map coordinate conventions:
        // 3D X = Y_mm / 1000 (+Left / -Right)
        // 3D Z = X_mm / 1000 (0 = Front Axle, L = Rear Axle)
        const posX = (comp.y || 0) / 1000;
        const posZ = (comp.x || 0) / 1000;
        const posY = 0.32; // Elevation on chassis frame platform

        const forceN = comp.mass * 9.81;
        const arrowHeight = Math.min(0.65, Math.max(0.28, (comp.mass / 60) * 0.35));

        // Anti-overlap layout:
        // Centerline components fan out laterally alternating left & right
        let displacedX = posX;
        if (Math.abs(posX) < 0.25) {
          const lateralSide = idx % 2 === 0 ? 1 : -1;
          const lateralStep = 0.45 + ((idx % 3) * 0.12);
          displacedX = posX + lateralSide * lateralStep;
        } else {
          // Off-center components push further outwards
          displacedX = posX + Math.sign(posX) * 0.35;
        }

        // Elevation staggered across 3 height tiers to prevent horizontal overlap
        const heightTier = idx % 3;
        const displacedY = posY + arrowHeight + 0.35 + heightTier * 0.18;

        // Subtle longitudinal stagger
        const zStagger = (idx % 2 === 0 ? 1 : -1) * 0.08;
        const displacedZ = posZ + zStagger;

        const startPt: [number, number, number] = [posX, posY + arrowHeight + 0.02, posZ];
        const endPt: [number, number, number] = [displacedX, displacedY, displacedZ];

        return (
          <group key={comp.id}>
            {/* 1. COMPONENT LOAD CONTACT NODE ON CHASSIS */}
            <mesh position={[posX, posY, posZ]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial
                color="#ff7849"
                emissive="#ea580c"
                emissiveIntensity={0.8}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>

            {/* 2. DOWNWARD LOAD VECTOR ARROW (Independent toggle: showArrows) */}
            {showArrows && (
              <group position={[posX, posY + arrowHeight / 2 + 0.04, posZ]}>
                {/* Arrow Cylinder Shaft */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, arrowHeight, 16]} />
                  <meshStandardMaterial
                    color="#ff7849"
                    emissive="#ea580c"
                    emissiveIntensity={0.6}
                  />
                </mesh>
                {/* Arrow Cone Head pointing downwards into the chassis node */}
                <mesh position={[0, -arrowHeight / 2 - 0.03, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.034, 0.08, 16]} />
                  <meshStandardMaterial
                    color="#ff7849"
                    emissive="#ea580c"
                    emissiveIntensity={0.85}
                  />
                </mesh>
              </group>
            )}

            {/* 3. CONNECTOR LEADER LINE (Independent toggle: showLabels) */}
            {showLabels && <LeaderLine start={startPt} end={endPt} />}

            {/* 4. COMPACT COMPONENT TEXT BADGE WITH HOVER DETAIL (Independent toggle: showLabels) */}
            {showLabels && (
              <Html
                position={endPt}
                center
                distanceFactor={4.5}
                zIndexRange={[100, 0]}
                className="select-none pointer-events-none"
              >
                <div className="bg-slate-950/92 border border-orange-500/70 text-slate-100 px-2 py-0.5 rounded shadow-xl font-mono text-[10px] whitespace-nowrap text-left backdrop-blur-md">
                  <div className="flex items-center gap-1.5 font-bold leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-[0_0_6px_#f97316]"></span>
                    <span className="text-white truncate max-w-[110px]">{comp.name}</span>
                  </div>
                  <div className="text-orange-400 font-semibold text-[9px] mt-0.5 flex items-center gap-1">
                    <span>{comp.mass} kg</span>
                    {showValues && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-300 font-bold">{forceN.toFixed(0)} N</span>
                      </>
                    )}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
