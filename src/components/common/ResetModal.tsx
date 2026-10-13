import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold uppercase tracking-wider">Reset Project Confirmation</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
          Are you sure you want to reset all chassis dimensions and load elements back to default demo configuration? All custom component inputs will be lost.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-highest text-on-surface hover:bg-surface-bright rounded text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-error-container text-on-error-container hover:bg-red-900 rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reset Project
          </button>
        </div>
      </div>
    </div>
  );
};
