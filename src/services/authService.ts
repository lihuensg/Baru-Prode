import type { AuthUser } from '../types';

const AUTH_KEY = 'baru_auth_user';

/**
 * Mock authentication service.
 * Replace the login() implementation with a real HTTP call when backend is ready.
 */
export const authService = {
  /**
   * Mock login — accepts 'admin'/'admin' or 'juan.perez'/'1234' etc.
   * In production: POST /api/auth/login { username, password }
   */
  login(username: string, _password: string): AuthUser | null {
    const users: Record<string, AuthUser> = {
      admin: { id: 'user-admin-1', username: 'admin', fullName: 'Administrador', role: 'ADMIN' },
      'juan.perez': { id: 'user-1', username: 'juan.perez', fullName: 'Juan Pérez', role: 'USER' },
      'maria.gonzalez': { id: 'user-2', username: 'maria.gonzalez', fullName: 'María González', role: 'USER' },
      'ana.martinez': { id: 'user-4', username: 'ana.martinez', fullName: 'Ana Martínez', role: 'USER' },
    };

    const user = users[username] ?? null;
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  },

  loginAsAdmin(): AuthUser {
    const user: AuthUser = { id: 'user-admin-1', username: 'admin', fullName: 'Administrador', role: 'ADMIN' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  loginAsUser(): AuthUser {
    const user: AuthUser = { id: 'user-1', username: 'juan.perez', fullName: 'Juan Pérez', role: 'USER' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  getSession(): AuthUser | null {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!authService.getSession();
  },
};
