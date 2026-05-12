const DEFAULT_API_URL = 'http://localhost:3000/api';

// Normalize API URL so it always points to the /api root.
const rawApiUrl = String(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
export const API_URL = rawApiUrl.replace(/\/$/, '').endsWith('/api')
  ? rawApiUrl.replace(/\/$/, '')
  : rawApiUrl.replace(/\/$/, '') + '/api';
export const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true';

import ApiError from '../utils/ApiError';

const TOKEN_KEY = 'baru_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (err: any) {
    // network or CORS error
    throw new ApiError('No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.', 0, undefined, err);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const serverMessage = typeof payload === 'string' ? payload : payload?.message || 'Error inesperado';
    const fields = payload?.fields ?? undefined;
    throw new ApiError(serverMessage, response.status, fields, payload);
  }

  return payload as T;
}
