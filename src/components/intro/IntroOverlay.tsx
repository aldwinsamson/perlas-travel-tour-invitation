import { eventConfig } from '../../config/event';

/**
 * film-style framing while the aircraft crosses: two bars slide in, the tagline fades up in the lower one, then everything
 * lifts away as the invitation appears. purely decorative (aria-hidden); it never takes focus and has no controls.
 */
export default function IntroOverlay({ revealAt }: { revealAt: number }) {
  return (
    <div className="intro-ui" aria-hidden="true" style={{ ['--reveal-at' as string]: `${revealAt}s` }}>
      <i className="lb lb--top" />
      <i className="lb lb--bot">
        <span className="intro-title">{eventConfig.agency.tagline}</span>
      </i>
    </div>
  );
}
