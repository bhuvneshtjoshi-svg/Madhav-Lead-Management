import React, { useState, useMemo } from 'react';
import { LeadPriority, LeadStatus } from '../../types';
import { formatDate, getTodayDateString, storage } from '../../services/storage';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react';
import { AddFollowupModal } from '../followups/AddFollowupModal';

interface ExecutiveWorkProps {
  initialExecutiveId?: string;
  onSelectLead: (leadId: string) => void;
}

export const ExecutiveWork: React.FC<ExecutiveWorkProps> = ({
  initialExecutiveId,
  onSelectLead,
}) => {
  const executives = storage.getExecutives();
  const leads = storage.getLeads();
  const today = getTodayDateString();

  const [selectedExecId, setSelectedExecId] = useState<string>(
    initialExecutiveId || executives[0]?.id || ''
  );
  const [dataVersion, setDataVersion] = useState(0);
  const [activeFollowupLead, setActiveFollowupLead] = useState<any>(null);

  const currentExec = executives.find(e => e.id === selectedExecId) || executives[0];

  const execLeads = useMemo(() => {
    if (!currentExec) return [];
    return leads.filter(l => l.executiveId === currentExec.id);
  }, [leads, currentExec, dataVersion]);

  // Executive KPI summary as required in #23
  const summary = useMemo(() => {
    let total = execLeads.length;
    let newLeads = 0;
    let active = 0;
    let hot = 0;
    let warm = 0;
    let cold = 0;
    let todayFups = 0;
    let overdueFups = 0;
    let siteVisits = 0;
    let converted = 0;
    let future = 0;
    let lost = 0;

    execLeads.forEach(l => {
      if (l.status === 'New') newLeads++;
      if (l.status !== 'Converted' && l.status !== 'Lost' && l.status !== 'Not Interested') active++;
      if (l.priority === 'Hot') hot++;
      if (l.priority === 'Warm') warm++;
      if (l.priority === 'Cold') cold++;
      if (l.status === 'Site Visit Done' || l.status === 'Site Visit Planned') siteVisits++;
      if (l.status === 'Converted') converted++;
      if (l.status === 'Future') future++;
      if (l.status === 'Lost' || l.status === 'Not Interested') lost++;

      if (l.nextFollowUpDate === today && l.status !== 'Converted' && l.status !== 'Lost') todayFups++;
      if (l.nextFollowUpDate && l.nextFollowUpDate < today && l.status !== 'Converted' && l.status !== 'Lost') overdueFups++;
    });

    return {
      total,
      newLeads,
      active,
      hot,
      warm,
      cold,
      todayFups,
      overdueFups,
      siteVisits,
      converted,
      future,
      lost,
    };
  }, [execLeads, today]);

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

  if (executives.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No sales executives created yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Create sales executives and assign them to teams in the "Teams & Executives" master to monitor individual sales pipelines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Executive Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Executive Work Monitor</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual sales executive pipeline, task fulfillment, and active portfolio
          </p>
        </div>

        {/* Executive Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-700">Sales Executive:</label>
          <select
            value={selectedExecId}
            onChange={(e) => setSelectedExecId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
          >
            {executives.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name} — {ex.teamName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Executive Summary Metrics Grid (Exact 12 KPIs from Spec #23) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10.5px] font-semibold text-slate-500 uppercase">Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10.5px] font-semibold text-slate-500 uppercase">New Leads</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{summary.newLeads}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10.5px] font-semibold text-slate-500 uppercase">Active Leads</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{summary.active}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-[10.5px] font-semibold text-rose-700 uppercase">Hot Leads</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{summary.hot}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-[10.5px] font-semibold text-amber-700 uppercase">Warm Leads</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{summary.warm}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-sky-200 bg-sky-50/20 shadow-xs">
          <div className="text-[10.5px] font-semibold text-sky-700 uppercase">Cold Leads</div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{summary.cold}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="text-[10.5px] font-semibold text-blue-800 uppercase">Today's Follow-ups</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{summary.todayFups}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-[10.5px] font-semibold text-amber-800 uppercase">Overdue Follow-ups</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{summary.overdueFups}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <div className="text-[10.5px] font-semibold text-indigo-700 uppercase">Site Visits</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{summary.siteVisits}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-[10.5px] font-semibold text-emerald-800 uppercase">Converted</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{summary.converted}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10.5px] font-semibold text-slate-500 uppercase">Future Prospect</div>
          <div className="text-2xl font-bold text-slate-700 mt-1">{summary.future}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10.5px] font-semibold text-slate-500 uppercase">Lost / Not Int.</div>
          <div className="text-2xl font-bold text-slate-400 mt-1">{summary.lost}</div>
        </div>
      </div>

      {/* Executive Lead List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">
            Assigned Leads Portfolio for {currentExec?.name} ({currentExec?.teamName})
          </h3>
          <span className="text-xs text-slate-500 font-medium">{execLeads.length} leads assigned</span>
        </div>

        {execLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No leads assigned to this executive.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Lead ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Project & Requirement</th>
                  <th className="py-3 px-2 text-center">Priority</th>
                  <th className="py-3 px-3">Last Follow-up</th>
                  <th className="py-3 px-3">Next Follow-up</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {execLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-900">
                      {lead.leadId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{lead.customerDetails.mobile}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{lead.interestedProject}</div>
                      <div className="text-[10px] text-slate-500">{lead.propertyRequirement.preferredUnit || '-'}</div>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {getPriorityBadge(lead.priority)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700">{formatDate(lead.lastFollowUpDate)}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{lead.lastFollowUpRemark || '-'}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {lead.nextFollowUpDate ? (
                        <span className="font-semibold text-blue-700">{formatDate(lead.nextFollowUpDate)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td
                      className="py-3 px-3.5 text-right whitespace-nowrap"
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

      {activeFollowupLead && (
        <AddFollowupModal
          lead={activeFollowupLead}
          isOpen={true}
          onClose={() => setActiveFollowupLead(null)}
          onSuccess={() => {
            setDataVersion(v => v + 1);
            setActiveFollowupLead(null);
          }}
        />
      )}
    </div>
  );
};
