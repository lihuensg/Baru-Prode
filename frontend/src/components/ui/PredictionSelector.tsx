import { clsx } from 'clsx';
import type { PredictionChoice } from '../../types';

interface PredictionSelectorProps {
  value?: PredictionChoice;
  onChange?: (choice: PredictionChoice) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

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
  const options: Array<{ choice: PredictionChoice; label: string; shortLabel: string }> = [
    { choice: 'HOME', label: 'Gana local', shortLabel: 'Gana local' },
    { choice: 'DRAW', label: 'Empate', shortLabel: 'Empate' },
    { choice: 'AWAY', label: 'Gana visitante', shortLabel: 'Gana visitante' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ choice, label, shortLabel }) => {
        const isSelected = value === choice;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange?.(choice)}
            title={label}
            className={clsx(
              'prediction-btn flex-1 min-w-0 rounded-xl font-semibold border-2 transition-all cursor-pointer flex items-center justify-center',
              size === 'md' ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs',
              isSelected
                ? selectedClass[choice]
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md',
              disabled && 'cursor-not-allowed opacity-50 hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-sm'
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
