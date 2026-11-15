import { useState } from 'react';
import { eventConfig } from '../../config/event';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { formEmbedUrl, formUrl } from '../../utils/url';
import type { EventPhase } from '../../types';

export default function RsvpPanel({ phase }: { phase: EventPhase }) {
  const { copy, rsvp } = eventConfig;
  const [inline, setInline] = useState(false);

  if (phase === 'past') {
    return (
      <div>
        <h2 className="h-display text-[clamp(2.2rem,5.4vw,4rem)]">{copy.countdown.after}</h2>
        <p className="lede mx-auto mt-5 max-w-lg text-xl text-ink/75">RSVPs are now closed. We are grateful you were part of this journey.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow">RSVP</p>
      <h2 className="h-display mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5.4vw,4.2rem)]">{copy.rsvp.heading}</h2>
      <p className="lede mx-auto mt-6 max-w-xl text-[clamp(1.2rem,2.4vw,1.5rem)] text-ink/80">{copy.rsvp.body}</p>

      <div className="mt-9 flex flex-col items-center gap-4">
        {formUrl ? (
          <Button href={formUrl} external variant="primary" className="min-w-[17rem]">
            {copy.rsvp.button}
            <Icon name="arrow" />
          </Button>
        ) : (
          <>
            <Button disabled variant="primary" className="min-w-[17rem]">{copy.rsvp.button}</Button>
            <p className="max-w-sm text-sm text-mute" role="status">The RSVP form link is being prepared. Please check back shortly.</p>
          </>
        )}
        {formUrl && formEmbedUrl && !inline && (
          <button type="button" className="link-quiet text-sm" onClick={() => setInline(true)} aria-expanded={false} aria-controls="rsvp-form">
            Prefer to answer here? Show the form on this page
          </button>
        )}
      </div>

      {inline && formEmbedUrl && (
        <div id="rsvp-form" className="form-frame">
          <iframe title="RSVP form" src={formEmbedUrl} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
            Loading form…
          </iframe>
          <p className="p-3 text-sm text-neutral-700">
            Form not loading? <a className="link-quiet" href={formUrl ?? '#'} target="_blank" rel="noopener noreferrer">Open it in a new tab</a>.
          </p>
        </div>
      )}

      <details className="privacy">
        <summary>How your response is handled</summary>
        <ul>{rsvp.privacy.map((p) => <li key={p}>{p}</li>)}</ul>
      </details>
    </div>
  );
}
