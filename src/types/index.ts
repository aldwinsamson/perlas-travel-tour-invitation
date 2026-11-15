export type EventStatusSetting = 'auto' | 'upcoming' | 'event-day' | 'past';
export type EventPhase = 'upcoming' | 'event-day' | 'past';

export interface ProgramItem {
  title: string;
  description?: string;
  /** leave undefined until the official time is confirmed. never guess one. */
  time?: string;
}

export type SocialId = 'facebook' | 'instagram';

export interface SocialLink {
  id: SocialId;
  label: string;
  /** empty string = not provided yet; rendered as a muted placeholder, never as a dead link */
  url: string;
}

export interface EventConfig {
  agency: { name: string; wordmark: string; tagline: string };
  event: { title: string; titleScript: [string, string]; hashtags: string[] };
  when: {
    /** wall-clock time at the venue, no offset */
    localStart: string;
    timezone: string;
    /** manila has no daylight saving, so a fixed offset is exact */
    utcOffset: string;
    displayDate: string;
    displayTime: string;
    /** the official invitation gives no end time. this is only used for the calendar file. */
    assumedDurationMinutes: number;
  };
  venue: { name: string; room: string; area: string; mapsUrl: string; mapsQuery: string; mapsEmbedAllowed: boolean };
  host: { name: string; role: string; photo: string | null; bio: string | null };
  invitation: { image: string | null; file: string | null; alt: string };
  copy: {
    inviteLead: string;
    inviteMessage: string;
    about: { heading: string; paragraphs: string[] };
    countdown: { before: string; today: string; after: string };
    rsvp: { heading: string; body: string; button: string };
    closing: string;
  };
  program: { tentative: boolean; items: ProgramItem[] };
  rsvp: { formUrl: string; embedUrl: string; privacy: string[] };
  contact: { email: string; phone: string; socials: SocialLink[] };
  social: { follow: string };
  status: EventStatusSetting;
  /** the flight doubles as the loading screen, so it plays on every visit. failsafe counts from the start of page load. */
  intro: { enabled: boolean; mobileBreakpoint: number; failsafeSeconds: number };
}
