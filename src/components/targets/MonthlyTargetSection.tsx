import React, { useState, useMemo } from 'react';
import {
  MONTH_NAMES,
  formatDate,
  getMonthName,
  storage,
} from '../../services/storage';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  MapPin,
  PlusCircle,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

interface MonthlyTargetSectionProps {
  onNavigateToTargetSetter?: () => void;
  onSelectLead?: (leadId: string) => void;
}

export const MonthlyTargetSection: React.FC<MonthlyTargetSectionProps> = ({
  onNavigateToTargetSetter,
  onSelectLead,
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Filters for Team & Executive
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('ALL');

  // Daily activity filter
  const [dailyFilterScope, setDailyFilterScope] = useState<'ALL' | 'TEAM' | 'EXEC'>('ALL');
  const [dailyTeamId, setDailyTeamId] = useState<string>('');
  const [dailyExecId, setDailyExecId] = useState<string>('');

  const teams = storage.getTeams().filter((t) => t.active);
  const executives = storage.getExecutives().filter((e) => e.active);
  const settings = storage.getSettings();

  // All targets for this month/year
  const monthlyTargets = useMemo(() => {
    return storage.getMonthlyTargets(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Overall Business & Scope Metrics
  const metrics = useMemo(() => {
    const tId = selectedTeamId !== 'ALL' ? selectedTeamId : undefined;
    const eId = selectedExecutiveId !== 'ALL' ? selectedExecutiveId : undefined;
    return storage.getMonthlyTargetAndAchievement(selectedMonth, selectedYear, tId, eId);
  }, [selectedMonth, selectedYear, selectedTeamId, selectedExecutiveId, monthlyTargets]);

  // Team-wise metrics
  const teamPerformance = useMemo(() => {
    return teams.map((team) => {
      const teamMetrics = storage.getMonthlyTargetAndAchievement(
        selectedMonth,
        selectedYear,
        team.id,
        undefined
      );
      return {
        team,
        metrics: teamMetrics,
      };
    });
  }, [teams, selectedMonth, selectedYear, monthlyTargets]);

  // Executive-wise metrics
  const executivePerformance = useMemo(() => {
    return executives.map((exec) => {
      const execMetrics = storage.getMonthlyTargetAndAchievement(
        selectedMonth,
        selectedYear,
        exec.teamId,
        exec.id
      );
      return {
        executive: exec,
        metrics: execMetrics,
      };
    });
  }, [executives, selectedMonth, selectedYear, monthlyTargets]);

  // Daily activity list
  const dailyActivities = useMemo(() => {
    let tId: string | undefined = undefined;
    let eId: string | undefined = undefined;

    if (dailyFilterScope === 'TEAM' && dailyTeamId) {
      tId = dailyTeamId;
    } else if (dailyFilterScope === 'EXEC' && dailyExecId) {
      eId = dailyExecId;
    } else if (selectedTeamId !== 'ALL') {
      tId = selectedTeamId;
      if (selectedExecutiveId !== 'ALL') {
        eId = selectedExecutiveId;
      }
    }

    return storage.getMonthlyDailyActivity(selectedMonth, selectedYear, tId, eId);
  }, [
    selectedMonth,
    selectedYear,
    dailyFilterScope,
    dailyTeamId,
    dailyExecId,
    selectedTeamId,
    selectedExecutiveId,
  ]);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Helper to render KPI cards
  const renderKpiCard = (
    label: string,
    metric: {
      target: number;
      achieved: number;
      gap: number;
      isExceeded: boolean;
      exceededBy: number;
      achievementPercent: number | null;
      requiredDailyPace: number | null;
    },
    icon: React.ReactNode,
    colorScheme: {
      bg: string;
      border: string;
      accent: string;
      progress: string;
    }
  ) => {
    const hasTarget = metric.target > 0;
    const progressWidth = hasTarget
      ? Math.min(100, (metric.achieved / metric.target) * 100)
      : 0;

    return (
      <div className={`p-4 rounded-xl border ${colorScheme.border} ${colorScheme.bg} shadow-xs space-y-3`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${colorScheme.accent} bg-white shadow-2xs`}>
              {icon}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {label}
              </div>
              <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                {metric.achieved}
                <span className="text-xs font-semibold text-slate-400 font-sans ml-1">
                  / {hasTarget ? metric.target : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                hasTarget
                  ? (metric.achievementPercent || 0) >= 100
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : (metric.achievementPercent || 0) >= 70
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {hasTarget ? `${metric.achievementPercent}%` : 'Not Set'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${colorScheme.progress}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10.5px] mt-1.5 font-medium">
            <span className="text-slate-500">
              {metric.isExceeded ? (
                <span className="text-emerald-700 font-bold">
                  ★ Target Exceeded by {metric.exceededBy}
                </span>
              ) : hasTarget ? (
                <span>
                  Gap: <strong className="text-slate-800">{metric.gap}</strong>
                </span>
              ) : (
                <span className="text-slate-400">Target not configured</span>
              )}
            </span>

            {hasTarget && (
              <span className="text-slate-600 font-mono">
                {metric.requiredDailyPace !== null && metric.requiredDailyPace > 0 ? (
                  <span title="Remaining target divided by remaining working days">
                    Pace: <strong>{metric.requiredDailyPace}/day</strong>
                  </span>
                ) : metric.gap === 0 ? (
                  <span className="text-emerald-600 font-bold">Pace Met</span>
                ) : (
                  <span>Pace: —</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Module Header with Month Selector & Scope Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Performance Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Working Days Left: {metrics.remainingWorkingDays}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 tracking-tight flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Monthly Target & Sales Achievement</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of Leads, Site Visits, and Tokens against planned monthly targets.
          </p>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-bold text-slate-800 whitespace-nowrap min-w-[130px] text-center">
              {getMonthName(selectedMonth)} {selectedYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scope Filters */}
          <select
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setSelectedExecutiveId('ALL');
            }}
            className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-medium"
          >
            <option value="ALL">🏢 All Teams (Overall)</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teamName}
              </option>
            ))}
          </select>

          {selectedTeamId !== 'ALL' && (
            <select
              value={selectedExecutiveId}
              onChange={(e) => setSelectedExecutiveId(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-medium"
            >
              <option value="ALL">All Executives in Team</option>
              {executives
                .filter((e) => e.teamId === selectedTeamId)
                .map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    👤 {ex.name}
                  </option>
                ))}
            </select>
          )}

          {onNavigateToTargetSetter && (
            <button
              onClick={onNavigateToTargetSetter}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center space-x-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Set Targets</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Not Set Warning or Overview KPI Cards */}
      {!metrics.hasTargetsSet && monthlyTargets.length === 0 ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-center space-y-2">
          <Target className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-amber-900">
            No monthly targets have been set for {getMonthName(selectedMonth)} {selectedYear}.
          </h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Set targets for Leads, Site Visits, and Tokens for your teams and sales executives to activate target tracking.
          </p>
          {onNavigateToTargetSetter && (
            <button
              onClick={onNavigateToTargetSetter}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Set Monthly Targets Now</span>
            </button>
          )}
        </div>
      ) : (
        /* Overall Business KPI Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderKpiCard(
            '1. Lead Generation',
            metrics.leads,
            <Users className="w-4 h-4 text-blue-600" />,
            {
              bg: 'bg-blue-50/40',
              border: 'border-blue-200',
              accent: 'text-blue-600',
              progress: 'bg-blue-600',
            }
          )}

          {renderKpiCard(
            '2. Site Visits Completed',
            metrics.siteVisits,
            <MapPin className="w-4 h-4 text-indigo-600" />,
            {
              bg: 'bg-indigo-50/40',
              border: 'border-indigo-200',
              accent: 'text-indigo-600',
              progress: 'bg-indigo-600',
            }
          )}

          {renderKpiCard(
            '3. Tokens & Bookings',
            metrics.tokens,
            <Tag className="w-4 h-4 text-emerald-600" />,
            {
              bg: 'bg-emerald-50/40',
              border: 'border-emerald-200',
              accent: 'text-emerald-600',
              progress: 'bg-emerald-600',
            }
          )}
        </div>
      )}

      {/* Team-wise Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Team-Wise Target & Achievement
            </h3>
            <p className="text-[11px] text-slate-500">
              Workload and achievement distribution across active sales teams for{' '}
              {getMonthName(selectedMonth)} {selectedYear}.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {teamPerformance.length} Teams
          </span>
        </div>

        {teamPerformance.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No active teams configured. Add teams in Teams & Executives master.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Team Name</th>
                  <th className="py-2.5 px-2 text-right">Lead Tgt</th>
                  <th className="py-2.5 px-2 text-right">Leads</th>
                  <th className="py-2.5 px-2 text-right">Lead Gap</th>
                  <th className="py-2.5 px-2 text-right">SV Tgt</th>
                  <th className="py-2.5 px-2 text-right">SV Done</th>
                  <th className="py-2.5 px-2 text-right">SV Gap</th>
                  <th className="py-2.5 px-2 text-right">Token Tgt</th>
                  <th className="py-2.5 px-2 text-right">Tokens</th>
                  <th className="py-2.5 px-2 text-right">Token Gap</th>
                  <th className="py-2.5 px-3 text-center">Pace Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamPerformance.map(({ team, metrics: tm }) => (
                  <tr
                    key={team.id}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setSelectedExecutiveId('ALL');
                    }}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {team.teamName}
                    </td>

                    {/* Leads */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {tm.leads.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-blue-900">
                      {tm.leads.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {tm.leads.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        tm.leads.gap
                      )}
                    </td>

                    {/* Site Visits */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {tm.siteVisits.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-indigo-900">
                      {tm.siteVisits.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {tm.siteVisits.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        tm.siteVisits.gap
                      )}
                    </td>

                    {/* Tokens */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {tm.tokens.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-emerald-900">
                      {tm.tokens.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {tm.tokens.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        tm.tokens.gap
                      )}
                    </td>

                    {/* Required Daily Pace */}
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {tm.leads.requiredDailyPace !== null && tm.leads.requiredDailyPace > 0
                        ? `${tm.leads.requiredDailyPace} leads/day`
                        : tm.leads.target > 0 && tm.leads.gap === 0
                        ? 'Target Met'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Executive Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Executive-Wise Target & Achievement
            </h3>
            <p className="text-[11px] text-slate-500">
              Individual executive achievement across Leads, Site Visits, and Tokens.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {executivePerformance.length} Executives
          </span>
        </div>

        {executivePerformance.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No active executives configured. Add executives in Teams & Executives master.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Executive</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-right">Lead Tgt</th>
                  <th className="py-2.5 px-2 text-right">Leads</th>
                  <th className="py-2.5 px-2 text-right">Lead Gap</th>
                  <th className="py-2.5 px-2 text-right">SV Tgt</th>
                  <th className="py-2.5 px-2 text-right">SV Done</th>
                  <th className="py-2.5 px-2 text-right">SV Gap</th>
                  <th className="py-2.5 px-2 text-right">Token Tgt</th>
                  <th className="py-2.5 px-2 text-right">Tokens</th>
                  <th className="py-2.5 px-2 text-right">Token Gap</th>
                  <th className="py-2.5 px-3 text-center">Achievement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executivePerformance.map(({ executive, metrics: em }) => (
                  <tr
                    key={executive.id}
                    onClick={() => {
                      setSelectedTeamId(executive.teamId);
                      setSelectedExecutiveId(executive.id);
                    }}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      👤 {executive.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {executive.teamName}
                    </td>

                    {/* Leads */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {em.leads.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-blue-900">
                      {em.leads.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {em.leads.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        em.leads.gap
                      )}
                    </td>

                    {/* Site Visits */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {em.siteVisits.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-indigo-900">
                      {em.siteVisits.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {em.siteVisits.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        em.siteVisits.gap
                      )}
                    </td>

                    {/* Tokens */}
                    <td className="py-3 px-2 text-right font-mono text-slate-500">
                      {em.tokens.target || '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-emerald-900">
                      {em.tokens.achieved}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      {em.tokens.isExceeded ? (
                        <span className="text-emerald-700 font-bold text-[10px]">Exceeded</span>
                      ) : (
                        em.tokens.gap
                      )}
                    </td>

                    {/* Achievement Summary Badges */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono font-semibold">
                        <span
                          title="Leads Achievement"
                          className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                        >
                          L: {em.leads.achievementPercent !== null ? `${em.leads.achievementPercent}%` : '—'}
                        </span>
                        <span
                          title="Site Visits Achievement"
                          className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200"
                        >
                          SV: {em.siteVisits.achievementPercent !== null ? `${em.siteVisits.achievementPercent}%` : '—'}
                        </span>
                        <span
                          title="Tokens Achievement"
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          T: {em.tokens.achievementPercent !== null ? `${em.tokens.achievementPercent}%` : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Activity Breakdown Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Daily Business Activity ({getMonthName(selectedMonth)} {selectedYear})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Day-by-day record of Leads created, Site Visits completed, and Tokens received.
            </p>
          </div>

          {/* Daily Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter By:</span>
            <select
              value={dailyFilterScope}
              onChange={(e) => setDailyFilterScope(e.target.value as any)}
              className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-semibold text-slate-700"
            >
              <option value="ALL">All Business</option>
              <option value="TEAM">Specific Team</option>
              <option value="EXEC">Specific Executive</option>
            </select>

            {dailyFilterScope === 'TEAM' && (
              <select
                value={dailyTeamId}
                onChange={(e) => setDailyTeamId(e.target.value)}
                className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
              >
                <option value="">Select Team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            )}

            {dailyFilterScope === 'EXEC' && (
              <select
                value={dailyExecId}
                onChange={(e) => setDailyExecId(e.target.value)}
                className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
              >
                <option value="">Select Executive...</option>
                {executives.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.teamName})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200 sticky top-0 bg-slate-50">
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4 text-center">Leads Generated</th>
                <th className="py-2 px-4 text-center">Site Visits Completed</th>
                <th className="py-2 px-4 text-center">Tokens Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyActivities.map((day) => {
                const hasActivity = day.leads > 0 || day.siteVisits > 0 || day.tokens > 0;
                return (
                  <tr
                    key={day.date}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasActivity ? 'bg-blue-50/20 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    <td className="py-2 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {day.displayDate}
                    </td>
                    <td className="py-2 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          day.leads > 0
                            ? 'bg-blue-100 text-blue-900 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {day.leads}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          day.siteVisits > 0
                            ? 'bg-indigo-100 text-indigo-900 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {day.siteVisits}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          day.tokens > 0
                            ? 'bg-emerald-100 text-emerald-900 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {day.tokens}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
