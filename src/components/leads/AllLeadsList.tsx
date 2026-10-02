import React, { useState, useMemo } from 'react';
import { Lead, LeadPriority, LeadStatus } from '../../types';
import { formatDate, storage } from '../../services/storage';
import {
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  PlusCircle,
  Printer,
  Search,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { AddFollowupModal } from '../followups/AddFollowupModal';
import { PrintPreviewModal } from '../print/PrintPreviewModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface AllLeadsListProps {
  onSelectLead: (leadId: string) => void;
  onEditLead: (lead: Lead) => void;
  onNewLeadClick: () => void;
}

export const AllLeadsList: React.FC<AllLeadsListProps> = ({
  onSelectLead,
  onEditLead,
  onNewLeadClick,
}) => {
  const [dataVersion, setDataVersion] = useState(0);
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');

  const allRawLeads = useMemo(() => storage.getAllLeadsRaw(), [dataVersion]);
  const activeLeads = useMemo(() => allRawLeads.filter(l => !l.archived), [allRawLeads]);
  const archivedLeads = useMemo(() => allRawLeads.filter(l => l.archived), [allRawLeads]);

  const teams = useMemo(() => storage.getTeams(), [dataVersion]);
  const executives = useMemo(() => storage.getExecutives(), [dataVersion]);
  const projects = useMemo(() => storage.getProjects(), [dataVersion]);
  const sources = useMemo(() => storage.getLeadSources(), [dataVersion]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterExec, setFilterExec] = useState('ALL');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');

  // Sorting
  const [sortBy, setSortBy] = useState<'leadId' | 'leadDate' | 'name' | 'nextFollowUpDate' | 'status'>('leadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected lead for quick follow-up / print preview / delete / archive confirm
  const [followupLead, setFollowupLead] = useState<Lead | null>(null);
  const [printLead, setPrintLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const [archiveConfirmLead, setArchiveConfirmLead] = useState<Lead | null>(null);

  const refreshData = () => setDataVersion((v) => v + 1);

  const targetList = viewTab === 'active' ? activeLeads : archivedLeads;

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    return targetList.filter((lead) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = lead.customerDetails.name.toLowerCase().includes(q);
        const matchesMobile = lead.customerDetails.mobile.toLowerCase().includes(q);
        const matchesAltMobile = lead.customerDetails.altMobile?.toLowerCase().includes(q);
        const matchesId = lead.leadId.toLowerCase().includes(q);
        const matchesCompany = lead.customerDetails.companyName?.toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesAltMobile && !matchesId && !matchesCompany) {
          return false;
        }
      }

      // Dropdown filters
      if (filterTeam !== 'ALL' && lead.teamId !== filterTeam) return false;
      if (filterExec !== 'ALL' && lead.executiveId !== filterExec) return false;
      if (filterProject !== 'ALL' && lead.interestedProject !== filterProject) return false;
      if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
      if (filterPriority !== 'ALL' && lead.priority !== filterPriority) return false;
      if (filterSource !== 'ALL' && lead.leadSource !== filterSource) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'leadDate') {
        comparison = (a.leadDate || '').localeCompare(b.leadDate || '');
      } else if (sortBy === 'leadId') {
        comparison = (a.leadId || '').localeCompare(b.leadId || '');
      } else if (sortBy === 'name') {
        comparison = a.customerDetails.name.localeCompare(b.customerDetails.name);
      } else if (sortBy === 'nextFollowUpDate') {
        comparison = (a.nextFollowUpDate || '9999').localeCompare(b.nextFollowUpDate || '9999');
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [targetList, searchQuery, filterTeam, filterExec, filterProject, filterStatus, filterPriority, filterSource, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const handleArchiveLead = (lead: Lead) => {
    storage.archiveLead(lead.id);
    setArchiveConfirmLead(null);
    refreshData();
  };

  const handleUnarchiveLead = (lead: Lead) => {
    storage.unarchiveLead(lead.id);
    refreshData();
  };

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

  // Export filtered list to CSV
  const handleExportCSV = () => {
    const headers = [
      'Lead ID',
      'Lead Date',
      'Customer Name',
      'Mobile',
      'Email',
      'Project',
      'Unit',
      'Team',
      'Sales Executive',
      'Priority',
      'Status',
      'Source',
      'Next Follow-up',
    ];

    const rows = filteredLeads.map((l) => [
      l.leadId,
      l.leadDate,
      `"${l.customerDetails.name}"`,
      l.customerDetails.mobile,
      l.customerDetails.email || '',
      `"${l.interestedProject}"`,
      `"${l.propertyRequirement.preferredUnit || ''}"`,
      l.teamName,
      `"${l.executiveName}"`,
      l.priority,
      l.status,
      `"${l.leadSource}"`,
      l.nextFollowUpDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BM_LEADS_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Leads Master</h2>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setViewTab('active');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  viewTab === 'active'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Leads ({activeLeads.length})
              </button>
              <button
                onClick={() => {
                  setViewTab('archived');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  viewTab === 'archived'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Archived ({archivedLeads.length})
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {viewTab === 'active'
              ? `${activeLeads.length} active leads in pipeline`
              : `${archivedLeads.length} preserved archived customer files`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {filteredLeads.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onNewLeadClick}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, mobile, lead ID, or company..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={filterTeam}
              onChange={(e) => {
                setFilterTeam(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
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
              onChange={(e) => {
                setFilterExec(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Executives</option>
              {executives.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.teamName})
                </option>
              ))}
            </select>

            <select
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.projectName}>
                  {p.projectName}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Site Visit Planned">Site Visit Planned</option>
              <option value="Site Visit Done">Site Visit Done</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Booking">Booking</option>
              <option value="Converted">Converted</option>
              <option value="Future">Future</option>
              <option value="Lost">Lost</option>
              <option value="Not Interested">Not Interested</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">⚡ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {(searchQuery || filterTeam !== 'ALL' || filterExec !== 'ALL' || filterProject !== 'ALL' || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterSource !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTeam('ALL');
                  setFilterExec('ALL');
                  setFilterProject('ALL');
                  setFilterStatus('ALL');
                  setFilterPriority('ALL');
                  setFilterSource('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">
              {viewTab === 'active' ? 'No leads found. Create your first lead to get started.' : 'No archived leads found.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {viewTab === 'active'
                ? 'Create a new customer lead with their requirements, assigned executive, and follow-up plan.'
                : 'Archived leads will appear here when archived from active records.'}
            </p>
            {viewTab === 'active' && (
              <button
                onClick={onNewLeadClick}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Create New Lead
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th
                    onClick={() => toggleSort('leadId')}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100/70"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Lead ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('leadDate')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100/70"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100/70"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer & Contact</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Project & Unit</th>
                  <th className="py-3 px-3">Team & Executive</th>
                  <th className="py-3 px-2 text-center">Priority</th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100/70"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('nextFollowUpDate')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100/70"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Next Follow-up</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectLead(lead.id)}
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {lead.leadId}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(lead.leadDate)}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {lead.customerDetails.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>{lead.customerDetails.mobile}</span>
                        {lead.customerDetails.customerType && (
                          <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-sans text-slate-600">
                            {lead.customerDetails.customerType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{lead.interestedProject}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {lead.propertyRequirement.preferredUnit || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{lead.executiveName}</div>
                      <div className="text-[11px] text-slate-500">{lead.teamName}</div>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {getPriorityBadge(lead.priority)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {lead.nextFollowUpDate ? (
                        <div className="font-semibold text-blue-700">
                          {formatDate(lead.nextFollowUpDate)}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      <div className="text-[10px] text-slate-400">
                        {lead.followUpCount} {lead.followUpCount === 1 ? 'follow-up' : 'follow-ups'}
                      </div>
                    </td>
                    <td
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        {!lead.archived && (
                          <button
                            onClick={() => setFollowupLead(lead)}
                            title="Record Follow-up"
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setPrintLead(lead)}
                          title="Print A4 Customer File"
                          className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditLead(lead)}
                          title="Edit Customer Lead"
                          className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {lead.archived ? (
                          <button
                            onClick={() => handleUnarchiveLead(lead)}
                            title="Restore to Active Leads"
                            className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setArchiveConfirmLead(lead)}
                            title="Archive Lead"
                            className="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteLead(lead)}
                          title="Delete Lead"
                          className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredLeads.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, filteredLeads.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredLeads.length}</span> entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Previous
              </button>
              <span className="font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      {archiveConfirmLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-amber-200 max-w-md w-full overflow-hidden">
            <div className="bg-amber-500 text-white px-5 py-3.5 flex items-center space-x-2">
              <Archive className="w-5 h-5 text-amber-100" />
              <h3 className="font-bold text-sm">Archive Customer Lead</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700">
              <p>
                Are you sure you want to archive lead <span className="font-mono font-bold text-slate-900">{archiveConfirmLead.leadId}</span> ({archiveConfirmLead.customerDetails.name})?
              </p>
              <p className="text-slate-500 text-[11px]">
                Archived leads are kept safely in your database for records and reporting, but will not show in active daily follow-ups. You can unarchive this lead at any time from the "Archived" tab.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => setArchiveConfirmLead(null)}
                className="px-3.5 py-1.5 border rounded bg-white text-slate-700 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveLead(archiveConfirmLead)}
                className="px-4 py-1.5 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 shadow-xs"
              >
                Archive Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Modals */}
      {followupLead && (
        <AddFollowupModal
          lead={followupLead}
          isOpen={true}
          onClose={() => setFollowupLead(null)}
          onSuccess={() => {
            refreshData();
            setFollowupLead(null);
          }}
        />
      )}

      {printLead && (
        <PrintPreviewModal
          lead={printLead}
          followUps={storage.getFollowUps(printLead.id)}
          isOpen={true}
          onClose={() => setPrintLead(null)}
        />
      )}

      {deleteLead && (
        <DeleteConfirmModal
          lead={deleteLead}
          isOpen={true}
          onClose={() => setDeleteLead(null)}
          onConfirm={() => {
            storage.deleteLead(deleteLead.id);
            refreshData();
            setDeleteLead(null);
          }}
        />
      )}
    </div>
  );
};
