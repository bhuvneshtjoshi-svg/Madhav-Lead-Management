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
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  Phone,
  Plus,
  PlusCircle,
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
  onViewLead?: (leadId: string) => void;
}

export const NewLeadForm: React.FC<NewLeadFormProps> = ({
  initialLead,
  onSaveSuccess,
  onCancel,
  onViewLead,
}) => {
  const isEditing = Boolean(initialLead);
  const today = getTodayDateString();

  // Master lists from storage
  const [teams, setTeams] = useState(storage.getTeams().filter(t => t.active));
  const [allExecutives, setAllExecutives] = useState(storage.getExecutives().filter(e => e.active));
  const [projects, setProjects] = useState(storage.getProjects().filter(p => p.active));
  const [leadSources, setLeadSources] = useState(storage.getLeadSources().filter(s => s.active));
  const [units, setUnits] = useState(storage.getPreferredUnits().filter(u => u.active));

  // Quick Inline Master Creation Modals
  const [showQuickProjectModal, setShowQuickProjectModal] = useState(false);
  const [quickProjectName, setQuickProjectName] = useState('');
  const [quickProjectLocation, setQuickProjectLocation] = useState('');

  const [showQuickTeamModal, setShowQuickTeamModal] = useState(false);
  const [quickTeamName, setQuickTeamName] = useState('');
  const [quickExecName, setQuickExecName] = useState('');

  // Lead Identification
  const [leadId, setLeadId] = useState(initialLead ? initialLead.leadId : '');
  const [leadDate, setLeadDate] = useState(initialLead ? initialLead.leadDate : today);
  const [leadSource, setLeadSource] = useState(initialLead ? initialLead.leadSource : (leadSources[0]?.name || 'Reference'));
  const [interestedProject, setInterestedProject] = useState(
    initialLead ? initialLead.interestedProject : (projects[0]?.projectName || '')
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

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    matchedLead?: Lead;
    matchReason?: string;
  } | null>(null);
  const [dismissDuplicate, setDismissDuplicate] = useState(false);

  // Address Details - Residential
  const [resAddress, setResAddress] = useState(initialLead ? initialLead.residentialAddress.address : '');
  const [resArea, setResArea] = useState(initialLead ? initialLead.residentialAddress.area : '');
  const [resCity, setResCity] = useState(initialLead ? initialLead.residentialAddress.city : '');
  const [resState, setResState] = useState(initialLead ? initialLead.residentialAddress.state : '');
  const [resPincode, setResPincode] = useState(initialLead ? initialLead.residentialAddress.pincode : '');

  // Address Details - Work
  const [workCompany, setWorkCompany] = useState(initialLead ? initialLead.workAddress.company : '');
  const [workAddress, setWorkAddress] = useState(initialLead ? initialLead.workAddress.workAddress : '');
  const [workArea, setWorkArea] = useState(initialLead ? initialLead.workAddress.workArea : '');
  const [workCity, setWorkCity] = useState(initialLead ? initialLead.workAddress.city : '');
  const [workState, setWorkState] = useState(initialLead ? initialLead.workAddress.state : '');
  const [workPincode, setWorkPincode] = useState(initialLead ? initialLead.workAddress.pincode : '');
  const [designation, setDesignation] = useState(initialLead ? (initialLead.workAddress.designation || '') : '');

  // Property Requirement
  const [reqType, setReqType] = useState<RequirementType>(
    initialLead ? initialLead.propertyRequirement.requirementType : 'Residential'
  );
  const [prefUnit, setPrefUnit] = useState(
    initialLead ? initialLead.propertyRequirement.preferredUnit : (units[0]?.name || '')
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
    initialLead ? initialLead.financialProfile.fundingType : 'Self Funded'
  );
  const [existingProperty, setExistingProperty] = useState(initialLead ? (initialLead.financialProfile.existingProperty || '') : '');
  const [sellingExisting, setSellingExisting] = useState(initialLead ? (initialLead.financialProfile.sellingExistingProperty || 'No') : 'No');
  const [investmentPurpose, setInvestmentPurpose] = useState(initialLead ? (initialLead.financialProfile.investmentPurpose || '') : '');
  const [decisionMaker, setDecisionMaker] = useState(initialLead ? (initialLead.financialProfile.decisionMaker || 'Self') : 'Self');
  const [familyInvolvement, setFamilyInvolvement] = useState(initialLead ? (initialLead.financialProfile.familyInvolvement || 'Medium') : 'Medium');
  const [purchaseUrgency, setPurchaseUrgency] = useState(initialLead ? (initialLead.financialProfile.purchaseUrgency || 'Normal') : 'Normal');

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate next Lead ID preview if creating new
  useEffect(() => {
    if (!isEditing && !leadId) {
      const settings = storage.getSettings();
      const prefix = settings.leadIdPrefix || 'BM';
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

  // Duplicate Check logic
  const performDuplicateCheck = (currMobile: string, currWhatsapp: string, currName: string) => {
    if (dismissDuplicate || isEditing) return;
    if (currMobile.trim().length >= 8 || currWhatsapp.trim().length >= 8) {
      const res = storage.checkDuplicateLead(currMobile, currWhatsapp, currName, initialLead?.id);
      if (res.isDuplicate) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleMobileChange = (val: string) => {
    setMobile(val);
    if (errors.mobile) setErrors({ ...errors, mobile: '' });
    performDuplicateCheck(val, whatsapp, name);
  };

  const handleWhatsAppChange = (val: string) => {
    setWhatsapp(val);
    performDuplicateCheck(mobile, val, name);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) setErrors({ ...errors, name: '' });
    performDuplicateCheck(mobile, whatsapp, val);
  };

  // Quick Project Add
  const handleQuickAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProjectName.trim()) return;
    const newProj = storage.addProject(quickProjectName.trim(), quickProjectLocation.trim() || 'Prime Location');
    const updated = storage.getProjects().filter(p => p.active);
    setProjects(updated);
    setInterestedProject(newProj.projectName);
    setShowQuickProjectModal(false);
    setQuickProjectName('');
    setQuickProjectLocation('');
  };

  // Quick Team & Executive Add
  const handleQuickAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTeamName.trim()) return;
    const newTeam = storage.addTeam(quickTeamName.trim());
    let newExec = null;
    if (quickExecName.trim()) {
      newExec = storage.addExecutive({
        name: quickExecName.trim(),
        teamId: newTeam.id,
        teamName: newTeam.teamName,
        active: true,
      });
    }
    const updatedTeams = storage.getTeams().filter(t => t.active);
    const updatedExecs = storage.getExecutives().filter(e => e.active);
    setTeams(updatedTeams);
    setAllExecutives(updatedExecs);
    setSelectedTeamId(newTeam.id);
    if (newExec) {
      setSelectedExecutiveId(newExec.id);
    }
    setShowQuickTeamModal(false);
    setQuickTeamName('');
    setQuickExecName('');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Customer Name is required';
    if (!mobile.trim()) {
      errs.mobile = 'Mobile Number is required';
    } else if (mobile.trim().length < 8) {
      errs.mobile = 'Please enter a valid mobile number (min 8 digits)';
    }

    if (email.trim() && !email.includes('@')) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (shouldPrint = false) => {
    if (!validate()) return;

    // Duplicate protection check
    if (!isEditing && !dismissDuplicate) {
      const dup = storage.checkDuplicateLead(mobile, whatsapp, name);
      if (dup.isDuplicate) {
        setDuplicateWarning(dup);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      const selectedExec = allExecutives.find(e => e.id === selectedExecutiveId);

      const parsedLeadData = {
        leadId: isEditing ? leadId : storage.generateNextLeadId(),
        leadDate,
        leadSource: leadSource || 'Other',
        interestedProject: interestedProject || 'Unspecified',
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
          interestedProject: interestedProject || 'Unspecified',
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

        teamId: selectedTeamId || '',
        teamName: selectedTeam?.teamName || 'Unassigned',
        executiveId: selectedExecutiveId || '',
        executiveName: selectedExec?.name || 'Unassigned',
        assignedDate: isEditing ? initialLead!.assignedDate : today,

        initialContact: {
          modeOfContact: contactMode,
          firstContactDate,
          referredBy: referredBy.trim() || undefined,
          initialNotes: initialNotes.trim() || undefined,
        },

        managementNotes: managementNotes.trim() || undefined,
        archived: false,
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
      setErrors({ form: 'Unable to save the lead. Please try again. Your existing data has not been changed.' });
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
            Organized multi-section form with automatic Lead ID and duplicate customer protection
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

      {/* Duplicate Protection Warning Banner */}
      {duplicateWarning && duplicateWarning.isDuplicate && duplicateWarning.matchedLead && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                A similar customer already exists
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {duplicateWarning.matchReason}: Existing Lead <span className="font-mono font-bold">{duplicateWarning.matchedLead.leadId}</span> belongs to <span className="font-bold">{duplicateWarning.matchedLead.customerDetails.name}</span> ({duplicateWarning.matchedLead.customerDetails.mobile}).
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Please verify if this is an update to an existing customer record rather than a new duplicate.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            {onViewLead && (
              <button
                type="button"
                onClick={() => onViewLead(duplicateWarning.matchedLead!.id)}
                className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded text-xs font-semibold hover:bg-amber-100 flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Review Existing Lead</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setDismissDuplicate(true)}
              className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-red-700 text-xs font-medium">
          {errors.form}
        </div>
      )}

      {/* Real-world Master Data notices if zero exist */}
      {(projects.length === 0 || teams.length === 0) && (
        <div className="bg-blue-50/70 border-b border-blue-200 px-6 py-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {projects.length === 0 && teams.length === 0
                ? 'Tip: You can create your real Projects, Teams, and Sales Executives right here on the fly.'
                : projects.length === 0
                ? 'Tip: No projects added yet. Click "+ Add Project" to define your first real estate project.'
                : 'Tip: No teams added yet. Click "+ Add Team" to define sales teams for lead assignment.'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {projects.length === 0 && (
              <button
                type="button"
                onClick={() => setShowQuickProjectModal(true)}
                className="px-2.5 py-1 bg-white border border-blue-300 rounded font-semibold text-blue-700 hover:bg-blue-50 text-[11px]"
              >
                + Add Project
              </button>
            )}
            {teams.length === 0 && (
              <button
                type="button"
                onClick={() => setShowQuickTeamModal(true)}
                className="px-2.5 py-1 bg-white border border-blue-300 rounded font-semibold text-blue-700 hover:bg-blue-50 text-[11px]"
              >
                + Add Team & Exec
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Section 1: Lead Identification & Assignment */}
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
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-600 font-medium">Interested Project</label>
                <button
                  type="button"
                  onClick={() => setShowQuickProjectModal(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                >
                  + New
                </button>
              </div>
              <select
                value={interestedProject}
                onChange={(e) => setInterestedProject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {projects.length === 0 ? (
                  <option value="">(No projects yet - click + New)</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.projectName}>
                      {p.projectName}
                    </option>
                  ))
                )}
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
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-700 font-semibold">
                  Assign Team
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickTeamModal(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                >
                  + New Team
                </button>
              </div>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {teams.length === 0 ? (
                  <option value="">(No teams created yet)</option>
                ) : (
                  teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assign Sales Executive (Filtered)
              </label>
              <select
                value={selectedExecutiveId}
                onChange={(e) => setSelectedExecutiveId(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded px-2.5 py-1.5 font-bold text-blue-900 focus:ring-1 focus:ring-blue-500"
              >
                {filteredExecutives.length === 0 ? (
                  <option value="">(No executives in this team)</option>
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Full Customer Name"
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
                onChange={(e) => handleMobileChange(e.target.value)}
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
                placeholder="Secondary contact"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="Leave blank if same as mobile"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="e.g. customer@example.com"
                className={`w-full px-2.5 py-1.5 rounded border ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
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
                placeholder="e.g. IT Director, Architect, Doctor"
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
                  placeholder="Street / Society address"
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
                    placeholder="Area name"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={resCity}
                    onChange={(e) => setResCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={resState}
                    onChange={(e) => setResState(e.target.value)}
                    placeholder="State"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={resPincode}
                    onChange={(e) => setResPincode(e.target.value)}
                    placeholder="Postal PIN"
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
                    placeholder="Employer or Business"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Job Title"
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
                  placeholder="Office premise address"
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
                    placeholder="Area"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={workCity}
                    onChange={(e) => setWorkCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={workPincode}
                    onChange={(e) => setWorkPincode(e.target.value)}
                    placeholder="PIN Code"
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
                  placeholder="Min budget"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max budget"
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
                  placeholder="Budget"
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
                  placeholder="Details of existing property"
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
                  placeholder="e.g. Self, Family, Joint"
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
                  placeholder="e.g. End use for self, Rental return, Upgrade"
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
                placeholder="Reference person or advertisement location"
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
                placeholder="Summary of initial greeting or discussion..."
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Internal Management Notes (Prints on A4 File)</label>
              <textarea
                rows={2}
                value={managementNotes}
                onChange={(e) => setManagementNotes(e.target.value)}
                placeholder="Management observations, negotiation leeway..."
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
                      placeholder="e.g. Spoke with client, shared project details, scheduled site meeting."
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
            * Customer Name & Mobile are required. Lead ID will be generated uniquely.
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

      {/* Quick Add Project Modal */}
      {showQuickProjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center text-xs font-bold">
              <span>Add Real Project</span>
              <button onClick={() => setShowQuickProjectModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleQuickAddProject} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  value={quickProjectName}
                  onChange={(e) => setQuickProjectName(e.target.value)}
                  placeholder="e.g. Riverfront Terraces"
                  required
                  autoFocus
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={quickProjectLocation}
                  onChange={(e) => setQuickProjectLocation(e.target.value)}
                  placeholder="e.g. West Coast Road"
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickProjectModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Team & Executive Modal */}
      {showQuickTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center text-xs font-bold">
              <span>Create Sales Team & Executive</span>
              <button onClick={() => setShowQuickTeamModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleQuickAddTeam} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Team Name *</label>
                <input
                  type="text"
                  value={quickTeamName}
                  onChange={(e) => setQuickTeamName(e.target.value)}
                  placeholder="e.g. Residential Sales Team 1"
                  required
                  autoFocus
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Initial Sales Executive Name</label>
                <input
                  type="text"
                  value={quickExecName}
                  onChange={(e) => setQuickExecName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickTeamModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
