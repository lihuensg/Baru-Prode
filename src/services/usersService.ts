import type { User } from '../types';
import { mockUsers } from '../mocks/data';

const STORAGE_KEY = 'baru_users';

function loadUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as User[]; } catch { /* ignore */ }
  }
  // Seed from mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
  return mockUsers;
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Users service (mock).
 * Replace with HTTP calls to /api/users when backend is ready.
 */
export const usersService = {
  getAll(): User[] {
    return loadUsers();
  },

  getParticipants(): User[] {
    return loadUsers().filter(u => u.role === 'USER');
  },

  getById(id: string): User | undefined {
    return loadUsers().find(u => u.id === id);
  },

  create(data: Omit<User, 'id' | 'createdAt'>): User {
    const users = loadUsers();
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  update(id: string, data: Partial<User>): User | null {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    saveUsers(users);
    return users[idx];
  },

  toggleActive(id: string): User | null {
    const users = loadUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;
    return usersService.update(id, { isActive: !user.isActive });
  },

  getStats() {
    const users = loadUsers();
    const participants = users.filter(u => u.role === 'USER');
    return {
      total: participants.length,
      active: participants.filter(u => u.isActive).length,
      paid: participants.filter(u => u.paymentStatus === 'PAID').length,
      pending: participants.filter(u => u.paymentStatus === 'PENDING').length,
    };
  },
};
