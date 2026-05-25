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

export interface ApiError {
  status: number;
  message?: string;
  errors?: Record<string, string>;
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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};
