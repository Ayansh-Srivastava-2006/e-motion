import React, { useState } from 'react';
import { ChassisParameters, ComponentLoad, CalculationResults } from '../../types/chassis';
import { ChassisCanvas3D, CameraPreset } from './ChassisCanvas3D';
import { SideTelemetryPanel } from './SideTelemetryPanel';
import { RotateCcw, Box, Layers, Eye } from 'lucide-react';

interface SimulationViewProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  results: CalculationResults;
  onUpdateComponent: (id: string, updated: Partial<ComponentLoad>) => void;
  onResetProject?: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  chassis,
  components,
  results,
  onUpdateComponent,
}) => {
  // Independent visual layer controls (prioritize 3D vehicle visibility by default)
  const [showLoadArrows, setShowLoadArrows] = useState(true);
  const [showLoadLabels, setShowLoadLabels] = useState(false); // Disabled by default to prevent vehicle obstruction
  const [showWheelArrows, setShowWheelArrows] = useState(true);
  const [showWheelLabels, setShowWheelLabels] = useState(false); // Disabled by default
  const [showCG, setShowCG] = useState(true);
  const [showCGLabel, setShowCGLabel] = useState(false); // Disabled by default
  const [showDimensions, setShowDimensions] = useState(false); // Disabled by default
  const [showValues, setShowValues] = useState(true);

  // Camera preset and reset trigger
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [resetKey, setResetKey] = useState(0);

  const handleUpdateMass = (id: string, mass: number) => {
    onUpdateComponent(id, { mass });
  };

  const handleResetCamera = () => {
    setCameraPreset('isometric');
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* ======================================================== */}
      {/* TOP SIMULATION CONTROL & LAYER TOOLBAR                    */}
      {/* ======================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-lg gap-4 text-xs">
        {/* Left: View Presets & Camera Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
            <button
              onClick={() => setCameraPreset('isometric')}
              title="Isometric 3D Camera Perspective"
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cameraPreset === 'isometric'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D Isometric
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              title="Top View (XY Ground Plane)"
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                cameraPreset === 'top'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Top (XY)
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              title="Side Elevation (XZ Profile)"
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                cameraPreset === 'side'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Side (XZ)
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              title="Front View (YZ Track Alignment)"
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                cameraPreset === 'front'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Front (YZ)
            </button>
          </div>

          <button
            onClick={handleResetCamera}
            title="Reset 3D camera pan, zoom, and orientation"
            className="flex items-center gap-1.5 bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg font-semibold hover:bg-surface-bright transition-all border border-outline-variant/40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-secondary-fixed" /> RESET CAMERA
          </button>
        </div>

        {/* Right: Independent Visual Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs select-none">
          <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mr-1">
            <Eye className="w-3.5 h-3.5" /> Layers:
          </div>

          {/* Load Arrows */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showLoadArrows}
              onChange={(e) => setShowLoadArrows(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Load Arrows</span>
          </label>

          {/* Load Cards */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showLoadLabels}
              onChange={(e) => setShowLoadLabels(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Load Cards</span>
          </label>

          {/* Wheel Arrows */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showWheelArrows}
              onChange={(e) => setShowWheelArrows(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Wheel Arrows</span>
          </label>

          {/* Wheel Cards */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showWheelLabels}
              onChange={(e) => setShowWheelLabels(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Wheel Cards</span>
          </label>

          {/* CG Marker */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showCG}
              onChange={(e) => setShowCG(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">CG Marker</span>
          </label>

          {/* CG Label */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showCGLabel}
              onChange={(e) => setShowCGLabel(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">CG Label</span>
          </label>

          {/* Dimensions */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Dimensions</span>
          </label>

          {/* Force Values */}
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface bg-surface-container/60 hover:bg-surface-container px-2 py-1 rounded border border-outline-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={showValues}
              onChange={(e) => setShowValues(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-surface-container-highest border-outline accent-secondary-fixed cursor-pointer"
            />
            <span className="text-on-surface-variant">Force Values</span>
          </label>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT & SIDE TELEMETRY PANEL GRID                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 h-[480px] xl:h-[500px] 2xl:h-[580px] flex">
          <ChassisCanvas3D
            chassis={chassis}
            components={components}
            results={results}
            showLoadArrows={showLoadArrows}
            showLoadLabels={showLoadLabels}
            showWheelArrows={showWheelArrows}
            showWheelLabels={showWheelLabels}
            showCG={showCG}
            showCGLabel={showCGLabel}
            showDimensions={showDimensions}
            showValues={showValues}
            cameraPreset={cameraPreset}
            resetKey={resetKey}
          />
        </div>

        <div className="h-[480px] xl:h-[500px] 2xl:h-[580px]">
          <SideTelemetryPanel
            results={results}
            components={components}
            onUpdateMass={handleUpdateMass}
          />
        </div>
      </div>
    </div>
  );
};
