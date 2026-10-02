import React, { useState } from 'react';
import { FollowUp, Lead, LeadPriority, LeadStatus, TokenStatus } from '../../types';
import { formatDate, storage } from '../../services/storage';
import {
  Calendar,
  Clock,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
  Trash2,
  UserCheck,
  Users,
  X,
  PlusCircle,
  Building,
  Briefcase,
  AlertCircle,
  Sparkles,
  Archive,
  ArchiveRestore,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { AddFollowupModal } from '../followups/AddFollowupModal';
import { PrintPreviewModal } from '../print/PrintPreviewModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { RecordSiteVisitModal } from './RecordSiteVisitModal';
import { RecordTokenModal } from './RecordTokenModal';

interface LeadProfileModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onEditLead: (lead: Lead) => void;
  onDataChanged: () => void;
}

export const LeadProfileModal: React.FC<LeadProfileModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onEditLead,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'followups' | 'site-visits' | 'tokens' | 'notes'>('profile');
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [showRecordSiteVisit, setShowRecordSiteVisit] = useState(false);
  const [showRecordToken, setShowRecordToken] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  if (!isOpen) return null;

  const lead = storage.getLeadById(leadId);
  if (!lead) return null;

  const followUps = storage.getFollowUps(lead.id);
  const siteVisits = storage.getSiteVisits(lead.id);
  const tokens = storage.getTokens(lead.id);
  const teams = storage.getTeams();
  const executives = storage.getExecutives().filter(e => e.active);

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case 'Hot':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">🔥 Hot</span>;
      case 'Warm':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">⚡ Warm</span>;
      case 'Cold':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">❄️ Cold</span>;
    }
  };

  const getStatusBadge = (s: LeadStatus) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (s === 'Converted') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (s === 'Site Visit Done' || s === 'Site Visit Planned') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    else if (s === 'Lost' || s === 'Not Interested') color = 'bg-red-50 text-red-700 border-red-200';
    else if (s === 'Follow-up') color = 'bg-blue-50 text-blue-700 border-blue-200';
    return <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${color}`}>{s}</span>;
  };

  const handleQuickStatusChange = (newStatus: LeadStatus) => {
    storage.updateLead(lead.id, { status: newStatus });
    onDataChanged();
  };

  const handleQuickPriorityChange = (newPriority: LeadPriority) => {
    storage.updateLead(lead.id, { priority: newPriority });
    onDataChanged();
  };

  const handleQuickExecutiveChange = (execId: string) => {
    const selectedExec = executives.find(e => e.id === execId);
    if (selectedExec) {
      storage.updateLead(lead.id, {
        executiveId: selectedExec.id,
        executiveName: selectedExec.name,
        teamId: selectedExec.teamId,
        teamName: selectedExec.teamName,
      });
      onDataChanged();
    }
  };

  const handleSaveNotes = () => {
    if (notesDraft !== null) {
      storage.updateLead(lead.id, { managementNotes: notesDraft.trim() });
      setNotesDraft(null);
      onDataChanged();
    }
  };

  const handleDeleteLead = () => {
    storage.deleteLead(lead.id);
    onDataChanged();
    onClose();
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '-';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600/30 border border-blue-500/40 text-blue-300 font-mono text-xs px-2.5 py-1 rounded font-bold">
                {lead.leadId}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {lead.customerDetails.name}
                  </h2>
                  {getPriorityBadge(lead.priority)}
                  {getStatusBadge(lead.status)}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Project: <span className="font-semibold text-white">{lead.interestedProject}</span> &bull; Lead Date: {formatDate(lead.leadDate)} &bull; Source: {lead.leadSource}
                </p>
              </div>
            </div>

            {/* Clear Primary Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddFollowup(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Follow-up</span>
              </button>
              <button
                onClick={() => setShowRecordSiteVisit(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs"
                title="Record Completed or Planned Site Visit"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Site Visit</span>
              </button>
              <button
                onClick={() => setShowRecordToken(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                title="Record Booking Token Commitment"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Token</span>
              </button>
              <button
                onClick={() => setShowPrintPreview(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Print A4 Customer Lead Sheet"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Print A4</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEditLead(lead);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              {lead.archived ? (
                <button
                  onClick={() => {
                    storage.unarchiveLead(lead.id);
                    onDataChanged();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 text-xs font-medium transition-colors"
                  title="Restore Lead to Active"
                >
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  <span>Unarchive</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    storage.archiveLead(lead.id);
                    onDataChanged();
                    onClose();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                  title="Archive Lead"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Archive</span>
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Delete Lead Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Management Reassignment Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium">Executive:</span>
                <select
                  value={lead.executiveId}
                  onChange={(e) => handleQuickExecutiveChange(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  {executives.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.teamName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleQuickStatusChange(e.target.value as LeadStatus)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-hidden"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Site Visit Planned">Site Visit Planned</option>
                  <option value="Site Visit Done">Site Visit Done</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Booking">Booking</option>
                  <option value="Converted">Converted</option>
                  <option value="Future">Future</option>
                  <option value="Lost">Lost</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium">Priority:</span>
                <select
                  value={lead.priority}
                  onChange={(e) => handleQuickPriorityChange(e.target.value as LeadPriority)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-hidden"
                >
                  <option value="Hot">🔥 Hot</option>
                  <option value="Warm">⚡ Warm</option>
                  <option value="Cold">❄️ Cold</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <div>
                <span className="text-slate-400">Next Follow-up: </span>
                <span className="font-semibold text-blue-700">
                  {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Not scheduled'}
                </span>
              </div>
              <span>&bull;</span>
              <div>
                <span className="text-slate-400">Total Follow-ups: </span>
                <span className="font-bold text-slate-800">{followUps.length}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-200 bg-white flex space-x-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Customer & Requirement Details
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'followups'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Follow-up History</span>
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                {followUps.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('site-visits')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'site-visits'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Site Visits</span>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                {siteVisits.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'tokens'
                  ? 'border-emerald-600 text-emerald-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Tokens & Bookings</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                {tokens.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Management Notes
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Row 1: Customer Details & Addresses */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Customer Details */}
                  <div className="col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-100 flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Customer Personal Details</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Customer Name</span>
                        <span className="font-semibold text-slate-900">{lead.customerDetails.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Customer Type</span>
                        <span className="font-medium text-slate-800">{lead.customerDetails.customerType || 'Salaried'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Mobile</span>
                        <span className="font-mono font-semibold text-slate-900">{lead.customerDetails.mobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">WhatsApp</span>
                        <span className="font-mono text-slate-800">{lead.customerDetails.whatsapp || lead.customerDetails.mobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Alternate Mobile</span>
                        <span className="font-mono text-slate-700">{lead.customerDetails.altMobile || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email Address</span>
                        <span className="text-slate-700 break-all">{lead.customerDetails.email || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Occupation</span>
                        <span className="text-slate-800">{lead.customerDetails.occupation || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Company / Business</span>
                        <span className="text-slate-800">{lead.customerDetails.companyName || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-100 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Address Information</span>
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Residential Address
                        </span>
                        <p className="text-slate-800 font-medium">{lead.residentialAddress.address || '-'}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {[
                            lead.residentialAddress.area,
                            lead.residentialAddress.city,
                            lead.residentialAddress.state,
                            lead.residentialAddress.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Work / Business Address
                        </span>
                        {lead.workAddress.company && (
                          <p className="font-semibold text-slate-900">{lead.workAddress.company}</p>
                        )}
                        <p className="text-slate-800">{lead.workAddress.workAddress || '-'}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {[
                            lead.workAddress.workArea,
                            lead.workAddress.city,
                            lead.workAddress.state,
                            lead.workAddress.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </p>
                        {lead.workAddress.designation && (
                          <p className="text-[11px] text-blue-700 font-medium mt-1">
                            Designation: {lead.workAddress.designation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Property Requirements & Financial Profile */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Property Requirement */}
                  <div className="col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-100 flex items-center space-x-1.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Property Requirement</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Requirement Type</span>
                        <span className="font-bold text-slate-900">{lead.propertyRequirement.requirementType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Preferred Unit</span>
                        <span className="font-bold text-blue-700">{lead.propertyRequirement.preferredUnit || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Interested Project</span>
                        <span className="font-semibold text-slate-900">{lead.propertyRequirement.interestedProject}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Purchase Timeline</span>
                        <span className="font-medium text-slate-800">{lead.propertyRequirement.purchaseTimeline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Budget Range</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(lead.propertyRequirement.minBudget)} – {formatCurrency(lead.propertyRequirement.maxBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Size Preference</span>
                        <span className="font-medium text-slate-800">
                          {lead.propertyRequirement.minSize || '-'} to {lead.propertyRequirement.maxSize || '-'} sq.ft
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Preferred Location / Specifics</span>
                        <span className="text-slate-700">{lead.propertyRequirement.preferredLocation || 'Any floor/facing'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Purchase Profile */}
                  <div className="col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-100 flex items-center space-x-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Financial & Purchase Profile</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Approximate Budget</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {formatCurrency(lead.financialProfile.approxBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Funding Mode</span>
                        <span className="font-semibold text-slate-800">{lead.financialProfile.fundingType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Decision Maker</span>
                        <span className="text-slate-800">{lead.financialProfile.decisionMaker || 'Self'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Purchase Urgency</span>
                        <span className="font-medium text-slate-800">{lead.financialProfile.purchaseUrgency || 'Normal'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Selling Existing Home?</span>
                        <span className="text-slate-800">{lead.financialProfile.sellingExistingProperty || 'No'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Existing Property Status</span>
                        <span className="text-slate-700">{lead.financialProfile.existingProperty || 'None'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Investment / Usage Purpose</span>
                        <span className="text-slate-700">{lead.financialProfile.investmentPurpose || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Initial Contact History */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-2 border-b border-slate-100">
                    Initial Contact & Lead Initiation
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Initial Mode of Contact</span>
                      <span className="font-medium text-slate-800">{lead.initialContact.modeOfContact}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Initiated Date</span>
                      <span className="font-medium text-slate-800">{formatDate(lead.initialContact.firstContactDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Referred By</span>
                      <span className="font-medium text-slate-800">{lead.initialContact.referredBy || 'Direct Walk-in / Inbound'}</span>
                    </div>
                  </div>
                  {lead.initialContact.initialNotes && (
                    <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 italic">
                      "{lead.initialContact.initialNotes}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'followups' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Follow-up History ({followUps.length} Records)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Permanent chronological ledger. Previous records are never overwritten.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddFollowup(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Follow-up</span>
                  </button>
                </div>

                {followUps.length === 0 ? (
                  <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-700">No Follow-ups Recorded Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Log daily phone calls, visits, WhatsApp interactions, and schedule the next follow-up date.
                    </p>
                    <button
                      onClick={() => setShowAddFollowup(true)}
                      className="mt-3 px-4 py-1.5 rounded bg-blue-600 text-white font-medium text-xs hover:bg-blue-700"
                    >
                      Record First Follow-up
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center">No.</th>
                          <th className="py-2.5 px-3 w-28">Date</th>
                          <th className="py-2.5 px-3 w-32">Mode</th>
                          <th className="py-2.5 px-3">Discussion Remark</th>
                          <th className="py-2.5 px-3 w-32 text-right">Next Follow-up</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {followUps.map((fup) => (
                          <tr key={fup.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3 text-center font-bold text-slate-500 bg-slate-50/40">
                              {fup.followUpNumber}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                              {formatDate(fup.date)}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                {fup.modeOfContact}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 leading-relaxed font-normal">
                              {fup.remark}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-blue-700">
                              {fup.nextFollowUpDate ? formatDate(fup.nextFollowUpDate) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Site Visits History Tab */}
            {activeTab === 'site-visits' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>Site Visits History & Status</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed site visits count toward monthly site visit achievement for{' '}
                      <span className="font-semibold text-slate-700">{lead.teamName}</span> &{' '}
                      <span className="font-semibold text-slate-700">{lead.executiveName}</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecordSiteVisit(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Record New Site Visit</span>
                  </button>
                </div>

                {siteVisits.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg border border-dashed border-slate-300 text-center">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No site visits recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Record a customer site visit to automatically attribute and track monthly sales targets.
                    </p>
                    <button
                      onClick={() => setShowRecordSiteVisit(true)}
                      className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Record First Site Visit</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Visit Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Attributed Team & Exec</th>
                          <th className="py-2.5 px-3">Remarks / Feedback</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {siteVisits.map((sv) => (
                          <tr key={sv.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3.5 font-semibold text-slate-800 whitespace-nowrap">
                              {formatDate(sv.activityDate)}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {sv.status === 'Site Visit Done' ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span>✓ Completed Visit</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  <span>📅 Planned Visit</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{sv.executiveName || '-'}</div>
                              <div className="text-[10px] text-slate-500">{sv.teamName || '-'}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 leading-relaxed">
                              {sv.remarks || '-'}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              {sv.status !== 'Site Visit Done' && (
                                <button
                                  onClick={() => {
                                    storage.updateSalesActivity(sv.id, { status: 'Site Visit Done' });
                                    storage.updateLead(lead.id, { status: 'Site Visit Done' });
                                    onDataChanged();
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tokens History Tab */}
            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Customer Tokens & Bookings</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Active tokens (Token Received & Confirmed) contribute toward monthly Token Target achievement.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecordToken(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Record New Token</span>
                  </button>
                </div>

                {tokens.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg border border-dashed border-slate-300 text-center">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No booking tokens recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Record a customer booking token or commitment amount to track token achievements.
                    </p>
                    <button
                      onClick={() => setShowRecordToken(true)}
                      className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-200"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Record First Token</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Token Date</th>
                          <th className="py-2.5 px-3">Token Amount</th>
                          <th className="py-2.5 px-3">Unit / Property</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Attributed Team & Exec</th>
                          <th className="py-2.5 px-3">Remarks / Receipt</th>
                          <th className="py-2.5 px-3 text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tokens.map((tk) => (
                          <tr key={tk.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3.5 font-semibold text-slate-800 whitespace-nowrap">
                              {formatDate(tk.activityDate)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              ₹ {tk.tokenAmount ? tk.tokenAmount.toLocaleString('en-IN') : '-'}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-700">
                              {tk.unitRef || '-'}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  tk.status === 'Confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : tk.status === 'Token Received'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                                }`}
                              >
                                {tk.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{tk.executiveName || '-'}</div>
                              <div className="text-[10px] text-slate-500">{tk.teamName || '-'}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 leading-relaxed">
                              {tk.remarks || '-'}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <select
                                value={tk.status}
                                onChange={(e) => {
                                  storage.updateTokenStatus(tk.id, e.target.value as TokenStatus);
                                  onDataChanged();
                                }}
                                className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden"
                              >
                                <option value="Token Received">Token Received</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Internal Management Observations & Notes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confidential internal guidance for sales team and management. These print on the customer lead file sheet.
                  </p>
                </div>

                <textarea
                  rows={6}
                  value={notesDraft !== null ? notesDraft : (lead.managementNotes || '')}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Enter strategic observations, VIP buyer preferences, pricing room, family dynamics..."
                  className="w-full text-xs p-3 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors shadow-xs"
                  >
                    Save Management Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFollowupModal
        lead={lead}
        isOpen={showAddFollowup}
        onClose={() => setShowAddFollowup(false)}
        onSuccess={() => {
          onDataChanged();
          setActiveTab('followups');
        }}
      />

      <PrintPreviewModal
        lead={lead}
        followUps={followUps}
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
      />

      <DeleteConfirmModal
        lead={lead}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteLead}
      />

      <RecordSiteVisitModal
        lead={lead}
        isOpen={showRecordSiteVisit}
        onClose={() => setShowRecordSiteVisit(false)}
        onSuccess={() => {
          onDataChanged();
          setActiveTab('site-visits');
        }}
      />

      <RecordTokenModal
        lead={lead}
        isOpen={showRecordToken}
        onClose={() => setShowRecordToken(false)}
        onSuccess={() => {
          onDataChanged();
          setActiveTab('tokens');
        }}
      />
    </>
  );
};
