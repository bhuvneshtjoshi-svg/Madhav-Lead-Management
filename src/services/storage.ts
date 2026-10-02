import {
  AppDataBackup,
  AppSettings,
  Executive,
  FollowUp,
  Lead,
  LeadSource,
  PreferredUnit,
  Project,
  Team,
} from '../types';

const STORAGE_KEYS = {
  LEADS: 'bm_leads_v1',
  FOLLOW_UPS: 'bm_followups_v1',
  TEAMS: 'bm_teams_v1',
  EXECUTIVES: 'bm_executives_v1',
  PROJECTS: 'bm_projects_v1',
  LEAD_SOURCES: 'bm_lead_sources_v1',
  PREFERRED_UNITS: 'bm_units_v1',
  SETTINGS: 'bm_settings_v1',
  INITIALIZED: 'bm_initialized_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  leadIdPrefix: 'BTG',
  nextLeadNumber: 131,
  companyName: 'BM Real Estate & Marketing',
  currencySymbol: '₹',
  defaultFollowupDays: 3,
  dateFormat: 'DD-MM-YYYY',
};

// Helper: Format date string YYYY-MM-DD to DD-MM-YYYY for display
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
}

// Helper: Get today's ISO date string YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Calculate days difference (Target Date - Today)
// If target < today, returns positive days overdue
export function getDaysOverdue(targetDateStr?: string, todayStr?: string): number {
  if (!targetDateStr) return 0;
  const today = todayStr || getTodayDateString();
  const target = new Date(targetDateStr).getTime();
  const curr = new Date(today).getTime();
  const diffTime = curr - target;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Initial Master Data
const INITIAL_TEAMS: Team[] = [
  { id: 'team-1', teamName: 'Team A', active: true },
  { id: 'team-2', teamName: 'Team B', active: true },
];

const INITIAL_EXECUTIVES: Executive[] = [
  {
    id: 'exec-1',
    name: 'Rahul Sharma',
    teamId: 'team-1',
    teamName: 'Team A',
    mobile: '9820011223',
    email: 'rahul.sharma@bmleads.com',
    active: true,
  },
  {
    id: 'exec-2',
    name: 'Amit Patel',
    teamId: 'team-1',
    teamName: 'Team A',
    mobile: '9820022334',
    email: 'amit.patel@bmleads.com',
    active: true,
  },
  {
    id: 'exec-3',
    name: 'Jay Mehta',
    teamId: 'team-1',
    teamName: 'Team A',
    mobile: '9820033445',
    email: 'jay.mehta@bmleads.com',
    active: true,
  },
  {
    id: 'exec-4',
    name: 'Sameer Shah',
    teamId: 'team-2',
    teamName: 'Team B',
    mobile: '9820044556',
    email: 'sameer.shah@bmleads.com',
    active: true,
  },
  {
    id: 'exec-5',
    name: 'Raj Joshi',
    teamId: 'team-2',
    teamName: 'Team B',
    mobile: '9820055667',
    email: 'raj.joshi@bmleads.com',
    active: true,
  },
  {
    id: 'exec-6',
    name: 'Karan Patel',
    teamId: 'team-2',
    teamName: 'Team B',
    mobile: '9820066778',
    email: 'karan.patel@bmleads.com',
    active: true,
  },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'proj-1', projectName: 'By The Garden', location: 'SG Highway, Bodakdev', active: true },
  { id: 'proj-2', projectName: 'Green Valley Terraces', location: 'Sindhu Bhavan Road', active: true },
  { id: 'proj-3', projectName: 'Royal Solitaire Commercial', location: 'Prahlad Nagar', active: true },
];

const INITIAL_LEAD_SOURCES: LeadSource[] = [
  { id: 'src-1', name: 'Reference', active: true },
  { id: 'src-2', name: 'Walk-in', active: true },
  { id: 'src-3', name: 'Website', active: true },
  { id: 'src-4', name: 'Facebook', active: true },
  { id: 'src-5', name: 'Instagram', active: true },
  { id: 'src-6', name: 'Broker', active: true },
  { id: 'src-7', name: 'Existing Customer', active: true },
  { id: 'src-8', name: 'Digital', active: true },
  { id: 'src-9', name: 'Other', active: true },
];

const INITIAL_UNITS: PreferredUnit[] = [
  { id: 'unit-1', name: '2 BHK Luxury Apartment', category: 'Residential', active: true },
  { id: 'unit-2', name: '3 BHK Premium Apartment', category: 'Residential', active: true },
  { id: 'unit-3', name: '4 BHK Sky Villa', category: 'Residential', active: true },
  { id: 'unit-4', name: 'Penthouse', category: 'Residential', active: true },
  { id: 'unit-5', name: 'Retail Ground Showroom', category: 'Commercial', active: true },
  { id: 'unit-6', name: 'Corporate Office Space', category: 'Commercial', active: true },
  { id: 'unit-7', name: 'Boutique Studio Suite', category: 'Commercial', active: true },
];

// Seed realistic sample leads matching the current date (2026-10-02)
const todayIso = getTodayDateString();

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    leadId: 'BTG-000125',
    leadDate: '2026-09-24',
    leadSource: 'Reference',
    interestedProject: 'By The Garden',
    status: 'Follow-up',
    priority: 'Hot',
    customerDetails: {
      name: 'Rajesh Kumar',
      mobile: '9825012345',
      altMobile: '9426098765',
      whatsapp: '9825012345',
      email: 'rajesh.kumar@infotech.in',
      dob: '1984-06-15',
      occupation: 'IT Director',
      companyName: 'Apex Tech Solutions Ltd.',
      customerType: 'Salaried',
    },
    residentialAddress: {
      address: 'B-402, Shivalik Residency, Near Judges Bunglow',
      area: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
    },
    workAddress: {
      company: 'Apex Tech Solutions Ltd.',
      workAddress: '8th Floor, Pinnacle Business Park, Prahlad Nagar',
      workArea: 'Prahlad Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      designation: 'Director of Engineering',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '3 BHK Premium Apartment',
      interestedProject: 'By The Garden',
      preferredLocation: 'Higher floor with garden view',
      minBudget: 12500000,
      maxBudget: 15000000,
      minSize: 2100,
      maxSize: 2450,
      purchaseTimeline: '0–30 Days',
    },
    financialProfile: {
      approxBudget: 14000000,
      fundingType: 'Partly Loan',
      existingProperty: 'Owns 2 BHK in Satellite',
      sellingExistingProperty: 'No',
      investmentPurpose: 'End Use for self & family',
      decisionMaker: 'Self & Spouse',
      familyInvolvement: 'High',
      purchaseUrgency: 'High',
    },
    teamId: 'team-1',
    teamName: 'Team A',
    executiveId: 'exec-1',
    executiveName: 'Rahul Sharma',
    assignedDate: '2026-09-24',
    initialContact: {
      modeOfContact: 'Phone Call',
      firstContactDate: '2026-09-24',
      referredBy: 'Dr. Manish Trivedi (Tower A-301 resident)',
      initialNotes: 'Referred by existing buyer. Looking for 3 BHK garden facing, ready to decide this month.',
    },
    managementNotes: 'Very genuine buyer with solid budget. Rahul to offer sample flat walkthrough.',
    lastFollowUpDate: '2026-09-30',
    lastFollowUpRemark: 'Customer visited site. Loved 3 BHK layout on 9th floor. Requested pricing breakdown and payment schedule.',
    nextFollowUpDate: todayIso, // Scheduled for TODAY!
    followUpCount: 3,
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-30T16:30:00.000Z',
  },
  {
    id: 'lead-2',
    leadId: 'BTG-000126',
    leadDate: '2026-09-20',
    leadSource: 'Digital',
    interestedProject: 'By The Garden',
    status: 'Follow-up',
    priority: 'Warm',
    customerDetails: {
      name: 'Priya Mehta',
      mobile: '9898011223',
      altMobile: '9727033445',
      whatsapp: '9898011223',
      email: 'priya.mehta@studioarch.com',
      dob: '1989-11-22',
      occupation: 'Principal Architect',
      companyName: 'Studio Arch Design Lab',
      customerType: 'Professional',
    },
    residentialAddress: {
      address: '12, Sunrise Bungalows, Near Drive-In Cinema',
      area: 'Thaltej',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
    },
    workAddress: {
      company: 'Studio Arch Design Lab',
      workAddress: '304, Venus Atlantis, Corporate Road',
      workArea: 'Prahlad Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      designation: 'Founder / Architect',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '4 BHK Sky Villa',
      interestedProject: 'By The Garden',
      preferredLocation: 'Corner unit with natural ventilation',
      minBudget: 19000000,
      maxBudget: 22000000,
      minSize: 3200,
      maxSize: 3600,
      purchaseTimeline: '1–3 Months',
    },
    financialProfile: {
      approxBudget: 21000000,
      fundingType: 'Self Funded',
      existingProperty: 'Owns ancestral bungalow',
      sellingExistingProperty: 'No',
      investmentPurpose: 'Upgrade residence',
      decisionMaker: 'Self',
      familyInvolvement: 'Medium',
      purchaseUrgency: 'Medium',
    },
    teamId: 'team-1',
    teamName: 'Team A',
    executiveId: 'exec-2',
    executiveName: 'Amit Patel',
    assignedDate: '2026-09-20',
    initialContact: {
      modeOfContact: 'WhatsApp',
      firstContactDate: '2026-09-20',
      referredBy: 'Website Enquiry Form',
      initialNotes: 'Enquired about Sky Villa specs and club amenities.',
    },
    managementNotes: 'Architect buyer; pays strong attention to construction quality and floor heights.',
    lastFollowUpDate: '2026-09-26',
    lastFollowUpRemark: 'Called to discuss architect drawings. She is out of town until Sept 29.',
    nextFollowUpDate: '2026-09-29', // OVERDUE by 3 days!
    followUpCount: 2,
    createdAt: '2026-09-20T11:15:00.000Z',
    updatedAt: '2026-09-26T14:20:00.000Z',
  },
  {
    id: 'lead-3',
    leadId: 'BTG-000127',
    leadDate: '2026-09-27',
    leadSource: 'Walk-in',
    interestedProject: 'By The Garden',
    status: 'Site Visit Planned',
    priority: 'Hot',
    customerDetails: {
      name: 'Vikram Singh',
      mobile: '9879034567',
      altMobile: '',
      whatsapp: '9879034567',
      email: 'vikram.singh@maruticorporate.com',
      dob: '1978-04-02',
      occupation: 'Industrialist / MD',
      companyName: 'Maruti Plastics & Polymers',
      customerType: 'Business',
    },
    residentialAddress: {
      address: 'Plot 45, Sterling City',
      area: 'Bopal',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380058',
    },
    workAddress: {
      company: 'Maruti Plastics & Polymers',
      workAddress: 'GIDC Phase 2, Vatva Industrial Estate',
      workArea: 'Vatva',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382445',
      designation: 'Managing Director',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '4 BHK Sky Villa',
      interestedProject: 'By The Garden',
      preferredLocation: 'East facing penthouse or sky villa',
      minBudget: 20000000,
      maxBudget: 25000000,
      minSize: 3400,
      maxSize: 4000,
      purchaseTimeline: 'Immediate',
    },
    financialProfile: {
      approxBudget: 24000000,
      fundingType: 'Self Funded',
      existingProperty: 'Multiple commercial & residential units',
      sellingExistingProperty: 'No',
      investmentPurpose: 'Primary family residence',
      decisionMaker: 'Self & Parents',
      familyInvolvement: 'High',
      purchaseUrgency: 'High',
    },
    teamId: 'team-2',
    teamName: 'Team B',
    executiveId: 'exec-4',
    executiveName: 'Sameer Shah',
    assignedDate: '2026-09-27',
    initialContact: {
      modeOfContact: 'Office Visit',
      firstContactDate: '2026-09-27',
      referredBy: 'Hoarding at ISKCON Cross Road',
      initialNotes: 'Direct walk-in at sales pavilion. Was highly impressed by the sample villa.',
    },
    managementNotes: 'High Net-worth buyer. Arrange senior sales team greeting on his visit today.',
    lastFollowUpDate: '2026-10-01',
    lastFollowUpRemark: 'Confirmed site visit with his father and architect for today at 3:30 PM.',
    nextFollowUpDate: todayIso, // Scheduled for TODAY!
    followUpCount: 2,
    createdAt: '2026-09-27T15:00:00.000Z',
    updatedAt: '2026-10-01T17:00:00.000Z',
  },
  {
    id: 'lead-4',
    leadId: 'BTG-000128',
    leadDate: '2026-09-29',
    leadSource: 'Facebook',
    interestedProject: 'Green Valley Terraces',
    status: 'New',
    priority: 'Cold',
    customerDetails: {
      name: 'Ananya Sharma',
      mobile: '9712045678',
      altMobile: '',
      whatsapp: '9712045678',
      email: 'ananya.s@fintech.co',
      dob: '1995-03-10',
      occupation: 'Product Manager',
      companyName: 'Fintech Spark',
      customerType: 'Salaried',
    },
    residentialAddress: {
      address: 'Flat 602, Royal Palms',
      area: 'Vastrapur',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
    },
    workAddress: {
      company: 'Fintech Spark',
      workAddress: 'Regus Co-working, Sindhu Bhavan Road',
      workArea: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      designation: 'Sr. Product Manager',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '2 BHK Luxury Apartment',
      interestedProject: 'Green Valley Terraces',
      preferredLocation: 'Near club house',
      minBudget: 7500000,
      maxBudget: 9000000,
      minSize: 1300,
      maxSize: 1550,
      purchaseTimeline: '3–6 Months',
    },
    financialProfile: {
      approxBudget: 8500000,
      fundingType: 'Loan',
      existingProperty: 'None',
      sellingExistingProperty: 'No',
      investmentPurpose: 'First home purchase',
      decisionMaker: 'Self',
      familyInvolvement: 'Low',
      purchaseUrgency: 'Low',
    },
    teamId: 'team-2',
    teamName: 'Team B',
    executiveId: 'exec-5',
    executiveName: 'Raj Joshi',
    assignedDate: '2026-09-29',
    initialContact: {
      modeOfContact: 'Phone Call',
      firstContactDate: '2026-09-29',
      referredBy: 'Facebook Lead Ad',
      initialNotes: 'Expressed interest in 2 BHK pricing for investment/first home.',
    },
    managementNotes: '',
    lastFollowUpDate: '2026-09-29',
    lastFollowUpRemark: 'Initial call made. Sent brochure via WhatsApp. Awaiting review.',
    nextFollowUpDate: '2026-10-04',
    followUpCount: 1,
    createdAt: '2026-09-29T12:00:00.000Z',
    updatedAt: '2026-09-29T12:30:00.000Z',
  },
  {
    id: 'lead-5',
    leadId: 'BTG-000129',
    leadDate: '2026-09-10',
    leadSource: 'Existing Customer',
    interestedProject: 'By The Garden',
    status: 'Converted',
    priority: 'Hot',
    customerDetails: {
      name: 'Suresh Gupta',
      mobile: '9824056789',
      altMobile: '9427011222',
      whatsapp: '9824056789',
      email: 'suresh.gupta@guptatraders.com',
      dob: '1972-08-18',
      occupation: 'Wholesale Commodity Merchant',
      companyName: 'Gupta Brothers Agro Corp',
      customerType: 'Business',
    },
    residentialAddress: {
      address: '7, Parishkar Bungalows',
      area: 'Ambawadi',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380006',
    },
    workAddress: {
      company: 'Gupta Brothers Agro Corp',
      workAddress: 'Block C, APMC Market, Vasna',
      workArea: 'Vasna',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380007',
      designation: 'Managing Partner',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '3 BHK Premium Apartment',
      interestedProject: 'By The Garden',
      preferredLocation: 'Unit A-1102 (11th floor)',
      minBudget: 14000000,
      maxBudget: 16000000,
      minSize: 2200,
      maxSize: 2400,
      purchaseTimeline: 'Immediate',
    },
    financialProfile: {
      approxBudget: 15200000,
      fundingType: 'Self Funded',
      existingProperty: 'Multiple commercial shops',
      sellingExistingProperty: 'No',
      investmentPurpose: 'Gift for son getting married',
      decisionMaker: 'Self',
      familyInvolvement: 'High',
      purchaseUrgency: 'High',
    },
    teamId: 'team-1',
    teamName: 'Team A',
    executiveId: 'exec-3',
    executiveName: 'Jay Mehta',
    assignedDate: '2026-09-10',
    initialContact: {
      modeOfContact: 'Reference Meeting',
      firstContactDate: '2026-09-10',
      referredBy: 'Owner reference',
      initialNotes: 'VIP existing customer who bought commercial shop in earlier project.',
    },
    managementNotes: 'Token received. Agreement for sale scheduled.',
    lastFollowUpDate: '2026-09-28',
    lastFollowUpRemark: 'Booking amount received. Unit A-1102 booked. Handed over welcome kit.',
    nextFollowUpDate: undefined,
    followUpCount: 4,
    createdAt: '2026-09-10T09:00:00.000Z',
    updatedAt: '2026-09-28T18:00:00.000Z',
  },
  {
    id: 'lead-6',
    leadId: 'BTG-000130',
    leadDate: '2026-09-18',
    leadSource: 'Broker',
    interestedProject: 'By The Garden',
    status: 'Follow-up',
    priority: 'Warm',
    customerDetails: {
      name: 'Sunil Verma',
      mobile: '9825599887',
      altMobile: '9909988776',
      whatsapp: '9825599887',
      email: 'sunilverma@vermaassociates.com',
      dob: '1981-01-25',
      occupation: 'Chartered Accountant',
      companyName: 'Verma & Associates Chartered Accountants',
      customerType: 'Professional',
    },
    residentialAddress: {
      address: 'A-201, Goyal Intercity',
      area: 'Drive-In Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380052',
    },
    workAddress: {
      company: 'Verma & Associates',
      workAddress: '501, Silicon Tower, Law Garden',
      workArea: 'Ellisbridge',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380006',
      designation: 'Senior Partner',
    },
    propertyRequirement: {
      requirementType: 'Residential',
      preferredUnit: '3 BHK Premium Apartment',
      interestedProject: 'By The Garden',
      preferredLocation: 'Tower B, mid floor',
      minBudget: 13000000,
      maxBudget: 14500000,
      minSize: 2150,
      maxSize: 2350,
      purchaseTimeline: '0–30 Days',
    },
    financialProfile: {
      approxBudget: 13800000,
      fundingType: 'Partly Loan',
      existingProperty: 'Owns 3 BHK',
      sellingExistingProperty: 'Yes',
      investmentPurpose: 'Upgrade to new gated community',
      decisionMaker: 'Self & Wife',
      familyInvolvement: 'High',
      purchaseUrgency: 'Medium',
    },
    teamId: 'team-2',
    teamName: 'Team B',
    executiveId: 'exec-6',
    executiveName: 'Karan Patel',
    assignedDate: '2026-09-18',
    initialContact: {
      modeOfContact: 'Phone Call',
      firstContactDate: '2026-09-18',
      referredBy: 'Chirag Shah (Broker)',
      initialNotes: 'Looking to sell existing flat and move to By The Garden.',
    },
    managementNotes: 'Needs loan assistance and valuation support for existing home.',
    lastFollowUpDate: '2026-09-25',
    lastFollowUpRemark: 'Meeting held. Discussed loan tie-ups with SBI and HDFC bank managers.',
    nextFollowUpDate: '2026-09-28', // OVERDUE by 4 days!
    followUpCount: 3,
    createdAt: '2026-09-18T14:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z',
  },
];

const INITIAL_FOLLOW_UPS: FollowUp[] = [
  // Rajesh Kumar follow-ups (Lead 1)
  {
    id: 'fup-1-1',
    leadId: 'lead-1',
    followUpNumber: 1,
    date: '2026-09-24',
    remark: 'Introductory call following Dr. Trivedi recommendation. Shared floor plans and elevation renders over WhatsApp.',
    modeOfContact: 'Phone Call',
    nextFollowUpDate: '2026-09-27',
    createdAt: '2026-09-24T11:00:00.000Z',
  },
  {
    id: 'fup-1-2',
    leadId: 'lead-1',
    followUpNumber: 2,
    date: '2026-09-27',
    remark: 'Followed up on WhatsApp. Customer reviewed plans and scheduled physical site visit for Sept 30 afternoon.',
    modeOfContact: 'WhatsApp',
    nextFollowUpDate: '2026-09-30',
    createdAt: '2026-09-27T15:30:00.000Z',
  },
  {
    id: 'fup-1-3',
    leadId: 'lead-1',
    followUpNumber: 3,
    date: '2026-09-30',
    remark: 'Customer visited site. Loved 3 BHK layout on 9th floor. Requested pricing breakdown and payment schedule.',
    modeOfContact: 'Site Visit',
    nextFollowUpDate: todayIso, // Scheduled for TODAY
    createdAt: '2026-09-30T16:30:00.000Z',
  },

  // Priya Mehta follow-ups (Lead 2)
  {
    id: 'fup-2-1',
    leadId: 'lead-2',
    followUpNumber: 1,
    date: '2026-09-20',
    remark: 'Online enquiry response. Sent detailed project e-brochure and architectural elevation specifications.',
    modeOfContact: 'WhatsApp',
    nextFollowUpDate: '2026-09-24',
    createdAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'fup-2-2',
    leadId: 'lead-2',
    followUpNumber: 2,
    date: '2026-09-26',
    remark: 'Called to discuss architect drawings. She is out of town until Sept 29. Next follow-up set for Sept 29.',
    modeOfContact: 'Phone Call',
    nextFollowUpDate: '2026-09-29',
    createdAt: '2026-09-26T14:20:00.000Z',
  },

  // Vikram Singh follow-ups (Lead 3)
  {
    id: 'fup-3-1',
    leadId: 'lead-3',
    followUpNumber: 1,
    date: '2026-09-27',
    remark: 'Met in sales office. Customer interested in top floor sky villa. Discussed customization options.',
    modeOfContact: 'Office Visit',
    nextFollowUpDate: '2026-10-01',
    createdAt: '2026-09-27T16:00:00.000Z',
  },
  {
    id: 'fup-3-2',
    leadId: 'lead-3',
    followUpNumber: 2,
    date: '2026-10-01',
    remark: 'Confirmed site visit with his father and architect for today at 3:30 PM.',
    modeOfContact: 'Phone Call',
    nextFollowUpDate: todayIso, // Scheduled for TODAY
    createdAt: '2026-10-01T17:00:00.000Z',
  },

  // Ananya Sharma follow-ups (Lead 4)
  {
    id: 'fup-4-1',
    leadId: 'lead-4',
    followUpNumber: 1,
    date: '2026-09-29',
    remark: 'Initial call made. Sent brochure via WhatsApp. Awaiting review.',
    modeOfContact: 'Phone Call',
    nextFollowUpDate: '2026-10-04',
    createdAt: '2026-09-29T12:30:00.000Z',
  },

  // Suresh Gupta follow-ups (Lead 5)
  {
    id: 'fup-5-1',
    leadId: 'lead-5',
    followUpNumber: 1,
    date: '2026-09-10',
    remark: 'VIP meeting with management. Showcased tower layout and priority inventory.',
    modeOfContact: 'Office Visit',
    nextFollowUpDate: '2026-09-16',
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'fup-5-2',
    leadId: 'lead-5',
    followUpNumber: 2,
    date: '2026-09-16',
    remark: 'Site visit with family. Selected unit A-1102 on 11th floor.',
    modeOfContact: 'Site Visit',
    nextFollowUpDate: '2026-09-22',
    createdAt: '2026-09-16T15:00:00.000Z',
  },
  {
    id: 'fup-5-3',
    leadId: 'lead-5',
    followUpNumber: 3,
    date: '2026-09-22',
    remark: 'Final price negotiation. Management approved 1% VIP courtesy rebate.',
    modeOfContact: 'Office Visit',
    nextFollowUpDate: '2026-09-28',
    createdAt: '2026-09-22T17:30:00.000Z',
  },
  {
    id: 'fup-5-4',
    leadId: 'lead-5',
    followUpNumber: 4,
    date: '2026-09-28',
    remark: 'Booking amount received. Unit A-1102 booked. Handed over welcome kit.',
    modeOfContact: 'Office Visit',
    nextFollowUpDate: '',
    createdAt: '2026-09-28T18:00:00.000Z',
  },

  // Sunil Verma follow-ups (Lead 6)
  {
    id: 'fup-6-1',
    leadId: 'lead-6',
    followUpNumber: 1,
    date: '2026-09-18',
    remark: 'Broker connected call. Explained project details and location advantages.',
    modeOfContact: 'Phone Call',
    nextFollowUpDate: '2026-09-21',
    createdAt: '2026-09-18T14:30:00.000Z',
  },
  {
    id: 'fup-6-2',
    leadId: 'lead-6',
    followUpNumber: 2,
    date: '2026-09-21',
    remark: 'Customer visited site office. Liked mid-rise 3 BHK option in Tower B.',
    modeOfContact: 'Site Visit',
    nextFollowUpDate: '2026-09-25',
    createdAt: '2026-09-21T16:00:00.000Z',
  },
  {
    id: 'fup-6-3',
    leadId: 'lead-6',
    followUpNumber: 3,
    date: '2026-09-25',
    remark: 'Meeting held. Discussed loan tie-ups with SBI and HDFC bank managers.',
    modeOfContact: 'Office Visit',
    nextFollowUpDate: '2026-09-28', // OVERDUE
    createdAt: '2026-09-25T16:00:00.000Z',
  },
];

class StorageService {
  private inMemoryCache: Record<string, any> = {};

  constructor() {
    this.ensureInitialized();
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          return JSON.parse(val);
        }
      }
    } catch (e) {
      console.warn(`Storage get error for key ${key}:`, e);
    }
    return this.inMemoryCache[key] ?? fallback;
  }

  private setItem<T>(key: string, value: T): void {
    try {
      this.inMemoryCache[key] = value;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Storage set error for key ${key}:`, e);
    }
  }

  public ensureInitialized(): void {
    const initialized = this.getItem<boolean>(STORAGE_KEYS.INITIALIZED, false);
    if (!initialized) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.setItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
    this.setItem(STORAGE_KEYS.EXECUTIVES, INITIAL_EXECUTIVES);
    this.setItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    this.setItem(STORAGE_KEYS.LEAD_SOURCES, INITIAL_LEAD_SOURCES);
    this.setItem(STORAGE_KEYS.PREFERRED_UNITS, INITIAL_UNITS);
    this.setItem(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    this.setItem(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    this.setItem(STORAGE_KEYS.INITIALIZED, true);
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  public generateNextLeadId(): string {
    const settings = this.getSettings();
    const prefix = settings.leadIdPrefix || 'BTG';
    const num = settings.nextLeadNumber || 1;
    const formattedNum = String(num).padStart(6, '0');

    // Increment and save
    settings.nextLeadNumber = num + 1;
    this.saveSettings(settings);

    return `${prefix}-${formattedNum}`;
  }

  // --- Teams ---
  public getTeams(): Team[] {
    return this.getItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  }

  public saveTeams(teams: Team[]): void {
    this.setItem(STORAGE_KEYS.TEAMS, teams);
  }

  public addTeam(name: string): Team {
    const teams = this.getTeams();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      teamName: name.trim(),
      active: true,
    };
    teams.push(newTeam);
    this.saveTeams(teams);
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<Team>): void {
    const teams = this.getTeams().map(t => (t.id === id ? { ...t, ...updates } : t));
    this.saveTeams(teams);
  }

  // --- Executives ---
  public getExecutives(): Executive[] {
    return this.getItem<Executive[]>(STORAGE_KEYS.EXECUTIVES, []);
  }

  public saveExecutives(execs: Executive[]): void {
    this.setItem(STORAGE_KEYS.EXECUTIVES, execs);
  }

  public addExecutive(exec: Omit<Executive, 'id'>): Executive {
    const execs = this.getExecutives();
    const newExec: Executive = {
      ...exec,
      id: `exec-${Date.now()}`,
    };
    execs.push(newExec);
    this.saveExecutives(execs);
    return newExec;
  }

  public updateExecutive(id: string, updates: Partial<Executive>): void {
    const execs = this.getExecutives().map(e => (e.id === id ? { ...e, ...updates } : e));
    this.saveExecutives(execs);
  }

  // --- Projects ---
  public getProjects(): Project[] {
    return this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
  }

  public saveProjects(projects: Project[]): void {
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  public addProject(name: string, location: string): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectName: name.trim(),
      location: location.trim(),
      active: true,
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): void {
    const projects = this.getProjects().map(p => (p.id === id ? { ...p, ...updates } : p));
    this.saveProjects(projects);
  }

  // --- Lead Sources ---
  public getLeadSources(): LeadSource[] {
    return this.getItem<LeadSource[]>(STORAGE_KEYS.LEAD_SOURCES, []);
  }

  public saveLeadSources(sources: LeadSource[]): void {
    this.setItem(STORAGE_KEYS.LEAD_SOURCES, sources);
  }

  public addLeadSource(name: string): LeadSource {
    const sources = this.getLeadSources();
    const newSource: LeadSource = {
      id: `src-${Date.now()}`,
      name: name.trim(),
      active: true,
    };
    sources.push(newSource);
    this.saveLeadSources(sources);
    return newSource;
  }

  // --- Preferred Units ---
  public getPreferredUnits(): PreferredUnit[] {
    return this.getItem<PreferredUnit[]>(STORAGE_KEYS.PREFERRED_UNITS, []);
  }

  public savePreferredUnits(units: PreferredUnit[]): void {
    this.setItem(STORAGE_KEYS.PREFERRED_UNITS, units);
  }

  public addPreferredUnit(name: string, category: string): PreferredUnit {
    const units = this.getPreferredUnits();
    const newUnit: PreferredUnit = {
      id: `unit-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Residential',
      active: true,
    };
    units.push(newUnit);
    this.savePreferredUnits(units);
    return newUnit;
  }

  // --- Leads ---
  public getLeads(): Lead[] {
    return this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []);
  }

  public saveLeads(leads: Lead[]): void {
    this.setItem(STORAGE_KEYS.LEADS, leads);
  }

  public getLeadById(id: string): Lead | undefined {
    return this.getLeads().find(l => l.id === id || l.leadId === id);
  }

  public createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followUpCount'>, initialFollowup?: { remark: string; nextFollowUpDate: string; modeOfContact?: string }): Lead {
    const leads = this.getLeads();
    const nowIso = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      followUpCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (initialFollowup && initialFollowup.remark.trim()) {
      newLead.lastFollowUpDate = leadData.leadDate;
      newLead.lastFollowUpRemark = initialFollowup.remark.trim();
      newLead.nextFollowUpDate = initialFollowup.nextFollowUpDate;
      newLead.followUpCount = 1;
    }

    leads.unshift(newLead);
    this.saveLeads(leads);

    if (initialFollowup && initialFollowup.remark.trim()) {
      this.addFollowUp({
        leadId: newLead.id,
        date: leadData.leadDate,
        remark: initialFollowup.remark.trim(),
        modeOfContact: (initialFollowup.modeOfContact as any) || leadData.initialContact.modeOfContact || 'Phone Call',
        nextFollowUpDate: initialFollowup.nextFollowUpDate,
      });
    }

    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return undefined;

    const updatedLead: Lead = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    leads[index] = updatedLead;
    this.saveLeads(leads);
    return updatedLead;
  }

  public deleteLead(id: string): boolean {
    const leads = this.getLeads();
    const filtered = leads.filter(l => l.id !== id);
    if (filtered.length !== leads.length) {
      this.saveLeads(filtered);
      return true;
    }
    return false;
  }

  // --- Follow Ups ---
  public getFollowUps(leadId?: string): FollowUp[] {
    const all = this.getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    if (!leadId) return all;
    return all
      .filter(f => f.leadId === leadId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  }

  public saveFollowUps(followUps: FollowUp[]): void {
    this.setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
  }

  public addFollowUp(params: {
    leadId: string;
    date: string;
    remark: string;
    modeOfContact: any;
    nextFollowUpDate?: string;
    updateLeadStatus?: any;
    updateLeadPriority?: any;
  }): FollowUp {
    const all = this.getFollowUps();
    const leadFollowUps = all.filter(f => f.leadId === params.leadId);
    const nextNumber = leadFollowUps.length + 1;

    const newFollowUp: FollowUp = {
      id: `fup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      leadId: params.leadId,
      followUpNumber: nextNumber,
      date: params.date,
      remark: params.remark,
      modeOfContact: params.modeOfContact,
      nextFollowUpDate: params.nextFollowUpDate || '',
      createdAt: new Date().toISOString(),
    };

    all.push(newFollowUp);
    this.saveFollowUps(all);

    // Update lead summary
    const leadUpdates: Partial<Lead> = {
      lastFollowUpDate: params.date,
      lastFollowUpRemark: params.remark,
      nextFollowUpDate: params.nextFollowUpDate || '',
      followUpCount: nextNumber,
    };

    if (params.updateLeadStatus) {
      leadUpdates.status = params.updateLeadStatus;
    }
    if (params.updateLeadPriority) {
      leadUpdates.priority = params.updateLeadPriority;
    }

    this.updateLead(params.leadId, leadUpdates);
    return newFollowUp;
  }

  // --- Backup & Restore ---
  public createBackup(): AppDataBackup {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      leads: this.getLeads(),
      followUps: this.getFollowUps(),
      teams: this.getTeams(),
      executives: this.getExecutives(),
      projects: this.getProjects(),
      leadSources: this.getLeadSources(),
      preferredUnits: this.getPreferredUnits(),
      settings: this.getSettings(),
    };
  }

  public restoreBackup(data: AppDataBackup): { success: boolean; error?: string } {
    try {
      if (!data || !Array.isArray(data.leads) || !Array.isArray(data.teams)) {
        return { success: false, error: 'Invalid backup file structure: missing leads or teams data.' };
      }

      this.setItem(STORAGE_KEYS.LEADS, data.leads);
      this.setItem(STORAGE_KEYS.FOLLOW_UPS, Array.isArray(data.followUps) ? data.followUps : []);
      this.setItem(STORAGE_KEYS.TEAMS, data.teams);
      this.setItem(STORAGE_KEYS.EXECUTIVES, Array.isArray(data.executives) ? data.executives : []);
      this.setItem(STORAGE_KEYS.PROJECTS, Array.isArray(data.projects) ? data.projects : []);
      this.setItem(STORAGE_KEYS.LEAD_SOURCES, Array.isArray(data.leadSources) ? data.leadSources : []);
      this.setItem(STORAGE_KEYS.PREFERRED_UNITS, Array.isArray(data.preferredUnits) ? data.preferredUnits : []);
      this.setItem(STORAGE_KEYS.SETTINGS, data.settings || DEFAULT_SETTINGS);
      this.setItem(STORAGE_KEYS.INITIALIZED, true);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to restore backup.' };
    }
  }
}

export const storage = new StorageService();
