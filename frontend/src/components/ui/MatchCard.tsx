import { clsx } from 'clsx';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Match, Prediction } from '../../types';
import { StatusBadge } from './StatusBadge';
import { PredictionSelector } from './PredictionSelector';
import type { PredictionChoice } from '../../types';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict?: (matchId: string, choice: PredictionChoice) => void;
  disabled?: boolean;
  showResult?: boolean;
  compact?: boolean;
}

const choiceLabel: Record<PredictionChoice, string> = {
  HOME: 'Gana local',
  DRAW: 'Empate',
  AWAY: 'Gana visitante',
};

export function MatchCard({
  match,
  prediction,
  onPredict,
  disabled = false,
  showResult = false,
  compact = false,
}: MatchCardProps) {
  const hasResult = match.status === 'FINISHED' && match.result;
  const predictionCorrect = prediction?.isCorrect;
  const [year, month, day] = match.date.split('-').map(Number);
  const displayDate = Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
    ? new Date(year, month - 1, day)
    : new Date(match.date);

  return (
    <div className={clsx(
      'bg-white rounded-xl border shadow-sm transition-all',
      predictionCorrect === true && 'border-l-4 border-l-emerald-400 border-slate-100',
      predictionCorrect === false && 'border-l-4 border-l-red-300 border-slate-100',
      predictionCorrect === undefined && 'border-slate-100',
      !compact && 'p-5',
      compact && 'p-3',
    )}>
      {/* Header: group + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
          Grupo {match.group}
        </span>
        <StatusBadge type="match" value={match.status} />
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex-1 min-w-0 text-center">
          <div className="text-2xl mb-0.5">{match.homeFlag}</div>
          <p className="text-sm font-semibold text-slate-800 leading-tight break-words">{match.homeTeam}</p>
          <p className="text-xs text-slate-400 mt-0.5">Local</p>
        </div>
        <div className="flex flex-col items-center px-2">
          <span className="text-xs font-bold text-slate-400 tracking-widest">VS</span>
          {hasResult && showResult && (
            <span className={clsx(
              'mt-1 text-xs font-semibold px-2 py-0.5 rounded',
              'bg-blue-700 text-white'
            )}>
              {choiceLabel[match.result!]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-2xl mb-0.5">{match.awayFlag}</div>
          <p className="text-sm font-semibold text-slate-800 leading-tight break-words">{match.awayTeam}</p>
          <p className="text-xs text-slate-400 mt-0.5">Visitante</p>
        </div>
      </div>

      {/* Date / time / venue */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {displayDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {match.time}
        </span>
        {match.venue && !compact && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </span>
        )}
      </div>

      {/* Prediction row */}
      {onPredict && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {disabled && prediction?.choice && (
            <p className="text-xs text-slate-400 mb-2">
              Tu pronóstico: <span className="font-semibold text-slate-600">{choiceLabel[prediction.choice]}</span>
              {prediction.points !== undefined && (
                <span className={clsx(
                  'ml-2 font-bold',
                  prediction.isCorrect ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {prediction.isCorrect ? `+${prediction.points} pts ✓` : '0 pts ✗'}
                </span>
              )}
            </p>
          )}
          <PredictionSelector
            value={prediction?.choice}
            onChange={(choice) => onPredict(match.id, choice)}
            disabled={disabled}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            size={compact ? 'sm' : 'md'}
          />
        </div>
      )}
    </div>
  );
}
