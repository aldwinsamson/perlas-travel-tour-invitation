import RsvpPanel from '../components/rsvp/RsvpPanel';
import type { EventPhase } from '../types';

export default function Rsvp({ phase }: { phase: EventPhase }) {
  return (
    <section id="rsvp" className="section rsvp-bg" aria-label="RSVP">
      <div className="wrap max-w-4xl">
        <div className="rsvp-card" data-reveal>
          <RsvpPanel phase={phase} />
        </div>
      </div>
    </section>
  );
}
