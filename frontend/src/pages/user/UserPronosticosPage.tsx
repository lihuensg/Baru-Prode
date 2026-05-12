import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../layouts/AppLayout';
import { MatchCard } from '../../components/ui/MatchCard';
import { LockBanner } from '../../components/ui/LockBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { useProdeStatus } from '../../hooks/useProdeStatus';
import { matchesService } from '../../services/matchesService';
import { predictionsService } from '../../services/predictionsService';
import { extractError, showErrorToast } from '../../utils/errorHandler';
import type { Match, Prediction, PredictionChoice } from '../../types';

export function UserPronosticosPage() {
  const { user } = useAuth();
  const { isOpen } = useProdeStatus();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    void (async () => {
      const [loadedMatches, loadedPredictions] = await Promise.all([
        matchesService.getAll(),
        predictionsService.getByUser(user!.id),
      ]);
      setMatches(loadedMatches);
      setPredictions(loadedPredictions);
    })();
  }, [user]);

  const groups = useMemo(() => [...new Set(matches.map(match => match.group))].sort(), [matches]);
  const [activeGroup, setActiveGroup] = useState<string>('A');

  useEffect(() => {
    if (groups.length > 0 && !groups.includes(activeGroup)) {
      setActiveGroup(groups[0]);
    }
  }, [groups, activeGroup]);

  const getPrediction = (matchId: string) => predictions.find(prediction => prediction.matchId === matchId);

  const handlePredict = async (matchId: string, choice: PredictionChoice) => {
    if (!isOpen) {
      toast.error('El prode ya está cerrado, no podés modificar tus pronósticos.');
      return;
    }

    try {
      const updated = await predictionsService.upsert(user!.id, matchId, choice);
      setPredictions(prev => {
        const idx = prev.findIndex(prediction => prediction.matchId === matchId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      toast.success('Pronóstico guardado correctamente');
    } catch (err: unknown) {
      const parsed = extractError(err);
      // specific friendly mapping
      if (parsed.message && /cerrad|comenz/i.test(parsed.message)) {
        toast.error('Este partido ya comenzó y no se puede modificar el pronóstico.');
        return;
      }
      showErrorToast(err);
    }
  };

  const groupMatches = matches.filter(match => match.group === activeGroup);
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
