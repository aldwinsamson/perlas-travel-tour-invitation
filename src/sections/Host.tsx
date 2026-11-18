import { eventConfig } from '../config/event';
import { Tilt } from '../components/common/Tilt';

export default function Host() {
  const { host, agency } = eventConfig;
  const alt = `${host.name}, ${host.role} of ${agency.name}`;
  return (
    <section id="host" className="section host-bg" aria-labelledby="host-title">
      <div className="wrap grid12 items-center gap-y-12">
        <div className="col-span-12 mx-auto w-full max-w-sm md:col-span-5 lg:col-span-4 lg:col-start-2" data-reveal="left">
          <Tilt className="pop">
            <span className="pop__back" aria-hidden="true" />
            <div className="pop__panel">
              {!host.cutout && host.photo && <img className="pop__photo" src={host.photo} alt={alt} loading="lazy" decoding="async" />}
              {!host.cutout && !host.photo && (
                <div className="pop__mark">
                  <img src="/images/perlas-emblem.webp" alt="" width="480" height="340" loading="lazy" decoding="async" />
                  <span>{agency.wordmark}</span>
                </div>
              )}
            </div>
            {host.cutout && <img className="pop__cut" src={host.cutout} alt={alt} width="768" height="960" loading="lazy" decoding="async" />}
          </Tilt>
        </div>
        <div className="col-span-12 md:col-span-7 lg:col-span-5 lg:col-start-7">
          <p className="h-script text-[clamp(2.2rem,4.4vw,3.2rem)] text-royal" data-reveal>Hosted by</p>
          <h2 id="host-title" className="h-display mt-1 text-[clamp(2.6rem,6vw,4.8rem)]" data-reveal>{host.name}</h2>
          <hr className="hairline my-6 w-24 !bg-gold" data-reveal />
          <p className="eyebrow" data-reveal>{host.role}</p>
          <p className="lede mt-5 max-w-md text-[clamp(1.25rem,2.4vw,1.6rem)] text-ink/85" data-reveal>
            {host.bio ?? `Welcoming you to the official opening of ${agency.name}.`}
          </p>
        </div>
      </div>
    </section>
  );
}