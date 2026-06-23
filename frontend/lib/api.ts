// API Service for Time Tracking Application
// Base URL - change this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Types matching backend API exactly
export interface ProjectDTO {
  id?: number;
  name: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface UserDTO {
  id?: number;
  username: string;
  role: string;
  password?: string;
}

export interface TaskDTO {
  id?: number;
  projectId: number;
  projectName?: string;
  name: string;
  description?: string;
  status: string;
  assignedUsers?: { id: number; username: string }[];
  assignedUserIds?: number[];
}

export interface AuthResponseDTO {
  token: string;
  id: number;
  username: string;
  role: string;
}

export interface LoginRequestDTO {
  username: string;
  password?: string;
}

export interface ReportResponseDTO<T> {
  type: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  data: T[];
}

export interface SummaryReportItemDTO {
  userId: number;
  username: string;
  totalHours: number;
  totalEntries: number;
}

export interface DetailedReportItemDTO {
  userId: number;
  username: string;
  projectId: number;
  projectName: string;
  taskId: number;
  taskName: string;
  duration: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface ProjectReportItemDTO {
  projectId: number;
  projectName: string;
  totalHours: number;
  employeeCount: number;
}

export interface TeamReportItemDTO {
  teamId: number;
  teamName: string;
  totalHours: number;
  memberCount: number;
}

export interface ApiError {
  status: number;
  message?: string;
  errors?: Record<string, string>;
}

// Helper to decode JWT and check if it's expired
export function isTokenValid(token: string): boolean {
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    
    // Decode base64
    const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(decodedJson);
    
    // Check expiration if present
    if (decoded.exp) {
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate > new Date();
    }
    return true; // Token has no expiration
  } catch (e) {
    return false; // Invalid token format
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Merge any custom headers passed in options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 204 No Content (successful delete)
    if (response.status === 204) {
      return { data: undefined };
    }

    // Handle 401/403 - token expired or invalid, redirect to login
    if (response.status === 401 || response.status === 403) {
      // Don't redirect if this is the login endpoint itself
      if (!endpoint.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
      const data = await response.json().catch(() => null);
      return {
        error: {
          status: response.status,
          message: data?.message || 'Sesja wygasła. Zaloguj się ponownie.',
        },
      };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          message: data?.message || `HTTP error ${response.status}`,
          errors: data?.errors,
        },
      };
    }

    return { data };
  } catch (err) {
    return {
      error: {
        status: 0,
        message: err instanceof Error ? err.message : 'Network error',
      },
    };
  }
}

// ============================================
// PROJECTS API
// ============================================

/**
 * GET /projects
 * Returns a list of all projects
 */
export async function getProjects(): Promise<{ data?: ProjectDTO[]; error?: ApiError }> {
  return apiFetch<ProjectDTO[]>('/projects');
}

/**
 * GET /projects/{id}
 * Returns a single project by ID
 */
export async function getProject(id: number): Promise<{ data?: ProjectDTO; error?: ApiError }> {
  return apiFetch<ProjectDTO>(`/projects/${id}`);
}

/**
 * POST /projects
 * Creates a new project
 * @param project - Project data (name required, description/startDate/endDate optional)
 */
export async function createProject(
  project: Omit<ProjectDTO, 'id'>
): Promise<{ data?: ProjectDTO; error?: ApiError }> {
  return apiFetch<ProjectDTO>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
}

/**
 * PUT /projects/{id}
 * Updates an existing project (send all fields - missing optional fields will be cleared)
 * @param id - Project ID
 * @param project - Updated project data
 */
export async function updateProject(
  id: number,
  project: Omit<ProjectDTO, 'id'>
): Promise<{ data?: ProjectDTO; error?: ApiError }> {
  return apiFetch<ProjectDTO>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });
}

/**
 * DELETE /projects/{id}
 * Deletes a project (fails if project has tasks assigned)
 * @param id - Project ID
 */
export async function deleteProject(id: number): Promise<{ data?: void; error?: ApiError }> {
  return apiFetch<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// TASKS API
// ============================================

export async function getTasks(): Promise<{ data?: TaskDTO[]; error?: ApiError }> {
  return apiFetch<TaskDTO[]>('/tasks');
}

export async function getTask(id: number): Promise<{ data?: TaskDTO; error?: ApiError }> {
  return apiFetch<TaskDTO>(`/tasks/${id}`);
}

export async function getProjectTasks(projectId: number): Promise<{ data?: TaskDTO[]; error?: ApiError }> {
  return apiFetch<TaskDTO[]>(`/tasks/project/${projectId}`);
}

export async function createTask(
  task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>
): Promise<{ data?: TaskDTO; error?: ApiError }> {
  return apiFetch<TaskDTO>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateTask(
  id: number,
  task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>
): Promise<{ data?: TaskDTO; error?: ApiError }> {
  return apiFetch<TaskDTO>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

export async function deleteTask(id: number): Promise<{ data?: void; error?: ApiError }> {
  return apiFetch<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// USERS API
// ============================================

export async function getUsers(): Promise<{ data?: UserDTO[]; error?: ApiError }> {
  return apiFetch<UserDTO[]>('/users');
}

export async function getUser(id: number): Promise<{ data?: UserDTO; error?: ApiError }> {
  return apiFetch<UserDTO>(`/users/${id}`);
}

export async function createUser(
  user: Omit<UserDTO, 'id'>
): Promise<{ data?: UserDTO; error?: ApiError }> {
  return apiFetch<UserDTO>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(
  id: number,
  user: Omit<UserDTO, 'id'>
): Promise<{ data?: UserDTO; error?: ApiError }> {
  return apiFetch<UserDTO>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(id: number): Promise<{ data?: void; error?: ApiError }> {
  return apiFetch<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// AUTH API
// ============================================

export async function login(
  credentials: LoginRequestDTO
): Promise<{ data?: AuthResponseDTO; error?: ApiError }> {
  return apiFetch<AuthResponseDTO>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// ============================================
// REPORTS API
// ============================================

export async function getReports(): Promise<{ data?: ReportResponseDTO<any>[]; error?: ApiError }> {
  return apiFetch<ReportResponseDTO<any>[]>('/reports');
}

export async function generateReport<T>(
  type: 'summary' | 'detailed' | 'by-project' | 'by-team',
  startDate?: string,
  endDate?: string
): Promise<{ data?: ReportResponseDTO<T>; error?: ApiError }> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ReportResponseDTO<T>>(`/reports/${type}${queryString}`);
}

// ============================================
// TIME ENTRIES API
// ============================================

export interface TimeEntryDTO {
  id?: number;
  userId: number;
  username?: string;
  taskId: number;
  taskName?: string;
  projectId?: number;
  projectName?: string;
  startTime: string;
  endTime?: string;
  isActive?: boolean;
  durationMinutes?: number;
  description?: string;
}

export async function getTimeEntries(): Promise<{ data?: TimeEntryDTO[]; error?: ApiError }> {
  return apiFetch<TimeEntryDTO[]>('/time-entries');
}

export async function getTimeEntriesByUser(userId: number): Promise<{ data?: TimeEntryDTO[]; error?: ApiError }> {
  return apiFetch<TimeEntryDTO[]>(`/time-entries/user/${userId}`);
}

export async function createTimeEntry(
  entry: TimeEntryDTO
): Promise<{ data?: TimeEntryDTO; error?: ApiError }> {
  return apiFetch<TimeEntryDTO>('/time-entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function updateTimeEntry(
  id: number,
  entry: TimeEntryDTO
): Promise<{ data?: TimeEntryDTO; error?: ApiError }> {
  return apiFetch<TimeEntryDTO>(`/time-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  });
}

export async function deleteTimeEntry(id: number): Promise<{ data?: void; error?: ApiError }> {
  return apiFetch<void>(`/time-entries/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// HELPER HOOKS (for use with SWR)
// ============================================

export const projectsApiKey = '/projects';
export const projectApiKey = (id: number) => `/projects/${id}`;

// Fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers,
  });

  if (!response.ok) {
    // Handle 401/403 - token expired or invalid, redirect to login
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};
