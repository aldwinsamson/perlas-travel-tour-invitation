/** every section on the page, in the order they appear (top to bottom). the scroll tracker relies on this order. */
export const SECTION_IDS = ['home', 'about', 'invitation', 'details', 'program', 'host', 'venue', 'rsvp', 'finale'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** the items that can be underlined in the menu */
export type NavId = 'home' | 'about' | 'details' | 'program' | 'venue' | 'rsvp';

export const NAV_LINKS: { id: Exclude<NavId, 'rsvp'>; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'details', label: 'Event Details' },
  { id: 'program', label: 'Program' },
  { id: 'venue', label: 'Venue' },
];

/** which menu item stays underlined while each section is on screen.
 *  sections without a link of their own share the closest one: change a line here to move an underline. */
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