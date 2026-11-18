import { eventConfig } from '../config/event';
import { Tilt } from '../components/common/Tilt';

export default function About() {
  const { copy } = eventConfig;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap grid12 items-start gap-y-14">
        <div className="col-span-12 lg:col-span-7 lg:pt-10">
          <p className="eyebrow" data-reveal>The Grand Opening</p>
          <h2 id="about-title" className="h-display mt-5 text-[clamp(3rem,8.2vw,6.8rem)]" data-reveal style={{ ['--d' as string]: '80ms' }}>
            A New Chapter <span className="h-script block mt-1 pl-[0.4em] text-[1.18em] text-royal">Begins.</span>
          </h2>
          <div className="mt-10 max-w-xl space-y-6 text-[1.08rem]">
            <p className="prose-copy dropcap" data-reveal>{copy.about.paragraphs[0]}</p>
            <p className="lede text-[clamp(1.35rem,2.6vw,1.75rem)] text-ink/90" data-reveal style={{ ['--d' as string]: '120ms' }}>{copy.about.paragraphs[1]}</p>
          </div>
          <div className="triad mt-14 max-w-xl" data-reveal aria-label="Explore, Discover, Create">
            <span>Explore</span><i /><span>Discover</span><i /><span>Create</span>
          </div>
        </div>

        <div className="col-span-12 mx-auto w-full max-w-md lg:col-span-5 lg:mt-24 lg:max-w-none" data-reveal="right">
          <Tilt className="stack">
            <span className="stack__back" aria-hidden="true" />
            <figure className="stack__main">
              <img src="/images/intramuros.webp" alt="A historic stone church facade with a bell tower in Intramuros, Manila" width="966" height="2040" loading="lazy" decoding="async" />
            </figure>
            <figure className="stack__inset">
              <img src="/images/intramuros-about.webp" alt="The carved coat of arms above the arched doorway of an Intramuros church" width="930" height="2050" loading="lazy" decoding="async" />
            </figure>
          </Tilt>
          <p className="mt-6 pl-1 text-xs uppercase tracking-wider3 text-mute">Intramuros, Manila</p>
        </div>
      </div>
    </section>
  );
}