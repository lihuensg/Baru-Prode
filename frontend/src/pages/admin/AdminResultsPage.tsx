import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck, Zap, Info, ChevronDown } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PredictionSelector } from '../../components/ui/PredictionSelector';
import { matchesService } from '../../services/matchesService';
import { predictionsService } from '../../services/predictionsService';
import { rankingService } from '../../services/rankingService';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandler';
import type { Match, PredictionChoice } from '../../types';

const choiceLabel: Record<PredictionChoice, string> = {
  HOME: 'Ganó local',
  DRAW: 'Empate',
  AWAY: 'Ganó visitante',
};

const getMatchTimestamp = (match: Match) => {
  const timestamp = Date.parse(`${match.date}T${match.time || '00:00'}:00`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const compareMatchByGroupDateTime = (a: Match, b: Match) => {
  const groupCompare = a.group.localeCompare(b.group, 'es', { numeric: true });
  if (groupCompare !== 0) return groupCompare;

  const dateTimeCompare = getMatchTimestamp(a) - getMatchTimestamp(b);
  if (dateTimeCompare !== 0) return dateTimeCompare;

  return a.homeTeam.localeCompare(b.homeTeam, 'es');
};

const groupMatchesByGroup = (list: Match[]) => {
  const sorted = [...list].sort(compareMatchByGroupDateTime);
  const grouped = new Map<string, Match[]>();

  sorted.forEach(match => {
    const current = grouped.get(match.group) ?? [];
    current.push(match);
    grouped.set(match.group, current);
  });

  return [...grouped.entries()];
};

export function AdminResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingResults, setPendingResults] = useState<Record<string, PredictionChoice>>({});
  const [expandedScheduledGroups, setExpandedScheduledGroups] = useState<Record<string, boolean>>({});
  const [expandedFinishedGroups, setExpandedFinishedGroups] = useState<Record<string, boolean>>({});
  const [resultSource] = useState<'MANUAL' | 'API'>('MANUAL');

  const scheduledMatches = matches.filter(match => match.status === 'SCHEDULED' || match.status === 'LIVE');
  const finishedMatches = matches.filter(match => match.status === 'FINISHED');
  const groupedScheduledMatches = groupMatchesByGroup(scheduledMatches);
  const groupedFinishedMatches = groupMatchesByGroup(finishedMatches);

  const refresh = async () => setMatches(await matchesService.getAll());

  useEffect(() => {
    void refresh();
  }, []);

  const handleSetResult = async (match: Match, result: PredictionChoice) => {
    try {
      await matchesService.setResult(match.id, result);
      await predictionsService.recalculateForMatch(match.id);
      await rankingService.recalculate();

      setPendingResults(prev => {
        const next = { ...prev };
        delete next[match.id];
        return next;
      });

      void refresh();
      showSuccessToast('Resultado actualizado correctamente.');
    } catch (err) {
      showErrorToast(err);
    }
  };

  const setPending = (matchId: string, choice: PredictionChoice) => {
    setPendingResults(prev => ({ ...prev, [matchId]: choice }));
  };

  const toggleScheduledGroup = (group: string) => {
    setExpandedScheduledGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleFinishedGroup = (group: string) => {
    setExpandedFinishedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <AppLayout variant="admin">
      <PageHeader
        title="Carga de resultados"
        subtitle="Ingresá el resultado real de cada partido finalizado"
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Fuente de resultados</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold shadow-sm">
            <ClipboardCheck className="w-4 h-4" />
            Manual
          </button>
          <div className="relative">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed border border-slate-200"
            >
              <Zap className="w-4 h-4" />
              API de fútbol
            </button>
            <span className="absolute -top-2.5 left-2 text-xs bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">Próximamente</span>
          </div>
        </div>
        {resultSource === 'MANUAL' && (
          <div className="flex items-start gap-2 mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Modo manual activo. Ingresá los resultados partido por partido. La integración con API estará disponible próximamente.</p>
          </div>
        )}
      </div>

      <h2 className="text-base font-bold text-slate-700 mb-3">
        Partidos sin resultado ({scheduledMatches.length})
      </h2>

      {scheduledMatches.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-3 mb-6">
          <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">¡Todos los partidos tienen resultado cargado!</p>
        </div>
      ) : (
        <div className="space-y-5 mb-8">
          {groupedScheduledMatches.map(([group, groupMatches]) => (
            <section key={group}>
              <button
                type="button"
                onClick={() => toggleScheduledGroup(group)}
                className="w-full mb-2 flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${expandedScheduledGroups[group] ? 'rotate-180' : ''}`}
                  />
                  <h3 className="text-sm font-bold text-slate-700 text-left">Grupo {group}</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {groupMatches.length} partido{groupMatches.length === 1 ? '' : 's'}
                </span>
              </button>

              {expandedScheduledGroups[group] && (
                <div className="space-y-3">
                  {groupMatches.map(match => (
                    <div key={match.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Grupo {match.group}</span>
                            <StatusBadge type="match" value={match.status} />
                          </div>
                          <p className="font-semibold text-slate-800 text-sm break-words">
                            {match.homeFlag} {match.homeTeam} <span className="text-slate-400">vs</span> {match.awayTeam} {match.awayFlag}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{match.date} · {match.time}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0 w-full">
                          <div className="w-full sm:w-56">
                            <PredictionSelector
                              homeTeam={match.homeTeam}
                              awayTeam={match.awayTeam}
                              value={pendingResults[match.id]}
                              onChange={choice => setPending(match.id, choice)}
                              size="sm"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (!pendingResults[match.id]) {
                                toast.error('Seleccioná una opción para este partido.');
                                return;
                              }
                              void handleSetResult(match, pendingResults[match.id]);
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <h2 className="text-base font-bold text-slate-700 mb-3">
        Partidos finalizados ({finishedMatches.length})
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {finishedMatches.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No hay partidos finalizados todavía.</div>
        ) : (
          <div>
            {groupedFinishedMatches.map(([group, groupMatches], groupIndex) => (
              <section key={group}>
                <button
                  type="button"
                  onClick={() => toggleFinishedGroup(group)}
                  className={`w-full px-5 py-3 flex items-center justify-between gap-3 bg-slate-50/80 border-b border-slate-100 ${groupIndex > 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${expandedFinishedGroups[group] ? 'rotate-180' : ''}`}
                    />
                    <h3 className="text-sm font-bold text-slate-700 text-left">Grupo {group}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {groupMatches.length} partido{groupMatches.length === 1 ? '' : 's'}
                  </span>
                </button>

                {expandedFinishedGroups[group] && (
                  <div className="divide-y divide-slate-50">
                    {groupMatches.map(match => (
                      <div key={match.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Grupo {match.group}</span>
                            <p className="text-sm font-semibold text-slate-800 break-words">
                              {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                          {match.result && (
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                              {choiceLabel[match.result]}
                            </span>
                          )}
                          <StatusBadge type="match" value="FINISHED" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
