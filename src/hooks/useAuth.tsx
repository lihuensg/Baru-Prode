import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  loginAsAdmin: () => void;
  loginAsUser: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());

  const login = useCallback((username: string, password: string): boolean => {
    const result = authService.login(username, password);
    if (result) setUser(result);
    return !!result;
  }, []);

  const loginAsAdmin = useCallback(() => {
    setUser(authService.loginAsAdmin());
  }, []);

  const loginAsUser = useCallback(() => {
    setUser(authService.loginAsUser());
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginAsAdmin,
      loginAsUser,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
