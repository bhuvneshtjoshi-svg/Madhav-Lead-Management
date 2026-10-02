import React, { useMemo, useState } from 'react';
import { Lead, LeadPriority, LeadStatus } from '../../types';
import { formatDate, getDaysOverdue, getTodayDateString, storage } from '../../services/storage';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  PlusCircle,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { AddFollowupModal } from '../followups/AddFollowupModal';
import { MonthlyTargetSection } from '../targets/MonthlyTargetSection';

interface DashboardProps {
  onSelectLead: (leadId: string) => void;
  onNavigate: (view: string) => void;
  onNewLeadClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectLead,
  onNavigate,
  onNewLeadClick,
}) => {
  const [dataVersion, setDataVersion] = useState(0);
  const leads = useMemo(() => storage.getLeads(), [dataVersion]);
  const today = getTodayDateString();

  const [activeFollowupLead, setActiveFollowupLead] = useState<Lead | null>(null);

  const refreshData = () => setDataVersion((v) => v + 1);

  // Compute Metrics
  const metrics = useMemo(() => {
    let totalLeads = leads.length;
    let newLeads = 0;
    let activeLeads = 0;
    let todayFollowups = 0;
    let overdueFollowups = 0;
    let hotLeads = 0;
    let siteVisits = 0;
    let convertedLeads = 0;

    leads.forEach((l) => {
      if (l.status === 'New') newLeads++;
      if (l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') {
        activeLeads++;
      }
      if (l.status === 'Converted') convertedLeads++;
      if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
      if (l.priority === 'Hot') hotLeads++;

      if (l.nextFollowUpDate === today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') {
        todayFollowups++;
      }
      if (l.nextFollowUpDate && l.nextFollowUpDate < today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') {
        overdueFollowups++;
      }
    });

    return {
      totalLeads,
      newLeads,
      activeLeads,
      todayFollowups,
      overdueFollowups,
      hotLeads,
      siteVisits,
      convertedLeads,
    };
  }, [leads, today]);

  // Today's Follow-up Leads (limit 5 on dashboard)
  const todayFollowupList = useMemo(() => {
    return leads
      .filter((l) => l.nextFollowUpDate === today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested')
      .slice(0, 5);
  }, [leads, today]);

  // Overdue Follow-up Leads (limit 5 on dashboard)
  const overdueFollowupList = useMemo(() => {
    return leads
      .filter((l) => l.nextFollowUpDate && l.nextFollowUpDate < today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested')
      .sort((a, b) => getDaysOverdue(b.nextFollowUpDate, today) - getDaysOverdue(a.nextFollowUpDate, today))
      .slice(0, 5);
  }, [leads, today]);

  // Recent Leads (limit 6 on dashboard)
  const recentLeadsList = useMemo(() => {
    return [...leads]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 6);
  }, [leads]);

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case 'Hot':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🔥 Hot</span>;
      case 'Warm':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">⚡ Warm</span>;
      case 'Cold':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">❄️ Cold</span>;
    }
  };

  const getStatusBadge = (s: LeadStatus) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (s === 'Converted') color = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    else if (s === 'Site Visit Done' || s === 'Site Visit Planned') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    else if (s === 'Lost' || s === 'Not Interested') color = 'bg-rose-50 text-rose-700 border-rose-200';
    else if (s === 'Follow-up') color = 'bg-blue-50 text-blue-700 border-blue-200';
    return <span className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap ${color}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Date Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Executive Operations Center
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
            BM Sales Lead Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-user management dashboard for tracking customer leads, daily follow-ups, and sales progress
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Business Date</div>
            <div className="text-sm font-bold text-slate-800 flex items-center space-x-1.5 justify-end">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formatDate(today)}</span>
            </div>
          </div>
          <button
            onClick={onNewLeadClick}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Customer Lead</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (8 Core Management Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalLeads}</div>
          <div className="text-[10px] text-slate-400 mt-1">All in database</div>
        </div>

        {/* New Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">New Leads</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.newLeads}</div>
          <div className="text-[10px] text-slate-400 mt-1">Pending contact</div>
        </div>

        {/* Active Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Leads</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{metrics.activeLeads}</div>
          <div className="text-[10px] text-slate-400 mt-1">In pipeline</div>
        </div>

        {/* Today's Follow-ups */}
        <div
          onClick={() => onNavigate('today')}
          className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider flex items-center justify-between">
            <span>Today's F/Up</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{metrics.todayFollowups}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">Due today</div>
        </div>

        {/* Overdue Follow-ups */}
        <div
          onClick={() => onNavigate('overdue')}
          className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-500 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Overdue</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.overdueFollowups}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">Action delayed</div>
        </div>

        {/* Hot Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Hot Leads</span>
            <Flame className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{metrics.hotLeads}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-1">High conversion</div>
        </div>

        {/* Site Visits */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Site Visits</span>
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{metrics.siteVisits}</div>
          <div className="text-[10px] text-slate-400 mt-1">Planned / Done</div>
        </div>

        {/* Converted Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Converted</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.convertedLeads}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Booked deals</div>
        </div>
      </div>

      {/* MONTHLY TARGET & ACHIEVEMENT SECTION */}
      <MonthlyTargetSection
        onNavigateToTargetSetter={() => onNavigate('target-setter')}
        onSelectLead={onSelectLead}
      />

      {/* Grid: Today's Follow-ups & Overdue Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TODAY'S FOLLOW-UPS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Today's Scheduled Follow-ups</h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {metrics.todayFollowups}
              </span>
            </div>
            <button
              onClick={() => onNavigate('today')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayFollowupList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No follow-ups scheduled for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/40 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Executive</th>
                    <th className="py-2.5 px-2">Project</th>
                    <th className="py-2.5 px-2 text-center">Priority</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayFollowupList.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead.id)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.leadId} &bull; {lead.customerDetails.mobile}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {lead.executiveName}
                        <div className="text-[10px] text-slate-400">{lead.teamName}</div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-700 truncate max-w-[110px]">
                        {lead.interestedProject}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {getPriorityBadge(lead.priority)}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td
                        className="py-2.5 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setActiveFollowupLead(lead)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded transition-colors"
                        >
                          Follow-up
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* OVERDUE FOLLOW-UPS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Overdue Follow-ups</h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {metrics.overdueFollowups}
              </span>
            </div>
            <button
              onClick={() => onNavigate('overdue')}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueFollowupList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No overdue follow-ups! All follow-ups are up to date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/40 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Executive</th>
                    <th className="py-2.5 px-2">Due Date</th>
                    <th className="py-2.5 px-2 text-center">Overdue</th>
                    <th className="py-2.5 px-2 text-center">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueFollowupList.map((lead) => {
                    const days = getDaysOverdue(lead.nextFollowUpDate, today);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => onSelectLead(lead.id)}
                        className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{lead.leadId} &bull; {lead.customerDetails.mobile}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {lead.executiveName}
                          <div className="text-[10px] text-slate-400">{lead.teamName}</div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-700 whitespace-nowrap">
                          {formatDate(lead.nextFollowUpDate)}
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {days}d overdue
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          {getPriorityBadge(lead.priority)}
                        </td>
                        <td
                          className="py-2.5 px-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setActiveFollowupLead(lead)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] rounded transition-colors"
                          >
                            Follow-up
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RECENT LEADS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Leads</h3>
            <span className="text-xs text-slate-500 font-normal">Latest additions</span>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLeadsList.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No leads have been created yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Create your real customer leads to track daily follow-ups, assign sales executives, and generate printed A4 customer file records.
            </p>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-3 text-xs">
              <button
                onClick={() => onNavigate('teams')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300"
              >
                1. Create Team
              </button>
              <button
                onClick={() => onNavigate('masters')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300"
              >
                2. Add Project
              </button>
              <button
                onClick={onNewLeadClick}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                3. Create New Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/40 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Lead ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Project & Unit</th>
                  <th className="py-2.5 px-3">Executive</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-center">Priority</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeadsList.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-900">
                      {lead.leadId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{lead.customerDetails.mobile}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{lead.interestedProject}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {lead.propertyRequirement.preferredUnit || '-'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {lead.executiveName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {lead.teamName}
                    </td>
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {getPriorityBadge(lead.priority)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono whitespace-nowrap">
                      {formatDate(lead.leadDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Followup Modal */}
      {activeFollowupLead && (
        <AddFollowupModal
          lead={activeFollowupLead}
          isOpen={true}
          onClose={() => setActiveFollowupLead(null)}
          onSuccess={() => {
            refreshData();
            setActiveFollowupLead(null);
          }}
        />
      )}
    </div>
  );
};
