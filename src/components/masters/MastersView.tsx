import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Building, Layers, PlusCircle, Sparkles, ToggleLeft, ToggleRight, Check, X, Edit } from 'lucide-react';
import { LeadSource, PreferredUnit, Project } from '../../types';

export const MastersView: React.FC = () => {
  const [dataVersion, setDataVersion] = useState(0);
  const projects = storage.getProjects();
  const sources = storage.getLeadSources();
  const units = storage.getPreferredUnits();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'projects' | 'sources' | 'units'>('projects');

  // New Project Form
  const [newProjName, setNewProjName] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // New Source Form
  const [newSourceName, setNewSourceName] = useState('');

  // New Unit Form
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCategory, setNewUnitCategory] = useState('Residential');

  const refresh = () => setDataVersion(v => v + 1);

  // Projects Handlers
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    storage.addProject(newProjName.trim(), newProjLocation.trim() || 'Prime Location', newProjDesc.trim());
    setNewProjName('');
    setNewProjLocation('');
    setNewProjDesc('');
    refresh();
  };

  const handleToggleProject = (p: Project) => {
    storage.updateProject(p.id, { active: !p.active });
    refresh();
  };

  // Sources Handlers
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    storage.addLeadSource(newSourceName.trim());
    setNewSourceName('');
    refresh();
  };

  const handleToggleSource = (s: LeadSource) => {
    const all = storage.getLeadSources().map(src => src.id === s.id ? { ...src, active: !src.active } : src);
    storage.saveLeadSources(all);
    refresh();
  };

  // Units Handlers
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    storage.addPreferredUnit(newUnitName.trim(), newUnitCategory);
    setNewUnitName('');
    refresh();
  };

  const handleToggleUnit = (u: PreferredUnit) => {
    const all = storage.getPreferredUnits().map(unit => unit.id === u.id ? { ...unit, active: !unit.active } : unit);
    storage.savePreferredUnits(all);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Master Data Configurations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure projects, inquiry channels, and property inventory options across lead forms and filters
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-semibold px-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Projects Master ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sources'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Lead Sources Master ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'units'
                ? 'border-blue-600 text-blue-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Preferred Units Master ({units.length})
          </button>
        </div>

        {/* Tab 1: Projects */}
        {activeTab === 'projects' && (
          <div className="p-6 space-y-6">
            {/* Add Project Form */}
            <form onSubmit={handleAddProject} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap items-end gap-3 text-xs">
              <div className="flex-1 min-w-[180px]">
                <label className="block font-semibold text-slate-700 mb-1">New Project Name *</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Royal Palms Residency"
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block font-semibold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  value={newProjLocation}
                  onChange={(e) => setNewProjLocation(e.target.value)}
                  placeholder="e.g. Main Ring Road"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="e.g. 3 & 4 BHK Luxury High-rise"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </form>

            {/* Projects Table */}
            {projects.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No projects created yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add your real estate projects above to make them available in customer lead requirements.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Project Name</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Toggle Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{proj.projectName}</td>
                      <td className="py-3 px-3 text-slate-600">{proj.location}</td>
                      <td className="py-3 px-3 text-slate-500">{proj.description || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          proj.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {proj.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleProject(proj)}
                          className="text-slate-400 hover:text-slate-800"
                        >
                          {proj.active ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Lead Sources */}
        {activeTab === 'sources' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleAddSource} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-end gap-3 text-xs">
              <div className="flex-1 max-w-md">
                <label className="block font-semibold text-slate-700 mb-1">New Lead Source Name *</label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Newspaper Ad, Channel Partner"
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Source</span>
              </button>
            </form>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Lead Source Name</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Toggle Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map(src => (
                  <tr key={src.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{src.name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        src.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {src.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleSource(src)}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {src.active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Preferred Units */}
        {activeTab === 'units' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleAddUnit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap items-end gap-3 text-xs">
              <div className="flex-1 min-w-[200px]">
                <label className="block font-semibold text-slate-700 mb-1">Preferred Unit Name *</label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. 5 BHK Sky Villa, Duplex"
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-48">
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newUnitCategory}
                  onChange={(e) => setNewUnitCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Plotting">Plotting</option>
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Unit</span>
              </button>
            </form>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Unit Configuration Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Toggle Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{unit.name}</td>
                    <td className="py-3 px-3 text-slate-600">{unit.category}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        unit.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {unit.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUnit(unit)}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        {unit.active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
