import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '../../constants/nav';
import { useActiveSection } from '../../hooks/useActiveSection';
import { eventConfig } from '../../config/event';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { MusicToggle } from '../common/MusicToggle';
import { SocialLinks } from '../common/SocialLinks';
import type { EventPhase } from '../../types';

export default function Navbar({ phase }: { phase: EventPhase }) {
  const active = useActiveSection();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a, button') ?? []);
    items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab') {
        const els = items();
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = '';
      openBtn.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const rsvpLabel = phase === 'past' ? 'Thank you' : 'RSVP';
  const rsvpHref = phase === 'past' ? '#details' : '#rsvp';

  return (
    <>
      <header className="site-nav" data-solid={solid || open}>
        <a href="#home" className="brand" aria-label={`${eventConfig.agency.name}, back to the top`}>
          <img src="/images/perlas-emblem.webp" width="44" height="31" alt="" />
          <span>
            <b>{eventConfig.agency.wordmark}</b>
            <i>Travel &amp; Tours</i>
          </span>
        </a>
        <nav aria-label="Primary" className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-active' : ''} aria-current={active === l.id ? 'true' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <MusicToggle />
          <SocialLinks className="nav-social" />
          <Button href={rsvpHref} variant="gold" small className="nav-rsvp">
            {rsvpLabel}
          </Button>
          <button ref={openBtn} type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <div ref={menuRef} id="mobile-menu" className="mobile-menu" data-open={open} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
        <div className="mobile-menu__top">
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        {[...NAV_LINKS, { id: 'rsvp' as const, label: 'RSVP' }].map((l) => (
          <a key={l.id} href={`#${l.id}`} className={`m-link ${active === l.id ? 'is-active' : ''}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {l.label}
          </a>
        ))}
        <div className="mobile-menu__foot">
          <p className="eyebrow">{eventConfig.social.follow}</p>
          <SocialLinks variant="pills" />
        </div>
      </div>
    </>
  );
}