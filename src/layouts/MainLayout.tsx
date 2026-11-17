import { memo } from 'react';
import Navbar from '../components/navigation/Navbar';
import Hero from '../components/hero/Hero';
import About from '../sections/About';
import EventDetails from '../sections/EventDetails';
import Program from '../sections/Program';
import Host from '../sections/Host';
import Invitation from '../sections/Invitation';
import Venue from '../sections/Venue';
import Rsvp from '../sections/Rsvp';
import Finale from '../sections/Finale';
import Footer from '../components/footer/Footer';
import StickyRsvp from '../components/navigation/StickyRsvp';
import type { EventPhase } from '../types';

function MainLayout({ phase }: { phase: EventPhase }) {
  return (
    <div id="site" className="site-root">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar phase={phase} />
      <main id="main">
        <Hero phase={phase} />
        <About />
        <EventDetails />
        <Program />
        <Host />
        <Invitation />
        <Venue />
        <Rsvp phase={phase} />
        <Finale phase={phase} />
      </main>
      <Footer />
      <StickyRsvp phase={phase} />
    </div>
  );
}

export default memo(MainLayout);
