import { createPortal } from 'react-dom';

/** the button lives inside the static boot screen (index.html) so it shows the moment the page paints */
export default function EntryGate({ onEnter }: { onEnter: () => void }) {
  const slot = document.getElementById('boot-action');
  if (!slot) return null;
  return createPortal(
    <button type="button" className="boot__btn" onClick={onEnter}>
      Open invitation
    </button>,
    slot,
  );
}
