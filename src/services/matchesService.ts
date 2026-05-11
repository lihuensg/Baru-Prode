import type { Match, PredictionChoice } from '../types';
import { mockMatches } from '../mocks/data';

const STORAGE_KEY = 'baru_matches';

function loadMatches(): Match[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as Match[]; } catch { /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMatches));
  return mockMatches;
}

function saveMatches(matches: Match[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

/**
 * Matches service (mock).
 * Replace with HTTP calls to /api/matches when backend is ready.
 */
export const matchesService = {
  getAll(): Match[] {
    return loadMatches();
  },

  getByGroup(group: string): Match[] {
    return loadMatches().filter(m => m.group === group);
  },

  getById(id: string): Match | undefined {
    return loadMatches().find(m => m.id === id);
  },

  getGroups(): string[] {
    const all = loadMatches().map(m => m.group);
    return [...new Set(all)].sort();
  },

  getFinished(): Match[] {
    return loadMatches().filter(m => m.status === 'FINISHED');
  },

  getScheduled(): Match[] {
    return loadMatches().filter(m => m.status === 'SCHEDULED');
  },

  create(data: Omit<Match, 'id'>): Match {
    const matches = loadMatches();
    const newMatch: Match = { ...data, id: `match-${Date.now()}` };
    matches.push(newMatch);
    saveMatches(matches);
    return newMatch;
  },

  update(id: string, data: Partial<Match>): Match | null {
    const matches = loadMatches();
    const idx = matches.findIndex(m => m.id === id);
    if (idx === -1) return null;
    matches[idx] = { ...matches[idx], ...data };
    saveMatches(matches);
    return matches[idx];
  },

  /**
   * Set the real result of a finished match.
   * Triggers ranking recalculation via predictionsService.
   */
  setResult(id: string, result: PredictionChoice): Match | null {
    return matchesService.update(id, { result, status: 'FINISHED' });
  },

  getStats() {
    const matches = loadMatches();
    return {
      total: matches.length,
      scheduled: matches.filter(m => m.status === 'SCHEDULED').length,
      live: matches.filter(m => m.status === 'LIVE').length,
      finished: matches.filter(m => m.status === 'FINISHED').length,
    };
  },
};
