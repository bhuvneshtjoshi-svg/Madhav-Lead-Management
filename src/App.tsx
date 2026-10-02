import React, { useState, useEffect, useMemo } from 'react';
import { NavItem, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { AllLeadsList } from './components/leads/AllLeadsList';
import { NewLeadForm } from './components/leads/NewLeadForm';
import { LeadProfileModal } from './components/leads/LeadProfileModal';
import { TodayFollowups } from './components/followups/TodayFollowups';
import { OverdueFollowups } from './components/followups/OverdueFollowups';
import { TeamsExecutives } from './components/teams/TeamsExecutives';
import { TeamWork } from './components/teams/TeamWork';
import { ExecutiveWork } from './components/teams/ExecutiveWork';
import { ReportsView } from './components/reports/ReportsView';
import { PrintLeadFilesView } from './components/print/PrintLeadFilesView';
import { PrintPreviewModal } from './components/print/PrintPreviewModal';
import { MastersView } from './components/masters/MastersView';
import { BackupRestore } from './components/backup/BackupRestore';
import { SettingsView } from './components/settings/SettingsView';
import { Lead } from './types';
import { getTodayDateString, storage } from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [dataVersion, setDataVersion] = useState(0);

  // Modal / Selected states
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [printLead, setPrintLead] = useState<Lead | null>(null);
  const [selectedExecutiveIdForWork, setSelectedExecutiveIdForWork] = useState<string | undefined>(undefined);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const leads = useMemo(() => storage.getLeads(), [dataVersion]);
  const today = getTodayDateString();

  // Calculate live badge counts
  const { todayCount, overdueCount } = useMemo(() => {
    let todayCount = 0;
    let overdueCount = 0;
    leads.forEach((l) => {
      if (l.status === 'Converted' || l.status === 'Lost' || l.status === 'Not Interested') return;
      if (l.nextFollowUpDate === today) {
        todayCount++;
      } else if (l.nextFollowUpDate && l.nextFollowUpDate < today) {
        overdueCount++;
      }
    });
    return { todayCount, overdueCount };
  }, [leads, today]);

  // Handle lead saved from New / Edit Form
  const handleLeadSaved = (savedLead: Lead, shouldPrint = false) => {
    refreshData();
    setEditingLead(null);

    if (shouldPrint) {
      setPrintLead(savedLead);
      setCurrentTab('leads');
      showToast(`Lead ${savedLead.leadId} saved. Opening A4 print preview.`);
    } else {
      setSelectedLeadId(savedLead.id);
      showToast(`Customer Lead ${savedLead.leadId} (${savedLead.customerDetails.name}) saved successfully!`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 select-none">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setEditingLead(null);
          setCurrentTab(tab);
        }}
        todayCount={todayCount}
        overdueCount={overdueCount}
      />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onNewLeadClick={() => {
            setEditingLead(null);
            setCurrentTab('new-lead');
          }}
          onSearchSelect={(leadId) => {
            setSelectedLeadId(leadId);
          }}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 animate-fade-in flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* New Lead / Edit Lead Screen */}
          {(currentTab === 'new-lead' || editingLead !== null) && (
            <NewLeadForm
              initialLead={editingLead}
              onSaveSuccess={handleLeadSaved}
              onCancel={() => {
                setEditingLead(null);
                setCurrentTab('leads');
              }}
            />
          )}

          {/* Dashboard */}
          {currentTab === 'dashboard' && !editingLead && (
            <Dashboard
              onSelectLead={(id) => setSelectedLeadId(id)}
              onNavigate={(view) => setCurrentTab(view as NavItem)}
              onNewLeadClick={() => setCurrentTab('new-lead')}
            />
          )}

          {/* All Leads */}
          {currentTab === 'leads' && !editingLead && (
            <AllLeadsList
              onSelectLead={(id) => setSelectedLeadId(id)}
              onEditLead={(lead) => setEditingLead(lead)}
              onNewLeadClick={() => setCurrentTab('new-lead')}
            />
          )}

          {/* Today's Follow-ups */}
          {currentTab === 'today' && !editingLead && (
            <TodayFollowups onSelectLead={(id) => setSelectedLeadId(id)} />
          )}

          {/* Overdue Follow-ups */}
          {currentTab === 'overdue' && !editingLead && (
            <OverdueFollowups onSelectLead={(id) => setSelectedLeadId(id)} />
          )}

          {/* Teams & Executives */}
          {currentTab === 'teams' && !editingLead && <TeamsExecutives />}

          {/* Team Work */}
          {currentTab === 'team-work' && !editingLead && (
            <TeamWork
              onSelectExecutive={(execId) => {
                setSelectedExecutiveIdForWork(execId);
                setCurrentTab('executive-work');
              }}
            />
          )}

          {/* Executive Work */}
          {currentTab === 'executive-work' && !editingLead && (
            <ExecutiveWork
              initialExecutiveId={selectedExecutiveIdForWork}
              onSelectLead={(id) => setSelectedLeadId(id)}
            />
          )}

          {/* Reports */}
          {currentTab === 'reports' && !editingLead && <ReportsView />}

          {/* Print / Lead Files */}
          {currentTab === 'print-files' && !editingLead && <PrintLeadFilesView />}

          {/* Masters */}
          {currentTab === 'masters' && !editingLead && <MastersView />}

          {/* Backup & Restore */}
          {currentTab === 'backup' && !editingLead && (
            <BackupRestore
              onDataRestored={() => {
                refreshData();
                showToast('Database updated successfully.');
              }}
            />
          )}

          {/* Settings */}
          {currentTab === 'settings' && !editingLead && <SettingsView />}
        </main>
      </div>

      {/* Complete Customer Profile Modal */}
      {selectedLeadId && (
        <LeadProfileModal
          leadId={selectedLeadId}
          isOpen={true}
          onClose={() => setSelectedLeadId(null)}
          onEditLead={(lead) => {
            setSelectedLeadId(null);
            setEditingLead(lead);
          }}
          onDataChanged={() => {
            refreshData();
          }}
        />
      )}

      {/* Immediate Print Preview Modal (used after Save & Print) */}
      {printLead && (
        <PrintPreviewModal
          lead={printLead}
          followUps={storage.getFollowUps(printLead.id)}
          isOpen={true}
          onClose={() => setPrintLead(null)}
        />
      )}
    </div>
  );
}
