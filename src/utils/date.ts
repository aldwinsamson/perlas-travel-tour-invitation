import { eventConfig } from '../config/event';
import type { EventPhase } from '../types';

const { localStart, utcOffset, timezone } = eventConfig.when;

/** the exact instant the ceremony starts (10:00 in manila, whatever the visitor's own clock says) */
export const EVENT_START = new Date(`${localStart}${utcOffset}`);

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
/** yyyy-mm-dd on the manila calendar */
const manilaDay = (d: Date) => dayFmt.format(d);
const EVENT_DAY = localStart.slice(0, 10);

export function getPhase(now: Date, override = eventConfig.status): EventPhase {
  if (override !== 'auto') return override;
  const today = manilaDay(now);
  if (today < EVENT_DAY) return 'upcoming';
  if (today === EVENT_DAY) return 'event-day';
  return 'past';
}

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function remainingUntil(now: Date, target = EVENT_START): Remaining {
  const totalMs = Math.max(0, target.getTime() - now.getTime()); // never negative
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalMs,
  };
}

export const weekdayLabel = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(EVENT_START);
