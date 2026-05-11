import type { RankingEntry } from '../types';
import { mockRanking } from '../mocks/data';
import { usersService } from './usersService';
import { predictionsService } from './predictionsService';

const STORAGE_KEY = 'baru_ranking';

function loadRanking(): RankingEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as RankingEntry[]; } catch { /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRanking));
  return mockRanking;
}

/**
 * Ranking service (mock).
 * Replace with HTTP calls to /api/ranking when backend is ready.
 */
export const rankingService = {
  getAll(): RankingEntry[] {
    return loadRanking().sort((a, b) => b.totalPoints - a.totalPoints || b.totalCorrect - a.totalCorrect);
  },

  getPosition(userId: string): number {
    const ranking = rankingService.getAll();
    const entry = ranking.find(r => r.userId === userId);
    return entry?.position ?? 0;
  },

  /**
   * Rebuild the entire ranking from current predictions data.
   * Called after a result is set.
   */
  recalculate(): void {
    const users = usersService.getParticipants().filter(u => u.isActive);
    const entries: RankingEntry[] = users.map(user => {
      const stats = predictionsService.getUserStats(user.id);
      return {
        userId: user.id,
        fullName: user.fullName,
        username: user.username,
        totalPoints: stats.totalPoints,
        totalCorrect: stats.totalCorrect,
        totalPredicted: stats.totalPredicted,
        position: 0, // assigned below
      };
    });

    entries.sort((a, b) => b.totalPoints - a.totalPoints || b.totalCorrect - a.totalCorrect);
    entries.forEach((e, idx) => { e.position = idx + 1; });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },
};
