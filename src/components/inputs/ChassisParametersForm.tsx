import React from 'react';
import { ChassisParameters } from '../../types/chassis';
import { validateChassisParameters } from '../../physics/validator';
import { Ruler, AlertTriangle } from 'lucide-react';

interface ChassisParametersFormProps {
  chassis: ChassisParameters;
  onChange: (updated: ChassisParameters) => void;
}

export const ChassisParametersForm: React.FC<ChassisParametersFormProps> = ({ chassis, onChange }) => {
  const validation = validateChassisParameters(chassis);

  const handleFieldChange = (field: keyof ChassisParameters, value: string) => {
    const num = parseFloat(value);
    onChange({
      ...chassis,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <h3 className="text-headline-sm font-mono text-on-surface flex items-center gap-2">
          <Ruler className="w-5 h-5 text-secondary-fixed" />
          Chassis Geometry Parameters
        </h3>
        <span className="text-xs font-mono text-on-surface-variant">Units: Millimeters (mm)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* Length */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Overall Length (mm)</label>
          <input
            type="number"
            value={chassis.length || ''}
            onChange={(e) => handleFieldChange('length', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.length ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.length && (
            <p className="text-error text-[10px]">{validation.errors.length}</p>
          )}
        </div>

        {/* Width */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Overall Width (mm)</label>
          <input
            type="number"
            value={chassis.width || ''}
            onChange={(e) => handleFieldChange('width', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.width ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.width && (
            <p className="text-error text-[10px]">{validation.errors.width}</p>
          )}
        </div>

        {/* Wheelbase */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Wheelbase (mm)</label>
          <input
            type="number"
            value={chassis.wheelbase || ''}
            onChange={(e) => handleFieldChange('wheelbase', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.wheelbase ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.wheelbase && (
            <p className="text-error text-[10px]">{validation.errors.wheelbase}</p>
          )}
        </div>

        {/* Front Track */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Front Track (mm)</label>
          <input
            type="number"
            value={chassis.trackF || ''}
            onChange={(e) => handleFieldChange('trackF', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.trackF ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.trackF && (
            <p className="text-error text-[10px]">{validation.errors.trackF}</p>
          )}
        </div>

        {/* Rear Track */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Rear Track (mm)</label>
          <input
            type="number"
            value={chassis.trackR || ''}
            onChange={(e) => handleFieldChange('trackR', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.trackR ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.trackR && (
            <p className="text-error text-[10px]">{validation.errors.trackR}</p>
          )}
        </div>

        {/* Front Overhang */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Front Overhang (mm)</label>
          <input
            type="number"
            value={chassis.ohF ?? ''}
            onChange={(e) => handleFieldChange('ohF', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.ohF ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.ohF && (
            <p className="text-error text-[10px]">{validation.errors.ohF}</p>
          )}
        </div>

        {/* Rear Overhang */}
        <div className="bg-surface-container p-3 rounded space-y-1">
          <label className="text-on-surface-variant block font-medium">Rear Overhang (mm)</label>
          <input
            type="number"
            value={chassis.ohR ?? ''}
            onChange={(e) => handleFieldChange('ohR', e.target.value)}
            className={`w-full bg-surface-container-highest text-secondary-fixed px-2.5 py-1.5 rounded border ${
              validation.errors.ohR ? 'border-error' : 'border-outline-variant/50 focus:border-secondary-fixed'
            } outline-none transition-colors`}
          />
          {validation.errors.ohR && (
            <p className="text-error text-[10px]">{validation.errors.ohR}</p>
          )}
        </div>
      </div>

      {/* Warnings Output */}
      {validation.warnings.length > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded flex items-start gap-2 text-xs font-mono text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {validation.warnings.map((warn, idx) => (
              <p key={idx}>{warn}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
