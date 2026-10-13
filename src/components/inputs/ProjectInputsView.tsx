import React, { useState } from 'react';
import { ChassisParameters, ComponentLoad, CalculationResults } from '../../types/chassis';
import { ChassisParametersForm } from './ChassisParametersForm';
import { AppliedLoadsTable } from './AppliedLoadsTable';
import { InputSummary } from './InputSummary';
import { ChassisPreview } from './ChassisPreview';
import { validateChassisParameters, validateComponentMatrix } from '../../physics/validator';
import { Play } from 'lucide-react';

interface ProjectInputsViewProps {
  chassis: ChassisParameters;
  components: ComponentLoad[];
  results: CalculationResults;
  onUpdateChassis: (updated: ChassisParameters) => void;
  onUpdateComponent: (id: string, updated: Partial<ComponentLoad>) => void;
  onAddComponent: () => void;
  onRemoveComponent: (id: string) => void;
  onNavigateToSimulation: () => void;
}

export const ProjectInputsView: React.FC<ProjectInputsViewProps> = ({
  chassis,
  components,
  results,
  onUpdateChassis,
  onUpdateComponent,
  onAddComponent,
  onRemoveComponent,
  onNavigateToSimulation,
}) => {
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  const handleRunAnalysis = () => {
    const chassisVal = validateChassisParameters(chassis);
    if (!chassisVal.isValid) {
      const firstErrKey = Object.keys(chassisVal.errors)[0];
      setValidationError(`Chassis Geometry Error: ${chassisVal.errors[firstErrKey]}`);
      return;
    }

    const compVal = validateComponentMatrix(components);
    if (!compVal.isValid) {
      setValidationError(`Load Matrix Error: ${compVal.error}`);
      return;
    }

    if (!results.equilibrium.isValid && results.equilibrium.warningMessage) {
      setValidationError(results.equilibrium.warningMessage);
      return;
    }

    setValidationError(undefined);
    onNavigateToSimulation();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Header Banner */}
      <div className="flex flex-wrap justify-between items-center bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-on-surface">Project Inputs &amp; Configuration</h1>
          <p className="text-xs font-sans text-on-surface-variant mt-1">
            Specify chassis boundary geometry parameters and component mass matrix.
          </p>
        </div>
        <button
          onClick={handleRunAnalysis}
          className="bg-secondary-container hover:brightness-110 text-on-secondary-container px-6 py-3 rounded-lg font-mono font-bold text-sm tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" /> ▶ RUN ANALYSIS
        </button>
      </div>

      {/* Main Inputs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Form, Table, Live Preview */}
        <div className="xl:col-span-2 space-y-6">
          <ChassisParametersForm chassis={chassis} onChange={onUpdateChassis} />
          <AppliedLoadsTable
            components={components}
            onUpdateComponent={onUpdateComponent}
            onAddComponent={onAddComponent}
            onRemoveComponent={onRemoveComponent}
          />
          <ChassisPreview chassis={chassis} components={components} cg={results.cg} />
        </div>

        {/* Right Column: Summary & Quick Actions */}
        <div>
          <InputSummary
            results={results}
            componentCount={components.length}
            onRunAnalysis={handleRunAnalysis}
            validationError={validationError}
          />
        </div>
      </div>
    </div>
  );
};
