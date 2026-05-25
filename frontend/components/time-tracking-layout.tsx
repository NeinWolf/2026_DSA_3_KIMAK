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
  Search, 
  Bell,
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
import type { ProjectDTO, TaskDTO, ApiError } from '@/lib/api';

type ViewType = 'dashboard' | 'my-time' | 'projects' | 'reports' | 'team';
type ModalType = 'none' | 'add-time-entry' | 'edit-time-entry' | 'add-project' | 'edit-project' | 'add-task' | 'assign-employee' | 'add-user' | 'generate-report' | 'view-report' | 'delete-confirm';
export type UserRole = 'admin' | 'employee';
type SortField = 'date' | 'duration' | 'project' | 'task';
type SortDirection = 'asc' | 'desc';

export interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  team: string;
  activeTimer?: { task: string; project: string; startTime: Date };
}

interface TimeEntry {
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
}

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'todo';
  assignee: string;
  assigneeId: number;
  hours: number;
  description?: string;
}

interface Project {
  id: number;
  name: string;
  client: string;
  color: string;
  progress: number;
  totalHours: number;
  loggedHours: number;
  status: 'active' | 'completed' | 'on-hold';
  tasks: Task[];
  teamMembers: number[];
}

interface Report {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  dateRange: string;
  generatedAt: string;
  generatedBy: string;
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

const teams = ['Frontend', 'Backend', 'Design', 'QA', 'DevOps'];

export default function TimeTrackingLayout({ 
  currentUser, 
  onLogout 
}: { 
  currentUser: User; 
  onLogout: () => void; 
}) {
  // Core state
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(8130); // 02:15:30
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Data state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [reports, setReports] = useState<Report[]>(initialReports);
  
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
  
  // Notifications
  // Notifications - will be loaded from API when endpoint is available
  const [notifications, setNotifications] = useState<{ id: number; message: string; time: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // API Integration state
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showApiStatus, setShowApiStatus] = useState(false);
  
  // Use the API hook for projects
  const { 
    projects: apiProjects, 
    isLoading: projectsLoading, 
    error: projectsError,
    createProject: apiCreateProject,
    updateProject: apiUpdateProject,
    deleteProject: apiDeleteProject,
    refresh: refreshProjects
  } = useProjects();

  // Use the API hook for tasks
  const {
    tasks: apiTasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask: apiCreateTask,
    updateTask: apiUpdateTask,
    deleteTask: apiDeleteTask,
    refresh: refreshTasks
  } = useTasks();

  // Use the API hook for users
  const {
    users: apiUsers,
    isLoading: usersLoading,
    error: usersError,
    createUser: apiCreateUser,
    updateUser: apiUpdateUser,
    deleteUser: apiDeleteUser,
    refresh: refreshUsers
  } = useUsers();

  // Sync projects from API into local state
  useEffect(() => {
    if (apiProjects && apiProjects.length > 0) {
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
      const mapped: Project[] = apiProjects.map((p, index) => ({
        id: p.id || index + 1,
        name: p.name,
        client: p.description || '',
        color: colors[index % colors.length],
        progress: 0,
        totalHours: 0,
        loggedHours: 0,
        status: 'active' as const,
        tasks: [],
        teamMembers: [],
      }));
      setProjects(mapped);
    }
  }, [apiProjects]);

  // Sync users from API into local state
  useEffect(() => {
    if (apiUsers && apiUsers.length > 0) {
      const mapped: User[] = apiUsers.map((u) => ({
        id: u.id || 0,
        name: u.username,
        email: '',
        initials: u.username.slice(0, 2).toUpperCase(),
        role: (u.role?.toLowerCase() || 'employee') as UserRole,
        team: '',
      }));
      setUsers(mapped);
    }
  }, [apiUsers]);

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
    return timeEntries.filter(entry => entry.date === dateStr && entry.userId === currentUser.id);
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
        setFormData({ ...item, username: item.name || item.username || '' });
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
  const handleSaveTimeEntry = () => {
    const errors = validateTimeEntry(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const project = projects.find(p => p.id === Number(formData.project));
    const duration = calculateDuration(formData.startTime, formData.endTime);

    if (editingItem) {
      setTimeEntries(prev => prev.map(entry => 
        entry.id === editingItem.id 
          ? { 
              ...entry, 
              ...formData, 
              projectId: Number(formData.project),
              project: project?.name || '',
              color: project?.color || 'bg-slate-500',
              duration 
            } 
          : entry
      ));
    } else {
      const nextId = timeEntries.length > 0 ? Math.max(...timeEntries.map(e => e.id)) + 1 : 1;
      const newEntry: TimeEntry = {
        id: nextId,
        date: formData.date,
        task: formData.task,
        taskId: Number(formData.taskId) || 0,
        project: project?.name || '',
        projectId: Number(formData.project),
        duration,
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: project?.color || 'bg-slate-500',
        userId: currentUser.id,
      };
      setTimeEntries(prev => [...prev, newEntry]);
    }
    closeModal();
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
      } else {
        // CREATE new project via API
        const result = await apiCreateProject(projectData);
        
        if (!result.success) {
          setApiError(result.error?.message || 'Nie udalo sie utworzyc projektu');
          setApiLoading(false);
          return;
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
      if (editingItem) {
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
      }

      setApiLoading(false);
      closeModal();
    } catch (err) {
      setApiError('Wystapil nieoczekiwany blad');
      setApiLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!formData.dateFrom || !formData.dateTo) {
      setFormErrors({
        dateFrom: !formData.dateFrom ? 'Data poczatkowa jest wymagana' : '',
        dateTo: !formData.dateTo ? 'Data koncowa jest wymagana' : '',
      });
      return;
    }

    const newReport: Report = {
      id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
      name: `Raport ${formData.type === 'daily' ? 'dzienny' : formData.type === 'weekly' ? 'tygodniowy' : 'miesieczny'} - ${formData.dateFrom}`,
      type: formData.type,
      dateRange: `${formData.dateFrom} - ${formData.dateTo}`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      generatedBy: currentUser.name,
    };
    setReports(prev => [newReport, ...prev]);
    closeModal();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setApiLoading(true);
    setApiError(null);

    try {
      switch (deleteTarget.type) {
        case 'time-entry':
          // TODO: Add API call for time entries when endpoint is available
          setTimeEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
          break;
        case 'project':
          // DELETE project via API
          const result = await apiDeleteProject(deleteTarget.id);
          
          if (!result.success) {
            if (result.error?.status === 409) {
              setApiError('Nie mozna usunac projektu z przypisanymi zadaniami');
            } else {
              setApiError(result.error?.message || 'Nie udalo sie usunac projektu');
            }
            setApiLoading(false);
            return;
          }
          
          setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
          if (selectedProject === deleteTarget.id) setSelectedProject(null);
          break;
        case 'task':
          const taskDelResult = await apiDeleteTask(deleteTarget.id);
          if (!taskDelResult.success) {
            setApiError(taskDelResult.error?.message || 'Nie udalo sie usunac zadania');
            setApiLoading(false);
            return;
          }
          break;
        case 'user':
          const userDelResult = await apiDeleteUser(deleteTarget.id);
          if (!userDelResult.success) {
            setApiError(userDelResult.error?.message || 'Nie udalo sie usunac uzytkownika');
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

    setProjects(prev => prev.map(project => {
      if (project.id !== selectedProject) return project;
      if (project.teamMembers.includes(Number(formData.userId))) return project;
      return { ...project, teamMembers: [...project.teamMembers, Number(formData.userId)] };
    }));
    closeModal();
  };

  // Sorting & Filtering (UC-14)
  const getSortedFilteredEntries = () => {
    let filtered = [...timeEntries].filter(e => e.userId === currentUser.id);
    
    if (filterProject !== 'all') {
      filtered = filtered.filter(e => e.projectId === filterProject);
    }
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

  // Render Dashboard (UC-05, UC-12)
  const renderDashboard = () => {
    const isAdmin = currentUser.role === 'admin';
    const activeTimers = users.filter(u => u.activeTimer);

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
        <div className={`grid grid-cols-1 gap-6 mb-8 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">
              {isAdmin ? 'Laczny czas zespolu (Dzisiaj)' : 'Zalogowany czas (Dzisiaj)'}
            </h3>
            <div className="text-3xl font-bold text-slate-900">{isAdmin ? '0h 00m' : '0h 00m'}</div>
            <p className="text-sm text-slate-500 mt-2">Brak danych</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">
              {isAdmin ? 'Laczny czas zespolu (Tydzien)' : 'Zalogowany czas (Tydzien)'}
            </h3>
            <div className="text-3xl font-bold text-slate-900">{isAdmin ? '0h 00m' : '0h 00m'}</div>
            <p className="text-sm text-slate-500 mt-2">Cel: {isAdmin ? '200h' : '40h'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Aktywne Projekty</h3>
            <div className="text-3xl font-bold text-slate-900">{visibleProjects.filter(p => p.status === 'active').length}</div>
            <p className="text-sm text-slate-500 mt-2">Wymagaja uwagi</p>
          </div>
          {isAdmin && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Aktywni pracownicy</h3>
              <div className="text-3xl font-bold text-slate-900">{activeTimers.length} / {users.length}</div>
              <p className="text-sm text-emerald-600 mt-2 font-medium">Pracuja teraz</p>
            </div>
          )}
        </div>

        {/* Admin: Real-time monitoring (UC-08) */}
        {isAdmin && activeTimers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Activity size={20} className="text-emerald-500" />
              <h2 className="font-semibold text-slate-900">Aktywne sesje pracy</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Na zywo</span>
            </div>
            <div className="divide-y divide-slate-100">
              {activeTimers.map(user => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {user.initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{user.activeTimer?.task}</p>
                    <p className="text-sm text-slate-500">{user.activeTimer?.project}</p>
                  </div>
                  <div className="text-lg font-mono font-bold text-emerald-600">
                    {formatTimer(Math.floor((Date.now() - (user.activeTimer?.startTime.getTime() || 0)) / 1000))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

  // Render My Time - Calendar (UC-04)
  const renderMyTime = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob', 'Ndz'];

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
            <div className="text-2xl font-bold text-slate-900 mt-1">0h 00m</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ten tydzien</h3>
            <div className="text-2xl font-bold text-slate-900 mt-1">0h 00m</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Srednia dzienna</h3>
            <div className="text-2xl font-bold text-slate-900 mt-1">0h 00m</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dni robocze</h3>
            <div className="text-2xl font-bold text-slate-900 mt-1">0 / 0</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* Calendar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 capitalize">{formatMonth(currentMonth)}</h2>
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
                            className={`${entry.color} text-white text-xs px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                            title={`${entry.task} - ${entry.duration}`}
                          >
                            {entry.duration} {entry.task}
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
                {apiTasks.filter(t => t.assignedUsers?.some(u => u.id === currentUser.id)).length > 0 ? (
                  apiTasks.filter(t => t.assignedUsers?.some(u => u.id === currentUser.id)).map(task => {
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

  // Render Projects (UC-02, UC-06, UC-07)
  const renderProjects = () => {
    const currentProject = selectedProject !== null 
      ? projects.find(p => p.id === selectedProject) 
      : null;
    const isAdmin = currentUser.role === 'admin';

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
                              {task.assignedUsers.slice(0, 3).map(au => (
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

  // Render Reports (UC-09, UC-10)
  const renderReports = () => {
    const isAdmin = currentUser.role === 'admin';

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Raporty Systemowe</h1>
            <p className="text-slate-500 mt-1">Generuj i przegladaj raporty czasu pracy.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => openModal('generate-report')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus size={18} />
              Generuj raport
            </button>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Raporty dzienne</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'daily').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText size={20} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Raporty tygodniowe</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'weekly').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText size={20} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Raporty miesieczne</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'monthly').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 size={20} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Laczny czas</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">0h</div>
          </div>
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Historia raportow</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.map(report => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    report.type === 'daily' ? 'bg-blue-100' : 
                    report.type === 'weekly' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <FileText size={20} className={
                      report.type === 'daily' ? 'text-blue-600' : 
                      report.type === 'weekly' ? 'text-emerald-600' : 'text-amber-600'
                    } />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{report.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{report.dateRange}</span>
                      <span>|</span>
                      <span>Wygenerowano: {report.generatedAt}</span>
                      <span>|</span>
                      <span>Przez: {report.generatedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingItem(report); setActiveModal('view-report'); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    Podglad
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Download size={16} />
                    Pobierz
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => confirmDelete('report', report.id, report.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Team Management (UC-11)
  const renderTeam = () => {
    const isAdmin = currentUser.role === 'admin';

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Zarzadzanie Zespolem</h1>
            <p className="text-slate-500 mt-1">Zarzadzaj uzytkownikami, rolami i zespolami.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => refreshUsers()}
              disabled={usersLoading}
              className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Odswiez liste uzytkownikow z API"
            >
              <RefreshCw size={16} className={usersLoading ? 'animate-spin' : ''} />
              Odswiez
            </button>
            {isAdmin && (
              <button 
                onClick={() => openModal('add-user')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <UserPlus size={18} />
                Dodaj uzytkownika
              </button>
            )}
          </div>
        </div>

        {/* Team stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Wszyscy uzytkownicy</h3>
            <div className="text-2xl font-bold text-slate-900">{users.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Administratorzy</h3>
            <div className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'admin').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Pracownicy</h3>
            <div className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'employee').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Zespoly</h3>
            <div className="text-2xl font-bold text-slate-900">{teams.length}</div>
          </div>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Lista uzytkownikow</h2>
            <div className="flex items-center gap-2">
              <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">Wszystkie zespoly</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Uzytkownik</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Zespol</th>
                <th className="px-6 py-3">Rola</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {user.initials}
                        </div>
                        {user.activeTimer && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                      {user.team}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Pracownik'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.activeTimer ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Aktywny
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">Nieaktywny</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && user.id !== currentUser.id && (
                      <>
                        <button 
                          onClick={() => openModal('add-user', user)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete('user', user.id, user.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'my-time':
        return renderMyTime();
      case 'projects':
        return renderProjects();
      case 'reports':
        return renderReports();
      case 'team':
        return renderTeam();
      default:
        return renderDashboard();
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
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingItem ? 'Edytuj wpis czasu' : 'Dodaj wpis czasu'}
              </h2>
              
              {formErrors.overlap && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-sm">
                  <AlertTriangle size={18} />
                  {formErrors.overlap}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Projekt *</label>
                  <select 
                    value={formData.project || formData.projectId || ''}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        project: e.target.value,
                        task: '' // Clear task if project changes
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.project ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Wybierz projekt</option>
                    {visibleProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {formErrors.project && <p className="text-rose-500 text-xs mt-1">{formErrors.project}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zadanie *</label>
                  {userTasksForSelectedProject.length > 0 ? (
                    <select
                      value={formData.task || ''}
                      onChange={(e) => {
                        const selectedTask = userTasksForSelectedProject.find(t => t.name === e.target.value);
                        setFormData({ 
                          ...formData, 
                          task: e.target.value,
                          taskId: selectedTask?.id || 0
                        });
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.task ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Wybierz zadanie</option>
                      {userTasksForSelectedProject.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value={formData.task || ''}
                      onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.task ? 'border-rose-500' : 'border-slate-200'
                      }`}
                      placeholder={formData.project ? "Brak przypisanych zadań - wpisz ręcznie" : "Najpierw wybierz projekt"}
                      disabled={!formData.project}
                    />
                  )}
                  {formErrors.task && <p className="text-rose-500 text-xs mt-1">{formErrors.task}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                  <input 
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.date ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.date && <p className="text-rose-500 text-xs mt-1">{formErrors.date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Czas rozpoczecia *</label>
                    <input 
                      type="time"
                      value={formData.startTime || ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.startTime ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.startTime && <p className="text-rose-500 text-xs mt-1">{formErrors.startTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Czas zakonczenia *</label>
                    <input 
                      type="time"
                      value={formData.endTime || ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.endTime ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.endTime && <p className="text-rose-500 text-xs mt-1">{formErrors.endTime}</p>}
                  </div>
                </div>

                {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm text-indigo-700 font-medium">
                      Czas trwania: {calculateDuration(formData.startTime, formData.endTime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleSaveTimeEntry}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  {editingItem ? 'Zapisz zmiany' : 'Dodaj wpis'}
                </button>
              </div>
            </>
          );

        case 'add-project':
        case 'edit-project':
          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingItem ? 'Edytuj projekt' : 'Nowy projekt'}
              </h2>

              {/* API Error Alert */}
              {apiError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-rose-700">{apiError}</p>
                  <button onClick={() => setApiError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded">
                    <X size={14} className="text-rose-500" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa projektu *</label>
                  <input 
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                    placeholder="Nazwa projektu"
                    disabled={apiLoading}
                  />
                  {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opis / Klient</label>
                  <input 
                    type="text"
                    value={formData.client || formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Opis lub nazwa klienta"
                    disabled={apiLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data rozpoczecia</label>
                    <input 
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={apiLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data zakonczenia</label>
                    <input 
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formData.startDate && formData.endDate && formData.endDate < formData.startDate 
                          ? 'border-rose-500' 
                          : 'border-slate-200'
                      }`}
                      disabled={apiLoading}
                    />
                    {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
                      <p className="text-rose-500 text-xs mt-1">Data zakonczenia musi byc po dacie rozpoczecia</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kolor projektu</label>
                  <div className="flex gap-2">
                    {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'].map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                        disabled={apiLoading}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Planowane godziny</label>
                  <input 
                    type="number"
                    value={formData.totalHours || 40}
                    onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    disabled={apiLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={apiLoading}
                  >
                    <option value="active">Aktywny (IN_PROGRESS)</option>
                    <option value="on-hold">Wstrzymany (ON_HOLD)</option>
                    <option value="completed">Ukonczony (COMPLETED)</option>
                  </select>
                </div>
              </div>

              {/* API Info */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/projects/${editingItem.id}` : 'POST /api/projects'}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={apiLoading}
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleSaveProject}
                  disabled={apiLoading || (formData.startDate && formData.endDate && formData.endDate < formData.startDate)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {apiLoading && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? 'Zapisz zmiany' : 'Utworz projekt'}
                </button>
              </div>
            </>
          );

        case 'add-task':
          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingItem ? 'Edytuj zadanie' : 'Nowe zadanie'}
              </h2>

              {/* API Error Alert */}
              {apiError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-rose-700">{apiError}</p>
                  <button onClick={() => setApiError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded">
                    <X size={14} className="text-rose-500" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa zadania *</label>
                  <input 
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                    placeholder="Nazwa zadania"
                    disabled={apiLoading}
                  />
                  {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Opis zadania"
                    disabled={apiLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Przypisz do</label>
                  <select 
                    value={formData.assigneeId || ''}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={apiLoading}
                  >
                    <option value="">Wybierz pracownika</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status || 'todo'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={apiLoading}
                  >
                    <option value="todo">Do zrobienia (TODO)</option>
                    <option value="in-progress">W trakcie (IN_PROGRESS)</option>
                    <option value="completed">Ukonczone (DONE)</option>
                  </select>
                </div>
              </div>

              {/* API Info */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/tasks/${editingItem.id}` : 'POST /api/tasks'}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={apiLoading}
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleSaveTask}
                  disabled={apiLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {apiLoading && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? 'Zapisz zmiany' : 'Dodaj zadanie'}
                </button>
              </div>
            </>
          );

        case 'assign-employee':
          const currentProjectData = projects.find(p => p.id === selectedProject);
          const availableUsers = users.filter(u => !currentProjectData?.teamMembers.includes(u.id));

          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Przypisz pracownika do projektu</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz pracownika</label>
                  <select 
                    value={formData.userId || ''}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Wybierz pracownika</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.team})</option>
                    ))}
                  </select>
                </div>

                {currentProjectData && currentProjectData.teamMembers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Aktualnie przypisani:</label>
                    <div className="flex flex-wrap gap-2">
                      {currentProjectData.teamMembers.map(memberId => {
                        const member = users.find(u => u.id === memberId);
                        return member ? (
                          <span key={memberId} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                              {member.initials}
                            </span>
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleAssignEmployee}
                  disabled={!formData.userId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Przypisz
                </button>
              </div>
            </>
          );

        case 'add-user':
          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingItem ? 'Edytuj uzytkownika' : 'Nowy uzytkownik'}
              </h2>

              {/* API Error Alert */}
              {apiError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-rose-700">{apiError}</p>
                  <button onClick={() => setApiError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded">
                    <X size={14} className="text-rose-500" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa uzytkownika *</label>
                  <input 
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.username ? 'border-rose-500' : 'border-slate-200'
                    }`}
                    placeholder="jan_kowalski"
                    disabled={apiLoading}
                  />
                  {formErrors.username && <p className="text-rose-500 text-xs mt-1">{formErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Haslo {editingItem ? '(pozostaw puste aby nie zmieniac)' : '*'}
                  </label>
                  <input 
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.password ? 'border-rose-500' : 'border-slate-200'
                    }`}
                    placeholder="********"
                    disabled={apiLoading}
                  />
                  {formErrors.password && <p className="text-rose-500 text-xs mt-1">{formErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rola</label>
                  <select 
                    value={formData.role || 'employee'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={apiLoading}
                  >
                    <option value="employee">Pracownik (EMPLOYEE)</option>
                    <option value="admin">Administrator (ADMIN)</option>
                  </select>
                </div>
              </div>

              {/* API Info */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/users/${editingItem.id}` : 'POST /api/users'}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={apiLoading}
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleSaveUser}
                  disabled={apiLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {apiLoading && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? 'Zapisz zmiany' : 'Dodaj uzytkownika'}
                </button>
              </div>
            </>
          );

        case 'generate-report':
          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Generuj raport</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Typ raportu</label>
                  <select 
                    value={formData.type || 'weekly'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Dzienny</option>
                    <option value="weekly">Tygodniowy</option>
                    <option value="monthly">Miesieczny</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data od *</label>
                    <input 
                      type="date"
                      value={formData.dateFrom || ''}
                      onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.dateFrom ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.dateFrom && <p className="text-rose-500 text-xs mt-1">{formErrors.dateFrom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data do *</label>
                    <input 
                      type="date"
                      value={formData.dateTo || ''}
                      onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.dateTo ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.dateTo && <p className="text-rose-500 text-xs mt-1">{formErrors.dateTo}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Projekty</label>
                  <select 
                    value={formData.includeProjects || 'all'}
                    onChange={(e) => setFormData({ ...formData, includeProjects: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Wszystkie projekty</option>
                    {visibleProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Uzytkownicy</label>
                  <select 
                    value={formData.includeUsers || 'all'}
                    onChange={(e) => setFormData({ ...formData, includeUsers: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Wszyscy uzytkownicy</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleGenerateReport}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Generuj raport
                </button>
              </div>
            </>
          );

        case 'view-report':
          return (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">{editingItem?.name}</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Zakres dat</p>
                    <p className="font-medium text-slate-900">{editingItem?.dateRange}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Wygenerowano</p>
                    <p className="font-medium text-slate-900">{editingItem?.generatedAt}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Projekt</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Godziny</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Procent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleProjects.length > 0 ? visibleProjects.map(p => (
                        <tr key={p.id}>
                          <td className="px-4 py-3">{p.name}</td>
                          <td className="px-4 py-3">{p.loggedHours}h</td>
                          <td className="px-4 py-3">-</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-400">Brak danych do wyswietlenia</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-medium">
                      <tr>
                        <td className="px-4 py-3">Razem</td>
                        <td className="px-4 py-3">{visibleProjects.reduce((sum, p) => sum + p.loggedHours, 0)}h</td>
                        <td className="px-4 py-3">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Zamknij
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Pobierz PDF
                </button>
              </div>
            </>
          );

        case 'delete-confirm':
          return (
            <>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-rose-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Potwierdzenie usuniecia</h2>
                <p className="text-slate-600 mb-4">
                  Czy na pewno chcesz usunac <strong>{deleteTarget?.name}</strong>? Tej operacji nie mozna cofnac.
                </p>

                {/* API Error Alert */}
                {apiError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-left">
                    <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                    <p className="text-sm text-rose-700">{apiError}</p>
                  </div>
                )}

                {/* API Info */}
                {deleteTarget?.type === 'project' && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
                    <p className="text-xs text-slate-500">
                      <span className="font-medium">Endpoint:</span> DELETE /api/projects/{deleteTarget?.id}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Uwaga: Nie mozna usunac projektu z przypisanymi zadaniami (HTTP 409)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={apiLoading}
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={apiLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {apiLoading && <Loader2 size={16} className="animate-spin" />}
                  Usun
                </button>
              </div>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Szukaj zadan, projektow..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

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
                  <span className="text-sm font-medium text-slate-800 leading-tight">Brak aktywnego zadania</span>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-600 ml-2">
                  {formatTimer(timerSeconds)}
                </div>
                <button 
                  onClick={() => setIsTimerRunning(false)}
                  className="p-1.5 bg-emerald-200 text-emerald-800 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Zatrzymaj timer"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Powiadomienia</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                          !notification.read ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <p className="text-sm text-slate-900">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

      {/* Click outside handlers */}
      {(showNotifications || showUserMenu || showApiStatus) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setShowNotifications(false); setShowUserMenu(false); setShowApiStatus(false); }}
        />
      )}
    </div>
  );
}
