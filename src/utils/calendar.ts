import { eventConfig } from '../config/event';

const { when, venue, event, agency } = eventConfig;

const pad = (n: number) => String(n).padStart(2, '0');
// "2026-11-27T10:00:00" -> "20261127T100000" (floating local time, paired with the tz id)
const compactLocal = (iso: string) => iso.replace(/[-:]/g, '').slice(0, 15);

function endLocal(): string {
  // arithmetic on the wall clock is safe here because manila never changes offset
  const d = new Date(`${when.localStart}${when.utcOffset}`);
  d.setMinutes(d.getMinutes() + when.assumedDurationMinutes);
  const shifted = new Date(d.getTime() + 8 * 3600 * 1000); // read back in utc+8
  return `${shifted.getUTCFullYear()}${pad(shifted.getUTCMonth() + 1)}${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}${pad(shifted.getUTCMinutes())}00`;
}

const title = `${agency.name} \u2013 ${event.title}`;
const location = `${venue.name}, ${venue.room}, ${venue.area}`;
const details = `${eventConfig.copy.inviteMessage}\n\n${event.hashtags.join(' ')}`;

export function googleCalendarUrl(): string {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compactLocal(when.localStart)}/${endLocal()}`,
    ctz: when.timezone,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// rfc 5545: escape , ; \ and newlines, then fold at 75 octets
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines carry a leading space
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function buildIcs(now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Perlas Travel & Tours//Grand Opening//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${when.timezone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:PST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:grand-opening-2026-11-27@perlas-travel',
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${when.timezone}:${compactLocal(when.localStart)}`,
    `DTEND;TZID=${when.timezone}:${endLocal()}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(details)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc('Tomorrow: ' + event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(): void {
  const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perlas-grand-opening.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
