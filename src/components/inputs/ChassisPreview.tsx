import React from 'react';
import { ChassisParameters, ComponentLoad, CenterOfGravity } from '../../types/chassis';

interface ChassisPreviewProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  cg: CenterOfGravity;
}

export const ChassisPreview: React.FC<ChassisPreviewProps> = ({ chassis, components, cg }) => {
  const svgWidth = 500;
  const svgHeight = 260;
  const padding = 40;

  const totalLength = (chassis.length && chassis.length > 0) ? chassis.length : 4200;
  const totalWidth = (chassis.width && chassis.width > 0) ? chassis.width : 1900;
  const wheelbase = (chassis.wheelbase && chassis.wheelbase > 0) ? chassis.wheelbase : 2650;
  const ohF = chassis.ohF >= 0 ? chassis.ohF : 850;

  // Coordinate mapping bounds:
  // Physical X range: [-ohF, totalLength - ohF]
  // Physical Y range: [-totalWidth / 2, +totalWidth / 2]
  const xMin = -ohF;
  const xMax = totalLength - ohF;
  const yMin = -totalWidth / 2;
  const yMax = totalWidth / 2;

  const mapX = (xMm: number): number => {
    const ratio = (xMm - xMin) / (xMax - xMin || 1);
    return padding + ratio * (svgWidth - 2 * padding);
  };

  const mapY = (yMm: number): number => {
    // In SVG Y increases downwards, so +Y (Left) is top (lower Y pixel), -Y (Right) is bottom (higher Y pixel)
    const ratio = (yMax - yMm) / (yMax - yMin || 1);
    return padding + ratio * (svgHeight - 2 * padding);
  };

  // Axle positions
  const frontAxleSvgX = mapX(0);
  const rearAxleSvgX = mapX(wheelbase);
  const centerlineSvgY = mapY(0);

  // Wheel rectangle sizes in pixels
  const wheelW = 28;
  const wheelH = 12;

  // Wheel positions
  const trackF = chassis.trackF || 1580;
  const trackR = chassis.trackR || 1580;

  const flY = mapY(trackF / 2);
  const frY = mapY(-trackF / 2);
  const rlY = mapY(trackR / 2);
  const rrY = mapY(-trackR / 2);

  // Chassis body rectangle
  const bodyX1 = mapX(-ohF);
  const bodyX2 = mapX(totalLength - ohF);
  const bodyY1 = mapY(totalWidth / 2);
  const bodyY2 = mapY(-totalWidth / 2);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 relative overflow-hidden flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2 px-2">
        <span className="text-xs font-mono text-on-surface-variant font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span> LIVE GEOMETRY PREVIEW
        </span>
        <span className="text-[11px] font-mono text-secondary-fixed bg-surface-container px-2 py-0.5 rounded">
          Datum: Front Axle (X=0)
        </span>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[260px] select-none">
        {/* Grid Background */}
        <defs>
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#152031" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid-pattern)" rx="6" />

        {/* Chassis Outer Body Envelope */}
        <rect
          x={Math.min(bodyX1, bodyX2)}
          y={Math.min(bodyY1, bodyY2)}
          width={Math.abs(bodyX2 - bodyX1)}
          height={Math.abs(bodyY2 - bodyY1)}
          fill="#111c2d"
          fillOpacity="0.7"
          stroke="#45464d"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          rx="4"
        />

        {/* Centerline (Longitudinal) */}
        <line
          x1={padding - 10}
          y1={centerlineSvgY}
          x2={svgWidth - padding + 10}
          y2={centerlineSvgY}
          stroke="#357df1"
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.6"
        />

        {/* Front Axle Line */}
        <line
          x1={frontAxleSvgX}
          y1={padding - 15}
          x2={frontAxleSvgX}
          y2={svgHeight - padding + 15}
          stroke="#00e3fd"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <text x={frontAxleSvgX} y={padding - 20} fill="#00e3fd" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
          FRONT AXLE
        </text>

        {/* Rear Axle Line */}
        <line
          x1={rearAxleSvgX}
          y1={padding - 15}
          x2={rearAxleSvgX}
          y2={svgHeight - padding + 15}
          stroke="#00e3fd"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <text x={rearAxleSvgX} y={padding - 20} fill="#00e3fd" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
          REAR AXLE
        </text>

        {/* 4 Wheels */}
        {/* FL */}
        <rect x={frontAxleSvgX - wheelW / 2} y={flY - wheelH / 2} width={wheelW} height={wheelH} fill="#22c55e" rx="2" />
        <text x={frontAxleSvgX - wheelW / 2 - 4} y={flY + 3} fill="#86efac" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">FL</text>

        {/* FR */}
        <rect x={frontAxleSvgX - wheelW / 2} y={frY - wheelH / 2} width={wheelW} height={wheelH} fill="#22c55e" rx="2" />
        <text x={frontAxleSvgX - wheelW / 2 - 4} y={frY + 3} fill="#86efac" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">FR</text>

        {/* RL */}
        <rect x={rearAxleSvgX - wheelW / 2} y={rlY - wheelH / 2} width={wheelW} height={wheelH} fill="#22c55e" rx="2" />
        <text x={rearAxleSvgX + wheelW / 2 + 4} y={rlY + 3} fill="#86efac" fontSize="8" fontFamily="JetBrains Mono" textAnchor="start">RL</text>

        {/* RR */}
        <rect x={rearAxleSvgX - wheelW / 2} y={rrY - wheelH / 2} width={wheelW} height={wheelH} fill="#22c55e" rx="2" />
        <text x={rearAxleSvgX + wheelW / 2 + 4} y={rrY + 3} fill="#86efac" fontSize="8" fontFamily="JetBrains Mono" textAnchor="start">RR</text>

        {/* Component Pins */}
        {components.map((comp) => {
          const cx = mapX(comp.x);
          const cy = mapY(comp.y);
          return (
            <g key={comp.id} className="cursor-pointer group">
              <circle cx={cx} cy={cy} r="6" fill="#ff7849" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x={cx}
                y={cy - 9}
                fill="#d8e3fb"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-90 group-hover:opacity-100"
              >
                {comp.name} ({comp.mass}kg)
              </text>
            </g>
          );
        })}

        {/* Combined Center of Gravity Marker */}
        {cg && (
          <g transform={`translate(${mapX(cg.x)}, ${mapY(cg.y)})`}>
            <circle cx="0" cy="0" r="10" fill="none" stroke="#00ffff" strokeWidth="2" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#00ffff" strokeWidth="1.5" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#00ffff" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#00ffff" />
            <rect x="14" y="-10" width="80" height="18" fill="#081425" stroke="#00ffff" strokeWidth="1" rx="3" fillOpacity="0.9" />
            <text x="54" y="2" fill="#9cf0ff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
              CG ({Math.round(cg.x)}, {Math.round(cg.y)})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
