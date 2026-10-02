import React, { useState, useMemo } from 'react';
import { getTodayDateString, storage } from '../../services/storage';
import { BarChart3, Calendar, Download, PieChart, Users, TrendingUp, Filter } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const leads = storage.getLeads();
  const teams = storage.getTeams();
  const executives = storage.getExecutives();
  const leadSources = storage.getLeadSources();
  const today = getTodayDateString();

  // Date range filter
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR'>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'teams' | 'executives' | 'sources'>('summary');

  // Filtered leads based on date range
  const filteredLeads = useMemo(() => {
    if (dateRange === 'ALL') return leads;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return leads.filter(l => {
      if (!l.leadDate) return true;
      const lDate = new Date(l.leadDate);

      if (dateRange === 'THIS_MONTH') {
        return lDate.getFullYear() === currentYear && lDate.getMonth() === currentMonth;
      }
      if (dateRange === 'LAST_30') {
        const diffDays = (now.getTime() - lDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (dateRange === 'THIS_YEAR') {
        return lDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [leads, dateRange]);

  // Tab 1: Lead Summary Metrics
  const summaryMetrics = useMemo(() => {
    let total = filteredLeads.length;
    let newLeads = 0;
    let active = 0;
    let converted = 0;
    let lost = 0;
    let future = 0;
    let notInterested = 0;
    let siteVisits = 0;

    let hot = 0;
    let warm = 0;
    let cold = 0;

    filteredLeads.forEach(l => {
      if (l.status === 'New') newLeads++;
      if (l.status === 'Converted') converted++;
      if (l.status === 'Lost') lost++;
      if (l.status === 'Future') future++;
      if (l.status === 'Not Interested') notInterested++;
      if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
      if (l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') active++;

      if (l.priority === 'Hot') hot++;
      if (l.priority === 'Warm') warm++;
      if (l.priority === 'Cold') cold++;
    });

    return { total, newLeads, active, converted, lost, future, notInterested, siteVisits, hot, warm, cold };
  }, [filteredLeads]);

  // Tab 2: Team Performance Report
  const teamReport = useMemo(() => {
    return teams.map(team => {
      const teamLeads = filteredLeads.filter(l => l.teamId === team.id);
      let followups = 0;
      let siteVisits = 0;
      let conversions = 0;

      teamLeads.forEach(l => {
        followups += (l.followUpCount || 0);
        if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
        if (l.status === 'Converted') conversions++;
      });

      const conversionRate = teamLeads.length > 0 ? ((conversions / teamLeads.length) * 100).toFixed(1) : '0.0';

      return {
        team,
        totalLeads: teamLeads.length,
        followups,
        siteVisits,
        conversions,
        conversionRate,
      };
    });
  }, [teams, filteredLeads]);

  // Tab 3: Executive Performance Report
  const executiveReport = useMemo(() => {
    return executives.map(exec => {
      const execLeads = filteredLeads.filter(l => l.executiveId === exec.id);
      let followups = 0;
      let pendingToday = 0;
      let overdue = 0;
      let siteVisits = 0;
      let conversions = 0;

      execLeads.forEach(l => {
        followups += (l.followUpCount || 0);
        if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
        if (l.status === 'Converted') conversions++;
        if (l.nextFollowUpDate === today && l.status !== 'Converted' && l.status !== 'Lost') pendingToday++;
        if (l.nextFollowUpDate && l.nextFollowUpDate < today && l.status !== 'Converted' && l.status !== 'Lost') overdue++;
      });

      const conversionRate = execLeads.length > 0 ? ((conversions / execLeads.length) * 100).toFixed(1) : '0.0';

      return {
        exec,
        totalLeads: execLeads.length,
        followups,
        pendingToday,
        overdue,
        siteVisits,
        conversions,
        conversionRate,
      };
    });
  }, [executives, filteredLeads, today]);

  // Tab 4: Lead Source Report
  const sourceReport = useMemo(() => {
    const counts: Record<string, { total: number; converted: number; siteVisits: number }> = {};

    leadSources.forEach(s => {
      counts[s.name] = { total: 0, converted: 0, siteVisits: 0 };
    });

    filteredLeads.forEach(l => {
      const src = l.leadSource || 'Other';
      if (!counts[src]) counts[src] = { total: 0, converted: 0, siteVisits: 0 };
      counts[src].total += 1;
      if (l.status === 'Converted') counts[src].converted += 1;
      if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') counts[src].siteVisits += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data,
      conversionRate: data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : '0.0',
    })).sort((a, b) => b.total - a.total);
  }, [leadSources, filteredLeads]);

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Business Reports & Analytics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Practical performance indicators for leads, team throughput, and conversion efficiency
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_30">Last 30 Days</option>
            <option value="THIS_YEAR">This Calendar Year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-semibold px-4">
          <button
            onClick={() => setActiveReportTab('summary')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeReportTab === 'summary'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Lead Summary Report
          </button>
          <button
            onClick={() => setActiveReportTab('teams')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeReportTab === 'teams'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Team Performance Report
          </button>
          <button
            onClick={() => setActiveReportTab('executives')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeReportTab === 'executives'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Executive Work Report
          </button>
          <button
            onClick={() => setActiveReportTab('sources')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeReportTab === 'sources'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Lead Source Analysis
          </button>
        </div>

        {/* Tab 1: Lead Summary */}
        {activeReportTab === 'summary' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Leads</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{summaryMetrics.total}</div>
              </div>
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-200">
                <div className="text-[10px] uppercase font-bold text-blue-800">New Leads</div>
                <div className="text-xl font-bold text-blue-700 mt-1">{summaryMetrics.newLeads}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-700">Active Leads</div>
                <div className="text-xl font-bold text-slate-800 mt-1">{summaryMetrics.active}</div>
              </div>
              <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-200">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Converted</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">{summaryMetrics.converted}</div>
              </div>
              <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-200">
                <div className="text-[10px] uppercase font-bold text-indigo-800">Site Visits</div>
                <div className="text-xl font-bold text-indigo-700 mt-1">{summaryMetrics.siteVisits}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-600">Future</div>
                <div className="text-xl font-bold text-slate-700 mt-1">{summaryMetrics.future}</div>
              </div>
              <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-200">
                <div className="text-[10px] uppercase font-bold text-rose-800">Lost / Not Int.</div>
                <div className="text-xl font-bold text-rose-700 mt-1">{summaryMetrics.lost + summaryMetrics.notInterested}</div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Pipeline Quality by Priority
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3 rounded border border-rose-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-rose-700">🔥 Hot Leads</span>
                    <p className="text-[11px] text-slate-500">Ready to decide / immediate urgency</p>
                  </div>
                  <span className="text-xl font-bold text-rose-700">{summaryMetrics.hot}</span>
                </div>
                <div className="bg-white p-3 rounded border border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-700">⚡ Warm Leads</span>
                    <p className="text-[11px] text-slate-500">Active engagement / 1–3 months</p>
                  </div>
                  <span className="text-xl font-bold text-amber-700">{summaryMetrics.warm}</span>
                </div>
                <div className="bg-white p-3 rounded border border-sky-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sky-700">❄️ Cold Leads</span>
                    <p className="text-[11px] text-slate-500">Longer timeline / preliminary explore</p>
                  </div>
                  <span className="text-xl font-bold text-sky-700">{summaryMetrics.cold}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Team Report */}
        {activeReportTab === 'teams' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-center">Total Leads Assigned</th>
                  <th className="py-3 px-4 text-center">Follow-ups Logged</th>
                  <th className="py-3 px-4 text-center">Site Visits Conducted</th>
                  <th className="py-3 px-4 text-center">Conversions</th>
                  <th className="py-3 px-4 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamReport.map(({ team, totalLeads, followups, siteVisits, conversions, conversionRate }) => (
                  <tr key={team.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{team.teamName}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">{totalLeads}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{followups}</td>
                    <td className="py-3 px-4 text-center font-semibold text-indigo-700">{siteVisits}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{conversions}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Executive Report */}
        {activeReportTab === 'executives' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Sales Executive</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-center">Leads Assigned</th>
                  <th className="py-3 px-4 text-center">Follow-ups Completed</th>
                  <th className="py-3 px-4 text-center">Pending Today</th>
                  <th className="py-3 px-4 text-center">Overdue</th>
                  <th className="py-3 px-4 text-center">Site Visits</th>
                  <th className="py-3 px-4 text-center">Conversions</th>
                  <th className="py-3 px-4 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executiveReport.map(({ exec, totalLeads, followups, pendingToday, overdue, siteVisits, conversions, conversionRate }) => (
                  <tr key={exec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{exec.name}</td>
                    <td className="py-3 px-4 text-slate-600">{exec.teamName}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">{totalLeads}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{followups}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${pendingToday > 0 ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-400'}`}>
                        {pendingToday}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${overdue > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-400'}`}>
                        {overdue}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-indigo-700">{siteVisits}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{conversions}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Lead Sources Report */}
        {activeReportTab === 'sources' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lead Source</th>
                  <th className="py-3 px-4 text-center">Total Inquiries</th>
                  <th className="py-3 px-4 text-center">Site Visits Planned/Done</th>
                  <th className="py-3 px-4 text-center">Conversions</th>
                  <th className="py-3 px-4 text-right">Conversion Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sourceReport.map(({ name, total, siteVisits, converted, conversionRate }) => (
                  <tr key={name} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{name}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">{total}</td>
                    <td className="py-3 px-4 text-center font-semibold text-indigo-700">{siteVisits}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{converted}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
