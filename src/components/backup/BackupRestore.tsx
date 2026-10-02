import React, { useState } from 'react';
import { storage } from '../../services/storage';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Database,
  FileCheck,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { AppDataBackup } from '../../types';

interface BackupRestoreProps {
  onDataRestored: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onDataRestored }) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<AppDataBackup | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');

  // Backup Export
  const handleExportBackup = () => {
    try {
      const data = storage.createBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const todayStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `BM_LEADS_BACKUP_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Full backup file exported successfully (${data.leads.length} leads, ${data.followUps.length} follow-ups, ${data.teams.length} teams, ${data.projects.length} projects).`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to export backup: ${err.message || 'Unknown error'}`,
      });
    }
  };

  // Restore File Selection with Strict Validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validation = storage.validateBackup(parsed);

        if (!validation.valid) {
          setStatusMessage({
            type: 'error',
            text: validation.error || 'This backup file is invalid or incompatible with this application version.',
          });
          return;
        }

        setPendingBackupData(parsed);
        setShowRestoreConfirm(true);
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: 'This backup file is invalid or incompatible with this application version.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute Restore
  const handleConfirmRestore = () => {
    if (!pendingBackupData) return;
    const res = storage.restoreBackup(pendingBackupData);
    if (res.success) {
      setShowRestoreConfirm(false);
      setPendingBackupData(null);
      setStatusMessage({
        type: 'success',
        text: 'Backup restored successfully! All leads, customer files, and master records have been loaded.',
      });
      onDataRestored();
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to restore backup.',
      });
    }
  };

  // Clear Application Data
  const handleClearData = () => {
    if (clearInput.trim().toUpperCase() !== 'CLEAR') return;
    storage.clearAllData();
    setShowClearConfirm(false);
    setClearInput('');
    setStatusMessage({
      type: 'success',
      text: 'Application database cleared. Ready for fresh business records.',
    });
    onDataRestored();
  };

  const leads = storage.getLeads(true);
  const followUps = storage.getFollowUps();
  const teams = storage.getTeams();
  const projects = storage.getProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Data Backup & Restore Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Safeguard your single-user database with complete application backups and verified restore capability
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2-Column Cards: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ArrowDownToLine className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Download Application Backup</h3>
              <p className="text-xs text-slate-500">Exports entire system snapshot to JSON file</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="font-semibold text-slate-800">Current Database Contents:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>{leads.length} Customer Leads (including archived records)</li>
              <li>{followUps.length} Chronological Follow-up history items</li>
              <li>{teams.length} Sales Teams & assigned Executives</li>
              <li>{projects.length} Real Estate Projects</li>
              <li>Lead sources, preferred units, and system preferences</li>
            </ul>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Generate & Download Full Backup (.json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <ArrowUpFromLine className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">2. Restore from Backup File</h3>
              <p className="text-xs text-slate-500">Restore application data from a previous backup file</p>
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center space-x-1.5 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Safety Protection Notice:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Restoring a backup may replace current application data. Please create a backup of your current data before continuing.
            </p>
          </div>

          <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer">
            <ArrowUpFromLine className="w-4 h-4" />
            <span>Select Backup JSON to Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Database Maintenance Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Database Maintenance</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Wipe current records and re-initialize with zero leads, zero teams, and zero projects.
          </p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded border border-rose-300 transition-colors flex items-center space-x-1.5"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && pendingBackupData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-amber-300 max-w-md w-full overflow-hidden">
            <div className="bg-amber-500 text-white px-5 py-3.5 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
              <h3 className="font-bold text-sm">Confirm Data Restore</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded font-medium">
                Restoring a backup may replace current application data. Please create a backup of your current data before continuing.
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <div>Application: <span className="font-mono font-bold text-slate-900">{pendingBackupData.appIdentifier || 'BM_SALES_LEAD_MANAGER'}</span></div>
                <div>Backup Date: <span className="font-mono font-semibold">{pendingBackupData.exportDate}</span></div>
                <div>Leads to Restore: <span className="font-bold text-blue-700">{pendingBackupData.leads?.length || 0}</span></div>
                <div>Follow-ups: <span className="font-bold">{pendingBackupData.followUps?.length || 0}</span></div>
                <div>Teams: <span className="font-bold">{pendingBackupData.teams?.length || 0}</span></div>
                <div>Projects: <span className="font-bold">{pendingBackupData.projects?.length || 0}</span></div>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700 shadow-xs"
              >
                Yes, Restore Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Database Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-red-300 max-w-md w-full overflow-hidden">
            <div className="bg-red-600 text-white px-5 py-3.5 flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-red-200" />
              <h3 className="font-bold text-sm">Clear Entire Database</h3>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3">
              <p className="font-semibold text-slate-900">
                This will delete all customer leads, follow-ups, teams, and projects, leaving the application completely empty.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Type <span className="font-mono text-red-600 font-bold">CLEAR</span> to confirm:
                </label>
                <input
                  type="text"
                  value={clearInput}
                  onChange={(e) => setClearInput(e.target.value)}
                  placeholder="Type CLEAR"
                  className="w-full px-2.5 py-1.5 border rounded font-mono"
                />
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setClearInput('');
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={clearInput.trim().toUpperCase() !== 'CLEAR'}
                onClick={handleClearData}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
