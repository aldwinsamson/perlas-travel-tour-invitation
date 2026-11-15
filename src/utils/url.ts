import { eventConfig } from '../config/event';

/** returns the url only if it is https and on an allowed host. anything else is dropped, never rendered. */
export function safeHttpsUrl(raw: string | undefined | null, hosts: string[]): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:') return null;
    const ok = hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

const FORM_HOSTS = ['docs.google.com', 'forms.gle', 'forms.google.com', 'google.com'];
const MAP_HOSTS = ['google.com', 'maps.app.goo.gl', 'goo.gl'];

export const formUrl = safeHttpsUrl(eventConfig.rsvp.formUrl, FORM_HOSTS);
export const formEmbedUrl = safeHttpsUrl(eventConfig.rsvp.embedUrl, ['docs.google.com']);

const { venue } = eventConfig;
const q = encodeURIComponent(venue.mapsQuery);
/** verified link if the owner provided one, otherwise a plain name search */
export const directionsUrl =
  safeHttpsUrl(venue.mapsUrl, MAP_HOSTS) ?? `https://www.google.com/maps/search/?api=1&query=${q}`;
export const mapEmbedUrl = `https://www.google.com/maps?q=${q}&output=embed`;

const SOCIAL_HOSTS = { facebook: ['facebook.com', 'fb.com', 'fb.me'], instagram: ['instagram.com', 'instagr.am'] } as const;
/** official pages, validated. href is null until the owner supplies a real https link on the right domain. */
export const socials = eventConfig.contact.socials.map((s) => ({
  ...s,
  href: safeHttpsUrl(s.url, [...SOCIAL_HOSTS[s.id]]),
}));
