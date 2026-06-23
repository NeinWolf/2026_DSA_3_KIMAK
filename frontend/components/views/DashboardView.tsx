import React from 'react';
import { Plus, Activity, Filter, ArrowUpDown, Edit2, Trash2 } from 'lucide-react';
import { User, Project, TimeEntry, SortField } from '../time-tracking-layout';

interface DashboardViewProps {
  currentUser: User;
  users: User[];
  timeEntries: TimeEntry[];
  visibleProjects: Project[];
  openModal: (type: string, item?: any) => void;
  formatTimer: (seconds: number) => string;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterProject: number | 'all';
  setFilterProject: (id: number | 'all') => void;
  projects: Project[];
  filterDateFrom: string;
  setFilterDateFrom: (date: string) => void;
  filterDateTo: string;
  setFilterDateTo: (date: string) => void;
  toggleSort: (field: SortField) => void;
  sortField: SortField;
  getSortedFilteredEntries: () => TimeEntry[];
  confirmDelete: (type: string, id: number, name: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  users,
  timeEntries,
  visibleProjects,
  openModal,
  formatTimer,
  showFilters,
  setShowFilters,
  filterProject,
  setFilterProject,
  projects,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  toggleSort,
  sortField,
  getSortedFilteredEntries,
  confirmDelete
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Helper to parse duration string 'Xh Ym' to hours float
  const parseDuration = (dur: string) => {
    const match = dur.match(/(\d+)h (\d+)m/);
    if (!match) return 0;
    return parseInt(match[1]) + parseInt(match[2]) / 60;
  };

  // Helper to format float hours back to 'Xh Ym'
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Get start of week (Monday)
  const todayDate = new Date();
  const day = todayDate.getDay();
  const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(todayDate.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  let todayHours = 0;
  let weekHours = 0;

  const relevantEntries = isAdmin ? timeEntries : timeEntries.filter(e => e.userId === currentUser.id);

  relevantEntries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const isToday = entry.date === todayStr;
    const isThisWeek = entryDate >= startOfWeek && entryDate <= new Date();
    
    if (isToday) todayHours += parseDuration(entry.duration);
    if (isThisWeek) weekHours += parseDuration(entry.duration);
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Dashboard Administratora' : 'Twoj Dashboard'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Przegladaj statystyki calego zespolu.' : 'Oto podsumowanie twojej pracy na dzisiaj.'}
          </p>
        </div>
        <button 
          onClick={() => openModal('add-time-entry')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Dodaj wpis recznie
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            {isAdmin ? 'Laczny czas zespolu (Dzisiaj)' : 'Zalogowany czas (Dzisiaj)'}
          </h3>
          <div className="text-3xl font-bold text-slate-900">{formatHours(todayHours)}</div>
          <p className="text-sm text-slate-500 mt-2">{todayHours > 0 ? 'Na biezaco' : 'Brak danych'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            {isAdmin ? 'Laczny czas zespolu (Tydzien)' : 'Zalogowany czas (Tydzien)'}
          </h3>
          <div className="text-3xl font-bold text-slate-900">{formatHours(weekHours)}</div>
          <p className="text-sm text-slate-500 mt-2">Cel: {isAdmin ? '200h' : '40h'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Aktywne projekty</h3>
          <div className="text-3xl font-bold text-slate-900">{visibleProjects.length}</div>
          <p className="text-sm text-slate-500 mt-2">Wymagaja uwagi</p>
        </div>
      </div>

      {/* Time entries table with filtering */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Dzisiejsze wpisy</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter size={16} />
              Filtry
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Projekt:</label>
              <select 
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Wszystkie</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Od:</label>
              <input 
                type="date" 
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Do:</label>
              <input 
                type="date" 
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={() => { setFilterProject('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Wyczysc filtry
            </button>
          </div>
        )}
        
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">
                <button onClick={() => toggleSort('task')} className="flex items-center gap-1 hover:text-slate-700">
                  Zadanie
                  <ArrowUpDown size={14} className={sortField === 'task' ? 'text-indigo-600' : ''} />
                </button>
              </th>
              <th className="px-6 py-3">
                <button onClick={() => toggleSort('project')} className="flex items-center gap-1 hover:text-slate-700">
                  Projekt
                  <ArrowUpDown size={14} className={sortField === 'project' ? 'text-indigo-600' : ''} />
                </button>
              </th>
              <th className="px-6 py-3">
                <button onClick={() => toggleSort('duration')} className="flex items-center gap-1 hover:text-slate-700">
                  Czas trwania
                  <ArrowUpDown size={14} className={sortField === 'duration' ? 'text-indigo-600' : ''} />
                </button>
              </th>
              <th className="px-6 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {getSortedFilteredEntries().slice(0, 5).map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{entry.task}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${entry.color.replace('bg-', 'bg-').replace('-500', '-50')} ${entry.color.replace('bg-', 'text-').replace('-500', '-700')}`}>
                    {entry.project}
                  </span>
                </td>
                <td className="px-6 py-4">{entry.startTime} - {entry.endTime} ({entry.duration})</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => openModal('edit-time-entry', entry)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => confirmDelete('time-entry', entry.id, entry.task)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
