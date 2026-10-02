import React, { useState } from 'react';
import { Lead, LeadPriority, LeadStatus, ModeOfContact } from '../../types';
import { getTodayDateString, storage } from '../../services/storage';
import { Calendar, CheckCircle2, Clock, Phone, X } from 'lucide-react';

interface AddFollowupModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONTACT_MODES: ModeOfContact[] = [
  'Phone Call',
  'WhatsApp',
  'Site Visit',
  'Office Visit',
  'Video Call',
  'Reference Meeting',
  'Email',
  'Other',
];

const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Follow-up',
  'Site Visit Planned',
  'Site Visit Done',
  'Negotiation',
  'Booking',
  'Converted',
  'Future',
  'Lost',
  'Not Interested',
];

export const AddFollowupModal: React.FC<AddFollowupModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = getTodayDateString();
  const settings = storage.getSettings();

  // Calculate default next follow-up date (today + defaultFollowupDays)
  const getDefaultNextDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (settings.defaultFollowupDays || 3));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(today);
  const [modeOfContact, setModeOfContact] = useState<ModeOfContact>('Phone Call');
  const [remark, setRemark] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(getDefaultNextDate());
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [priority, setPriority] = useState<LeadPriority>(lead.priority);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) {
      setErrorMessage('Please enter discussion remarks for this follow-up.');
      return;
    }

    setIsSubmitting(true);
    try {
      storage.addFollowUp({
        leadId: lead.id,
        date,
        remark: remark.trim(),
        modeOfContact,
        nextFollowUpDate: status === 'Converted' || status === 'Lost' || status === 'Not Interested' ? '' : nextFollowUpDate,
        updateLeadStatus: status,
        updateLeadPriority: priority,
      });

      // If status is Site Visit Done or mode is Site Visit, automatically record site visit event
      if (status === 'Site Visit Done' || modeOfContact === 'Site Visit') {
        storage.recordSiteVisit({
          leadId: lead.id,
          siteVisitDate: date,
          status: 'Site Visit Done',
          remarks: remark.trim(),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage('Unable to save this follow-up. Please check fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-200" />
              <span>Record Daily Follow-up</span>
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              {lead.leadId} &bull; {lead.customerDetails.name} &bull; {lead.interestedProject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Quick Glance */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500">Executive: </span>
            <span className="font-semibold text-slate-800">{lead.executiveName} ({lead.teamName})</span>
          </div>
          <div>
            <span className="text-slate-500">Mobile: </span>
            <span className="font-mono font-medium text-slate-900">{lead.customerDetails.mobile}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mode of Contact <span className="text-red-500">*</span>
              </label>
              <select
                value={modeOfContact}
                onChange={(e) => setModeOfContact(e.target.value as ModeOfContact)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {CONTACT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Remark / Discussion Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter detailed outcome of the conversation, customer feedback, visited site, requested quotation, etc..."
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                disabled={status === 'Converted' || status === 'Lost' || status === 'Not Interested'}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {LEAD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Update Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-semibold"
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Follow-up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
