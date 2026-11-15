import { eventConfig } from '../config/event';

export default function Program() {
  const { program } = eventConfig;
  return (
    <section id="program" className="section" aria-labelledby="program-title">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow" data-reveal>The Celebration</p>
            <h2 id="program-title" className="h-display mt-5 text-[clamp(2.6rem,6vw,4.6rem)]" data-reveal>Program of the Day</h2>
          </div>
        </div>
        <ol className="rail col-span-12 lg:col-span-7 lg:col-start-6">
          {program.items.map((it, i) => (
            <li key={it.title} data-reveal style={{ ['--d' as string]: `${Math.min(i, 4) * 70}ms` }}>
              <span className="rail__n" aria-hidden="true" />
              <div className="rail__body">
                <span className="rail__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="rail__title">{it.title}</h3>
                {it.description && <p className="prose-copy mt-1 text-sm">{it.description}</p>}
                {it.time && <span className="rail__time">{it.time}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
