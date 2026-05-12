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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
// HELPER HOOKS (for use with SWR)
// ============================================

export const projectsApiKey = '/projects';
export const projectApiKey = (id: number) => `/projects/${id}`;

// Fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }
  
  return response.json();
};
