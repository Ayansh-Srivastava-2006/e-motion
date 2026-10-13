import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChassisParameters, WheelLoads } from '../../types/chassis';
import { Html } from '@react-three/drei';

interface WheelReactions3DProps {
  wheelLoads: WheelLoads;
  chassis: ChassisParameters;
  showReactions?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
}

// 3D Emerald Leader Line connecting reaction vector to displaced label
const ReactionLeaderLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
}> = ({ start, end }) => {
  const { curve } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const line = new THREE.LineCurve3(p1, p2);
    return { curve: line };
  }, [start, end]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 8, 0.002, 6, false]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
};

export const WheelReactions3D: React.FC<WheelReactions3DProps> = ({
  wheelLoads,
  chassis,
  showReactions = true,
  showLabels = true,
  showValues = true,
}) => {
  const L = (chassis.wheelbase || 2650) / 1000;
  const Wf = (chassis.trackF || 1580) / 1000;
  const Wr = (chassis.trackR || 1580) / 1000;

  const wheels = [
    {
      name: 'FL',
      title: 'Front Left',
      forceN: wheelLoads.fl,
      pct: wheelLoads.flPct,
      pos: [Wf / 2, 0, 0] as [number, number, number],
      isLeft: true,
      xOffset: 0.42,
      zOffset: -0.22,
    },
    {
      name: 'FR',
      title: 'Front Right',
      forceN: wheelLoads.fr,
      pct: wheelLoads.frPct,
      pos: [-Wf / 2, 0, 0] as [number, number, number],
      isLeft: false,
      xOffset: -0.42,
      zOffset: -0.22,
    },
    {
      name: 'RL',
      title: 'Rear Left',
      forceN: wheelLoads.rl,
      pct: wheelLoads.rlPct,
      pos: [Wr / 2, 0, L] as [number, number, number],
      isLeft: true,
      xOffset: 0.42,
      zOffset: 0.22,
    },
    {
      name: 'RR',
      title: 'Rear Right',
      forceN: wheelLoads.rr,
      pct: wheelLoads.rrPct,
      pos: [-Wr / 2, 0, L] as [number, number, number],
      isLeft: false,
      xOffset: -0.42,
      zOffset: 0.22,
    },
  ];

  return (
    <group>
      {wheels.map((w) => {
        const forceKn = w.forceN / 1000;
        const arrowHeight = Math.max(0.55, Math.min(1.1, 0.4 + (w.forceN / 1500) * 0.5));
        const sideSign = w.isLeft ? 1 : -1;

        // Position reaction arrow on outer rim face (flanking the wheel)
        const tireFaceX = w.pos[0] + sideSign * 0.16;

        // Displaced label position (pushed further outward and clear of wheels)
        const labelPos: [number, number, number] = [
          w.pos[0] + w.xOffset,
          arrowHeight + 0.18,
          w.pos[2] + w.zOffset,
        ];
        const arrowTipPos: [number, number, number] = [tireFaceX, arrowHeight, w.pos[2]];

        return (
          <group key={w.name}>
            {/* Ground Contact Patch Indicator Ring */}
            <mesh position={[tireFaceX, 0.01, w.pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.07, 0.11, 24]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>

            {/* 1. UPWARD REACTION VECTOR ARROW (Independent toggle: showReactions) */}
            {showReactions && (
              <group position={[tireFaceX, arrowHeight / 2, w.pos[2]]}>
                {/* Bold Arrow Shaft */}
                <mesh>
                  <cylinderGeometry args={[0.024, 0.024, arrowHeight, 16]} />
                  <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.8}
                  />
                </mesh>
                {/* Arrow Head pointing UP */}
                <mesh position={[0, arrowHeight / 2 + 0.05, 0]}>
                  <coneGeometry args={[0.055, 0.12, 16]} />
                  <meshStandardMaterial
                    color="#4ade80"
                    emissive="#22c55e"
                    emissiveIntensity={0.9}
                  />
                </mesh>
              </group>
            )}

            {/* 2. LEADER CONNECTOR LINE (Independent toggle: showLabels) */}
            {showLabels && <ReactionLeaderLine start={arrowTipPos} end={labelPos} />}

            {/* 3. WHEEL REACTION TEXT CARD (Independent toggle: showLabels) */}
            {showLabels && (
              <Html
                position={labelPos}
                center
                distanceFactor={4.5}
                zIndexRange={[100, 0]}
                className="select-none pointer-events-none"
              >
                <div className="bg-slate-950/92 border border-emerald-500/80 text-emerald-300 px-2 py-0.5 rounded shadow-xl font-mono text-[10px] font-bold text-left backdrop-blur-md whitespace-nowrap">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_#34d399]"></span>
                    <span className="text-white font-bold">{w.name} Reaction</span>
                  </div>
                  <div className="text-emerald-400 text-[9px] mt-0.5 flex items-center gap-1 font-semibold">
                    <span>{w.pct.toFixed(1)}%</span>
                    {showValues && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-300 font-bold">{forceKn.toFixed(2)} kN</span>
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
