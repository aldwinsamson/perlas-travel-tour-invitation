import { useEffect, useState } from 'react';
import { getPhase } from '../utils/date';
import type { EventPhase } from '../types';

export function useEventPhase(): EventPhase {
  const [phase, setPhase] = useState<EventPhase>(() => getPhase(new Date()));
  useEffect(() => {
    const check = () => setPhase(getPhase(new Date()));
    const id = window.setInterval(check, 15000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return phase;
}
