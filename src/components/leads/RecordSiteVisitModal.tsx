import React, { useState } from 'react';
import { Lead, SiteVisitStatus } from '../../types';
import { getTodayDateString, storage } from '../../services/storage';
import { Calendar, CheckCircle2, MapPin, X } from 'lucide-react';

interface RecordSiteVisitModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordSiteVisitModal: React.FC<RecordSiteVisitModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = getTodayDateString();
  const [siteVisitDate, setSiteVisitDate] = useState(today);
  const [status, setStatus] = useState<SiteVisitStatus>('Site Visit Done');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      storage.recordSiteVisit({
        leadId: lead.id,
        siteVisitDate,
        status,
        remarks: remarks.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record site visit', err);
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
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Record Site Visit Event</h2>
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

        {/* Lead Context Details */}
        <div className="bg-slate-50 p-3.5 border-b border-slate-200 text-xs flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Project</div>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Site Visit Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Site Visit Done')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  status === 'Site Visit Done'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✓ Completed Visit
                <span className="block text-[10px] font-normal text-slate-500">
                  Counts as achievement
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('Site Visit Planned')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  status === 'Site Visit Planned'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📅 Planned Visit
                <span className="block text-[10px] font-normal text-slate-500">
                  Scheduled for future
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={siteVisitDate}
                onChange={(e) => setSiteVisitDate(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Remarks / Customer Feedback
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Units shown, client interest level, questions raised, accompanying family members..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-[11px] text-blue-800">
            ℹ️ Completed site visits automatically contribute +1 to the monthly achievement of{' '}
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
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Site Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
