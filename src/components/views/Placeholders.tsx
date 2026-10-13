import React from 'react';

interface PlaceholderProps {
  title: string;
  phase: string;
  description: string;
  onGoToInputs?: () => void;
}

export const ViewPlaceholder: React.FC<PlaceholderProps> = ({ title, phase, description, onGoToInputs }) => {
  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/30 shadow-xl space-y-4 font-mono">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
        <h1 className="text-xl font-bold text-on-surface">{title}</h1>
        <span className="px-3 py-1 bg-surface-container-high text-secondary-fixed text-xs rounded uppercase">
          {phase}
        </span>
      </div>
      <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
        {description}
      </p>
      {onGoToInputs && (
        <button
          onClick={onGoToInputs}
          className="px-4 py-2 bg-surface-container-highest text-secondary-fixed hover:bg-surface-bright rounded text-xs transition-colors cursor-pointer"
        >
          ← Back to Project Inputs
        </button>
      )}
    </div>
  );
};
