import React, { useState, useMemo } from 'react';
import { MONTH_NAMES, getMonthName, getTodayDateString, storage } from '../../services/storage';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  PieChart,
  Printer,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const leads = storage.getLeads();
  const teams = storage.getTeams();
  const executives = storage.getExecutives();
  const leadSources = storage.getLeadSources();
  const today = getTodayDateString();

  const currentDate = new Date();
  const [targetReportMonth, setTargetReportMonth] = useState<number>(currentDate.getMonth() + 1);
  const [targetReportYear, setTargetReportYear] = useState<number>(currentDate.getFullYear());

  // Date range filter
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR'>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<
    'summary' | 'teams' | 'executives' | 'sources' | 'targets'
  >('summary');

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
          <button
            onClick={() => setActiveReportTab('targets')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeReportTab === 'targets'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>5. Target & Achievement Report</span>
          </button>
        </div>

        {/* Empty State Check for Selected Period */}
        {filteredLeads.length === 0 && activeReportTab !== 'targets' ? (
          <div className="p-12 text-center bg-white">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No data available for the selected period.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Reports and conversion metrics will calculate automatically once customer leads are recorded.
            </p>
          </div>
        ) : (
          <>
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

        {/* Tab 5: Monthly Target & Sales Achievement Report */}
        {activeReportTab === 'targets' && (
          <div className="p-6 space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-wrap justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Monthly Target & Sales Achievement Statement
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Auditable statement showing Targets, Actuals, Gaps, and Achievement Percentages.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={targetReportMonth}
                  onChange={(e) => setTargetReportMonth(parseInt(e.target.value, 10))}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-hidden"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={targetReportYear}
                  onChange={(e) => setTargetReportYear(parseInt(e.target.value, 10))}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-hidden"
                >
                  {[targetReportYear - 1, targetReportYear, targetReportYear + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const monthName = getMonthName(targetReportMonth);
                    const rows = [
                      [
                        'Month',
                        'Year',
                        'Team',
                        'Executive Scope',
                        'Lead Target',
                        'Lead Achieved',
                        'Lead Gap',
                        'Lead Ach %',
                        'SV Target',
                        'SV Done',
                        'SV Gap',
                        'SV Ach %',
                        'Token Target',
                        'Token Achieved',
                        'Token Gap',
                        'Token Ach %',
                      ],
                    ];

                    teams.forEach((t) => {
                      const tm = storage.getMonthlyTargetAndAchievement(
                        targetReportMonth,
                        targetReportYear,
                        t.id,
                        undefined
                      );
                      rows.push([
                        monthName,
                        String(targetReportYear),
                        t.teamName,
                        'Overall Team Target',
                        String(tm.leads.target),
                        String(tm.leads.achieved),
                        String(tm.leads.gap),
                        tm.leads.achievementPercent !== null ? `${tm.leads.achievementPercent}%` : 'Not Set',
                        String(tm.siteVisits.target),
                        String(tm.siteVisits.achieved),
                        String(tm.siteVisits.gap),
                        tm.siteVisits.achievementPercent !== null ? `${tm.siteVisits.achievementPercent}%` : 'Not Set',
                        String(tm.tokens.target),
                        String(tm.tokens.achieved),
                        String(tm.tokens.gap),
                        tm.tokens.achievementPercent !== null ? `${tm.tokens.achievementPercent}%` : 'Not Set',
                      ]);

                      executives
                        .filter((e) => e.teamId === t.id)
                        .forEach((ex) => {
                          const em = storage.getMonthlyTargetAndAchievement(
                            targetReportMonth,
                            targetReportYear,
                            t.id,
                            ex.id
                          );
                          rows.push([
                            monthName,
                            String(targetReportYear),
                            t.teamName,
                            ex.name,
                            String(em.leads.target),
                            String(em.leads.achieved),
                            String(em.leads.gap),
                            em.leads.achievementPercent !== null ? `${em.leads.achievementPercent}%` : 'Not Set',
                            String(em.siteVisits.target),
                            String(em.siteVisits.achieved),
                            String(em.siteVisits.gap),
                            em.siteVisits.achievementPercent !== null ? `${em.siteVisits.achievementPercent}%` : 'Not Set',
                            String(em.tokens.target),
                            String(em.tokens.achieved),
                            String(em.tokens.gap),
                            em.tokens.achievementPercent !== null ? `${em.tokens.achievementPercent}%` : 'Not Set',
                          ]);
                        });
                    });

                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute(
                      'download',
                      `BM_Target_Report_${monthName}_${targetReportYear}.csv`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Target & Achievement Statement Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Month</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3">Scope / Executive</th>
                    <th className="py-3 px-2 text-right">Lead Tgt</th>
                    <th className="py-3 px-2 text-right">Lead Ach</th>
                    <th className="py-3 px-2 text-right">Lead Gap</th>
                    <th className="py-3 px-2 text-right">SV Tgt</th>
                    <th className="py-3 px-2 text-right">SV Ach</th>
                    <th className="py-3 px-2 text-right">SV Gap</th>
                    <th className="py-3 px-2 text-right">Token Tgt</th>
                    <th className="py-3 px-2 text-right">Token Ach</th>
                    <th className="py-3 px-2 text-right">Token Gap</th>
                    <th className="py-3 px-3 text-center">Achievement %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((t) => {
                    const tm = storage.getMonthlyTargetAndAchievement(
                      targetReportMonth,
                      targetReportYear,
                      t.id,
                      undefined
                    );
                    const teamExecs = executives.filter((e) => e.teamId === t.id);

                    return (
                      <React.Fragment key={t.id}>
                        {/* Team Header Row */}
                        <tr className="bg-blue-50/30 font-bold">
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-900">
                            {getMonthName(targetReportMonth)} {targetReportYear}
                          </td>
                          <td className="py-3 px-3 text-blue-900 whitespace-nowrap">
                            {t.teamName}
                          </td>
                          <td className="py-3 px-3 text-blue-950 font-bold whitespace-nowrap">
                            🏢 Team Target
                          </td>

                          {/* Leads */}
                          <td className="py-3 px-2 text-right font-mono text-slate-600">
                            {tm.leads.target || '—'}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-blue-900 font-black">
                            {tm.leads.achieved}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-slate-800">
                            {tm.leads.isExceeded ? (
                              <span className="text-emerald-700 font-bold text-[10px]">
                                Exceeded +{tm.leads.exceededBy}
                              </span>
                            ) : (
                              tm.leads.gap
                            )}
                          </td>

                          {/* Site Visits */}
                          <td className="py-3 px-2 text-right font-mono text-slate-600">
                            {tm.siteVisits.target || '—'}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-indigo-900 font-black">
                            {tm.siteVisits.achieved}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-slate-800">
                            {tm.siteVisits.isExceeded ? (
                              <span className="text-emerald-700 font-bold text-[10px]">
                                Exceeded +{tm.siteVisits.exceededBy}
                              </span>
                            ) : (
                              tm.siteVisits.gap
                            )}
                          </td>

                          {/* Tokens */}
                          <td className="py-3 px-2 text-right font-mono text-slate-600">
                            {tm.tokens.target || '—'}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-emerald-900 font-black">
                            {tm.tokens.achieved}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-slate-800">
                            {tm.tokens.isExceeded ? (
                              <span className="text-emerald-700 font-bold text-[10px]">
                                Exceeded +{tm.tokens.exceededBy}
                              </span>
                            ) : (
                              tm.tokens.gap
                            )}
                          </td>

                          {/* Ach % */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[10.5px]">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                              L:{' '}
                              {tm.leads.achievementPercent !== null
                                ? `${tm.leads.achievementPercent}%`
                                : '—'}
                            </span>{' '}
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold">
                              SV:{' '}
                              {tm.siteVisits.achievementPercent !== null
                                ? `${tm.siteVisits.achievementPercent}%`
                                : '—'}
                            </span>{' '}
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                              T:{' '}
                              {tm.tokens.achievementPercent !== null
                                ? `${tm.tokens.achievementPercent}%`
                                : '—'}
                            </span>
                          </td>
                        </tr>

                        {/* Executive Sub-Rows */}
                        {teamExecs.map((ex) => {
                          const em = storage.getMonthlyTargetAndAchievement(
                            targetReportMonth,
                            targetReportYear,
                            t.id,
                            ex.id
                          );
                          return (
                            <tr key={ex.id} className="hover:bg-slate-50/70 text-slate-700">
                              <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap pl-6">
                                ↳
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                                {t.teamName}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                                👤 {ex.name}
                              </td>

                              {/* Leads */}
                              <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                                {em.leads.target || '—'}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono font-bold text-blue-800">
                                {em.leads.achieved}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                                {em.leads.isExceeded ? 'Exceeded' : em.leads.gap}
                              </td>

                              {/* Site Visits */}
                              <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                                {em.siteVisits.target || '—'}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono font-bold text-indigo-800">
                                {em.siteVisits.achieved}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                                {em.siteVisits.isExceeded ? 'Exceeded' : em.siteVisits.gap}
                              </td>

                              {/* Tokens */}
                              <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                                {em.tokens.target || '—'}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-800">
                                {em.tokens.achieved}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                                {em.tokens.isExceeded ? 'Exceeded' : em.tokens.gap}
                              </td>

                              {/* Ach % */}
                              <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[10px]">
                                <span className="text-blue-700">
                                  {em.leads.achievementPercent !== null
                                    ? `${em.leads.achievementPercent}%`
                                    : '—'}
                                </span>{' '}
                                &bull;{' '}
                                <span className="text-indigo-700">
                                  {em.siteVisits.achievementPercent !== null
                                    ? `${em.siteVisits.achievementPercent}%`
                                    : '—'}
                                </span>{' '}
                                &bull;{' '}
                                <span className="text-emerald-700">
                                  {em.tokens.achievementPercent !== null
                                    ? `${em.tokens.achievementPercent}%`
                                    : '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};
