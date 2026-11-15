import { useState } from 'react';
import { eventConfig } from '../config/event';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { directionsUrl, mapEmbedUrl } from '../utils/url';

export default function Venue() {
  const { venue, when } = eventConfig;
  const [showMap, setShowMap] = useState(false);
  return (
    <section id="venue" className="section overflow-hidden" aria-labelledby="venue-title">
      <div className="venue-art" aria-hidden="true">
        <img src="/images/corporate-plaza.webp" alt="" width="930" height="2050" loading="lazy" decoding="async" />
      </div>
      <div className="wrap grid12 relative">
        <div className="venue-panel col-span-12 md:col-span-9 md:col-start-4 lg:col-span-6 lg:col-start-7" data-reveal>
          <p className="eyebrow">Venue &amp; Directions</p>
          <h2 id="venue-title" className="h-display mt-5 text-[clamp(2.4rem,5vw,3.8rem)]">{venue.name}</h2>
          <p className="h-script mt-1 text-[clamp(2rem,4vw,2.8rem)] text-royal">{venue.room}</p>
          <p className="mt-1 text-mute">{venue.area}</p>
          <hr className="hairline my-6" />
          <dl className="grid grid-cols-2 gap-6 text-sm">
            <div><dt className="eyebrow !text-[0.62rem]">Date</dt><dd className="mt-1 font-display text-xl font-medium">{when.displayDate}</dd></div>
            <div><dt className="eyebrow !text-[0.62rem]">Time</dt><dd className="mt-1 font-display text-xl font-medium">{when.displayTime}</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={directionsUrl} external variant="primary"><Icon name="route" />Get Directions</Button>
            {!showMap && (
              <Button variant="ghost" onClick={() => setShowMap(true)} aria-expanded={false} aria-controls="venue-map">Show map here</Button>
            )}
          </div>
          {showMap && (
            <div id="venue-map" className="map-frame">
              <iframe title={`Map showing ${venue.name}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer" allowFullScreen />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
