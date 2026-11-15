import { eventConfig } from '../../config/event';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SocialLinks } from '../common/SocialLinks';
import { Swoosh } from '../common/Swoosh';
import { directionsUrl } from '../../utils/url';
import type { EventPhase } from '../../types';

export default function Hero({ phase }: { phase: EventPhase }) {
  const { agency, event, when, venue, copy } = eventConfig;
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero__veil" aria-hidden="true" />
      <div className="arch arch--l" aria-hidden="true">
        <img src="/images/intramuros-left.webp" srcSet="/images/intramuros-left-sm.webp 560w, /images/intramuros-left.webp 930w" sizes="(max-width: 767px) 70vw, 46vw" alt="" width="930" height="2050" decoding="async" fetchPriority="low" />
      </div>
      <div className="arch arch--r" aria-hidden="true">
        <img src="/images/intramuros-right.webp" srcSet="/images/intramuros-right-sm.webp 560w, /images/intramuros-right.webp 966w" sizes="(max-width: 767px) 66vw, 44vw" alt="" width="966" height="2040" decoding="async" fetchPriority="low" />
      </div>

      <div className="hero__inner">
        <img className="hero-item hero__logo" src="/images/perlas-logo.webp" width="940" height="473" alt={`${agency.name} logo`} fetchPriority="high" />
        <p className="hero-item hero__tag">{agency.tagline}</p>

        <p className="hero-item hero__lead">{copy.inviteLead}</p>
        <h1 id="hero-title" className="hero-item hero__title">
          <span className="sr-only">{event.title}</span>
          <span className="t1" aria-hidden="true">{event.titleScript[0]}</span>
          <span className="amp" aria-hidden="true">&amp;</span>
          <span className="t2" aria-hidden="true">{event.titleScript[1]}</span>
        </h1>
        <Swoosh className="hero-item" />
        <p className="hero-item hero__copy">{copy.inviteMessage}</p>

        <ul className="hero-item facts">
          <li className="fact">
            <Icon name="calendar" />
            <div><small>Date</small><strong>{when.displayDate}</strong></div>
          </li>
          <li className="fact">
            <Icon name="clock" />
            <div><small>Time</small><strong>{when.displayTime}</strong></div>
          </li>
          <li className="fact">
            <Icon name="pin" />
            <div><small>Venue</small><strong>{venue.name}, {venue.room}</strong></div>
          </li>
        </ul>

        <div className="hero-item hero__cta">
          {phase === 'upcoming' && <Button href="#rsvp" variant="primary">Confirm Attendance</Button>}
          {phase === 'event-day' && <Button href={directionsUrl} external variant="primary">Get Directions<Icon name="external" /></Button>}
          {phase === 'past' && <Button href="#details" variant="primary">View Event Details</Button>}
          <Button href="#about" variant="ghost">Explore the Celebration</Button>
        </div>

        <div className="hero-item hero__follow">
          <span>{eventConfig.social.follow}</span>
          <SocialLinks />
        </div>
      </div>
      <div className="hero__fade" aria-hidden="true" />
    </section>
  );
}
