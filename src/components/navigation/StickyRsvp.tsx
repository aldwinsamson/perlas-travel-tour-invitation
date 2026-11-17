import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { eventConfig } from '../../config/event';
import type { EventPhase } from '../../types';

export default function StickyRsvp({ phase }: { phase: EventPhase }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const home = document.getElementById('home');
    const rsvp = document.getElementById('rsvp');
    const finale = document.querySelector('.finale');
    if (!home || !rsvp || !finale) return;
    const seen = { home: true, rsvp: false, finale: false };
    const update = () => setShow(!seen.home && !seen.rsvp && !seen.finale);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === home) seen.home = e.isIntersecting;
        if (e.target === rsvp) seen.rsvp = e.isIntersecting;
        if (e.target === finale) seen.finale = e.isIntersecting;
      }
      update();
    });
    io.observe(home);
    io.observe(rsvp);
    io.observe(finale);
    return () => io.disconnect();
  }, []);

  if (phase === 'past') return null;
  return (
    <div className="sticky-rsvp" data-show={show} aria-hidden={!show}>
      <Button href="#rsvp" variant="primary" className="w-full" tabIndex={show ? 0 : -1}>
        {eventConfig.copy.rsvp.button}
        <Icon name="arrow" />
      </Button>
    </div>
  );
}
