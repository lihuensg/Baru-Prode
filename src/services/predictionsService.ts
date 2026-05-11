import type { Prediction, PredictionChoice } from '../types';
import { mockPredictions } from '../mocks/data';
import { matchesService } from './matchesService';

const STORAGE_KEY = 'baru_predictions';

function loadPredictions(): Prediction[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as Prediction[]; } catch { /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPredictions));
  return mockPredictions;
}

function savePredictions(predictions: Prediction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

/**
 * Predictions service (mock).
 * Replace with HTTP calls to /api/predictions when backend is ready.
 */
export const predictionsService = {
  getAll(): Prediction[] {
    return loadPredictions();
  },

  getByUser(userId: string): Prediction[] {
    return loadPredictions().filter(p => p.userId === userId);
  },

  getByMatch(matchId: string): Prediction[] {
    return loadPredictions().filter(p => p.matchId === matchId);
  },

  getByUserAndMatch(userId: string, matchId: string): Prediction | undefined {
    return loadPredictions().find(p => p.userId === userId && p.matchId === matchId);
  },

  /**
   * Create or update a prediction for a user on a match.
   */
  upsert(userId: string, matchId: string, choice: PredictionChoice): Prediction {
    const predictions = loadPredictions();
    const existing = predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
    const now = new Date().toISOString();

    if (existing !== -1) {
      predictions[existing] = {
        ...predictions[existing],
        choice,
        updatedAt: now,
        // Clear any previous scoring when user edits their prediction
        points: undefined,
        isCorrect: undefined,
      };
      savePredictions(predictions);
      return predictions[existing];
    }

    const newPred: Prediction = {
      id: `pred-${Date.now()}`,
      userId,
      matchId,
      choice,
      createdAt: now,
      updatedAt: now,
    };
    predictions.push(newPred);
    savePredictions(predictions);
    return newPred;
  },

  /**
   * Recalculate points for all predictions on a match after result is set.
   * Called after admin sets a match result.
   */
  recalculateForMatch(matchId: string): void {
    const match = matchesService.getById(matchId);
    if (!match?.result) return;

    const predictions = loadPredictions();
    let changed = false;

    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].matchId !== matchId) continue;
      const isCorrect = predictions[i].choice === match.result;
      predictions[i] = {
        ...predictions[i],
        isCorrect,
        points: isCorrect ? 3 : 0,
      };
      changed = true;
    }

    if (changed) savePredictions(predictions);
  },

  getUserStats(userId: string) {
    const preds = predictionsService.getByUser(userId);
    const withResult = preds.filter(p => p.points !== undefined);
    return {
      totalPredicted: preds.length,
      totalCorrect: withResult.filter(p => p.isCorrect).length,
      totalPoints: withResult.reduce((acc, p) => acc + (p.points ?? 0), 0),
      pending: preds.filter(p => p.points === undefined).length,
    };
  },
};
