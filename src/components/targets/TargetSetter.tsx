import React, { useState, useMemo } from 'react';
import { MonthlyTarget } from '../../types';
import {
  MONTH_NAMES,
  formatDate,
  getMonthName,
  storage,
} from '../../services/storage';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Edit,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react';

interface TargetSetterProps {
  onTargetsUpdated?: () => void;
}

export const TargetSetter: React.FC<TargetSetterProps> = ({ onTargetsUpdated }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [dataVersion, setDataVersion] = useState(0);

  // Form State
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>(''); // empty string = Team Target

  const [leadTarget, setLeadTarget] = useState<string>('');
  const [siteVisitTarget, setSiteVisitTarget] = useState<string>('');
  const [tokenTarget, setTokenTarget] = useState<string>('');

  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Overview Filters
  const [filterMonth, setFilterMonth] = useState<string>(String(currentMonth));
  const [filterYear, setFilterYear] = useState<string>(String(currentYear));
  const [filterTeamId, setFilterTeamId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const teams = useMemo(() => storage.getTeams().filter((t) => t.active), [dataVersion]);
  const executives = useMemo(() => storage.getExecutives().filter((e) => e.active), [dataVersion]);
  const allTargets = useMemo(() => storage.getMonthlyTargets(), [dataVersion]);

  // Set default team if not selected
  React.useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Executives filtered by selected team in the form
  const teamExecutives = useMemo(() => {
    return executives.filter((e) => e.teamId === selectedTeamId);
  }, [executives, selectedTeamId]);

  // Check if a target already exists for selected combination
  const existingTarget = useMemo(() => {
    return allTargets.find(
      (t) =>
        t.month === selectedMonth &&
        t.year === selectedYear &&
        t.teamId === selectedTeamId &&
        (t.executiveId || '') === (selectedExecutiveId || '')
    );
  }, [allTargets, selectedMonth, selectedYear, selectedTeamId, selectedExecutiveId]);

  // When team, executive, month or year changes, pre-fill form if editing or if target exists
  const handleSelectCombination = (
    m: number,
    y: number,
    tId: string,
    eId: string
  ) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    setSelectedTeamId(tId);
    setSelectedExecutiveId(eId);

    const target = allTargets.find(
      (t) =>
        t.month === m &&
        t.year === y &&
        t.teamId === tId &&
        (t.executiveId || '') === (eId || '')
    );

    if (target) {
      setLeadTarget(String(target.leadTarget));
      setSiteVisitTarget(String(target.siteVisitTarget));
      setTokenTarget(String(target.tokenTarget));
      setEditingTargetId(target.id);
    } else {
      setLeadTarget('');
      setSiteVisitTarget('');
      setTokenTarget('');
      setEditingTargetId(null);
    }
  };

  // Team allocation check
  const allocationCheck = useMemo(() => {
    if (!selectedTeamId) return null;
    return storage.checkTeamTargetAllocation(selectedMonth, selectedYear, selectedTeamId);
  }, [selectedMonth, selectedYear, selectedTeamId, allTargets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const team = teams.find((t) => t.id === selectedTeamId);
    if (!team) {
      alert('Please select a Team.');
      return;
    }

    const exec = selectedExecutiveId ? executives.find((ex) => ex.id === selectedExecutiveId) : null;

    const leadNum = parseInt(leadTarget, 10) || 0;
    const svNum = parseInt(siteVisitTarget, 10) || 0;
    const tokenNum = parseInt(tokenTarget, 10) || 0;

    const saved = storage.setMonthlyTarget({
      month: selectedMonth,
      year: selectedYear,
      teamId: team.id,
      teamName: team.teamName,
      executiveId: exec ? exec.id : null,
      executiveName: exec ? exec.name : null,
      leadTarget: leadNum,
      siteVisitTarget: svNum,
      tokenTarget: tokenNum,
    });

    setDataVersion((v) => v + 1);
    setEditingTargetId(saved.id);
    setSuccessMessage(
      `Target for ${getMonthName(selectedMonth)} ${selectedYear} (${
        exec ? exec.name : `${team.teamName} (Team)`
      }) saved successfully.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);

    if (onTargetsUpdated) {
      onTargetsUpdated();
    }
  };

  const handleEditClick = (target: MonthlyTarget) => {
    setSelectedMonth(target.month);
    setSelectedYear(target.year);
    setSelectedTeamId(target.teamId);
    setSelectedExecutiveId(target.executiveId || '');
    setLeadTarget(String(target.leadTarget));
    setSiteVisitTarget(String(target.siteVisitTarget));
    setTokenTarget(String(target.tokenTarget));
    setEditingTargetId(target.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string, label: string) => {
    if (confirm(`Are you sure you want to remove target record for "${label}"?`)) {
      storage.deleteMonthlyTarget(id);
      setDataVersion((v) => v + 1);
      if (editingTargetId === id) {
        setEditingTargetId(null);
        setLeadTarget('');
        setSiteVisitTarget('');
        setTokenTarget('');
      }
      if (onTargetsUpdated) {
        onTargetsUpdated();
      }
    }
  };

  const handleResetForm = () => {
    setEditingTargetId(null);
    setLeadTarget('');
    setSiteVisitTarget('');
    setTokenTarget('');
  };

  // Filtered Overview Targets
  const filteredOverviewTargets = useMemo(() => {
    return allTargets
      .filter((t) => {
        if (filterMonth !== 'ALL' && t.month !== parseInt(filterMonth, 10)) return false;
        if (filterYear !== 'ALL' && t.year !== parseInt(filterYear, 10)) return false;
        if (filterTeamId !== 'ALL' && t.teamId !== filterTeamId) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTeam = t.teamName.toLowerCase().includes(q);
          const matchesExec = (t.executiveName || '').toLowerCase().includes(q);
          const matchesMonth = getMonthName(t.month).toLowerCase().includes(q);
          if (!matchesTeam && !matchesExec && !matchesMonth) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        if (a.teamName !== b.teamName) return a.teamName.localeCompare(b.teamName);
        return (a.executiveName || '').localeCompare(b.executiveName || '');
      });
  }, [allTargets, filterMonth, filterYear, filterTeamId, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Management Control
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1 tracking-tight flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Target Setter</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure monthly targets for Teams and Sales Executives. Achievements are calculated from actual business activity.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Active Targets Configured:</span>
          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full font-mono">
            {allTargets.length}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Target Setter Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="border-b border-slate-100 pb-4 mb-5 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {editingTargetId ? 'Edit Monthly Target' : 'Set New Monthly Target'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select period, team, and executive scope, then enter planned numbers.
            </p>
          </div>
          {editingTargetId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              + Create Different Target
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Period and Scope Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Month <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) =>
                  handleSelectCombination(
                    parseInt(e.target.value, 10),
                    selectedYear,
                    selectedTeamId,
                    selectedExecutiveId
                  )
                }
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedYear}
                onChange={(e) =>
                  handleSelectCombination(
                    selectedMonth,
                    parseInt(e.target.value, 10),
                    selectedTeamId,
                    selectedExecutiveId
                  )
                }
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) =>
                  handleSelectCombination(
                    selectedMonth,
                    selectedYear,
                    e.target.value,
                    '' // Reset exec when team changes
                  )
                }
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {teams.length === 0 && <option value="">No active teams found</option>}
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Level / Sales Executive
              </label>
              <select
                value={selectedExecutiveId}
                onChange={(e) =>
                  handleSelectCombination(
                    selectedMonth,
                    selectedYear,
                    selectedTeamId,
                    e.target.value
                  )
                }
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">🏢 Overall Team Target (Team Level)</option>
                {teamExecutives.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    👤 {ex.name} (Executive Target)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Allocation Warning Banner */}
          {allocationCheck?.exceeds && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-amber-900 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center space-x-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Executive target allocation exceeds the Team target.</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Management advisory: The sum of individual executive targets under{' '}
                <span className="font-semibold">
                  {teams.find((t) => t.id === selectedTeamId)?.teamName}
                </span>{' '}
                for {getMonthName(selectedMonth)} {selectedYear} exceeds the designated Team Target:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div
                  className={`p-2 rounded bg-white/70 border ${
                    allocationCheck.leadExceeds ? 'border-amber-400 font-bold' : 'border-slate-200'
                  }`}
                >
                  Leads: Execs Total {allocationCheck.totalExecLead} vs Team{' '}
                  {allocationCheck.teamTarget?.leadTarget || 0}
                </div>
                <div
                  className={`p-2 rounded bg-white/70 border ${
                    allocationCheck.svExceeds ? 'border-amber-400 font-bold' : 'border-slate-200'
                  }`}
                >
                  Site Visits: Execs Total {allocationCheck.totalExecSV} vs Team{' '}
                  {allocationCheck.teamTarget?.siteVisitTarget || 0}
                </div>
                <div
                  className={`p-2 rounded bg-white/70 border ${
                    allocationCheck.tokenExceeds ? 'border-amber-400 font-bold' : 'border-slate-200'
                  }`}
                >
                  Tokens: Execs Total {allocationCheck.totalExecToken} vs Team{' '}
                  {allocationCheck.teamTarget?.tokenTarget || 0}
                </div>
              </div>
              <p className="text-[10px] text-amber-700 mt-1 italic">
                * Management may decide whether this allocation is intentional. Targets will not be changed automatically.
              </p>
            </div>
          )}

          {/* Row 2: Target Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Monthly Lead Target <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Planned new customer inquiries for this month.
              </p>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 100"
                value={leadTarget}
                onChange={(e) => setLeadTarget(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Monthly Site Visit Target <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Completed customer site visits required this month.
              </p>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 40"
                value={siteVisitTarget}
                onChange={(e) => setSiteVisitTarget(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Monthly Token Target <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Confirmed booking tokens required this month.
              </p>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 10"
                value={tokenTarget}
                onChange={(e) => setTokenTarget(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-slate-500">
              Target for:{' '}
              <span className="font-semibold text-slate-800">
                {selectedExecutiveId
                  ? `${executives.find((e) => e.id === selectedExecutiveId)?.name} (Executive)`
                  : `${teams.find((t) => t.id === selectedTeamId)?.teamName || 'Team'} (Overall Team)`}
              </span>{' '}
              &bull; Period:{' '}
              <span className="font-semibold text-slate-800">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </div>

            <div className="flex space-x-2">
              {editingTargetId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingTargetId ? 'Update Target' : 'Save Target'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Target Overview Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Configured Monthly Targets Overview
            </h3>
            <p className="text-[11px] text-slate-500">
              Historical and active monthly target records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Month */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Filter Year */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            >
              <option value="ALL">All Years</option>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Filter Team */}
            <select
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            >
              <option value="ALL">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs py-1.5 px-2.5 pl-7 bg-white border border-slate-300 rounded-lg focus:outline-hidden w-36"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>

        {filteredOverviewTargets.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800">No monthly targets found</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Use the form above to set monthly targets for your teams and sales executives.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Month & Year</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Scope / Executive</th>
                  <th className="py-2.5 px-3 text-right">Lead Target</th>
                  <th className="py-2.5 px-3 text-right">Site Visit Target</th>
                  <th className="py-2.5 px-3 text-right">Token Target</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOverviewTargets.map((target) => {
                  const isTeamLevel = !target.executiveId;
                  const isCurrentlyEditing = editingTargetId === target.id;
                  return (
                    <tr
                      key={target.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentlyEditing ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {getMonthName(target.month)} {target.year}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {target.teamName}
                      </td>
                      <td className="py-3 px-3">
                        {isTeamLevel ? (
                          <span className="font-semibold text-blue-900 flex items-center space-x-1">
                            <span>🏢 Team Target</span>
                          </span>
                        ) : (
                          <span className="font-medium text-slate-700 flex items-center space-x-1">
                            <span>👤 {target.executiveName}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-800">
                        {target.leadTarget}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-800">
                        {target.siteVisitTarget}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                        {target.tokenTarget}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isTeamLevel
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isTeamLevel ? 'Team Target' : 'Executive Target'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(target)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Target"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                target.id,
                                `${target.teamName} ${
                                  target.executiveName ? `(${target.executiveName})` : ''
                                } - ${getMonthName(target.month)} ${target.year}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};
