import { eventConfig } from '../config/event';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { SocialLinks } from '../components/common/SocialLinks';
import type { EventPhase } from '../types';

export default function Finale({ phase }: { phase: EventPhase }) {
  const { copy, host, event, social } = eventConfig;
  return (
    <section id="finale" className="finale" aria-labelledby="finale-title">
      <div className="wrap max-w-4xl">
        <h2 id="finale-title" className="h-script text-[clamp(2.7rem,7.6vw,5.6rem)] text-navy" data-reveal>{copy.closing}</h2>
        <div className="mt-8" data-reveal style={{ ['--d' as string]: '120ms' }}>
          <p className="lede text-xl text-ink/80">Hosted by</p>
          <p className="h-display mt-1 text-[clamp(1.6rem,3.4vw,2.3rem)] tracking-wide">{host.name.toUpperCase()}</p>
          <p className="lede text-lg text-ink/80">{host.role}</p>
        </div>
        <div className="finale__cta" data-reveal style={{ ['--d' as string]: '200ms' }}>
          {phase === 'past' ? (
            <p className="lede text-2xl">{copy.countdown.after}</p>
          ) : (
            <Button href="#rsvp" variant="primary">{copy.rsvp.button}<Icon name="arrow" /></Button>
          )}
        </div>
        <div className="finale__follow" data-reveal>
          <p className="eyebrow">{social.follow}</p>
          <SocialLinks variant="pills" />
          <p className="finale__tags">{event.hashtags.join('   |   ')}</p>
        </div>
      </div>

      {/* rendered satin ribbon (see README): transparent webp with its own soft shadow. the mobile crop is framed tighter. */}
      <picture className="ribbon" data-reveal="fade">
        <source media="(min-width: 768px)" srcSet="/images/ribbon-wide.webp" width="1800" height="975" />
        <img src="/images/ribbon-mobile.webp" alt="" width="935" height="935" loading="lazy" decoding="async" />
      </picture>
    </section>
  );
}
