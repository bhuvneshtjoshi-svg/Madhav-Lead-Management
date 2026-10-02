import React, { useState } from 'react';
import { Lead, TokenStatus } from '../../types';
import { getTodayDateString, storage } from '../../services/storage';
import { Calendar, CheckCircle2, DollarSign, Tag, X } from 'lucide-react';

interface RecordTokenModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordTokenModal: React.FC<RecordTokenModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = getTodayDateString();
  const settings = storage.getSettings();

  const [tokenDate, setTokenDate] = useState(today);
  const [tokenAmount, setTokenAmount] = useState('');
  const [unitRef, setUnitRef] = useState(lead.propertyRequirement.preferredUnit || '');
  const [status, setStatus] = useState<TokenStatus>('Token Received');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(tokenAmount) || 0;
    if (amountNum <= 0) {
      alert('Please enter a valid token amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      storage.recordToken({
        leadId: lead.id,
        tokenDate,
        tokenAmount: amountNum,
        unitRef: unitRef.trim() || undefined,
        status,
        remarks: remarks.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record token', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Record Customer Token / Booking</h2>
              <p className="text-[11px] text-slate-400">
                {lead.leadId} — {lead.customerDetails.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Context */}
        <div className="bg-slate-50 p-3.5 border-b border-slate-200 text-xs flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Interested Project</div>
            <div className="font-semibold text-slate-800">{lead.interestedProject || 'Not specified'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Attributed Team & Exec</div>
            <div className="font-medium text-slate-700">
              {lead.teamName} / {lead.executiveName}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Token Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={tokenDate}
                  onChange={(e) => setTokenDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 pl-8 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Token Amount ({settings.currencySymbol || '₹'}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 51000"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  className="w-full text-xs py-2 px-3 pl-8 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit / Property Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 402, Block B or 3 BHK Terrace"
              value={unitRef}
              onChange={(e) => setUnitRef(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Token Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TokenStatus)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Token Received">Token Received (Counts in Achievement)</option>
              <option value="Confirmed">Confirmed Booking (Counts in Achievement)</option>
              <option value="Cancelled">Cancelled (Preserved in history, not counted)</option>
              <option value="Refunded">Refunded (Preserved in history, not counted)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Remarks & Receipt Info
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Cheque number / UPI Ref, bank name, payment terms, or receipt details..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-800">
            ✓ Active tokens contribute +1 to the monthly Token Target achievement for{' '}
            <span className="font-semibold">{lead.teamName}</span> and{' '}
            <span className="font-semibold">{lead.executiveName}</span>.
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Token</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
