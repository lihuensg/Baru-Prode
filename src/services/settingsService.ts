import type { AppSettings } from '../types';
import { mockSettings } from '../mocks/data';

const STORAGE_KEY = 'baru_settings';

function loadSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as AppSettings; } catch { /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSettings));
  return mockSettings;
}

/**
 * Settings service (mock).
 * Replace with HTTP calls to /api/settings when backend is ready.
 */
export const settingsService = {
  get(): AppSettings {
    return loadSettings();
  },

  update(data: Partial<AppSettings>): AppSettings {
    const current = loadSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Returns true if the prode is currently open (predictions can be edited).
   */
  isProdeOpen(): boolean {
    const settings = loadSettings();
    return new Date() < new Date(settings.prodeClosesAt);
  },

  /**
   * Returns remaining time info for display.
   */
  getCountdown(): { days: number; hours: number; minutes: number } {
    const settings = loadSettings();
    const diff = new Date(settings.prodeClosesAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  },
};
