import { AuthResponse, Note, NotesGroup, User } from '../types';

/**
 * Dynamically resolves the API base URL:
 * - If VITE_API_URL is specified, use it.
 * - If running on Vite dev server (port 5173 or 3000), call Spring Boot backend directly on port 8080 of the same host.
 * - Otherwise (served directly by Spring Boot on port 8080 in production), use relative '/api'.
 */
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000')) {
    return `${window.location.protocol}//${window.location.hostname}:8080/api`;
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('notes_jwt_token');
  },

  setToken(token: string): void {
    localStorage.setItem('notes_jwt_token', token);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('notes_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setStoredUser(user: User): void {
    localStorage.setItem('notes_user', JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem('notes_jwt_token');
    localStorage.removeItem('notes_user');
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Unauthorized or token expired
      this.clearSession();
      window.dispatchEvent(new CustomEvent('auth-expired'));
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // use default
      }
      throw new ApiError(errorMessage, response.status);
    }

    return response.json();
  },

  async login(email: string, password: string):Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    this.setToken(response.token);
    this.setStoredUser(response.user);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  },

  async fetchNotes(): Promise<NotesGroup[]> {
    return this.request<NotesGroup[]>('/notes');
  },

  async createNote(note: string, groupUuid?: string): Promise<Note> {
    return this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        note,
        groupUuid: groupUuid || null,
      }),
    });
  },

  async updateNote(uuid: string, note: string): Promise<Note> {
    return this.request<Note>(`/notes/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify({ note }),
    });
  },

  async archiveNote(uuid: string): Promise<Note> {
    return this.request<Note>(`/notes/${uuid}/archive`, {
      method: 'PATCH',
    });
  },
};

