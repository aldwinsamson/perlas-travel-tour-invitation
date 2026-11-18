export type EventStatusSetting = 'auto' | 'upcoming' | 'event-day' | 'past';
export type EventPhase = 'upcoming' | 'event-day' | 'past';

export interface ProgramItem {
  title: string;
  description?: string;
  time?: string;
}

export type SocialId = 'facebook' | 'instagram';

export interface SocialLink {
  id: SocialId;
  label: string;
  url: string;
}

export interface EventConfig {
  agency: { name: string; wordmark: string; tagline: string };
  event: { title: string; titleScript: [string, string]; hashtags: string[] };
  when: {
    localStart: string;
    timezone: string;
    utcOffset: string;
    displayDate: string;
    displayTime: string;
    assumedDurationMinutes: number;
  };
  venue: { name: string; room: string; area: string; mapsUrl: string; mapsQuery: string; mapsEmbedAllowed: boolean };
  host: { name: string; role: string; photo: string | null; cutout: string | null; bio: string | null };
  music: { src: string | null; volume: number };
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
  intro: { enabled: boolean; mobileBreakpoint: number; failsafeSeconds: number };
}
