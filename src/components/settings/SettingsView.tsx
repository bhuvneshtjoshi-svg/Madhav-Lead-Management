import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { CheckCircle2, Save, Settings as SettingsIcon } from 'lucide-react';
import { AppSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const currentSettings = storage.getSettings();
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">System Configuration & Numbering</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Lead ID sequence prefixes, follow-up defaults, and office preferences
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Application settings saved successfully.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Lead Identification Prefix & Counter */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4">
            1. Customer Lead ID Format
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lead ID Prefix
              </label>
              <input
                type="text"
                value={formData.leadIdPrefix}
                onChange={(e) => setFormData({ ...formData, leadIdPrefix: e.target.value.toUpperCase().trim() })}
                placeholder="e.g. BTG, BM, SALES"
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Prefix appended to customer lead IDs (e.g., {formData.leadIdPrefix}-000125).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Next Sequence Number
              </label>
              <input
                type="number"
                value={formData.nextLeadNumber}
                onChange={(e) => setFormData({ ...formData, nextLeadNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Next lead will generate ID: <span className="font-mono font-bold text-blue-700">{formData.leadIdPrefix}-{String(formData.nextLeadNumber).padStart(6, '0')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Business & Operations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4">
            2. Follow-up & Office Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Follow-up Interval (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formData.defaultFollowupDays}
                onChange={(e) => setFormData({ ...formData, defaultFollowupDays: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Automatically sets next follow-up date to today + {formData.defaultFollowupDays} days when adding a follow-up.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date Format Preference
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 02-10-2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-02)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Working Days & Target Pace */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4">
            3. Working Days & Target Pace Configuration
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Select the days considered official working days. The system uses these to calculate the{' '}
            <strong className="text-slate-700">Required Daily Pace</strong> for remaining monthly targets.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {[
              { key: 'monday', label: 'Monday' },
              { key: 'tuesday', label: 'Tuesday' },
              { key: 'wednesday', label: 'Wednesday' },
              { key: 'thursday', label: 'Thursday' },
              { key: 'friday', label: 'Friday' },
              { key: 'saturday', label: 'Saturday' },
              { key: 'sunday', label: 'Sunday' },
            ].map((day) => {
              const workingDays = formData.workingDays || {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: false,
              };
              const isChecked = Boolean((workingDays as any)[day.key]);

              return (
                <label
                  key={day.key}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-blue-50/50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const updated = {
                        ...workingDays,
                        [day.key]: e.target.checked,
                      };
                      setFormData({ ...formData, workingDays: updated });
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs">{day.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Default: Monday–Saturday are working days. Sundays are non-working days unless checked above.
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
