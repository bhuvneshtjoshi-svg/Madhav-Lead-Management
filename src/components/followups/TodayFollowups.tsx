import React, { useState, useMemo } from 'react';
import { Lead, LeadPriority, LeadStatus } from '../../types';
import { formatDate, getTodayDateString, storage } from '../../services/storage';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Phone,
  Printer,
  Search,
  Users,
} from 'lucide-react';
import { AddFollowupModal } from './AddFollowupModal';
import { PrintPreviewModal } from '../print/PrintPreviewModal';

interface TodayFollowupsProps {
  onSelectLead: (leadId: string) => void;
}

export const TodayFollowups: React.FC<TodayFollowupsProps> = ({ onSelectLead }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const leads = useMemo(() => storage.getLeads(), [dataVersion]);
  const today = getTodayDateString();

  const [activeLeadForFollowup, setActiveLeadForFollowup] = useState<Lead | null>(null);
  const [activeLeadForPrint, setActiveLeadForPrint] = useState<Lead | null>(null);
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const teams = useMemo(() => storage.getTeams(), [dataVersion]);

  // Leads whose nextFollowUpDate == today
  const todayLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (lead.nextFollowUpDate !== today) return false;
      if (lead.status === 'Converted' || lead.status === 'Lost' || lead.status === 'Not Interested') {
        return false;
      }
      if (filterTeam !== 'ALL' && lead.teamId !== filterTeam) return false;
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
    });
  }, [leads, today, filterTeam, filterPriority, searchQuery]);

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
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Today's Scheduled Follow-ups
            </h2>
            <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
              {todayLeads.length} Due Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current Date: <span className="font-semibold text-slate-800">{formatDate(today)}</span> &bull; All customer follow-ups scheduled for action today
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center space-x-2 text-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search today's follow-ups..."
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 w-48"
          />
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
        {todayLeads.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              No follow-ups scheduled for today
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              All daily follow-up calls and visits have been attended to or scheduled for other dates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Customer</th>
                  <th className="py-3 px-3">Mobile Contact</th>
                  <th className="py-3 px-3">Project & Unit</th>
                  <th className="py-3 px-3">Executive</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-2 text-center">Priority</th>
                  <th className="py-3 px-3">Last Remark</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => onSelectLead(lead.id)}
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                      <div className="text-[10px] font-mono text-blue-700 font-semibold">{lead.leadId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-slate-800 flex items-center space-x-1">
                        <span>{lead.customerDetails.mobile}</span>
                      </div>
                      {lead.customerDetails.whatsapp && (
                        <div className="text-[10px] text-slate-400">WA: {lead.customerDetails.whatsapp}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{lead.interestedProject}</div>
                      <div className="text-[10px] text-slate-500">{lead.propertyRequirement.preferredUnit || '-'}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {lead.executiveName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {lead.teamName}
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {getPriorityBadge(lead.priority)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {lead.lastFollowUpRemark || 'No prior remarks logged'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {lead.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setActiveLeadForFollowup(lead)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors shadow-xs"
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
                ))}
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
