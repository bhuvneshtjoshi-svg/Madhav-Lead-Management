import React, { useState } from 'react';
import { Executive, Team } from '../../types';
import { storage } from '../../services/storage';
import {
  Check,
  Edit,
  Mail,
  Phone,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

export const TeamsExecutives: React.FC = () => {
  const [dataVersion, setDataVersion] = useState(0);
  const teams = storage.getTeams();
  const executives = storage.getExecutives();

  // Add/Edit Team state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');

  // Add/Edit Executive state
  const [showExecModal, setShowExecModal] = useState(false);
  const [editingExec, setEditingExec] = useState<Executive | null>(null);
  const [execName, setExecName] = useState('');
  const [execTeamId, setExecTeamId] = useState(teams[0]?.id || '');
  const [execMobile, setExecMobile] = useState('');
  const [execEmail, setExecEmail] = useState('');

  const refresh = () => setDataVersion(v => v + 1);

  // Team Handlers
  const handleOpenTeamModal = (t?: Team) => {
    if (t) {
      setEditingTeam(t);
      setTeamNameInput(t.teamName);
    } else {
      setEditingTeam(null);
      setTeamNameInput('');
    }
    setShowTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamNameInput.trim()) return;

    if (editingTeam) {
      storage.updateTeam(editingTeam.id, { teamName: teamNameInput.trim() });
    } else {
      storage.addTeam(teamNameInput.trim());
    }
    setShowTeamModal(false);
    refresh();
  };

  const handleToggleTeamActive = (team: Team) => {
    storage.updateTeam(team.id, { active: !team.active });
    refresh();
  };

  // Executive Handlers
  const handleOpenExecModal = (ex?: Executive) => {
    if (ex) {
      setEditingExec(ex);
      setExecName(ex.name);
      setExecTeamId(ex.teamId);
      setExecMobile(ex.mobile || '');
      setExecEmail(ex.email || '');
    } else {
      setEditingExec(null);
      setExecName('');
      setExecTeamId(teams[0]?.id || '');
      setExecMobile('');
      setExecEmail('');
    }
    setShowExecModal(true);
  };

  const handleSaveExec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!execName.trim() || !execTeamId) return;

    const selectedTeam = teams.find(t => t.id === execTeamId);
    const teamName = selectedTeam?.teamName || 'Unassigned';

    if (editingExec) {
      storage.updateExecutive(editingExec.id, {
        name: execName.trim(),
        teamId: execTeamId,
        teamName,
        mobile: execMobile.trim() || undefined,
        email: execEmail.trim() || undefined,
      });
    } else {
      storage.addExecutive({
        name: execName.trim(),
        teamId: execTeamId,
        teamName,
        mobile: execMobile.trim() || undefined,
        email: execEmail.trim() || undefined,
        active: true,
      });
    }
    setShowExecModal(false);
    refresh();
  };

  const handleToggleExecActive = (ex: Executive) => {
    storage.updateExecutive(ex.id, { active: !ex.active });
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Teams & Sales Executives Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales divisions and team representatives used for lead assignment and tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenTeamModal()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Team</span>
          </button>
          <button
            onClick={() => handleOpenExecModal()}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Add Sales Executive</span>
          </button>
        </div>
      </div>

      {/* Team Cards Grid */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No teams created yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create your sales divisions or marketing teams (e.g., "Direct Sales", "Channel Sales", "Team A"). Once created, you can assign sales executives.
          </p>
          <button
            onClick={() => handleOpenTeamModal()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs"
          >
            Create First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => {
            const teamExecs = executives.filter(e => e.teamId === team.id);
            return (
              <div
                key={team.id}
                className={`bg-white rounded-xl border transition-all ${
                  team.active ? 'border-slate-200 shadow-xs' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                {/* Team Card Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="font-bold text-sm text-slate-900">{team.teamName}</h3>
                    <span className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {teamExecs.length} {teamExecs.length === 1 ? 'Executive' : 'Executives'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenTeamModal(team)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Edit Team Name"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleTeamActive(team)}
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        team.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {team.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Executives in this team */}
                <div className="p-4">
                  {teamExecs.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-slate-400 italic">No sales executives created in this team yet.</p>
                      <button
                        onClick={() => {
                          setEditingExec(null);
                          setExecName('');
                          setExecTeamId(team.id);
                          setExecMobile('');
                          setExecEmail('');
                          setShowExecModal(true);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        + Add Executive to {team.teamName}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {teamExecs.map((exec) => (
                        <div key={exec.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center space-x-2">
                              <span>{exec.name}</span>
                              {!exec.active && (
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                              {exec.mobile && (
                                <span className="flex items-center space-x-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{exec.mobile}</span>
                                </span>
                              )}
                              {exec.email && (
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{exec.email}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenExecModal(exec)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                              title="Edit / Move Team"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleExecActive(exec)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title={exec.active ? 'Deactivate' : 'Activate'}
                            >
                              {exec.active ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingTeam ? 'Edit Team Name' : 'Create New Team'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. Team A, Team North, Commercial Desk"
                  required
                  autoFocus
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executive Modal */}
      {showExecModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingExec ? 'Edit Executive Details' : 'Add New Sales Executive'}
              </h3>
              <button onClick={() => setShowExecModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveExec} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Executive Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={execName}
                  onChange={(e) => setExecName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign to Team <span className="text-red-500">*</span>
                </label>
                <select
                  value={execTeamId}
                  onChange={(e) => setExecTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  You can move the executive to another team at any time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={execMobile}
                    onChange={(e) => setExecMobile(e.target.value)}
                    placeholder="e.g. 9820011223"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={execEmail}
                    onChange={(e) => setExecEmail(e.target.value)}
                    placeholder="e.g. rahul@bmleads.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-xs"
                >
                  Save Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
