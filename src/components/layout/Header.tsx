import React, { useState } from 'react';
import { Calendar, PlusCircle, Search, ShieldCheck } from 'lucide-react';
import { formatDate, getTodayDateString, storage } from '../../services/storage';

interface HeaderProps {
  onNewLeadClick: () => void;
  onSearchSelect: (leadId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewLeadClick,
  onSearchSelect,
}) => {
  const today = getTodayDateString();
  const settings = storage.getSettings();
  const leads = storage.getLeads();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults = searchQuery.trim()
    ? leads
        .filter((l) => {
          const q = searchQuery.toLowerCase().trim();
          return (
            l.customerDetails.name.toLowerCase().includes(q) ||
            l.leadId.toLowerCase().includes(q) ||
            l.customerDetails.mobile.includes(q)
          );
        })
        .slice(0, 5)
    : [];

  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-6 flex justify-between items-center shrink-0 z-20 shadow-xs">
      {/* Quick Search */}
      <div className="relative w-80">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Quick search customer, mobile, ID..."
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-9 left-0 w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
            {searchResults.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  onSearchSelect(lead.id);
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-900">{lead.customerDetails.name}</span>
                  <span className="font-mono text-slate-500 ml-2 text-[11px]">{lead.customerDetails.mobile}</span>
                  <div className="text-[10px] text-slate-400">
                    {lead.interestedProject} &bull; {lead.executiveName}
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-700 text-[10px]">
                  {lead.leadId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Display */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-500">Today:</span>
          <span className="font-bold text-slate-900">{formatDate(today)}</span>
        </div>

        {/* Database safety badge */}
        <div className="flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Data Secured</span>
        </div>

        {/* Quick New Lead Button */}
        <button
          onClick={onNewLeadClick}
          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Lead</span>
        </button>
      </div>
    </header>
  );
};
