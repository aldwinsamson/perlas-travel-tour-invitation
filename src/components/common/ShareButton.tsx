import { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { eventConfig } from '../../config/event';

/** native share sheet on phones, copy-link everywhere else. no third-party scripts. */
export function ShareButton({ className = '' }: { className?: string }) {
  const [msg, setMsg] = useState('');
  const share = async () => {
    const url = window.location.href.split('#')[0];
    const data = { title: eventConfig.event.title, text: `You are invited: ${eventConfig.agency.name} ${eventConfig.event.title}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg('Link copied');
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') setMsg('Copy the address from your browser bar');
    }
    window.setTimeout(() => setMsg(''), 3000);
  };
  return (
    <span className={className}>
      <Button variant="ghost" onClick={share}>
        <Icon name="share" /> Share the invitation
      </Button>
      <span className="sr-only" role="status">{msg}</span>
      {msg && <span className="share-msg" aria-hidden="true">{msg}</span>}
    </span>
  );
}
