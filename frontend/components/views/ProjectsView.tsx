import React from 'react';
import { 
  RefreshCw, Plus, MoreHorizontal, Edit2, Trash2, 
  Clock, UserPlus, Play, FolderKanban, Loader2 
} from 'lucide-react';
import { User, Project, Task } from '../time-tracking-layout';

interface ProjectsViewProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  visibleProjects: Project[];
  selectedProject: number | null;
  setSelectedProject: (id: number | null) => void;
  projectsLoading: boolean;
  refreshProjects: () => void;
  openModal: (type: string, item?: any) => void;
  confirmDelete: (type: string, id: number, name: string) => void;
  apiTasks: any[];
  tasksLoading: boolean;
  refreshTasks: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  statusFromApi: (status: string) => any;
  getStatusBadge: (status: string) => React.ReactNode;
  setIsTimerRunning: (val: boolean) => void;
  setTimerSeconds: (val: number) => void;
  setActiveTimerTask: (task: any) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentUser, users, projects, visibleProjects, selectedProject, setSelectedProject,
  projectsLoading, refreshProjects, openModal, confirmDelete,
  apiTasks, tasksLoading, refreshTasks, getStatusIcon, statusFromApi, getStatusBadge,
  setIsTimerRunning, setTimerSeconds, setActiveTimerTask
}) => {
  const currentProject = selectedProject !== null 
    ? projects.find(p => p.id === selectedProject) 
    : null;
  const isAdmin = currentUser.role === 'admin';
  const selectedProjectTasks = apiTasks.filter(t => t.projectId === selectedProject);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projekty i Zadania</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Tworzenie i zarzadzanie projektami oraz zadaniami.' : 'Przegladaj przypisane projekty i zadania.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refreshProjects()}
            disabled={projectsLoading}
            className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Odswiez liste projektow z API"
          >
            <RefreshCw size={16} className={projectsLoading ? 'animate-spin' : ''} />
            Odswiez
          </button>
          {isAdmin && (
            <button 
              onClick={() => openModal('add-project')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus size={18} />
              Nowy projekt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-1 space-y-4">
          {visibleProjects.map(project => (
            <div 
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer transition-all ${
                selectedProject === project.id 
                  ? 'border-indigo-500 ring-1 ring-indigo-500' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-xs text-slate-500">{project.client}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="relative group">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal('edit-project', project); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 size={14} />
                        Edytuj
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); confirmDelete('project', project.id, project.name); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Usun
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Postep</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${project.color} transition-all`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock size={14} />
                  <span>{project.loggedHours}h / {project.totalHours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">{apiTasks.filter(t => t.projectId === project.id).length} zadan</span>
                </div>
              </div>

              {/* Team members avatars */}
              <div className="flex items-center mt-3 pt-3 border-t border-slate-100">
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 4).map(memberId => {
                    const member = users.find(u => u.id === memberId);
                    return member ? (
                      <div 
                        key={memberId}
                        className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold border-2 border-white"
                        title={member.name}
                      >
                        {member.initials}
                      </div>
                    ) : null;
                  })}
                  {project.teamMembers.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold border-2 border-white">
                      +{project.teamMembers.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks panel */}
        <div className="lg:col-span-2">
          {currentProject ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentProject.color}`}></div>
                  <div>
                    <h2 className="font-semibold text-slate-900">{currentProject.name}</h2>
                    <p className="text-xs text-slate-500">{currentProject.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => refreshTasks()}
                    disabled={tasksLoading}
                    className="flex items-center gap-2 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                    title="Odswiez liste zadan z API"
                  >
                    <RefreshCw size={14} className={tasksLoading ? 'animate-spin' : ''} />
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => openModal('assign-employee')}
                        className="flex items-center gap-2 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                      >
                        <UserPlus size={16} />
                        Przypisz
                      </button>
                      <button 
                        onClick={() => openModal('add-task')}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Plus size={16} />
                        Dodaj zadanie
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tasks list */}
              <div className="divide-y divide-slate-100">
                {tasksLoading && selectedProjectTasks.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Ladowanie zadan...</p>
                  </div>
                ) : selectedProjectTasks.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">Brak zadan w tym projekcie.</p>
                  </div>
                ) : (
                  selectedProjectTasks.map(task => (
                    <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(statusFromApi(task.status))}
                        <div>
                          <h4 className="font-medium text-slate-900">{task.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            {getStatusBadge(statusFromApi(task.status))}
                            {task.description && (
                              <span className="text-xs text-slate-500">{task.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {task.assignedUsers && task.assignedUsers.length > 0 && (
                          <div className="flex -space-x-1">
                            {task.assignedUsers.slice(0, 3).map((au: any) => (
                              <div 
                                key={au.id}
                                className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 border-2 border-white"
                                title={au.username}
                              >
                                {au.username.slice(0, 2).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        )}
                        {statusFromApi(task.status) !== 'completed' && (
                          <button 
                            onClick={() => {
                              setIsTimerRunning(true);
                              setTimerSeconds(0);
                              const proj = visibleProjects.find(p => p.id === selectedProject);
                              setActiveTimerTask({
                                id: task.id || 0,
                                name: task.name,
                                projectId: selectedProject || 0,
                                projectName: proj?.name || ''
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Rozpocznij timer"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => openModal('add-task', {
                                ...task,
                                status: statusFromApi(task.status),
                                assigneeId: task.assignedUsers?.[0]?.id || '',
                              })}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDelete('task', task.id!, task.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Project stats footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{selectedProjectTasks.length}</div>
                    <div className="text-xs text-slate-500">Wszystkie</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">
                      {selectedProjectTasks.filter(t => t.status === 'DONE').length}
                    </div>
                    <div className="text-xs text-slate-500">Ukonczone</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-600">
                      {selectedProjectTasks.filter(t => t.status === 'IN_PROGRESS').length}
                    </div>
                    <div className="text-xs text-slate-500">W trakcie</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-400">
                      {selectedProjectTasks.filter(t => t.status === 'TODO').length}
                    </div>
                    <div className="text-xs text-slate-500">Do zrobienia</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <FolderKanban size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Wybierz projekt</h3>
              <p className="text-slate-500">Kliknij na projekt po lewej stronie, aby zobaczyc jego zadania.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
