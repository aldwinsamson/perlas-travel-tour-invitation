import { eventConfig } from '../../config/event';
import { NAV_LINKS } from '../../constants/nav';
import { SocialLinks } from '../common/SocialLinks';

export default function Footer() {
  const { agency, when, venue, contact, event } = eventConfig;
  return (
    <footer className="footer">
      <div className="wrap grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img src="/images/perlas-logo-light.webp" alt={agency.name} width="240" height="121" loading="lazy" className="w-[200px]" />
          <p className="mt-5 max-w-xs font-display text-xl italic text-ivory/80">{agency.tagline}</p>
        </div>
        <div>
          <h3>The Event</h3>
          <ul>
            <li>{event.title}</li>
            <li>{when.displayDate} &middot; {when.displayTime}</li>
            <li>{venue.name}, {venue.room}</li>
          </ul>
        </div>
        <nav aria-label="Footer">
          <h3>Explore</h3>
          <ul>
            {NAV_LINKS.map((l) => <li key={l.id}><a href={`#${l.id}`}>{l.label}</a></li>)}
            <li><a href="#rsvp">RSVP</a></li>
          </ul>
        </nav>
        <div>
          <h3>Contact</h3>
          <ul>
            <li>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <span className="soon"></span>}</li>
            <li>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : <span className="soon"></span>}</li>
          </ul>
          <SocialLinks variant="pills" onDark className="mt-5" />
        </div>
      </div>
      <div className="wrap mt-14 flex flex-col items-start justify-between gap-4 border-t border-ivory/15 pt-6 text-sm text-ivory/60 sm:flex-row sm:items-center">
        <p>{event.hashtags.join('   ')}</p>
        <p>
          &copy; {new Date().getFullYear()} {agency.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
