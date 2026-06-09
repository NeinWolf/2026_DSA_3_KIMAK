import React from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, Project, TimeEntry } from '../time-tracking-layout';

interface MyTimeViewProps {
  currentUser: User;
  users: User[];
  timeEntries: TimeEntry[];
  projects: Project[];
  visibleProjects: Project[];
  apiTasks: any[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  getDaysInMonth: (date: Date) => (number | null)[];
  openModal: (type: string, item?: any) => void;
  formatMonth: (date: Date) => string;
  filterProject: number | 'all';
  setFilterProject: (val: number | 'all') => void;
  navigateMonth: (dir: 'prev' | 'next') => void;
  getEntriesForDay: (day: number) => TimeEntry[];
  setFormData: (data: any) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  statusFromApi: (status: string) => any;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const MyTimeView: React.FC<MyTimeViewProps> = ({
  currentUser, users, timeEntries, projects, visibleProjects, apiTasks,
  currentMonth, setCurrentMonth, getDaysInMonth, openModal, formatMonth,
  filterProject, setFilterProject, navigateMonth, getEntriesForDay,
  setFormData, getStatusIcon, statusFromApi, getStatusBadge
}) => {
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob', 'Ndz'];

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

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  
  // Get start of week (Monday)
  const day = todayDate.getDay();
  const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(todayDate.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

  let todayHours = 0;
  let weekHours = 0;
  let monthHours = 0;

  const relevantEntries = timeEntries?.filter(e => e.userId === currentUser.id) || [];

  relevantEntries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const dur = parseDuration(entry.duration);
    
    if (entry.date === todayStr) todayHours += dur;
    if (entryDate >= startOfWeek && entryDate <= new Date()) weekHours += dur;
    if (entryDate >= startOfMonth && entryDate <= new Date()) monthHours += dur;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moj Czas</h1>
          <p className="text-slate-500 mt-1">Przegladaj i zarzadzaj swoimi wpisami czasu pracy.</p>
        </div>
        <button 
          onClick={() => openModal('add-time-entry')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Dodaj wpis
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ten miesiac</h3>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatHours(monthHours)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ten tydzien</h3>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatHours(weekHours)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dzisiaj</h3>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatHours(todayHours)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cel tygodniowy</h3>
          <div className="text-2xl font-bold text-slate-900 mt-1">40h 00m</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (weekHours / 40) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-slate-900 capitalize">{formatMonth(currentMonth)}</h2>
                {currentUser.role === 'admin' && (
                  <select 
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Moje wpisy</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Wszyscy)</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Dzisiaj
                </button>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekDays.map(day => (
                <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const entries = day ? getEntriesForDay(day) : [];
                const isWeekend = index % 7 >= 5;
                const today = new Date();
                const isToday = day && 
                  today.getDate() === day && 
                  today.getMonth() === currentMonth.getMonth() && 
                  today.getFullYear() === currentMonth.getFullYear();
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-28 border-b border-r border-slate-100 p-2 ${
                      isWeekend ? 'bg-slate-50/50' : 'bg-white'
                    } ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-indigo-600 font-bold' : 'text-slate-700'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {entries.map(entry => (
                            <div 
                              key={entry.id}
                              onClick={() => openModal('edit-time-entry', entry)}
                              className={`${entry.color} text-white text-xs px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                              title={`${entry.task} - ${entry.duration} (${users.find(u => u.id === entry.userId)?.name || 'Nieznany'})`}
                            >
                              {entry.userId !== currentUser.id && (
                                <span className="font-bold opacity-90 text-[10px] bg-black/20 px-1 rounded flex-shrink-0">
                                  {users.find(u => u.id === entry.userId)?.initials}
                                </span>
                              )}
                              <span className="truncate">{entry.duration} {entry.task}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
            {visibleProjects.map(project => (
              <div key={project.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${project.color}`}></div>
                <span>{project.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* User Tasks Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">Twoje zadania</h2>
              <p className="text-xs text-slate-500 mt-1">Szybki dostep do zadan</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {apiTasks.filter(t => t.assignedUsers?.some((u: any) => u.id === currentUser.id)).length > 0 ? (
                apiTasks.filter(t => t.assignedUsers?.some((u: any) => u.id === currentUser.id)).map(task => {
                  const taskProject = projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="p-3 border border-slate-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition-all bg-white group cursor-pointer" onClick={() => {
                        openModal('add-time-entry');
                        setFormData({ project: task.projectId, task: task.name, taskId: task.id, date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00' });
                      }}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-900 text-sm leading-tight">{task.name}</h4>
                        {getStatusIcon(statusFromApi(task.status))}
                      </div>
                      {taskProject && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className={`w-2 h-2 rounded-full ${taskProject.color}`}></div>
                          <span className="text-xs text-slate-500 truncate">{taskProject.name}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {getStatusBadge(statusFromApi(task.status))}
                        <button className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Loguj czas
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Brak zadan przypisanych do Ciebie.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
