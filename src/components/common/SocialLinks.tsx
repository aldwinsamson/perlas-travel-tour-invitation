import { socials } from '../../utils/url';
import type { SocialId } from '../../types';

/* simple glyphs drawn for this site (outline style, matching the other icons) */
function Glyph({ id }: { id: SocialId }) {
  return id === 'facebook' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V2.5h-2.5A4 4 0 0 0 10.5 6.5v2H8v3h2.5V21.5h3.5V11.5h2.6l.4-3z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

interface Props {
  /** icons = round icon buttons; pills = icon + name */
  variant?: 'icons' | 'pills';
  /** on a dark band */
  onDark?: boolean;
  /** nav use: render nothing for a platform that has no link yet */
  hideEmpty?: boolean;
  className?: string;
}

/** official page links. a platform without a verified link shows as a muted, non-clickable placeholder instead of a dead link. */
export function SocialLinks({ variant = 'icons', onDark = false, hideEmpty = false, className = '' }: Props) {
  return (
    <ul className={`social social--${variant} ${onDark ? 'social--dark' : ''} ${className}`} aria-label="Perlas on social media">
      {socials.map((s) => {
        if (!s.href && hideEmpty) return null;
        const inner = (
          <>
            <Glyph id={s.id} />
            {variant === 'pills' && <span>{s.label}</span>}
          </>
        );
        return (
          <li key={s.id}>
            {s.href ? (
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Perlas Travel & Tours on ${s.label} (opens in a new tab)`}>
                {inner}
              </a>
            ) : (
              <span className="is-soon" role="img" aria-label={`${s.label}, link coming soon`} title="Link coming soon">
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
