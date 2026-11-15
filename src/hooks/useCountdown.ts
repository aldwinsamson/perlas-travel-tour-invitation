import { useEffect, useState } from 'react';
import { EVENT_START, getPhase, remainingUntil, type Remaining } from '../utils/date';
import type { EventPhase } from '../types';

export interface CountdownState extends Remaining {
  phase: EventPhase;
}

const snapshot = (): CountdownState => {
  const now = new Date();
  return { ...remainingUntil(now, EVENT_START), phase: getPhase(now) };
};

/** ticks once a second, re-aligned to the wall clock so the seconds never drift */
export function useCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(snapshot);
  useEffect(() => {
    let t: number;
    const tick = () => {
      setState(snapshot());
      t = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    const vis = () => document.visibilityState === 'visible' && setState(snapshot());
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);
  return state;
}
