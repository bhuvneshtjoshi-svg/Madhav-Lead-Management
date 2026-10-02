import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Lead } from '../../types';

interface DeleteConfirmModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  lead,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Lead ID confirmation for safety
    if (typedConfirmation.trim().toUpperCase() !== lead.leadId.toUpperCase()) {
      setError(true);
      return;
    }
    setError(false);
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-red-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base">Delete Protection Check</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            You are about to permanently delete this customer lead record and its follow-up history.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm">
            <div className="font-semibold text-slate-800">
              Customer: <span className="font-bold text-blue-700">{lead.customerDetails.name}</span>
            </div>
            <div className="text-slate-600 text-xs mt-1">
              Lead ID: <span className="font-mono font-bold text-slate-900">{lead.leadId}</span>
            </div>
            <div className="text-slate-600 text-xs">
              Project: <span className="font-medium text-slate-800">{lead.interestedProject}</span> | Executive: {lead.executiveName}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              To confirm deletion, please type the Lead ID (<span className="font-mono text-red-600 font-bold">{lead.leadId}</span>) below:
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => {
                setTypedConfirmation(e.target.value);
                setError(false);
              }}
              placeholder={`Type ${lead.leadId} here`}
              className={`w-full px-3 py-2 text-sm border rounded font-mono focus:outline-hidden ${
                error
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-400'
              }`}
            />
            {error && (
              <p className="text-xs text-red-600 mt-1">
                The entered ID does not match {lead.leadId}.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
