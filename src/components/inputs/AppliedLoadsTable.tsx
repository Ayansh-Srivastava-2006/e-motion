import React from 'react';
import { ComponentLoad } from '../../types/chassis';
import { Plus, Trash2, Weight } from 'lucide-react';

interface AppliedLoadsTableProps {
  components: ComponentLoad[];
  onUpdateComponent: (id: string, updated: Partial<ComponentLoad>) => void;
  onAddComponent: () => void;
  onRemoveComponent: (id: string) => void;
}

export const AppliedLoadsTable: React.FC<AppliedLoadsTableProps> = ({
  components,
  onUpdateComponent,
  onAddComponent,
  onRemoveComponent,
}) => {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
        <div>
          <h3 className="text-headline-sm font-mono text-on-surface flex items-center gap-2">
            <Weight className="w-5 h-5 text-secondary-fixed" />
            Applied Loads Matrix (Generic Component Loads)
          </h3>
          <p className="text-xs font-mono text-on-surface-variant mt-0.5">
            X = mm from Front Axle | Y = mm from Centerline (+Left / -Right)
          </p>
        </div>
        <button
          onClick={onAddComponent}
          className="bg-surface-container-high hover:bg-surface-bright text-secondary-fixed px-3 py-1.5 rounded font-mono text-xs flex items-center gap-1.5 border border-outline-variant/50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + ADD LOAD
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant">
              <th className="pb-3 font-semibold">Component Name</th>
              <th className="pb-3 font-semibold">Mass (kg)</th>
              <th className="pb-3 font-semibold">X Pos (mm)</th>
              <th className="pb-3 font-semibold">Y Pos (mm)</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {components.map((comp) => (
              <tr key={comp.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2.5 pr-3">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => onUpdateComponent(comp.id, { name: e.target.value })}
                    className="w-full bg-surface-container-highest text-on-surface px-2 py-1 rounded border border-outline-variant/30 focus:border-secondary-fixed outline-none"
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <input
                    type="number"
                    value={comp.mass}
                    onChange={(e) => onUpdateComponent(comp.id, { mass: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-surface-container-highest text-secondary-fixed px-2 py-1 rounded border border-outline-variant/30 focus:border-secondary-fixed outline-none text-right"
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <input
                    type="number"
                    value={comp.x}
                    onChange={(e) => onUpdateComponent(comp.id, { x: parseFloat(e.target.value) || 0 })}
                    className="w-28 bg-surface-container-highest text-secondary-fixed px-2 py-1 rounded border border-outline-variant/30 focus:border-secondary-fixed outline-none text-right"
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <input
                    type="number"
                    value={comp.y}
                    onChange={(e) => onUpdateComponent(comp.id, { y: parseFloat(e.target.value) || 0 })}
                    className="w-28 bg-surface-container-highest text-secondary-fixed px-2 py-1 rounded border border-outline-variant/30 focus:border-secondary-fixed outline-none text-right"
                  />
                </td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => onRemoveComponent(comp.id)}
                    className="text-error hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                    title="Remove Load Element"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
