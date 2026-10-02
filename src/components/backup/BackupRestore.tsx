import React, { useState } from 'react';
import { storage } from '../../services/storage';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Database,
  FileCheck,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { AppDataBackup } from '../../types';

interface BackupRestoreProps {
  onDataRestored: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onDataRestored }) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<AppDataBackup | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
        text: `Full backup file exported successfully (${data.leads.length} leads, ${data.followUps.length} follow-ups).`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to export backup: ${err.message || 'Unknown error'}`,
      });
    }
  };

  // Restore File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !Array.isArray(parsed.leads) || !Array.isArray(parsed.teams)) {
          setStatusMessage({
            type: 'error',
            text: 'Selected file is not a valid BM Sales Lead Manager backup structure.',
          });
          return;
        }

        setPendingBackupData(parsed);
        setShowRestoreConfirm(true);
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: 'Unable to parse JSON file. Please ensure valid backup file.',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
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
        text: 'Backup restored successfully! All leads and master records have been updated.',
      });
      onDataRestored();
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to restore backup.',
      });
    }
  };

  // Reset to Sample Data
  const handleResetToSample = () => {
    storage.resetToDefaults();
    setShowResetConfirm(false);
    setStatusMessage({
      type: 'success',
      text: 'Application reset to realistic sample master data and test leads.',
    });
    onDataRestored();
  };

  const leads = storage.getLeads();
  const followUps = storage.getFollowUps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Data Backup & Safety Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Safeguard your single-user database with instant full system backups and verified restore capability
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
            <div className="font-semibold text-slate-800">Snapshot Contents:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>{leads.length} Customer Leads with address & financial profiles</li>
              <li>{followUps.length} Chronological Follow-up history items</li>
              <li>Active Teams, Sales Executives, Projects & Sources</li>
              <li>Preferred Units and system preferences</li>
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
              Restoring a backup file will replace current leads and master data. You will be prompted to verify the contents before applying.
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

      {/* Reset to Sample Data Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Development / Test Preset</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset the system to the initial realistic sample data (Projects: By The Garden; Teams: Team A & B; 6 leads with active follow-ups).
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Sample Data</span>
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
              <p className="font-semibold text-slate-900">
                Are you sure you want to restore this backup?
              </p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <div>Backup export date: <span className="font-mono font-bold">{pendingBackupData.exportDate}</span></div>
                <div>Leads to import: <span className="font-bold">{pendingBackupData.leads?.length || 0}</span></div>
                <div>Follow-ups to import: <span className="font-bold">{pendingBackupData.followUps?.length || 0}</span></div>
                <div>Teams: <span className="font-bold">{pendingBackupData.teams?.length || 0}</span></div>
              </div>
              <p className="text-amber-800 text-[11px]">
                Warning: This action will replace current records with the contents of the backup.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700 shadow-xs"
              >
                Yes, Restore Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm">Reset to Sample Data?</h3>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-2">
              <p>
                This will reset the application to standard test data including sample projects, teams, executives, and realistic customer leads.
              </p>
              <p className="text-slate-500">
                Any customer leads created during this session will be replaced.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToSample}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-xs"
              >
                Reset to Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
