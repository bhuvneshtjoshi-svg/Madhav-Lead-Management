import React from 'react';
import { FollowUp, Lead } from '../../types';
import { A4LeadSheet } from './A4LeadSheet';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintPreviewModalProps {
  lead: Lead;
  followUps: FollowUp[];
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  lead,
  followUps,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex flex-col items-center">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print sticky top-0 z-10 w-full bg-slate-900 border-b border-slate-700 px-6 py-3 shadow-md flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-sm font-medium border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">A4 Print Preview</h2>
            <p className="text-xs text-slate-400">
              {lead.leadId} — {lead.customerDetails.name} ({lead.interestedProject})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            A4 Portrait (1 Page)
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Lead File</span>
          </button>
        </div>
      </div>

      {/* Sheet Container */}
      <div className="print-container w-full max-w-4xl py-8 px-4 flex justify-center">
        <A4LeadSheet lead={lead} followUps={followUps} />
      </div>
    </div>
  );
};
