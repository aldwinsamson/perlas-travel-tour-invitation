import { eventConfig } from '../config/event';

export default function Program() {
  const { program, when } = eventConfig;
  return (
    <section id="program" className="section" aria-labelledby="program-title">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow" data-reveal>The Celebration</p>
            <h2 id="program-title" className="h-display mt-5 text-[clamp(2.6rem,6vw,4.6rem)]" data-reveal>Program of the Day</h2>
            <p className="mt-5 text-[0.78rem] font-medium uppercase tracking-[0.24em] text-ink/70" data-reveal>{when.displayDate} · {when.displayTime}</p>
            {program.tentative && (
              <div className="mt-7 space-y-4" data-reveal>
                <span className="badge">Tentative</span>
                <p className="prose-copy max-w-sm text-[0.97rem]">
                  The order of activities may still change, and times have not been announced yet. Perlas Travel &amp; Tours will confirm the final program.
                </p>
              </div>
            )}
          </div>
        </div>
        <ol className="rail col-span-12 lg:col-span-7 lg:col-start-6">
          {program.items.map((it, i) => (
            <li key={it.title} data-reveal style={{ ['--d' as string]: `${Math.min(i, 4) * 70}ms` }}>
              <span className="rail__n" aria-hidden="true" />
              <div className="rail__body">
                <span className="rail__num">{it.time ?? String(i + 1).padStart(2, '0')}</span>
                <h3 className="rail__title">{it.title}</h3>
                {it.description && <p className="prose-copy mt-1 text-sm">{it.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}