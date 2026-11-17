import { eventConfig } from '../../config/event';

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
