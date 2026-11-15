import { eventConfig } from '../../config/event';
import { useCountdown } from '../../hooks/useCountdown';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { directionsUrl } from '../../utils/url';

const pad = (n: number) => String(n).padStart(2, '0');

/** live countdown on the manila clock. swaps to an event-day or thank-you message when the date arrives. */
export default function Countdown() {
  const c = useCountdown();
  const { copy, when, venue } = eventConfig;

  if (c.phase === 'past') {
    return (
      <div>
        <h2 className="h-display text-[clamp(2.4rem,6vw,4.6rem)]">{copy.countdown.after}</h2>
        <p className="lede mt-5 max-w-lg text-xl text-ivory/80">The celebration details remain below for the record.</p>
      </div>
    );
  }
  if (c.phase === 'event-day') {
    return (
      <div>
        <h2 className="h-display text-[clamp(2.4rem,6vw,4.6rem)]">{copy.countdown.today}</h2>
        <p className="lede mt-5 max-w-lg text-xl text-ivory/80">
          {when.displayTime} at {venue.name}, {venue.room}.
        </p>
        <div className="mt-8">
          <Button href={directionsUrl} external variant="gold">Get Directions<Icon name="external" /></Button>
        </div>
      </div>
    );
  }

  const units: [string, number][] = [['Days', c.days], ['Hours', c.hours], ['Minutes', c.minutes], ['Seconds', c.seconds]];
  return (
    <div>
      <h2 className="h-display text-[clamp(2.4rem,6vw,4.6rem)]">{copy.countdown.before}</h2>
      <div className="count" role="timer" aria-label="Time until the ceremony begins">
        {units.map(([label, value]) => (
          <div key={label} className="count__unit">
            <span className="count__num" aria-hidden="true">{label === 'Days' ? String(value) : pad(value)}</span>
            <span className="count__label">{label}</span>
          </div>
        ))}
      </div>
      {/* screen readers get one calm update a minute instead of a number every second */}
      <p className="sr-only" aria-live="polite">
        {c.days} days, {c.hours} hours and {c.minutes} minutes until the ceremony begins.
      </p>
    </div>
  );
}
