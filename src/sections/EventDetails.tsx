import { eventConfig } from '../config/event';
import Countdown from '../components/countdown/Countdown';
import CalendarActions from '../components/event/CalendarActions';
import { weekdayLabel } from '../utils/date';

export default function EventDetails() {
  const { when, venue, host, event } = eventConfig;
  return (
    <section id="details" className="section band" aria-labelledby="details-title">
      <div className="wrap grid12 gap-y-16">
        <div className="col-span-12 lg:col-span-7">
          <p className="eyebrow" id="details-title" data-reveal>Event Details</p>
          <div className="mt-6" data-reveal><Countdown /></div>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:pt-3" data-reveal style={{ ['--d' as string]: '120ms' }}>
          <dl className="ledger">
            <div><dt>Event</dt><dd>{event.title}</dd></div>
            <div><dt>Date</dt><dd>{weekdayLabel}, {when.displayDate}</dd></div>
            <div><dt>Time</dt><dd>{when.displayTime}<small>Philippine time ({when.timezone})</small></dd></div>
            <div><dt>Venue</dt><dd>{venue.name}, {venue.room}<small>{venue.area}</small></dd></div>
            <div><dt>Hosted by</dt><dd>{host.name}<small>{host.role}</small></dd></div>
          </dl>
          <div className="mt-7"><CalendarActions onDark /></div>
        </div>
      </div>
    </section>
  );
}
