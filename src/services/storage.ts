import {
  AppDataBackup,
  AppSettings,
  Executive,
  FollowUp,
  Lead,
  LeadSource,
  MonthlyTarget,
  PreferredUnit,
  Project,
  SalesActivity,
  Team,
  WorkingDaysConfig,
} from '../types';

const STORAGE_KEYS = {
  LEADS: 'bm_prod_leads_v2',
  FOLLOW_UPS: 'bm_prod_followups_v2',
  TEAMS: 'bm_prod_teams_v2',
  EXECUTIVES: 'bm_prod_executives_v2',
  PROJECTS: 'bm_prod_projects_v2',
  LEAD_SOURCES: 'bm_prod_lead_sources_v2',
  PREFERRED_UNITS: 'bm_prod_units_v2',
  SETTINGS: 'bm_prod_settings_v2',
  INITIALIZED: 'bm_prod_initialized_v2',
  TARGETS: 'bm_prod_targets_v2',
  ACTIVITIES: 'bm_prod_activities_v2',
};

export const DEFAULT_WORKING_DAYS: WorkingDaysConfig = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  leadIdPrefix: 'BM',
  nextLeadNumber: 1,
  companyName: 'Sales Lead Office',
  currencySymbol: '₹',
  defaultFollowupDays: 3,
  dateFormat: 'DD-MM-YYYY',
  workingDays: DEFAULT_WORKING_DAYS,
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthName(monthNum: number): string {
  return MONTH_NAMES[monthNum - 1] || `Month ${monthNum}`;
}

export function parseYearMonth(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// Calculate remaining working days in a month from a starting date (defaulting to today or 1st)
export function getRemainingWorkingDaysInMonth(
  year: number,
  month: number, // 1-12
  fromDateStr?: string,
  workingDaysConfig?: WorkingDaysConfig
): number {
  const config = workingDaysConfig || storage.getSettings().workingDays || DEFAULT_WORKING_DAYS;
  const lastDay = new Date(year, month, 0).getDate();

  const todayStr = fromDateStr || getTodayDateString();
  const { year: currentYear, month: currentMonth, day: currentDay } = parseYearMonth(todayStr);

  let startDay = 1;
  if (currentYear === year && currentMonth === month) {
    startDay = currentDay;
  } else if (currentYear > year || (currentYear === year && currentMonth > month)) {
    // Past month
    return 0;
  }

  let count = 0;
  for (let d = startDay; d <= lastDay; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    let isWorking = false;
    if (dayOfWeek === 1 && config.monday) isWorking = true;
    else if (dayOfWeek === 2 && config.tuesday) isWorking = true;
    else if (dayOfWeek === 3 && config.wednesday) isWorking = true;
    else if (dayOfWeek === 4 && config.thursday) isWorking = true;
    else if (dayOfWeek === 5 && config.friday) isWorking = true;
    else if (dayOfWeek === 6 && config.saturday) isWorking = true;
    else if (dayOfWeek === 0 && config.sunday) isWorking = true;

    if (isWorking) count++;
  }
  return count;
}

// Configurable Master Options (Configuration options only — ZERO business records)
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
  { id: 'unit-1', name: '2 BHK Apartment', category: 'Residential', active: true },
  { id: 'unit-2', name: '3 BHK Apartment', category: 'Residential', active: true },
  { id: 'unit-3', name: '4 BHK Apartment / Villa', category: 'Residential', active: true },
  { id: 'unit-4', name: 'Penthouse', category: 'Residential', active: true },
  { id: 'unit-5', name: 'Commercial Showroom', category: 'Commercial', active: true },
  { id: 'unit-6', name: 'Office Space', category: 'Commercial', active: true },
  { id: 'unit-7', name: 'Plot / Land', category: 'Residential', active: true },
];

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

// Helper: Get today's local business date string YYYY-MM-DD
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
      this.initializeCleanDatabase();
    } else {
      // Sync check: ensure activities exist for existing leads if not yet recorded
      const leads = this.getLeads(true);
      const activities = this.getSalesActivities();
      const leadActivityMap = new Set(
        activities.filter((a) => a.activityType === 'Lead').map((a) => a.leadId)
      );

      let added = false;
      for (const lead of leads) {
        if (!leadActivityMap.has(lead.id)) {
          activities.push({
            id: `act-lead-${lead.id}`,
            activityType: 'Lead',
            leadId: lead.id,
            customerName: lead.customerDetails.name,
            projectName: lead.interestedProject,
            teamId: lead.teamId,
            teamName: lead.teamName,
            executiveId: lead.executiveId,
            executiveName: lead.executiveName,
            activityDate: lead.leadDate,
            status: 'Created',
            remarks: 'Initial Lead Creation',
            createdAt: lead.createdAt,
          });
          added = true;
        }
      }
      if (added) {
        this.saveSalesActivities(activities);
      }
    }
  }

  /**
   * Initializes the application with ZERO mock records.
   * Zero leads, zero teams, zero executives, zero projects, zero follow-ups.
   */
  public initializeCleanDatabase(): void {
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.setItem(STORAGE_KEYS.TEAMS, []);
    this.setItem(STORAGE_KEYS.EXECUTIVES, []);
    this.setItem(STORAGE_KEYS.PROJECTS, []);
    this.setItem(STORAGE_KEYS.LEADS, []);
    this.setItem(STORAGE_KEYS.FOLLOW_UPS, []);
    this.setItem(STORAGE_KEYS.LEAD_SOURCES, INITIAL_LEAD_SOURCES);
    this.setItem(STORAGE_KEYS.PREFERRED_UNITS, INITIAL_UNITS);
    this.setItem(STORAGE_KEYS.TARGETS, []);
    this.setItem(STORAGE_KEYS.ACTIVITIES, []);
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
    const prefix = (settings.leadIdPrefix || 'BM').toUpperCase();
    const num = settings.nextLeadNumber || 1;
    const formattedNum = String(num).padStart(6, '0');

    // Increment and save counter
    settings.nextLeadNumber = num + 1;
    this.saveSettings(settings);

    return `${prefix}-${formattedNum}`;
  }

  // --- Duplicate Lead Check ---
  public checkDuplicateLead(
    mobile: string,
    whatsapp?: string,
    name?: string,
    excludeLeadId?: string
  ): { isDuplicate: boolean; matchedLead?: Lead; matchReason?: string } {
    const leads = this.getLeads();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    const cleanWhatsApp = whatsapp?.trim().replace(/\D/g, '');
    const cleanName = name?.trim().toLowerCase();

    for (const lead of leads) {
      if (excludeLeadId && lead.id === excludeLeadId) continue;

      const leadMobile = lead.customerDetails.mobile.replace(/\D/g, '');
      const leadWhatsApp = (lead.customerDetails.whatsapp || '').replace(/\D/g, '');
      const leadName = lead.customerDetails.name.trim().toLowerCase();

      // Check Mobile match (exact last 10 digits or exact match)
      if (cleanMobile && cleanMobile.length >= 8 && leadMobile && (leadMobile === cleanMobile || leadMobile.endsWith(cleanMobile) || cleanMobile.endsWith(leadMobile))) {
        return {
          isDuplicate: true,
          matchedLead: lead,
          matchReason: `Matching mobile number (${lead.customerDetails.mobile})`,
        };
      }

      // Check WhatsApp match
      if (cleanWhatsApp && cleanWhatsApp.length >= 8 && leadWhatsApp && (leadWhatsApp === cleanWhatsApp || leadWhatsApp.endsWith(cleanWhatsApp) || cleanWhatsApp.endsWith(leadWhatsApp))) {
        return {
          isDuplicate: true,
          matchedLead: lead,
          matchReason: `Matching WhatsApp number (${lead.customerDetails.whatsapp})`,
        };
      }

      // Check Name + Mobile similarity
      if (cleanName && leadName && cleanName === leadName && cleanMobile && cleanMobile === leadMobile) {
        return {
          isDuplicate: true,
          matchedLead: lead,
          matchReason: `Matching customer name and mobile`,
        };
      }
    }

    return { isDuplicate: false };
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
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      teamName: name.trim(),
      active: true,
    };
    teams.push(newTeam);
    this.saveTeams(teams);
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<Team>): void {
    const teams = this.getTeams().map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.saveTeams(teams);
  }

  public deleteTeam(id: string): { success: boolean; error?: string } {
    const executives = this.getExecutives().filter((e) => e.teamId === id);
    if (executives.length > 0) {
      return {
        success: false,
        error: `Cannot delete team with ${executives.length} active sales executives. Please reassign or delete executives first.`,
      };
    }
    const teams = this.getTeams().filter((t) => t.id !== id);
    this.saveTeams(teams);
    return { success: true };
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
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    execs.push(newExec);
    this.saveExecutives(execs);
    return newExec;
  }

  public updateExecutive(id: string, updates: Partial<Executive>): void {
    const execs = this.getExecutives().map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.saveExecutives(execs);
  }

  public deleteExecutive(id: string): { success: boolean; error?: string } {
    const leads = this.getLeads().filter((l) => l.executiveId === id && !l.archived);
    if (leads.length > 0) {
      return {
        success: false,
        error: `Cannot delete executive who is currently assigned to ${leads.length} leads. Please reassign leads first.`,
      };
    }
    const execs = this.getExecutives().filter((e) => e.id !== id);
    this.saveExecutives(execs);
    return { success: true };
  }

  // --- Projects ---
  public getProjects(): Project[] {
    return this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
  }

  public saveProjects(projects: Project[]): void {
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  public addProject(name: string, location: string, description?: string): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectName: name.trim(),
      location: location.trim(),
      description: description?.trim() || undefined,
      active: true,
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): void {
    const projects = this.getProjects().map((p) => (p.id === id ? { ...p, ...updates } : p));
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
  public getLeads(includeArchived = false): Lead[] {
    const all = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []);
    if (includeArchived) return all;
    return all.filter((l) => !l.archived);
  }

  public getAllLeadsRaw(): Lead[] {
    return this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []);
  }

  public saveLeads(leads: Lead[]): void {
    this.setItem(STORAGE_KEYS.LEADS, leads);
  }

  public getLeadById(id: string): Lead | undefined {
    return this.getAllLeadsRaw().find((l) => l.id === id || l.leadId === id);
  }

  public createLead(
    leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followUpCount'>,
    initialFollowup?: { remark: string; nextFollowUpDate: string; modeOfContact?: string }
  ): Lead {
    const leads = this.getAllLeadsRaw();
    const nowIso = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      followUpCount: 0,
      archived: false,
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

    // Automatically record Lead sales activity for monthly achievement
    this.addSalesActivity({
      activityType: 'Lead',
      leadId: newLead.id,
      customerName: newLead.customerDetails.name,
      projectName: newLead.interestedProject,
      teamId: newLead.teamId,
      teamName: newLead.teamName,
      executiveId: newLead.executiveId,
      executiveName: newLead.executiveName,
      activityDate: newLead.leadDate,
      status: 'Created',
      remarks: 'Lead Created',
    });

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
    const leads = this.getAllLeadsRaw();
    const index = leads.findIndex((l) => l.id === id);
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

  public archiveLead(id: string): Lead | undefined {
    return this.updateLead(id, { archived: true });
  }

  public unarchiveLead(id: string): Lead | undefined {
    return this.updateLead(id, { archived: false });
  }

  public deleteLead(id: string): boolean {
    const leads = this.getAllLeadsRaw();
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length !== leads.length) {
      this.saveLeads(filtered);
      // Clean up associated follow-ups
      const allFollowups = this.getFollowUps().filter((f) => f.leadId !== id);
      this.saveFollowUps(allFollowups);
      return true;
    }
    return false;
  }

  // --- Follow Ups ---
  public getFollowUps(leadId?: string): FollowUp[] {
    const all = this.getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    if (!leadId) return all;
    return all
      .filter((f) => f.leadId === leadId)
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
    const leadFollowUps = all.filter((f) => f.leadId === params.leadId);
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

  // --- Monthly Targets ---
  public getMonthlyTargets(month?: number, year?: number): MonthlyTarget[] {
    const all = this.getItem<MonthlyTarget[]>(STORAGE_KEYS.TARGETS, []);
    return all.filter((t) => {
      if (month !== undefined && t.month !== month) return false;
      if (year !== undefined && t.year !== year) return false;
      return true;
    });
  }

  public saveMonthlyTargets(targets: MonthlyTarget[]): void {
    this.setItem(STORAGE_KEYS.TARGETS, targets);
  }

  public setMonthlyTarget(params: {
    month: number;
    year: number;
    teamId: string;
    teamName: string;
    executiveId?: string | null;
    executiveName?: string | null;
    leadTarget: number;
    siteVisitTarget: number;
    tokenTarget: number;
  }): MonthlyTarget {
    const all = this.getItem<MonthlyTarget[]>(STORAGE_KEYS.TARGETS, []);
    const execId = params.executiveId ? params.executiveId : null;
    const existingIndex = all.findIndex(
      (t) =>
        t.month === params.month &&
        t.year === params.year &&
        t.teamId === params.teamId &&
        (t.executiveId || null) === execId
    );

    const nowIso = new Date().toISOString();
    if (existingIndex >= 0) {
      const updated: MonthlyTarget = {
        ...all[existingIndex],
        teamName: params.teamName,
        executiveName: params.executiveName || null,
        leadTarget: Math.max(0, Math.floor(Number(params.leadTarget) || 0)),
        siteVisitTarget: Math.max(0, Math.floor(Number(params.siteVisitTarget) || 0)),
        tokenTarget: Math.max(0, Math.floor(Number(params.tokenTarget) || 0)),
        updatedAt: nowIso,
      };
      all[existingIndex] = updated;
      this.saveMonthlyTargets(all);
      return updated;
    } else {
      const newTarget: MonthlyTarget = {
        id: `target-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        month: params.month,
        year: params.year,
        teamId: params.teamId,
        teamName: params.teamName,
        executiveId: execId,
        executiveName: params.executiveName || null,
        leadTarget: Math.max(0, Math.floor(Number(params.leadTarget) || 0)),
        siteVisitTarget: Math.max(0, Math.floor(Number(params.siteVisitTarget) || 0)),
        tokenTarget: Math.max(0, Math.floor(Number(params.tokenTarget) || 0)),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      all.push(newTarget);
      this.saveMonthlyTargets(all);
      return newTarget;
    }
  }

  public deleteMonthlyTarget(id: string): boolean {
    const all = this.getItem<MonthlyTarget[]>(STORAGE_KEYS.TARGETS, []);
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length !== all.length) {
      this.saveMonthlyTargets(filtered);
      return true;
    }
    return false;
  }

  public checkTeamTargetAllocation(month: number, year: number, teamId: string): {
    exceeds: boolean;
    teamTarget?: MonthlyTarget;
    totalExecLead: number;
    totalExecSV: number;
    totalExecToken: number;
    leadExceeds: boolean;
    svExceeds: boolean;
    tokenExceeds: boolean;
    message?: string;
  } {
    const targets = this.getMonthlyTargets(month, year).filter((t) => t.teamId === teamId);
    const teamTarget = targets.find((t) => !t.executiveId);
    const execTargets = targets.filter((t) => Boolean(t.executiveId));

    let totalExecLead = 0;
    let totalExecSV = 0;
    let totalExecToken = 0;

    execTargets.forEach((t) => {
      totalExecLead += t.leadTarget || 0;
      totalExecSV += t.siteVisitTarget || 0;
      totalExecToken += t.tokenTarget || 0;
    });

    const leadExceeds = Boolean(teamTarget && totalExecLead > teamTarget.leadTarget);
    const svExceeds = Boolean(teamTarget && totalExecSV > teamTarget.siteVisitTarget);
    const tokenExceeds = Boolean(teamTarget && totalExecToken > teamTarget.tokenTarget);
    const exceeds = leadExceeds || svExceeds || tokenExceeds;

    return {
      exceeds,
      teamTarget,
      totalExecLead,
      totalExecSV,
      totalExecToken,
      leadExceeds,
      svExceeds,
      tokenExceeds,
      message: exceeds ? 'Executive target allocation exceeds the Team target.' : undefined,
    };
  }

  // --- Sales Activities (Leads, Site Visits, Tokens) ---
  public getSalesActivities(filter?: {
    month?: number;
    year?: number;
    teamId?: string;
    executiveId?: string;
    activityType?: string;
  }): SalesActivity[] {
    const all = this.getItem<SalesActivity[]>(STORAGE_KEYS.ACTIVITIES, []);
    return all.filter((a) => {
      if (filter?.activityType && a.activityType !== filter.activityType) return false;
      if (filter?.teamId && a.teamId !== filter.teamId) return false;
      if (filter?.executiveId && a.executiveId !== filter.executiveId) return false;

      if (filter?.month !== undefined || filter?.year !== undefined) {
        const { year, month } = parseYearMonth(a.activityDate);
        if (filter.month !== undefined && month !== filter.month) return false;
        if (filter.year !== undefined && year !== filter.year) return false;
      }
      return true;
    });
  }

  public saveSalesActivities(activities: SalesActivity[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITIES, activities);
  }

  public addSalesActivity(activity: Omit<SalesActivity, 'id' | 'createdAt'>): SalesActivity {
    const all = this.getItem<SalesActivity[]>(STORAGE_KEYS.ACTIVITIES, []);
    const newAct: SalesActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newAct);
    this.saveSalesActivities(all);
    return newAct;
  }

  public updateSalesActivity(id: string, updates: Partial<SalesActivity>): SalesActivity | undefined {
    const all = this.getItem<SalesActivity[]>(STORAGE_KEYS.ACTIVITIES, []);
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    this.saveSalesActivities(all);
    return updated;
  }

  public deleteSalesActivity(id: string): boolean {
    const all = this.getItem<SalesActivity[]>(STORAGE_KEYS.ACTIVITIES, []);
    const filtered = all.filter((a) => a.id !== id);
    if (filtered.length !== all.length) {
      this.saveSalesActivities(filtered);
      return true;
    }
    return false;
  }

  // --- Site Visit Specific Actions ---
  public recordSiteVisit(params: {
    leadId: string;
    siteVisitDate: string;
    status: 'Site Visit Planned' | 'Site Visit Done';
    remarks?: string;
  }): SalesActivity {
    const lead = this.getLeadById(params.leadId);
    const act = this.addSalesActivity({
      activityType: 'Site Visit',
      leadId: params.leadId,
      customerName: lead ? lead.customerDetails.name : 'Customer',
      projectName: lead ? lead.interestedProject : '',
      teamId: lead ? lead.teamId : '',
      teamName: lead ? lead.teamName : '',
      executiveId: lead ? lead.executiveId : '',
      executiveName: lead ? lead.executiveName : '',
      activityDate: params.siteVisitDate,
      status: params.status,
      remarks: params.remarks,
    });

    if (lead) {
      this.updateLead(lead.id, {
        status: params.status === 'Site Visit Done' ? 'Site Visit Done' : 'Site Visit Planned',
      });
    }
    return act;
  }

  public getSiteVisits(leadId?: string): SalesActivity[] {
    const activities = this.getSalesActivities({ activityType: 'Site Visit' });
    if (!leadId) return activities;
    return activities.filter((a) => a.leadId === leadId);
  }

  // --- Token Specific Actions ---
  public recordToken(params: {
    leadId: string;
    tokenDate: string;
    tokenAmount: number;
    unitRef?: string;
    status?: 'Token Received' | 'Confirmed' | 'Cancelled' | 'Refunded';
    remarks?: string;
  }): SalesActivity {
    const lead = this.getLeadById(params.leadId);
    const status = params.status || 'Token Received';

    // Generate readable Token ID like TOK-000001
    const tokens = this.getTokens();
    const tokenSeq = tokens.length + 1;
    const tokenCode = `TOK-${String(tokenSeq).padStart(6, '0')}`;

    const act = this.addSalesActivity({
      activityType: 'Token',
      leadId: params.leadId,
      customerName: lead ? lead.customerDetails.name : 'Customer',
      projectName: lead ? lead.interestedProject : '',
      teamId: lead ? lead.teamId : '',
      teamName: lead ? lead.teamName : '',
      executiveId: lead ? lead.executiveId : '',
      executiveName: lead ? lead.executiveName : '',
      activityDate: params.tokenDate,
      status: status,
      tokenAmount: params.tokenAmount,
      unitRef: params.unitRef || tokenCode,
      remarks: params.remarks,
    });

    if (lead && (status === 'Token Received' || status === 'Confirmed')) {
      this.updateLead(lead.id, { status: 'Booking' });
    }
    return act;
  }

  public updateTokenStatus(
    activityId: string,
    status: 'Token Received' | 'Confirmed' | 'Cancelled' | 'Refunded',
    remarks?: string
  ): SalesActivity | undefined {
    return this.updateSalesActivity(activityId, {
      status,
      ...(remarks !== undefined ? { remarks } : {}),
    });
  }

  public getTokens(leadId?: string): SalesActivity[] {
    const activities = this.getSalesActivities({ activityType: 'Token' });
    if (!leadId) return activities;
    return activities.filter((a) => a.leadId === leadId);
  }

  // --- Target & Achievement Calculations ---
  public calculateMetricProgress(target: number, achieved: number, remainingWorkingDays: number) {
    const gap = Math.max(0, target - achieved);
    const isExceeded = achieved > target && target > 0;
    const exceededBy = isExceeded ? achieved - target : 0;
    const achievementPercent = target > 0 ? Math.round((achieved / target) * 1000) / 10 : null;

    let requiredDailyPace: number | null = null;
    if (target > 0) {
      if (gap <= 0) {
        requiredDailyPace = 0;
      } else if (remainingWorkingDays > 0) {
        requiredDailyPace = Math.round((gap / remainingWorkingDays) * 10) / 10;
      } else {
        requiredDailyPace = 0;
      }
    }

    return {
      target,
      achieved,
      gap,
      isExceeded,
      exceededBy,
      achievementPercent,
      requiredDailyPace,
    };
  }

  public getMonthlyTargetAndAchievement(
    month: number,
    year: number,
    teamId?: string,
    executiveId?: string
  ) {
    const targets = this.getMonthlyTargets(month, year);
    const activities = this.getSalesActivities({ month, year });
    const remainingWorkingDays = getRemainingWorkingDaysInMonth(year, month);

    let leadTarget = 0;
    let siteVisitTarget = 0;
    let tokenTarget = 0;

    if (executiveId) {
      const execTarget = targets.find((t) => t.executiveId === executiveId);
      if (execTarget) {
        leadTarget = execTarget.leadTarget;
        siteVisitTarget = execTarget.siteVisitTarget;
        tokenTarget = execTarget.tokenTarget;
      }
    } else if (teamId) {
      const tmTarget = targets.find((t) => t.teamId === teamId && !t.executiveId);
      if (tmTarget) {
        leadTarget = tmTarget.leadTarget;
        siteVisitTarget = tmTarget.siteVisitTarget;
        tokenTarget = tmTarget.tokenTarget;
      }
    } else {
      // Overall Business: sum team targets
      const teamTargets = targets.filter((t) => !t.executiveId);
      if (teamTargets.length > 0) {
        teamTargets.forEach((t) => {
          leadTarget += t.leadTarget;
          siteVisitTarget += t.siteVisitTarget;
          tokenTarget += t.tokenTarget;
        });
      } else {
        // Fallback to executive targets if only individual targets were entered
        targets.forEach((t) => {
          leadTarget += t.leadTarget;
          siteVisitTarget += t.siteVisitTarget;
          tokenTarget += t.tokenTarget;
        });
      }
    }

    // Filter activities by team / executive if specified
    const relevantActivities = activities.filter((a) => {
      if (executiveId && a.executiveId !== executiveId) return false;
      if (teamId && a.teamId !== teamId) return false;
      return true;
    });

    let leadAchieved = 0;
    let siteVisitAchieved = 0;
    let tokenAchieved = 0;

    relevantActivities.forEach((a) => {
      if (a.activityType === 'Lead') {
        leadAchieved++;
      } else if (a.activityType === 'Site Visit') {
        // Only completed Site Visits count toward achievement
        if (a.status === 'Site Visit Done') {
          siteVisitAchieved++;
        }
      } else if (a.activityType === 'Token') {
        // Only active/valid tokens count (Token Received or Confirmed)
        if (a.status === 'Token Received' || a.status === 'Confirmed') {
          tokenAchieved++;
        }
      }
    });

    return {
      leads: this.calculateMetricProgress(leadTarget, leadAchieved, remainingWorkingDays),
      siteVisits: this.calculateMetricProgress(siteVisitTarget, siteVisitAchieved, remainingWorkingDays),
      tokens: this.calculateMetricProgress(tokenTarget, tokenAchieved, remainingWorkingDays),
      remainingWorkingDays,
      hasTargetsSet: leadTarget > 0 || siteVisitTarget > 0 || tokenTarget > 0,
    };
  }

  // Daily activity breakdown for the entire month
  public getMonthlyDailyActivity(
    month: number,
    year: number,
    teamId?: string,
    executiveId?: string
  ) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const activities = this.getSalesActivities({ month, year });

    const dailyMap: Record<
      string,
      { date: string; displayDate: string; leads: number; siteVisits: number; tokens: number }
    > = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      const mStr = String(month).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;
      const monthShort = MONTH_NAMES[month - 1]?.substring(0, 3) || '';
      dailyMap[dateKey] = {
        date: dateKey,
        displayDate: `${dStr} ${monthShort}`,
        leads: 0,
        siteVisits: 0,
        tokens: 0,
      };
    }

    activities.forEach((a) => {
      if (teamId && a.teamId !== teamId) return;
      if (executiveId && a.executiveId !== executiveId) return;

      if (dailyMap[a.activityDate]) {
        if (a.activityType === 'Lead') {
          dailyMap[a.activityDate].leads++;
        } else if (a.activityType === 'Site Visit' && a.status === 'Site Visit Done') {
          dailyMap[a.activityDate].siteVisits++;
        } else if (
          a.activityType === 'Token' &&
          (a.status === 'Token Received' || a.status === 'Confirmed')
        ) {
          dailyMap[a.activityDate].tokens++;
        }
      }
    });

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  // --- Backup & Restore with Complete Metadata and Strict Validation ---
  public createBackup(): AppDataBackup {
    return {
      appIdentifier: 'BM_SALES_LEAD_MANAGER',
      backupVersion: '1.0.0',
      dataStructureVersion: '1.0',
      exportDate: new Date().toISOString(),
      leads: this.getAllLeadsRaw(),
      followUps: this.getFollowUps(),
      teams: this.getTeams(),
      executives: this.getExecutives(),
      projects: this.getProjects(),
      leadSources: this.getLeadSources(),
      preferredUnits: this.getPreferredUnits(),
      settings: this.getSettings(),
      monthlyTargets: this.getMonthlyTargets(),
      salesActivities: this.getSalesActivities(),
    };
  }

  public validateBackup(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'The file is empty or not valid JSON.' };
    }
    if (data.appIdentifier !== 'BM_SALES_LEAD_MANAGER' && !data.version) {
      return {
        valid: false,
        error: 'This backup file is invalid or incompatible with this application version.',
      };
    }
    if (!Array.isArray(data.leads) || !Array.isArray(data.teams)) {
      return {
        valid: false,
        error: 'Backup structure is corrupt: missing leads or teams data.',
      };
    }
    return { valid: true };
  }

  public restoreBackup(data: AppDataBackup): { success: boolean; error?: string } {
    try {
      const validation = this.validateBackup(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      this.setItem(STORAGE_KEYS.LEADS, data.leads);
      this.setItem(STORAGE_KEYS.FOLLOW_UPS, Array.isArray(data.followUps) ? data.followUps : []);
      this.setItem(STORAGE_KEYS.TEAMS, data.teams);
      this.setItem(STORAGE_KEYS.EXECUTIVES, Array.isArray(data.executives) ? data.executives : []);
      this.setItem(STORAGE_KEYS.PROJECTS, Array.isArray(data.projects) ? data.projects : []);
      this.setItem(
        STORAGE_KEYS.LEAD_SOURCES,
        Array.isArray(data.leadSources) ? data.leadSources : INITIAL_LEAD_SOURCES
      );
      this.setItem(
        STORAGE_KEYS.PREFERRED_UNITS,
        Array.isArray(data.preferredUnits) ? data.preferredUnits : INITIAL_UNITS
      );
      this.setItem(STORAGE_KEYS.SETTINGS, data.settings || DEFAULT_SETTINGS);
      this.setItem(
        STORAGE_KEYS.TARGETS,
        Array.isArray(data.monthlyTargets) ? data.monthlyTargets : []
      );
      this.setItem(
        STORAGE_KEYS.ACTIVITIES,
        Array.isArray(data.salesActivities) ? data.salesActivities : []
      );
      this.setItem(STORAGE_KEYS.INITIALIZED, true);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to restore backup.' };
    }
  }

  public clearAllData(): void {
    this.initializeCleanDatabase();
  }
}

export const storage = new StorageService();
