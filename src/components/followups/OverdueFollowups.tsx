import React, { useState, useMemo } from 'react';
import { Lead, LeadPriority } from '../../types';
import { formatDate, getDaysOverdue, getTodayDateString, storage } from '../../services/storage';
import {
  AlertTriangle,
  Clock,
  Printer,
  Search,
} from 'lucide-react';
import { AddFollowupModal } from './AddFollowupModal';
import { PrintPreviewModal } from '../print/PrintPreviewModal';

interface OverdueFollowupsProps {
  onSelectLead: (leadId: string) => void;
}

export const OverdueFollowups: React.FC<OverdueFollowupsProps> = ({ onSelectLead }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const leads = useMemo(() => storage.getLeads(), [dataVersion]);
  const today = getTodayDateString();

  const [activeLeadForFollowup, setActiveLeadForFollowup] = useState<Lead | null>(null);
  const [activeLeadForPrint, setActiveLeadForPrint] = useState<Lead | null>(null);

  // Filters
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterExec, setFilterExec] = useState('ALL');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterDaysRange, setFilterDaysRange] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const teams = useMemo(() => storage.getTeams(), [dataVersion]);
  const executives = useMemo(() => storage.getExecutives(), [dataVersion]);
  const projects = useMemo(() => storage.getProjects(), [dataVersion]);

  // Overdue leads: nextFollowUpDate < today and status not closed
  const overdueLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (!lead.nextFollowUpDate) return false;
        if (lead.nextFollowUpDate >= today) return false;
        if (lead.status === 'Converted' || lead.status === 'Lost' || lead.status === 'Not Interested') {
          return false;
        }

        const days = getDaysOverdue(lead.nextFollowUpDate, today);

        if (filterDaysRange === '1-3' && (days < 1 || days > 3)) return false;
        if (filterDaysRange === '4-7' && (days < 4 || days > 7)) return false;
        if (filterDaysRange === '7+' && days <= 7) return false;

        if (filterTeam !== 'ALL' && lead.teamId !== filterTeam) return false;
        if (filterExec !== 'ALL' && lead.executiveId !== filterExec) return false;
        if (filterProject !== 'ALL' && lead.interestedProject !== filterProject) return false;
        if (filterPriority !== 'ALL' && lead.priority !== filterPriority) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = lead.customerDetails.name.toLowerCase().includes(q);
          const matchesMobile = lead.customerDetails.mobile.toLowerCase().includes(q);
          const matchesExec = lead.executiveName.toLowerCase().includes(q);
          const matchesId = lead.leadId.toLowerCase().includes(q);
          if (!matchesName && !matchesMobile && !matchesExec && !matchesId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by most overdue first
        const daysA = getDaysOverdue(a.nextFollowUpDate, today);
        const daysB = getDaysOverdue(b.nextFollowUpDate, today);
        return daysB - daysA;
      });
  }, [leads, today, filterTeam, filterExec, filterProject, filterPriority, filterDaysRange, searchQuery]);

  const refreshData = () => setDataVersion((v) => v + 1);

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case 'Hot':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🔥 Hot</span>;
      case 'Warm':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">⚡ Warm</span>;
      case 'Cold':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">❄️ Cold</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Overdue Follow-ups
            </h2>
            <span className="bg-amber-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
              {overdueLeads.length} Attention Needed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current Date: <span className="font-semibold text-slate-800">{formatDate(today)}</span> &bull; Customer follow-ups where scheduled date has elapsed
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search overdue leads..."
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 w-44"
          />

          <select
            value={filterDaysRange}
            onChange={(e) => setFilterDaysRange(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-semibold"
          >
            <option value="ALL">All Overdue</option>
            <option value="1-3">1–3 Days Overdue</option>
            <option value="4-7">4–7 Days Overdue</option>
            <option value="7+">&gt; 7 Days Overdue</option>
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teamName}
              </option>
            ))}
          </select>

          <select
            value={filterExec}
            onChange={(e) => setFilterExec(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Executives</option>
            {executives.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {overdueLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              No overdue follow-ups
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Outstanding! All pending follow-ups are up to date and tracked according to schedule.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Customer</th>
                  <th className="py-3 px-3">Executive</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3 text-center">Scheduled Due Date</th>
                  <th className="py-3 px-3 text-center">Days Overdue</th>
                  <th className="py-3 px-2 text-center">Priority</th>
                  <th className="py-3 px-3">Last Remark</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueLeads.map((lead) => {
                  const daysOverdue = getDaysOverdue(lead.nextFollowUpDate, today);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectLead(lead.id)}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-1.5 mt-0.5">
                          <span className="text-blue-700 font-semibold">{lead.leadId}</span>
                          <span>&bull;</span>
                          <span>{lead.customerDetails.mobile}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {lead.executiveName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {lead.teamName}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {lead.interestedProject}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(lead.nextFollowUpDate)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          daysOverdue >= 5
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {getPriorityBadge(lead.priority)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {lead.lastFollowUpRemark || '-'}
                      </td>
                      <td
                        className="py-3 px-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setActiveLeadForFollowup(lead)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded transition-colors shadow-xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Update Follow-up</span>
                          </button>
                          <button
                            onClick={() => setActiveLeadForPrint(lead)}
                            title="Print A4 Customer File"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 border border-slate-300"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeLeadForFollowup && (
        <AddFollowupModal
          lead={activeLeadForFollowup}
          isOpen={true}
          onClose={() => setActiveLeadForFollowup(null)}
          onSuccess={() => {
            refreshData();
            setActiveLeadForFollowup(null);
          }}
        />
      )}

      {activeLeadForPrint && (
        <PrintPreviewModal
          lead={activeLeadForPrint}
          followUps={storage.getFollowUps(activeLeadForPrint.id)}
          isOpen={true}
          onClose={() => setActiveLeadForPrint(null)}
        />
      )}
    </div>
  );
};
