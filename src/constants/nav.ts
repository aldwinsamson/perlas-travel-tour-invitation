export const SECTION_IDS = ['home', 'about', 'invitation', 'details', 'program', 'host', 'venue', 'rsvp', 'finale'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type NavId = 'home' | 'about' | 'details' | 'program' | 'venue' | 'rsvp';

export const NAV_LINKS: { id: Exclude<NavId, 'rsvp'>; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'details', label: 'Event Details' },
  { id: 'program', label: 'Program' },
  { id: 'venue', label: 'Venue' },
];

export const NAV_OF: Record<SectionId, NavId> = {
  home: 'home',
  about: 'about',
  invitation: 'details',
  details: 'details',
  program: 'program',
  host: 'program',
  venue: 'venue',
  rsvp: 'rsvp',
  finale: 'rsvp',
};