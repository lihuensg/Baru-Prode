import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

/**
 * Hook to get and react to the prode open/closed state.
 * Updates every minute to handle the closing time.
 */
export function useProdeStatus() {
  const [isOpen, setIsOpen] = useState(() => settingsService.isProdeOpen());
  const [countdown, setCountdown] = useState(() => settingsService.getCountdown());

  useEffect(() => {
    const update = () => {
      setIsOpen(settingsService.isProdeOpen());
      setCountdown(settingsService.getCountdown());
    };

    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return { isOpen, countdown };
}
