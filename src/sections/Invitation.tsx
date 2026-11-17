import { eventConfig } from '../config/event';
import { Icon } from '../components/common/Icon';

export default function Invitation() {
  const { invitation, agency, when } = eventConfig;
  const view = invitation.image;
  if (!view) return null;

  const file = invitation.file ?? view;
  const ext = (file.split(/[?#]/)[0].split('.').pop() ?? 'png').toLowerCase();
  const saveAs = `${agency.name.replace(/[^a-z0-9]+/gi, '-')}-Invitation.${ext}`;

  return (
    <section id="invitation" className="section" aria-labelledby="invitation-title">
      <div className="wrap text-center">
        <p className="eyebrow" data-reveal>The Official Invitation</p>
        <h2 id="invitation-title" className="h-display mt-5 text-[clamp(2.4rem,6vw,4.6rem)]" data-reveal>
          Join us on {when.displayDate}
        </h2>

        <figure className="mx-auto mt-10 w-fit max-w-full border border-gold/90 bg-ivory p-2 shadow-[0_30px_60px_-34px_rgb(var(--c-navy)/0.55)] sm:p-3" data-reveal>
          <img className="block h-auto max-h-[80svh] w-auto max-w-full" src={view} alt={invitation.alt} loading="lazy" decoding="async" />
        </figure>

        <div className="mt-9 flex flex-wrap justify-center gap-3.5" data-reveal>
          <a className="btn" href={file} download={saveAs}>
            <Icon name="download" /> Download Invitation
          </a>
          <a className="btn btn--ghost" href={view} target="_blank" rel="noopener noreferrer">
            View Full Size
          </a>
        </div>
      </div>
    </section>
  );
}