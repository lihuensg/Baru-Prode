import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../layouts/AppLayout';
import { MatchCard } from '../../components/ui/MatchCard';
import { LockBanner } from '../../components/ui/LockBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { useProdeStatus } from '../../hooks/useProdeStatus';
import { matchesService } from '../../services/matchesService';
import { predictionsService } from '../../services/predictionsService';
import type { PredictionChoice, Prediction } from '../../types';

export function UserPronosticosPage() {
  const { user } = useAuth();
  const { isOpen } = useProdeStatus();

  const matches = matchesService.getAll();
  const groups = matchesService.getGroups();

  const [predictions, setPredictions] = useState<Prediction[]>(() =>
    predictionsService.getByUser(user!.id)
  );
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] ?? 'A');

  const getPrediction = useCallback(
    (matchId: string) => predictions.find(p => p.matchId === matchId),
    [predictions]
  );

  const handlePredict = (matchId: string, choice: PredictionChoice) => {
    if (!isOpen) {
      toast.error('El prode ya está cerrado, no podés modificar tus pronósticos.');
      return;
    }
    const updated = predictionsService.upsert(user!.id, matchId, choice);
    setPredictions(prev => {
      const idx = prev.findIndex(p => p.matchId === matchId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    toast.success('Pronóstico guardado correctamente');
  };

  const groupMatches = matches.filter(m => m.group === activeGroup);
  const predicted = predictions.length;
  const total = matches.length;

  return (
    <AppLayout variant="user">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 font-display">Mis pronósticos</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {predicted} de {total} partidos pronosticados
        </p>
      </div>

      {!isOpen && <LockBanner />}

      {/* Group tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {groups.map(group => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeGroup === group
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            Grupo {group}
          </button>
        ))}
      </div>

      {/* Matches grid */}
      {groupMatches.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No hay partidos en este grupo"
          description="Los partidos se cargarán próximamente."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groupMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={getPrediction(match.id)}
              onPredict={handlePredict}
              disabled={!isOpen || match.status === 'FINISHED'}
              showResult={match.status === 'FINISHED'}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
