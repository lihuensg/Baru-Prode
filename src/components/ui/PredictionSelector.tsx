import { clsx } from 'clsx';
import type { PredictionChoice } from '../../types';

interface PredictionSelectorProps {
  value?: PredictionChoice;
  onChange?: (choice: PredictionChoice) => void;
  disabled?: boolean;
  homeTeam: string;
  awayTeam: string;
  size?: 'sm' | 'md';
}

const OPTIONS: Array<{ choice: PredictionChoice; label: string; shortLabel: string }> = [
  { choice: 'HOME', label: 'Gana local', shortLabel: 'Local' },
  { choice: 'DRAW', label: 'Empate', shortLabel: 'Empate' },
  { choice: 'AWAY', label: 'Gana visitante', shortLabel: 'Visitante' },
];

const selectedClass: Record<PredictionChoice, string> = {
  HOME: 'selected-home',
  DRAW: 'selected-draw',
  AWAY: 'selected-away',
};

export function PredictionSelector({
  value,
  onChange,
  disabled = false,
  size = 'md',
}: PredictionSelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ choice, label, shortLabel }) => {
        const isSelected = value === choice;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange?.(choice)}
            title={label}
            className={clsx(
              'prediction-btn flex-1 rounded-lg font-medium border-2 transition-all',
              size === 'md' ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs',
              isSelected
                ? selectedClass[choice]
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50',
              disabled && 'cursor-not-allowed opacity-60'
            )}
            aria-pressed={isSelected}
            aria-label={label}
          >
            {size === 'md' ? label : shortLabel}
          </button>
        );
      })}
    </div>
  );
}
