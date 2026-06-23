"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calendar, 
  BarChart3, 
  Users, 
  Square, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  X,
  Download,
  Filter,
  ArrowUpDown,
  UserPlus,
  Settings,
  LogOut,
  Eye,
  FileText,
  AlertTriangle,
  Check,
  ChevronDown,
  Activity,
  Loader2,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { useUsers } from '@/hooks/use-users';
import { useReports } from '@/hooks/use-reports';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useTeams } from '@/hooks/use-teams';
import { generateReport, createTask } from '@/lib/api';
import type { ProjectDTO, TaskDTO, TimeEntryDTO, ApiError } from '@/lib/api';

import { DashboardView } from './views/DashboardView';
import { MyTimeView } from './views/MyTimeView';
import { ProjectsView } from './views/ProjectsView';
import { ReportsView } from './views/ReportsView';
import { TeamView } from './views/TeamView';

import { TimeEntryModal } from './modals/TimeEntryModal';
import { ProjectModal } from './modals/ProjectModal';
import { TaskModal } from './modals/TaskModal';
import { AssignEmployeeModal } from './modals/AssignEmployeeModal';
import { UserModal } from './modals/UserModal';
import { GenerateReportModal } from './modals/GenerateReportModal';
import { ViewReportModal } from './modals/ViewReportModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';

export type ViewType = 'dashboard' | 'my-time' | 'projects' | 'reports' | 'team';
export type ModalType = 'none' | 'add-time-entry' | 'edit-time-entry' | 'add-project' | 'edit-project' | 'add-task' | 'assign-employee' | 'add-user' | 'generate-report' | 'view-report' | 'delete-confirm';
export type UserRole = 'admin' | 'employee';
export type SortField = 'date' | 'duration' | 'project' | 'task';
export type SortDirection = 'asc' | 'desc';

export interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  team: string;
  activeTimer?: { task: string; project: string; startTime: Date };
}

export interface TimeEntry {
  id: number;
  date: string;
  task: string;
  taskId: number;
  project: string;
  projectId: number;
  duration: string;
  startTime: string;
  endTime: string;
  color: string;
  userId: number;
  description?: string;
}

export interface Task {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'todo';
  assignee: string;
  assigneeId: number;
  hours: number;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
  client: string;
  color: string;
  progress: number;
  totalHours: number;
  loggedHours: number;
  tasks: Task[];
  teamMembers: number[];
}

export interface Report {
  id: number;
  name: string;
  type: 'summary' | 'detailed' | 'by-project' | 'by-team';
  dateRange: string;
  generatedAt: string;
  generatedBy: string;
  data?: any;
}

// Current user is now passed as a prop

// Users data - will be loaded from API when endpoint is available
const initialUsers: User[] = [];

// Time entries - populated with demo data for verification
const initialTimeEntries: TimeEntry[] = typeof window !== 'undefined' ? [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0], // Today!
    task: 'Zjeść obiad',
    taskId: 2,
    project: 'System Time Tracking',
    projectId: 2,
    duration: '1h 00m',
    startTime: '13:00',
    endTime: '14:00',
    color: 'bg-emerald-500',
    userId: 2, // Matches mikolaj_programista / user
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday!
    task: 'Zrobić zakupy w biedronce',
    taskId: 1,
    project: 'System Time Tracking',
    projectId: 2,
    duration: '2h 30m',
    startTime: '10:00',
    endTime: '12:30',
    color: 'bg-blue-500',
    userId: 2,
  }
] : [];

// Projects - loaded from backend API via useProjects hook
const initialProjects: Project[] = [];

// Reports - will be loaded from API when endpoint is available
const initialReports: Report[] = [];

export const teams = ['Zespół Frontend', 'Zespół Backend', 'Zarząd', 'Design', 'QA', 'DevOps'];

export default function TimeTrackingLayout({ 
  currentUser, 
  onLogout 
}: { 
  currentUser: User; 
  onLogout: () => void; 
}) {
  // API Integration hooks first so raw data is available
  const { 
    projects: apiProjects, 
    isLoading: projectsLoading, 
    error: projectsError,
    createProject: apiCreateProject,
    updateProject: apiUpdateProject,
    deleteProject: apiDeleteProject,
    refresh: refreshProjects
  } = useProjects();

  const {
    tasks: apiTasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask: apiCreateTask,
    updateTask: apiUpdateTask,
    deleteTask: apiDeleteTask,
    refresh: refreshTasks
  } = useTasks();

  const {
    users: apiUsers,
    isLoading: usersLoading,
    error: usersError,
    createUser: apiCreateUser,
    updateUser: apiUpdateUser,
    deleteUser: apiDeleteUser,
    refresh: refreshUsers
  } = useUsers();

  const {
    teams: apiTeams,
    isLoading: teamsLoading,
    createTeam: apiCreateTeam,
    updateTeam: apiUpdateTeam,
    deleteTeam: apiDeleteTeam,
    addTeamMember: apiAddTeamMember,
    removeTeamMember: apiRemoveTeamMember,
    refresh: refreshTeams
  } = useTeams();

  const {
    reports: apiReports,
    isLoading: reportsLoading,
    isError: reportsError,
    refreshReports
  } = useReports();

  const {
    timeEntries: apiTimeEntries,
    isLoading: timeEntriesLoading,
    createTimeEntry: apiCreateTimeEntry,
    updateTimeEntry: apiUpdateTimeEntry,
    deleteTimeEntry: apiDeleteTimeEntry,
    refresh: refreshTimeEntries
  } = useTimeEntries(currentUser.id, currentUser.role);

  // Core state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTimerTask, setActiveTimerTask] = useState<{ id: number; name: string; projectId: number; projectName: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Data state
  const users = useMemo(() => {
    if (!apiUsers || apiUsers.length === 0) {
      return initialUsers;
    }
    return apiUsers.map((u) => {
      // Find which team this user belongs to
      const userTeam = apiTeams.find(t => t.members && t.members.some(m => m.id === u.id));
      const teamName = userTeam ? userTeam.name : 'Brak zespołu';

      return {
        id: u.id || 0,
        name: u.username,
        email: `${u.username.toLowerCase()}@company.com`,
        initials: u.username.slice(0, 2).toUpperCase(),
        role: (u.role?.toLowerCase() || 'employee') as UserRole,
        team: teamName,
      };
    });
  }, [apiUsers, apiTeams]);

  const [localProjectMembers, setLocalProjectMembers] = useState<Record<number, number[]>>({});
  const [reports, setReports] = useState<Report[]>([]);

  // Deriving projects from apiProjects, apiTimeEntries and apiTasks
  const projects = useMemo(() => {
    if (!apiProjects || apiProjects.length === 0) {
      return initialProjects;
    }
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
    
    let projectHours: Record<number, number> = {};
    if (typeof window !== 'undefined') {
      try {
        const projectHoursStr = localStorage.getItem('projectTotalHours');
        if (projectHoursStr) {
          projectHours = JSON.parse(projectHoursStr);
        }
      } catch (e) {}
    }

    return apiProjects.map((p, index) => {
      const projId = p.id || index + 1;
      const totalH = projectHours[projId] || 40;

      let loggedHours = 0;
      apiTimeEntries.filter(te => te.projectId === projId).forEach(te => {
        if (te.durationMinutes !== null && te.durationMinutes !== undefined) {
          loggedHours += te.durationMinutes / 60;
        }
      });

      const progress = totalH > 0 ? Math.min(100, Math.round((loggedHours / totalH) * 100)) : 0;

      const projectTaskUsers = apiTasks
        .filter(t => t.projectId === projId)
        .flatMap(t => t.assignedUsers || [])
        .map(u => u.id);
      const manualUsers = localProjectMembers[projId] || [];
      const uniqueMemberIds = Array.from(new Set([...projectTaskUsers, ...manualUsers]));

      return {
        id: projId,
        name: p.name,
        client: p.description || '',
        color: colors[index % colors.length],
        progress,
        totalHours: totalH,
        loggedHours: Math.round(loggedHours * 10) / 10,
        tasks: [],
        teamMembers: uniqueMemberIds,
      };
    });
  }, [apiProjects, apiTimeEntries, apiTasks, localProjectMembers]);

  // Deriving timeEntries from apiTimeEntries and apiProjects
  const timeEntries: TimeEntry[] = useMemo(() => {
    return apiTimeEntries.map((dto) => {
      const datePart = dto.startTime.split('T')[0] || '';
      const startStr = dto.startTime.split('T')[1]?.substring(0, 5) || '00:00';
      const endStr = dto.endTime ? (dto.endTime.split('T')[1]?.substring(0, 5) || '') : '';
      
      const formatDuration = (minutes: number | null | undefined) => {
        if (minutes === null || minutes === undefined) return "0h 00m";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m.toString().padStart(2, '0')}m`;
      };
      
      const project = apiProjects.find(p => p.id === dto.projectId);
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
      const projectIndex = apiProjects.findIndex(p => p.id === dto.projectId);
      const color = projectIndex !== -1 ? colors[projectIndex % colors.length] : 'bg-slate-500';

      return {
        id: dto.id || 0,
        date: datePart,
        task: dto.taskName || '',
        taskId: dto.taskId,
        project: dto.projectName || project?.name || '',
        projectId: dto.projectId || 0,
        duration: formatDuration(dto.durationMinutes),
        startTime: startStr,
        endTime: endStr,
        color: color,
        userId: dto.userId,
        description: dto.description || '',
      };
    });
  }, [apiTimeEntries, apiProjects]);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null);
  
  // Filter & Sort state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterProject, setFilterProject] = useState<number | 'all'>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [showUserMenu, setShowUserMenu] = useState(false);

  // API Integration state
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showApiStatus, setShowApiStatus] = useState(false);




  const reportTypeFromApi = (t: string): 'summary' | 'detailed' | 'by-project' | 'by-team' => {
    switch (t) {
      case 'SUMMARY': return 'summary';
      case 'DETAILED': return 'detailed';
      case 'PER_PROJECT': return 'by-project';
      case 'PER_TEAM': return 'by-team';
      default: return 'summary';
    }
  };

  // Sync reports from API into local state
  useEffect(() => {
    if (apiReports) {
      const mapped: Report[] = apiReports.map((r: any, index: number) => ({
        id: index + 1, // API might not return IDs for history, so generate one
        name: `Raport: ${r.type.replace('_', ' ').toLowerCase()}`,
        type: reportTypeFromApi(r.type),
        dateRange: `${r.startDate || ''} - ${r.endDate || ''}`,
        generatedAt: r.generatedAt ? new Date(r.generatedAt).toLocaleString() : '',
        generatedBy: 'System', // API does not return this in the list currently
        data: r.data || [],
      }));
      setReports(mapped);
    }
  }, [apiReports]);

  // Helper: map backend task status to frontend format
  const statusFromApi = (s: string): 'completed' | 'in-progress' | 'todo' => {
    switch (s) {
      case 'DONE': return 'completed';
      case 'IN_PROGRESS': return 'in-progress';
      default: return 'todo';
    }
  };

  const statusToApi = (s: string): string => {
    switch (s) {
      case 'completed': return 'DONE';
      case 'in-progress': return 'IN_PROGRESS';
      default: return 'TODO';
    }
  };

  // Filter projects for employees to only show projects they are assigned to
  const visibleProjects = useMemo(() => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    return projects.filter(project => 
      apiTasks.some(task => 
        task.projectId === project.id && 
        task.assignedUsers?.some(u => u.id === currentUser.id)
      )
    );
  }, [projects, apiTasks, currentUser.role, currentUser.id]);

  // Filter tasks for the selected project in the log time modal that are assigned to the employee
  const userTasksForSelectedProject = useMemo(() => {
    const projId = Number(formData.project || formData.projectId);
    if (!projId) return [];
    
    const projectTasks = apiTasks.filter(t => t.projectId === projId);
    if (currentUser.role === 'admin') {
      return projectTasks;
    }
    return projectTasks.filter(t => t.assignedUsers?.some(u => u.id === currentUser.id));
  }, [formData.project, formData.projectId, apiTasks, currentUser.role, currentUser.id]);

  // Get tasks for the currently selected project from API
  const selectedProjectTasks: TaskDTO[] = selectedProject
    ? apiTasks.filter(t => t.projectId === selectedProject)
    : [];

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEntriesForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return timeEntries.filter(entry => {
      if (entry.date !== dateStr) return false;
      const isAdmin = currentUser.role === 'admin';
      if (isAdmin && filterProject !== 'all') {
        return entry.projectId === filterProject;
      }
      return entry.userId === currentUser.id && (filterProject === 'all' || entry.projectId === filterProject);
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Status helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'in-progress':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <Circle size={16} className="text-slate-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">Ukonczone</span>;
      case 'in-progress':
        return <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">W trakcie</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">Do zrobienia</span>;
    }
  };

  // Validation helpers (UC-13)
  const validateTimeEntry = (data: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.task || data.task.trim() === '') {
      errors.task = 'Nazwa zadania jest wymagana';
    }
    if (!data.project) {
      errors.project = 'Projekt jest wymagany';
    }
    if (!data.date) {
      errors.date = 'Data jest wymagana';
    }
    if (!data.startTime) {
      errors.startTime = 'Czas rozpoczecia jest wymagany';
    }
    if (!data.endTime) {
      errors.endTime = 'Czas zakonczenia jest wymagany';
    }
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = 'Czas zakonczenia musi byc pozniej niz rozpoczecia';
    }
    
    // Check for overlapping entries
    if (data.date && data.startTime && data.endTime) {
      const overlapping = timeEntries.find(entry => {
        if (entry.userId !== currentUser.id || entry.date !== data.date) return false;
        if (editingItem && entry.id === editingItem.id) return false;
        const entryStart = entry.startTime;
        const entryEnd = entry.endTime;
        return (data.startTime < entryEnd && data.endTime > entryStart);
      });
      if (overlapping) {
        errors.overlap = `Ten czas naklada sie z wpisem "${overlapping.task}" (${overlapping.startTime} - ${overlapping.endTime})`;
      }
    }
    
    return errors;
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // Modal handlers
  const openModal = (type: ModalType, item?: any) => {
    setActiveModal(type);
    setEditingItem(item || null);
    setFormErrors({});
    
    if (item) {
      if (type === 'add-user') {
        const userTeam = apiTeams.find(t => t.members && t.members.some(m => m.id === item.id));
        setFormData({ 
          ...item, 
          username: item.name || item.username || '', 
          teamId: userTeam ? userTeam.id : ''
        });
      } else {
        setFormData({ ...item });
      }
    } else {
      // Default values for new items
      if (type === 'add-time-entry') {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          task: '',
          project: '',
        });
      } else if (type === 'add-project') {
        setFormData({
          name: '',
          client: '',
          color: 'bg-blue-500',
          totalHours: 40,
          status: 'active',
        });
      } else if (type === 'add-task') {
        setFormData({
          name: '',
          description: '',
          assigneeId: '',
          status: 'todo',
        });
      } else if (type === 'add-user') {
        setFormData({
          username: '',
          password: '',
          role: 'employee',
          teamId: '',
        });
      } else if (type === 'generate-report') {
        setFormData({
          type: 'weekly',
          dateFrom: '',
          dateTo: '',
          includeProjects: 'all',
          includeUsers: 'all',
        });
      } else {
        setFormData({});
      }
    }
  };

  const closeModal = () => {
    setActiveModal('none');
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
    setDeleteTarget(null);
  };

  // CRUD operations
  const handleSaveTimeEntry = async () => {
    const errors = validateTimeEntry(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setApiLoading(true);
    setApiError(null);

    try {
      let taskId = Number(formData.taskId);
      if (!taskId && formData.task) {
        const existingTask = apiTasks.find(t => t.projectId === Number(formData.project) && t.name.toLowerCase() === formData.task.toLowerCase());
        if (existingTask) {
          taskId = existingTask.id || 0;
        } else {
          const taskResult = await createTask({
            projectId: Number(formData.project),
            name: formData.task,
            status: 'TODO',
            description: 'Utworzone automatycznie podczas logowania czasu',
            assignedUserIds: [currentUser.id]
          });
          
          if (taskResult.error) {
            setApiError(taskResult.error.message || 'Nie udało się utworzyć zadania dla wpisu czasu.');
            setApiLoading(false);
            return;
          }
          
          if (taskResult.data && taskResult.data.id) {
            taskId = taskResult.data.id;
            await refreshTasks();
          } else {
            setApiError('Nie udało się pobrać ID nowego zadania.');
            setApiLoading(false);
            return;
          }
        }
      }

      const startTime = `${formData.date}T${formData.startTime}:00`;
      const endTime = formData.endTime ? `${formData.date}T${formData.endTime}:00` : undefined;

      const entryData: TimeEntryDTO = {
        userId: currentUser.id,
        taskId: taskId,
        startTime,
        endTime,
        description: formData.description || ''
      };

      if (editingItem) {
        const result = await apiUpdateTimeEntry(editingItem.id, entryData);
        if (result.error) {
          setApiError(result.error.message || 'Błąd podczas aktualizacji wpisu czasu.');
          setApiLoading(false);
          return;
        }
      } else {
        const result = await apiCreateTimeEntry(entryData);
        if (result.error) {
          setApiError(result.error.message || 'Błąd podczas tworzenia wpisu czasu.');
          setApiLoading(false);
          return;
        }
      }

      await refreshTimeEntries();
      setApiLoading(false);
      closeModal();
    } catch (err) {
      setApiError('Wystąpił nieoczekiwany błąd podczas zapisywania.');
      setApiLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!formData.name) {
      setFormErrors({
        name: 'Nazwa projektu jest wymagana',
      });
      return;
    }

    setApiLoading(true);
    setApiError(null);

    const projectData: Omit<ProjectDTO, 'id'> = {
      name: formData.name,
      description: formData.client || formData.description || undefined,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || undefined,
    };

    try {
      if (editingItem) {
        // UPDATE existing project via API
        const result = await apiUpdateProject(editingItem.id, projectData);
        
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie zaktualizowac projektu');
          setApiLoading(false);
          return;
        }

        if (typeof window !== 'undefined') {
          try {
            const projectHoursStr = localStorage.getItem('projectTotalHours');
            const projectHours = projectHoursStr ? JSON.parse(projectHoursStr) : {};
            projectHours[editingItem.id] = parseInt(formData.totalHours) || 40;
            localStorage.setItem('projectTotalHours', JSON.stringify(projectHours));
          } catch (e) {}
        }
      } else {
        // CREATE new project via API
        const result = await apiCreateProject(projectData);
        
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie utworzyc projektu');
          setApiLoading(false);
          return;
        }

        if (result.data?.id && typeof window !== 'undefined') {
          try {
            const projectHoursStr = localStorage.getItem('projectTotalHours');
            const projectHours = projectHoursStr ? JSON.parse(projectHoursStr) : {};
            projectHours[result.data.id] = parseInt(formData.totalHours) || 40;
            localStorage.setItem('projectTotalHours', JSON.stringify(projectHours));
          } catch (e) {}
        }
      }
      
      // SWR will auto-refresh projects from the API
      setApiLoading(false);
      closeModal();
    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad');
      setApiLoading(false);
    }
  };

  const handleSaveTask = async () => {
    if (!formData.name) {
      setFormErrors({ name: 'Nazwa zadania jest wymagana' });
      return;
    }
    if (!selectedProject) return;

    setApiLoading(true);
    setApiError(null);

    const taskData = {
      projectId: selectedProject,
      name: formData.name,
      description: formData.description || undefined,
      status: statusToApi(formData.status || 'todo'),
      assignedUserIds: formData.assigneeId ? [Number(formData.assigneeId)] : [],
    };

    try {
      if (editingItem) {
        const result = await apiUpdateTask(editingItem.id, taskData);
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie zaktualizowac zadania');
          setApiLoading(false);
          return;
        }
      } else {
        const result = await apiCreateTask(taskData);
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie utworzyc zadania');
          setApiLoading(false);
          return;
        }
      }
      setApiLoading(false);
      closeModal();
    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad');
      setApiLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.username) {
      setFormErrors({
        username: 'Nazwa uzytkownika jest wymagana',
      });
      return;
    }

    if (!editingItem && !formData.password) {
      setFormErrors({
        password: 'Haslo jest wymagane dla nowego uzytkownika',
      });
      return;
    }

    setApiLoading(true);
    setApiError(null);

    const userData = {
      username: formData.username,
      password: formData.password || undefined,
      role: (formData.role || 'employee').toUpperCase(),
    };

    try {
      let savedUserId: number | undefined = undefined;

      if (editingItem) {
        savedUserId = editingItem.id;
        const result = await apiUpdateUser(editingItem.id, userData);
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie zaktualizowac uzytkownika');
          setApiLoading(false);
          return;
        }
      } else {
        const result = await apiCreateUser(userData);
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie utworzyc uzytkownika');
          setApiLoading(false);
          return;
        }
        savedUserId = result.data?.id;
      }

      // Handle team assignment/update
      if (savedUserId) {
        const previousTeam = apiTeams.find(t => t.members && t.members.some(m => m.id === savedUserId));
        const newTeamId = formData.teamId ? Number(formData.teamId) : null;

        if (newTeamId !== (previousTeam ? previousTeam.id : null)) {
          // Remove from old team first if user belonged to one
          if (previousTeam) {
            await apiRemoveTeamMember(previousTeam.id, savedUserId);
          }
          // Add to new team if selected
          if (newTeamId) {
            await apiAddTeamMember(newTeamId, savedUserId);
          }
        }
      }

      setApiLoading(false);
      refreshTeams();
      refreshUsers();
      closeModal();
    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad');
      setApiLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!formData.dateFrom || !formData.dateTo) {
      setFormErrors({
        dateFrom: !formData.dateFrom ? 'Data poczatkowa jest wymagana' : '',
        dateTo: !formData.dateTo ? 'Data koncowa jest wymagana' : '',
      });
      return;
    }

    setApiLoading(true);
    setApiError(null);

    const parseDurationToHours = (durationStr: string): number => {
      if (!durationStr) return 0;
      const match = durationStr.match(/(\d+)h (\d+)m/);
      if (match) {
        return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
      }
      return 0;
    };

    try {
      const type = formData.type || 'summary';
      
      // Filter entries locally based on form parameters
      const isDetailed = type === 'detailed';
      const relevantEntries = timeEntries.filter(entry => {
        const matchesDate = entry.date >= formData.dateFrom && entry.date <= formData.dateTo;
        const matchesProject = !isDetailed || !formData.includeProjects || formData.includeProjects === 'all' || entry.projectId === Number(formData.includeProjects);
        const matchesUser = !isDetailed || !formData.includeUsers || formData.includeUsers === 'all' || entry.userId === Number(formData.includeUsers);
        return matchesDate && matchesProject && matchesUser;
      });

      let generatedData: any[] = [];

      if (type === 'summary') {
        const summaryMap = new Map<number, { username: string; totalHours: number; totalEntries: number }>();
        relevantEntries.forEach(entry => {
          const uId = entry.userId;
          const user = users.find(u => u.id === uId);
          const name = user ? user.name : `Uzytkownik ${uId}`;
          const hours = parseDurationToHours(entry.duration);
          
          if (!summaryMap.has(uId)) {
            summaryMap.set(uId, { username: name, totalHours: 0, totalEntries: 0 });
          }
          const stats = summaryMap.get(uId)!;
          stats.totalHours += hours;
          stats.totalEntries += 1;
        });
        generatedData = Array.from(summaryMap.values()).map(item => ({
          username: item.username,
          totalHours: Math.round(item.totalHours * 100) / 100,
          totalEntries: item.totalEntries
        }));
      } else if (type === 'detailed') {
        generatedData = relevantEntries.map(entry => {
          const user = users.find(u => u.id === entry.userId);
          return {
            date: entry.date,
            username: user ? user.name : `Uzytkownik ${entry.userId}`,
            projectName: entry.project,
            taskName: entry.task,
            duration: entry.duration,
            description: entry.description || ''
          };
        });
      } else if (type === 'by-project') {
        const projectMap = new Map<number, { projectName: string; totalHours: number; employeeSet: Set<number> }>();
        relevantEntries.forEach(entry => {
          const pId = entry.projectId;
          const hours = parseDurationToHours(entry.duration);
          if (!projectMap.has(pId)) {
            projectMap.set(pId, { projectName: entry.project, totalHours: 0, employeeSet: new Set() });
          }
          const stats = projectMap.get(pId)!;
          stats.totalHours += hours;
          stats.employeeSet.add(entry.userId);
        });
        generatedData = Array.from(projectMap.values()).map(item => ({
          projectName: item.projectName,
          totalHours: Math.round(item.totalHours * 100) / 100,
          employeeCount: item.employeeSet.size
        }));
      } else if (type === 'by-team') {
        const teamMap = new Map<string, { teamName: string; totalHours: number; memberSet: Set<number> }>();
        relevantEntries.forEach(entry => {
          const user = users.find(u => u.id === entry.userId);
          const teamName = user?.team || 'Inne';
          const hours = parseDurationToHours(entry.duration);
          
          if (!teamMap.has(teamName)) {
            teamMap.set(teamName, { teamName, totalHours: 0, memberSet: new Set() });
          }
          const stats = teamMap.get(teamName)!;
          stats.totalHours += hours;
          stats.memberSet.add(entry.userId);
        });
        generatedData = Array.from(teamMap.values()).map(item => ({
          teamName: item.teamName,
          totalHours: Math.round(item.totalHours * 100) / 100,
          memberCount: item.memberSet.size
        }));
      }

      const newReport = {
        id: Date.now(),
        name: `Raport: ${type.replace('-', ' ').toLowerCase()}`,
        type: type,
        dateRange: `${formData.dateFrom} - ${formData.dateTo}`,
        generatedAt: new Date().toLocaleString(),
        generatedBy: currentUser.name,
        data: generatedData,
      };

      setReports(prev => [newReport, ...prev]);
      setActiveModal('view-report');
      setEditingItem(newReport);
      setApiLoading(false);

    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad przy generowaniu raportu');
      setApiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setApiLoading(true);
    setApiError(null);

    try {
      switch (deleteTarget.type) {
        case 'time-entry':
          const entryDelResult = await apiDeleteTimeEntry(deleteTarget.id);
          if (entryDelResult.error) {
            setApiError(entryDelResult.error.message || 'Nie udało się usunąć wpisu czasu.');
            setApiLoading(false);
            return;
          }
          break;
        case 'project':
          // DELETE project via API
          const result = await apiDeleteProject(deleteTarget.id);
          
          if (result.error) {
            if (result.error.status === 409) {
              setApiError('Nie mozna usunac projektu z przypisanymi zadaniami');
            } else {
              setApiError(result.error.message || 'Nie udalo sie usunac projektu');
            }
            setApiLoading(false);
            return;
          }
          
          setLocalProjectMembers(prev => {
            const next = { ...prev };
            delete next[deleteTarget.id];
            return next;
          });
          if (selectedProject === deleteTarget.id) setSelectedProject(null);
          break;
        case 'task':
          const taskDelResult = await apiDeleteTask(deleteTarget.id);
          if (taskDelResult.error) {
            setApiError(taskDelResult.error.message || 'Nie udalo sie usunac zadania');
            setApiLoading(false);
            return;
          }
          break;
        case 'user':
          const userDelResult = await apiDeleteUser(deleteTarget.id);
          if (userDelResult.error) {
            setApiError(userDelResult.error.message || 'Nie udalo sie usunac uzytkownika');
            setApiLoading(false);
            return;
          }
          break;
        case 'report':
          // TODO: Add API call for reports when endpoint is available
          setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
          break;
      }
      
      setApiLoading(false);
      closeModal();
    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad');
      setApiLoading(false);
    }
  };

  const confirmDelete = (type: string, id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setActiveModal('delete-confirm');
  };

  const handleAssignEmployee = () => {
    if (!formData.userId || !selectedProject) return;
    const userId = Number(formData.userId);
    setLocalProjectMembers(prev => {
      const current = prev[selectedProject] || [];
      if (current.includes(userId)) return prev;
      return {
        ...prev,
        [selectedProject]: [...current, userId]
      };
    });
    closeModal();
  };

  // Sorting & Filtering (UC-14)
  const getSortedFilteredEntries = () => {
    let filtered = [...timeEntries].filter(e => {
      const isAdmin = currentUser.role === 'admin';
      if (isAdmin && filterProject !== 'all') {
        return e.projectId === filterProject;
      }
      return e.userId === currentUser.id && (filterProject === 'all' || e.projectId === filterProject);
    });
    
    if (filterDateFrom) {
      filtered = filtered.filter(e => e.date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter(e => e.date <= filterDateTo);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'project':
          comparison = a.project.localeCompare(b.project);
          break;
        case 'task':
          comparison = a.task.localeCompare(b.task);
          break;
        case 'duration':
          comparison = a.duration.localeCompare(b.duration);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Inject current user's active timer into the users array so it shows up in views
  const usersWithActiveTimer = users.map(u => 
    u.id === currentUser.id && isTimerRunning && activeTimerTask 
      ? { ...u, activeTimer: { task: activeTimerTask.name, project: activeTimerTask.projectName, startTime: new Date(Date.now() - timerSeconds * 1000) } } 
      : u
  );

  const renderContent = () => {
    switch (currentView) {
      case 'my-time':
        return (
          <MyTimeView
            currentUser={currentUser}
            users={usersWithActiveTimer}
            timeEntries={timeEntries}
            projects={projects}
            visibleProjects={visibleProjects}
            apiTasks={apiTasks}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            getDaysInMonth={getDaysInMonth}
            openModal={openModal as any}
            formatMonth={formatMonth}
            filterProject={filterProject}
            setFilterProject={setFilterProject}
            navigateMonth={navigateMonth}
            getEntriesForDay={getEntriesForDay}
            setFormData={setFormData}
            getStatusIcon={getStatusIcon}
            statusFromApi={statusFromApi}
            getStatusBadge={getStatusBadge}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            currentUser={currentUser}
            users={usersWithActiveTimer}
            projects={projects}
            visibleProjects={visibleProjects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            projectsLoading={projectsLoading}
            refreshProjects={refreshProjects}
            openModal={openModal as any}
            confirmDelete={confirmDelete}
            apiTasks={apiTasks}
            tasksLoading={tasksLoading}
            refreshTasks={refreshTasks}
            getStatusIcon={getStatusIcon}
            statusFromApi={statusFromApi}
            getStatusBadge={getStatusBadge}
            setIsTimerRunning={setIsTimerRunning}
            setTimerSeconds={setTimerSeconds}
            setActiveTimerTask={setActiveTimerTask}
          />
        );
      case 'reports':
        return (
          <ReportsView
            currentUser={currentUser}
            reports={reports}
            openModal={openModal as any}
            setEditingItem={setEditingItem}
            setActiveModal={setActiveModal}
            confirmDelete={confirmDelete}
          />
        );
      case 'team':
        return (
          <TeamView
            currentUser={currentUser}
            users={usersWithActiveTimer}
            usersLoading={usersLoading}
            refreshUsers={refreshUsers}
            openModal={openModal as any}
            confirmDelete={confirmDelete}
            teams={apiTeams}
            teamsLoading={teamsLoading}
            refreshTeams={refreshTeams}
            createTeam={apiCreateTeam}
            deleteTeam={apiDeleteTeam}
          />
        );
      default:
        return (
          <DashboardView
            currentUser={currentUser}
            users={usersWithActiveTimer}
            timeEntries={timeEntries}
            visibleProjects={visibleProjects}
            openModal={openModal as any}
            formatTimer={formatTimer}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filterProject={filterProject}
            setFilterProject={setFilterProject}
            projects={projects}
            filterDateFrom={filterDateFrom}
            setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo}
            setFilterDateTo={setFilterDateTo}
            toggleSort={toggleSort}
            sortField={sortField}
            getSortedFilteredEntries={getSortedFilteredEntries}
            confirmDelete={confirmDelete}
          />
        );
    }
  };

  // Modal content
  const renderModal = () => {
    if (activeModal === 'none') return null;

    const modalContent = () => {
      switch (activeModal) {
        case 'add-time-entry':
        case 'edit-time-entry':
          return (
            <TimeEntryModal
              editingItem={editingItem}
              formErrors={formErrors}
              formData={formData}
              setFormData={setFormData}
              visibleProjects={visibleProjects}
              userTasksForSelectedProject={userTasksForSelectedProject}
              calculateDuration={calculateDuration}
              closeModal={closeModal}
              handleSaveTimeEntry={handleSaveTimeEntry}
            />
          );
        case 'add-project':
        case 'edit-project':
          return (
            <ProjectModal
              editingItem={editingItem}
              apiError={apiError}
              setApiError={setApiError}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              apiLoading={apiLoading}
              closeModal={closeModal}
              handleSaveProject={handleSaveProject}
            />
          );
        case 'add-task':
          return (
            <TaskModal
              editingItem={editingItem}
              apiError={apiError}
              setApiError={setApiError}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              apiLoading={apiLoading}
              users={users}
              closeModal={closeModal}
              handleSaveTask={handleSaveTask}
            />
          );
        case 'assign-employee':
          return (
            <AssignEmployeeModal
              formData={formData}
              setFormData={setFormData}
              projects={projects}
              selectedProject={selectedProject}
              users={usersWithActiveTimer}
              closeModal={closeModal}
              handleAssignEmployee={handleAssignEmployee}
            />
          );
        case 'add-user':
          return (
            <UserModal
              editingItem={editingItem}
              apiError={apiError}
              setApiError={setApiError}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              apiLoading={apiLoading}
              teams={apiTeams}
              closeModal={closeModal}
              handleSaveUser={handleSaveUser}
            />
          );
        case 'generate-report':
          return (
            <GenerateReportModal
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              visibleProjects={visibleProjects}
              users={usersWithActiveTimer}
              closeModal={closeModal}
              handleGenerateReport={handleGenerateReport}
            />
          );
        case 'view-report':
          return (
            <ViewReportModal
              editingItem={editingItem}
              visibleProjects={visibleProjects}
              closeModal={closeModal}
            />
          );
        case 'delete-confirm':
          return (
            <DeleteConfirmModal
              deleteTarget={deleteTarget}
              apiError={apiError}
              apiLoading={apiLoading}
              closeModal={closeModal}
              handleDelete={handleDelete}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${activeModal === 'view-report' ? 'max-w-4xl' : 'max-w-lg'}`}>
          <div className="p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            {modalContent()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="text-xl font-bold tracking-tight text-indigo-600">
            LW2<span className="text-slate-800">Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Glowne</p>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('projects')}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium transition-colors ${
              currentView === 'projects' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderKanban size={20} />
            Projekty i Zadania
          </button>
          <button 
            onClick={() => setCurrentView('my-time')}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium transition-colors ${
              currentView === 'my-time' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar size={20} />
            Moj Czas
          </button>

          {currentUser.role === 'admin' && (
            <div className="pt-6">
              <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Administracja</p>
              <button 
                onClick={() => setCurrentView('reports')}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium transition-colors ${
                  currentView === 'reports' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BarChart3 size={20} />
                Raporty Systemowe
              </button>
              <button 
                onClick={() => setCurrentView('team')}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium transition-colors ${
                  currentView === 'team' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users size={20} />
                Zarzadzanie Zespolem
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {currentUser.initials}
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-slate-500">Tytul</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex-1"></div>

          <div className="flex items-center gap-6">
            {/* API Status Indicator */}
            <div className="relative">
              <button
                onClick={() => setShowApiStatus(!showApiStatus)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isOnline ? 'API Online' : 'Offline'}
              </button>

              {showApiStatus && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Status API</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Serwer</span>
                      <span className={`text-sm font-medium ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isOnline ? 'Polaczony' : 'Rozlaczony'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Base URL</span>
                      <span className="text-xs font-mono text-slate-500">localhost:8081</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">Polaczone endpointy:</p>
                      <div className="space-y-1 text-xs font-mono max-h-40 overflow-y-auto">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1">Projects</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">GET</span>
                          <span className="text-slate-600">/api/projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                          <span className="text-slate-600">/api/projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">PUT</span>
                          <span className="text-slate-600">/api/projects/:id</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">DEL</span>
                          <span className="text-slate-600">/api/projects/:id</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-2">Tasks</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">GET</span>
                          <span className="text-slate-600">/api/tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                          <span className="text-slate-600">/api/tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">PUT</span>
                          <span className="text-slate-600">/api/tasks/:id</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">DEL</span>
                          <span className="text-slate-600">/api/tasks/:id</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-2">Users</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">GET</span>
                          <span className="text-slate-600">/api/users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                          <span className="text-slate-600">/api/users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">PUT</span>
                          <span className="text-slate-600">/api/users/:id</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">DEL</span>
                          <span className="text-slate-600">/api/users/:id</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-2">Auth</p>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">POST</span>
                          <span className="text-slate-600">/api/auth/login</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { refreshProjects(); refreshTasks(); refreshUsers(); setShowApiStatus(false); }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors mt-2"
                    >
                      <RefreshCw size={14} />
                      Odswiez dane
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isTimerRunning && (
              <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide leading-none">Aktywne zadanie</span>
                  <span className="text-sm font-medium text-slate-800 leading-tight">
                    {activeTimerTask ? activeTimerTask.name : 'Brak aktywnego zadania'}
                  </span>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-600 ml-2">
                  {formatTimer(timerSeconds)}
                </div>
                <button 
                  onClick={() => {
                    setIsTimerRunning(false);
                    if (activeTimerTask) {
                      const now = new Date();
                      const endTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                      const start = new Date(now.getTime() - timerSeconds * 1000);
                      const startTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
                      
                      setActiveModal('add-time-entry');
                      setEditingItem(null);
                      setFormErrors({});
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        taskId: activeTimerTask.id,
                        task: activeTimerTask.name,
                        project: activeTimerTask.projectId, // project property uses projectId in the modal select
                      });
                      setActiveTimerTask(null);
                    }
                  }}
                  className="p-1.5 bg-emerald-200 text-emerald-800 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Zatrzymaj timer"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              </div>
            )}


            {/* User menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {currentUser.initials}
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="font-medium text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <Settings size={16} />
                      Ustawienia
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Wyloguj sie
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Modal */}
      {renderModal()}

      {(showUserMenu || showApiStatus) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setShowUserMenu(false); setShowApiStatus(false); }}
        />
      )}
    </div>
  );
}

