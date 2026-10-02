export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Site Visit Planned'
  | 'Site Visit Done'
  | 'Negotiation'
  | 'Booking'
  | 'Converted'
  | 'Future'
  | 'Lost'
  | 'Not Interested';

export type CustomerType =
  | 'Salaried'
  | 'Business'
  | 'Professional'
  | 'Self Employed'
  | 'Investor'
  | 'NRI'
  | 'Other';

export type RequirementType =
  | 'Residential'
  | 'Commercial'
  | 'Investment'
  | 'Office'
  | 'Shop'
  | 'Other';

export type PurchaseTimeline =
  | 'Immediate'
  | '0–30 Days'
  | '1–3 Months'
  | '3–6 Months'
  | '6–12 Months'
  | 'Future';

export type FundingType =
  | 'Self Funded'
  | 'Loan'
  | 'Partly Loan'
  | 'To Be Decided';

export type ModeOfContact =
  | 'Phone Call'
  | 'WhatsApp'
  | 'Site Visit'
  | 'Office Visit'
  | 'Video Call'
  | 'Reference Meeting'
  | 'Email'
  | 'Other';

export interface FollowUp {
  id: string;
  leadId: string;
  followUpNumber: number;
  date: string; // YYYY-MM-DD
  remark: string;
  modeOfContact: ModeOfContact;
  nextFollowUpDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  altMobile?: string;
  whatsapp?: string;
  email?: string;
  dob?: string;
  occupation?: string;
  companyName?: string;
  customerType: CustomerType;
}

export interface AddressDetails {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface WorkAddressDetails {
  company: string;
  workAddress: string;
  workArea: string;
  city: string;
  state: string;
  pincode: string;
  designation?: string;
}

export interface PropertyRequirement {
  requirementType: RequirementType;
  preferredUnit: string; // e.g. "3 BHK", "2 BHK", "Shop"
  interestedProject: string;
  preferredLocation?: string;
  minBudget?: number;
  maxBudget?: number;
  minSize?: number;
  maxSize?: number;
  purchaseTimeline: PurchaseTimeline;
}

export interface FinancialProfile {
  approxBudget?: number;
  fundingType: FundingType;
  existingProperty?: string; // Yes / No or description
  sellingExistingProperty?: string; // Yes / No
  investmentPurpose?: string; // End Use / Investment / Rental
  decisionMaker?: string; // Self / Family / Joint
  familyInvolvement?: string; // High / Medium / Low
  purchaseUrgency?: string; // High / Medium / Low
}

export interface InitialContact {
  modeOfContact: ModeOfContact;
  firstContactDate: string;
  referredBy?: string;
  initialNotes?: string;
}

export interface Lead {
  id: string;
  leadId: string; // e.g. "BTG-000125"
  leadDate: string; // YYYY-MM-DD
  leadSource: string;
  interestedProject: string;
  status: LeadStatus;
  priority: LeadPriority;

  customerDetails: CustomerDetails;
  residentialAddress: AddressDetails;
  workAddress: WorkAddressDetails;
  propertyRequirement: PropertyRequirement;
  financialProfile: FinancialProfile;

  teamId: string;
  teamName: string;
  executiveId: string;
  executiveName: string;
  assignedDate: string;

  initialContact: InitialContact;
  managementNotes?: string;

  // Cached summary fields for fast filtering and reporting
  lastFollowUpDate?: string;
  lastFollowUpRemark?: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  followUpCount: number;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Team {
  id: string;
  teamName: string;
  active: boolean;
}

export interface Executive {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  mobile?: string;
  email?: string;
  active: boolean;
}

export interface Project {
  id: string;
  projectName: string;
  location: string;
  active: boolean;
}

export interface LeadSource {
  id: string;
  name: string;
  active: boolean;
}

export interface PreferredUnit {
  id: string;
  name: string;
  category: string; // Residential / Commercial
  active: boolean;
}

export interface AppSettings {
  leadIdPrefix: string;
  nextLeadNumber: number;
  companyName: string;
  currencySymbol: string;
  defaultFollowupDays: number;
  dateFormat: 'DD-MM-YYYY' | 'YYYY-MM-DD';
}

export interface AppDataBackup {
  version: string;
  exportDate: string;
  leads: Lead[];
  followUps: FollowUp[];
  teams: Team[];
  executives: Executive[];
  projects: Project[];
  leadSources: LeadSource[];
  preferredUnits: PreferredUnit[];
  settings: AppSettings;
}
