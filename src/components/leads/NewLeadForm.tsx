import React, { useState, useEffect } from 'react';
import {
  CustomerType,
  FundingType,
  Lead,
  LeadPriority,
  LeadStatus,
  ModeOfContact,
  PurchaseTimeline,
  RequirementType,
} from '../../types';
import { getTodayDateString, storage } from '../../services/storage';
import {
  Building,
  CheckCircle2,
  ChevronRight,
  FileText,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';

interface NewLeadFormProps {
  initialLead?: Lead | null;
  onSaveSuccess: (lead: Lead, shouldPrint?: boolean) => void;
  onCancel: () => void;
}

export const NewLeadForm: React.FC<NewLeadFormProps> = ({
  initialLead,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialLead);
  const today = getTodayDateString();

  // Master lists from storage
  const [teams, setTeams] = useState(storage.getTeams().filter(t => t.active));
  const [allExecutives, setAllExecutives] = useState(storage.getExecutives().filter(e => e.active));
  const [projects, setProjects] = useState(storage.getProjects().filter(p => p.active));
  const [leadSources, setLeadSources] = useState(storage.getLeadSources().filter(s => s.active));
  const [units, setUnits] = useState(storage.getPreferredUnits().filter(u => u.active));

  // Lead Identification
  const [leadId, setLeadId] = useState(initialLead ? initialLead.leadId : '');
  const [leadDate, setLeadDate] = useState(initialLead ? initialLead.leadDate : today);
  const [leadSource, setLeadSource] = useState(initialLead ? initialLead.leadSource : (leadSources[0]?.name || 'Reference'));
  const [interestedProject, setInterestedProject] = useState(
    initialLead ? initialLead.interestedProject : (projects[0]?.projectName || 'By The Garden')
  );
  const [status, setStatus] = useState<LeadStatus>(initialLead ? initialLead.status : 'New');
  const [priority, setPriority] = useState<LeadPriority>(initialLead ? initialLead.priority : 'Hot');

  // Customer Details
  const [name, setName] = useState(initialLead ? initialLead.customerDetails.name : '');
  const [mobile, setMobile] = useState(initialLead ? initialLead.customerDetails.mobile : '');
  const [altMobile, setAltMobile] = useState(initialLead ? (initialLead.customerDetails.altMobile || '') : '');
  const [whatsapp, setWhatsapp] = useState(initialLead ? (initialLead.customerDetails.whatsapp || '') : '');
  const [email, setEmail] = useState(initialLead ? (initialLead.customerDetails.email || '') : '');
  const [dob, setDob] = useState(initialLead ? (initialLead.customerDetails.dob || '') : '');
  const [occupation, setOccupation] = useState(initialLead ? (initialLead.customerDetails.occupation || '') : '');
  const [companyName, setCompanyName] = useState(initialLead ? (initialLead.customerDetails.companyName || '') : '');
  const [customerType, setCustomerType] = useState<CustomerType>(
    initialLead ? initialLead.customerDetails.customerType : 'Salaried'
  );

  // Address Details - Residential
  const [resAddress, setResAddress] = useState(initialLead ? initialLead.residentialAddress.address : '');
  const [resArea, setResArea] = useState(initialLead ? initialLead.residentialAddress.area : '');
  const [resCity, setResCity] = useState(initialLead ? initialLead.residentialAddress.city : 'Ahmedabad');
  const [resState, setResState] = useState(initialLead ? initialLead.residentialAddress.state : 'Gujarat');
  const [resPincode, setResPincode] = useState(initialLead ? initialLead.residentialAddress.pincode : '');

  // Address Details - Work
  const [workCompany, setWorkCompany] = useState(initialLead ? initialLead.workAddress.company : '');
  const [workAddress, setWorkAddress] = useState(initialLead ? initialLead.workAddress.workAddress : '');
  const [workArea, setWorkArea] = useState(initialLead ? initialLead.workAddress.workArea : '');
  const [workCity, setWorkCity] = useState(initialLead ? initialLead.workAddress.city : 'Ahmedabad');
  const [workState, setWorkState] = useState(initialLead ? initialLead.workAddress.state : 'Gujarat');
  const [workPincode, setWorkPincode] = useState(initialLead ? initialLead.workAddress.pincode : '');
  const [designation, setDesignation] = useState(initialLead ? (initialLead.workAddress.designation || '') : '');

  // Property Requirement
  const [reqType, setReqType] = useState<RequirementType>(
    initialLead ? initialLead.propertyRequirement.requirementType : 'Residential'
  );
  const [prefUnit, setPrefUnit] = useState(
    initialLead ? initialLead.propertyRequirement.preferredUnit : (units[1]?.name || '3 BHK Premium Apartment')
  );
  const [prefLocation, setPrefLocation] = useState(initialLead ? (initialLead.propertyRequirement.preferredLocation || '') : '');
  const [minBudget, setMinBudget] = useState<string>(
    initialLead && initialLead.propertyRequirement.minBudget ? String(initialLead.propertyRequirement.minBudget) : ''
  );
  const [maxBudget, setMaxBudget] = useState<string>(
    initialLead && initialLead.propertyRequirement.maxBudget ? String(initialLead.propertyRequirement.maxBudget) : ''
  );
  const [minSize, setMinSize] = useState<string>(
    initialLead && initialLead.propertyRequirement.minSize ? String(initialLead.propertyRequirement.minSize) : ''
  );
  const [maxSize, setMaxSize] = useState<string>(
    initialLead && initialLead.propertyRequirement.maxSize ? String(initialLead.propertyRequirement.maxSize) : ''
  );
  const [purchaseTimeline, setPurchaseTimeline] = useState<PurchaseTimeline>(
    initialLead ? initialLead.propertyRequirement.purchaseTimeline : '0–30 Days'
  );

  // Financial / Purchase Profile
  const [approxBudget, setApproxBudget] = useState<string>(
    initialLead && initialLead.financialProfile.approxBudget ? String(initialLead.financialProfile.approxBudget) : ''
  );
  const [fundingType, setFundingType] = useState<FundingType>(
    initialLead ? initialLead.financialProfile.fundingType : 'Partly Loan'
  );
  const [existingProperty, setExistingProperty] = useState(initialLead ? (initialLead.financialProfile.existingProperty || '') : '');
  const [sellingExisting, setSellingExisting] = useState(initialLead ? (initialLead.financialProfile.sellingExistingProperty || 'No') : 'No');
  const [investmentPurpose, setInvestmentPurpose] = useState(initialLead ? (initialLead.financialProfile.investmentPurpose || 'End Use for Family') : 'End Use for Family');
  const [decisionMaker, setDecisionMaker] = useState(initialLead ? (initialLead.financialProfile.decisionMaker || 'Self') : 'Self');
  const [familyInvolvement, setFamilyInvolvement] = useState(initialLead ? (initialLead.financialProfile.familyInvolvement || 'High') : 'High');
  const [purchaseUrgency, setPurchaseUrgency] = useState(initialLead ? (initialLead.financialProfile.purchaseUrgency || 'High') : 'High');

  // Assignment
  const [selectedTeamId, setSelectedTeamId] = useState(
    initialLead ? initialLead.teamId : (teams[0]?.id || '')
  );
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(
    initialLead ? initialLead.executiveId : ''
  );

  // Initial Contact
  const [contactMode, setContactMode] = useState<ModeOfContact>(
    initialLead ? initialLead.initialContact.modeOfContact : 'Phone Call'
  );
  const [firstContactDate, setFirstContactDate] = useState(
    initialLead ? initialLead.initialContact.firstContactDate : today
  );
  const [referredBy, setReferredBy] = useState(
    initialLead ? (initialLead.initialContact.referredBy || '') : ''
  );
  const [initialNotes, setInitialNotes] = useState(
    initialLead ? (initialLead.initialContact.initialNotes || '') : ''
  );
  const [managementNotes, setManagementNotes] = useState(
    initialLead ? (initialLead.managementNotes || '') : ''
  );

  // Initial Follow-up on creation
  const [createInitialFollowup, setCreateInitialFollowup] = useState(false);
  const [initialFollowupRemark, setInitialFollowupRemark] = useState('');
  const [initialNextFollowupDate, setInitialNextFollowupDate] = useState('');

  // Form State
  const [activeSection, setActiveSection] = useState<'all' | 'customer' | 'requirement' | 'financial' | 'assignment'>('all');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate next Lead ID if creating new
  useEffect(() => {
    if (!isEditing && !leadId) {
      // preview ID without incrementing storage counter yet
      const settings = storage.getSettings();
      const prefix = settings.leadIdPrefix || 'BTG';
      const num = settings.nextLeadNumber || 1;
      setLeadId(`${prefix}-${String(num).padStart(6, '0')}`);
    }
  }, [isEditing, leadId]);

  // Sync executives based on selected team
  const filteredExecutives = allExecutives.filter(e => e.teamId === selectedTeamId);

  useEffect(() => {
    if (!selectedExecutiveId || !filteredExecutives.some(e => e.id === selectedExecutiveId)) {
      if (filteredExecutives.length > 0) {
        setSelectedExecutiveId(filteredExecutives[0].id);
      } else {
        setSelectedExecutiveId('');
      }
    }
  }, [selectedTeamId, filteredExecutives, selectedExecutiveId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Customer Name is required';
    if (!mobile.trim()) {
      errs.mobile = 'Mobile Number is required';
    } else if (mobile.trim().length < 8) {
      errs.mobile = 'Enter a valid mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (shouldPrint = false) => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      const selectedExec = allExecutives.find(e => e.id === selectedExecutiveId);

      const parsedLeadData = {
        leadId: isEditing ? leadId : storage.generateNextLeadId(), // finalize generated ID
        leadDate,
        leadSource,
        interestedProject,
        status,
        priority,

        customerDetails: {
          name: name.trim(),
          mobile: mobile.trim(),
          altMobile: altMobile.trim() || undefined,
          whatsapp: whatsapp.trim() || mobile.trim(),
          email: email.trim() || undefined,
          dob: dob || undefined,
          occupation: occupation.trim() || undefined,
          companyName: companyName.trim() || undefined,
          customerType,
        },

        residentialAddress: {
          address: resAddress.trim(),
          area: resArea.trim(),
          city: resCity.trim(),
          state: resState.trim(),
          pincode: resPincode.trim(),
        },

        workAddress: {
          company: workCompany.trim(),
          workAddress: workAddress.trim(),
          workArea: workArea.trim(),
          city: workCity.trim(),
          state: workState.trim(),
          pincode: workPincode.trim(),
          designation: designation.trim() || undefined,
        },

        propertyRequirement: {
          requirementType: reqType,
          preferredUnit: prefUnit,
          interestedProject,
          preferredLocation: prefLocation.trim() || undefined,
          minBudget: minBudget ? parseFloat(minBudget) : undefined,
          maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
          minSize: minSize ? parseFloat(minSize) : undefined,
          maxSize: maxSize ? parseFloat(maxSize) : undefined,
          purchaseTimeline,
        },

        financialProfile: {
          approxBudget: approxBudget ? parseFloat(approxBudget) : undefined,
          fundingType,
          existingProperty: existingProperty.trim() || undefined,
          sellingExistingProperty: sellingExisting,
          investmentPurpose: investmentPurpose.trim() || undefined,
          decisionMaker: decisionMaker.trim() || 'Self',
          familyInvolvement,
          purchaseUrgency,
        },

        teamId: selectedTeamId,
        teamName: selectedTeam?.teamName || 'Unassigned',
        executiveId: selectedExecutiveId,
        executiveName: selectedExec?.name || 'Unassigned',
        assignedDate: isEditing ? initialLead!.assignedDate : today,

        initialContact: {
          modeOfContact: contactMode,
          firstContactDate,
          referredBy: referredBy.trim() || undefined,
          initialNotes: initialNotes.trim() || undefined,
        },

        managementNotes: managementNotes.trim() || undefined,
      };

      let savedLead: Lead;
      if (isEditing && initialLead) {
        savedLead = storage.updateLead(initialLead.id, parsedLeadData)!;
      } else {
        const initialFollow = createInitialFollowup && initialFollowupRemark.trim()
          ? {
              remark: initialFollowupRemark.trim(),
              nextFollowUpDate: initialNextFollowupDate || today,
              modeOfContact: contactMode,
            }
          : undefined;

        savedLead = storage.createLead(parsedLeadData, initialFollow);
      }

      onSaveSuccess(savedLead, shouldPrint);
    } catch (err) {
      setErrors({ form: 'Unable to save lead. Please check your inputs and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600/30 text-blue-300 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-blue-500/40">
              {leadId}
            </span>
            <h2 className="text-base font-bold">
              {isEditing ? `Edit Customer Lead: ${initialLead?.customerDetails.name}` : 'Create New Customer Lead'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Organized multi-section desktop form with automatic ID generation and filtered executive assignment
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
          >
            Cancel
          </button>
          {!isEditing && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Save & Print A4</span>
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="flex items-center space-x-1.5 px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditing ? 'Update Lead' : 'Save Lead'}</span>
          </button>
        </div>
      </div>

      {errors.form && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-red-700 text-xs font-medium">
          {errors.form}
        </div>
      )}

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Section 1: Lead Identification & Assignment (Top Priority Grid) */}
        <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Lead Identification & Team Assignment</span>
          </h3>

          <div className="grid grid-cols-6 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Lead ID (Auto)</label>
              <input
                type="text"
                value={leadId}
                disabled
                className="w-full bg-slate-200 border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-slate-800 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Lead Date</label>
              <input
                type="date"
                value={leadDate}
                onChange={(e) => setLeadDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Interested Project</label>
              <select
                value={interestedProject}
                onChange={(e) => setInterestedProject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.projectName}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Lead Source</label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
              >
                {leadSources.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Lead Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500"
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
          </div>

          {/* Assignment Dropdowns Filtered by Team */}
          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assign Team <span className="text-blue-600">*</span>
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assign Sales Executive (Filtered) <span className="text-blue-600">*</span>
              </label>
              <select
                value={selectedExecutiveId}
                onChange={(e) => setSelectedExecutiveId(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded px-2.5 py-1.5 font-bold text-blue-900 focus:ring-1 focus:ring-blue-500"
              >
                {filteredExecutives.length === 0 ? (
                  <option value="">No executives in this team</option>
                ) : (
                  filteredExecutives.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Automatically filtered to members of {teams.find(t => t.id === selectedTeamId)?.teamName || 'selected team'}
              </p>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Initial Mode of Contact</label>
              <select
                value={contactMode}
                onChange={(e) => setContactMode(e.target.value as ModeOfContact)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Office Visit">Office Visit</option>
                <option value="Video Call">Video Call</option>
                <option value="Reference Meeting">Reference Meeting</option>
                <option value="Email">Email</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Customer Personal Details */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Customer Personal Details</span>
          </h3>

          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Rajesh Kumar"
                className={`w-full px-2.5 py-1.5 rounded border focus:ring-1 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (errors.mobile) setErrors({ ...errors, mobile: '' });
                }}
                placeholder="e.g. 9825012345"
                className={`w-full px-2.5 py-1.5 rounded border font-mono ${
                  errors.mobile ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.mobile && <p className="text-[10px] text-red-600 mt-0.5">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Alternate Mobile Number</label>
              <input
                type="tel"
                value={altMobile}
                onChange={(e) => setAltMobile(e.target.value)}
                placeholder="Optional secondary contact"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Leave blank if same as mobile"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rajesh@example.com"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Occupation / Profession</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. IT Director, Architect, Merchant"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              >
                <option value="Salaried">Salaried</option>
                <option value="Business">Business</option>
                <option value="Professional">Professional</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Investor">Investor</option>
                <option value="NRI">NRI</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Address Details (Residential & Work) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Residential Address */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3A</span>
              <span>Residential Address</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">House / Flat / Society Address</label>
                <input
                  type="text"
                  value={resAddress}
                  onChange={(e) => setResAddress(e.target.value)}
                  placeholder="e.g. B-402, Shivalik Residency, Judges Bunglow Rd"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={resArea}
                    onChange={(e) => setResArea(e.target.value)}
                    placeholder="e.g. Bodakdev"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={resCity}
                    onChange={(e) => setResCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={resState}
                    onChange={(e) => setResState(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={resPincode}
                    onChange={(e) => setResPincode(e.target.value)}
                    placeholder="e.g. 380054"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work / Business Address */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3B</span>
              <span>Work / Business Address</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={workCompany}
                    onChange={(e) => setWorkCompany(e.target.value)}
                    placeholder="e.g. Apex Tech Solutions Ltd."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. VP Engineering, Managing Partner"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Office / Business Address</label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  placeholder="e.g. 8th Floor, Pinnacle Business Park"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Work Area</label>
                  <input
                    type="text"
                    value={workArea}
                    onChange={(e) => setWorkArea(e.target.value)}
                    placeholder="e.g. Prahlad Nagar"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={workCity}
                    onChange={(e) => setWorkCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={workPincode}
                    onChange={(e) => setWorkPincode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Property Requirement & Financial Profile */}
        <div className="grid grid-cols-2 gap-6">
          {/* Property Requirement */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Property Requirement</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Requirement Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as RequirementType)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500 font-medium"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Investment">Investment</option>
                  <option value="Office">Office</option>
                  <option value="Shop">Shop</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Preferred Unit</label>
                <select
                  value={prefUnit}
                  onChange={(e) => setPrefUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500 font-semibold text-slate-800"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Preferred Location / View / Orientation</label>
                <input
                  type="text"
                  value={prefLocation}
                  onChange={(e) => setPrefLocation(e.target.value)}
                  placeholder="e.g. Higher floor with garden view, east-facing"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Min Budget (₹)</label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="e.g. 12500000"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="e.g. 15000000"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Size (Sq.Ft)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-2 py-1.5 rounded border border-slate-300 font-mono text-center"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-2 py-1.5 rounded border border-slate-300 font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Purchase Timeline</label>
                <select
                  value={purchaseTimeline}
                  onChange={(e) => setPurchaseTimeline(e.target.value as PurchaseTimeline)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500 font-medium text-slate-800"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="0–30 Days">0–30 Days</option>
                  <option value="1–3 Months">1–3 Months</option>
                  <option value="3–6 Months">3–6 Months</option>
                  <option value="6–12 Months">6–12 Months</option>
                  <option value="Future">Future</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">5</span>
              <span>Financial / Purchase Profile</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Approximate Budget (₹)</label>
                <input
                  type="number"
                  value={approxBudget}
                  onChange={(e) => setApproxBudget(e.target.value)}
                  placeholder="e.g. 14000000"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-semibold text-emerald-800 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Funding Type</label>
                <select
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value as FundingType)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                >
                  <option value="Self Funded">Self Funded</option>
                  <option value="Loan">Loan</option>
                  <option value="Partly Loan">Partly Loan</option>
                  <option value="To Be Decided">To Be Decided</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Owns Existing Property?</label>
                <input
                  type="text"
                  value={existingProperty}
                  onChange={(e) => setExistingProperty(e.target.value)}
                  placeholder="e.g. Owns 2 BHK in Satellite"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Selling Existing Property?</label>
                <select
                  value={sellingExisting}
                  onChange={(e) => setSellingExisting(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Undecided">Undecided</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Decision Maker</label>
                <input
                  type="text"
                  value={decisionMaker}
                  onChange={(e) => setDecisionMaker(e.target.value)}
                  placeholder="e.g. Self & Spouse, Father"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Purchase Urgency</label>
                <select
                  value={purchaseUrgency}
                  onChange={(e) => setPurchaseUrgency(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Investment / Usage Purpose</label>
                <input
                  type="text"
                  value={investmentPurpose}
                  onChange={(e) => setInvestmentPurpose(e.target.value)}
                  placeholder="e.g. End use for self & family, Rental return, Upgrade"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Initial Contact & Notes */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 mb-3 border-b border-slate-200 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">6</span>
            <span>Initial Contact Details & Management Notes</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Referred By / Contact Source Detail</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="e.g. Dr. Manish Trivedi, Hoarding at Cross Road"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">First Contact Date</label>
              <input
                type="date"
                value={firstContactDate}
                onChange={(e) => setFirstContactDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Initial Contact Notes</label>
              <textarea
                rows={2}
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
                placeholder="Brief summary of initial phone or in-person greeting..."
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Internal Management Notes (Prints on A4 File)</label>
              <textarea
                rows={2}
                value={managementNotes}
                onChange={(e) => setManagementNotes(e.target.value)}
                placeholder="Observations, VIP requirements, special price leeway..."
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional: Add first follow-up entry right now if creating new lead */}
          {!isEditing && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createInitialFollowup}
                  onChange={(e) => setCreateInitialFollowup(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Log first follow-up entry immediately upon saving lead</span>
              </label>

              {createInitialFollowup && (
                <div className="grid grid-cols-3 gap-3 mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      First Follow-up Remark <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={initialFollowupRemark}
                      onChange={(e) => setInitialFollowupRemark(e.target.value)}
                      placeholder="e.g. Called customer. Discussed 3 BHK layouts and sent brochure on WhatsApp."
                      className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Next Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={initialNextFollowupDate}
                      onChange={(e) => setInitialNextFollowupDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            * Customer Name & Mobile are required. Lead ID is automatically generated.
          </p>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {!isEditing && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Save & Print A4 Sheet</span>
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="flex items-center space-x-1.5 px-6 py-2 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Update Customer Lead' : 'Save Customer Lead'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
