import React, { useState, useMemo } from 'react';
import { getTodayDateString, storage } from '../../services/storage';
import { Building, Users, Calendar, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';

interface TeamWorkProps {
  onSelectExecutive: (execId: string) => void;
}

export const TeamWork: React.FC<TeamWorkProps> = ({ onSelectExecutive }) => {
  const teams = storage.getTeams();
  const executives = storage.getExecutives();
  const leads = storage.getLeads();
  const today = getTodayDateString();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  // Calculate team & per-executive statistics
  const teamStats = useMemo(() => {
    if (!currentTeam) return { execStats: [], totals: { totalLeads: 0, todayFollowups: 0, overdue: 0, siteVisits: 0, converted: 0 } };

    const teamExecs = executives.filter(e => e.teamId === currentTeam.id);

    const execStats = teamExecs.map(exec => {
      const execLeads = leads.filter(l => l.executiveId === exec.id);
      let totalLeads = execLeads.length;
      let todayFollowups = 0;
      let overdue = 0;
      let siteVisits = 0;
      let converted = 0;

      execLeads.forEach(l => {
        if (l.status === 'Converted') converted++;
        if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
        if (l.nextFollowUpDate === today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') {
          todayFollowups++;
        }
        if (l.nextFollowUpDate && l.nextFollowUpDate < today && l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') {
          overdue++;
        }
      });

      return {
        executive: exec,
        totalLeads,
        todayFollowups,
        overdue,
        siteVisits,
        converted,
      };
    });

    const totals = execStats.reduce(
      (acc, curr) => ({
        totalLeads: acc.totalLeads + curr.totalLeads,
        todayFollowups: acc.todayFollowups + curr.todayFollowups,
        overdue: acc.overdue + curr.overdue,
        siteVisits: acc.siteVisits + curr.siteVisits,
        converted: acc.converted + curr.converted,
      }),
      { totalLeads: 0, todayFollowups: 0, overdue: 0, siteVisits: 0, converted: 0 }
    );

    return { execStats, totals };
  }, [currentTeam, executives, leads, today]);

  return (
    <div className="space-y-6">
      {/* Header & Team Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Team Workload & Progress</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor sales team distribution, active follow-ups, and conversion metrics
          </p>
        </div>

        {/* Team Selection Tabs */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600 mr-1">Select Team:</span>
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedTeamId === team.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {team.teamName}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards for the Selected Team */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Team Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{teamStats.totals.totalLeads}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-800 uppercase flex items-center justify-between">
            <span>Today's Follow-ups</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{teamStats.totals.todayFollowups}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase flex items-center justify-between">
            <span>Overdue Follow-ups</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{teamStats.totals.overdue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <div className="text-[11px] font-semibold text-indigo-800 uppercase flex items-center justify-between">
            <span>Site Visits</span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{teamStats.totals.siteVisits}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center justify-between">
            <span>Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{teamStats.totals.converted}</div>
        </div>
      </div>

      {/* Main Team Table Matching Specification #24 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
            {currentTeam?.teamName || 'Team'} — Executive Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            Click any executive to view their detailed individual lead sheet
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Sales Executive</th>
              <th className="py-3 px-4 text-center">Total Leads</th>
              <th className="py-3 px-4 text-center">Today's Follow-ups</th>
              <th className="py-3 px-4 text-center">Overdue</th>
              <th className="py-3 px-4 text-center">Site Visits</th>
              <th className="py-3 px-4 text-center">Converted</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teamStats.execStats.map(({ executive, totalLeads, todayFollowups, overdue, siteVisits, converted }) => (
              <tr
                key={executive.id}
                onClick={() => onSelectExecutive(executive.id)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer"
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 text-sm">{executive.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{executive.mobile || 'No mobile'}</div>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-sm">
                  {totalLeads}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    todayFollowups > 0 ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-400'
                  }`}>
                    {todayFollowups}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    overdue > 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'
                  }`}>
                    {overdue}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                  {siteVisits}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    converted > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'
                  }`}>
                    {converted}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExecutive(executive.id);
                    }}
                    className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold text-xs transition-colors"
                  >
                    View Leads
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Summary Row */}
          <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900 text-xs">
            <tr>
              <td className="py-3 px-4 uppercase text-slate-700">Team Total</td>
              <td className="py-3 px-4 text-center text-sm">{teamStats.totals.totalLeads}</td>
              <td className="py-3 px-4 text-center text-sm text-blue-700">{teamStats.totals.todayFollowups}</td>
              <td className="py-3 px-4 text-center text-sm text-amber-700">{teamStats.totals.overdue}</td>
              <td className="py-3 px-4 text-center text-sm">{teamStats.totals.siteVisits}</td>
              <td className="py-3 px-4 text-center text-sm text-emerald-700">{teamStats.totals.converted}</td>
              <td className="py-3 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
