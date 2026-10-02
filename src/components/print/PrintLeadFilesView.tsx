import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { A4LeadSheet } from './A4LeadSheet';
import { Printer, Search, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { Lead } from '../../types';

export const PrintLeadFilesView: React.FC = () => {
  const leads = storage.getLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      l.customerDetails.name.toLowerCase().includes(q) ||
      l.leadId.toLowerCase().includes(q) ||
      l.customerDetails.mobile.includes(q) ||
      l.interestedProject.toLowerCase().includes(q)
    );
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const followUps = selectedLead ? storage.getFollowUps(selectedLead.id) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header (hidden in print) */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Printer className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Physical Customer Lead Files (A4 Print Center)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate standardized A4 portrait customer record sheets for physical office files and daily follow-up notes
          </p>
        </div>

        {selectedLead && (
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Sheet ({selectedLead.leadId})</span>
          </button>
        )}
      </div>

      {/* Main Two-Column Layout (Sidebar list of leads + Full A4 Sheet Preview) */}
      {leads.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No leads found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first customer lead to preview and print a standardized A4 customer lead sheet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Side Selector (hidden in print) */}
          <div className="no-print col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                Select Customer Record
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, ID, or mobile..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-[750px] overflow-y-auto divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-3 cursor-pointer transition-colors text-xs flex justify-between items-center ${
                    selectedLead?.id === lead.id
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">{lead.customerDetails.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1.5 mt-0.5">
                      <span className="text-blue-700 font-semibold">{lead.leadId}</span>
                      <span>&bull;</span>
                      <span>{lead.interestedProject}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Exec: {lead.executiveName} ({lead.teamName})
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedLead?.id === lead.id ? 'text-blue-600' : 'text-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side A4 Sheet Preview & Direct Print Area */}
          <div className="col-span-12 lg:col-span-8 print:col-span-12 print:w-full flex justify-center">
            {selectedLead ? (
              <div className="w-full">
                <A4LeadSheet lead={selectedLead} followUps={followUps} />
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-xs w-full">
                Please select a customer lead to preview the A4 file sheet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
