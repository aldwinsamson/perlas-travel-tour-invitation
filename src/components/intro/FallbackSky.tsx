import { useEffect, useRef } from 'react';
import { flightTiming } from '../../utils/intro';

export function FallbackSky() {
  return (
    <div className="sky-fallback" aria-hidden="true">
      <i className="sky-fallback__sun" />
      <i className="sky-fallback__clouds sky-fallback__clouds--far" />
      <i className="sky-fallback__clouds sky-fallback__clouds--near" />
    </div>
  );
}

export function FallbackFlight({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const planeRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const plane = planeRef.current;
    const trail = trailRef.current;
    const ft = flightTiming();
    if (!plane || !trail) {
      onReveal();
      onDone();
      return;
    }
    const dur = ft.flight * 1000;
    const delay = ft.start * 1000;
    const a = plane.animate(
      [
        { transform: 'translate(-14vw, 106vh) rotate(0deg) scale(1.7)', opacity: 0 },
        { transform: 'translate(-2vw, 92vh) scale(1.6)', opacity: 1, offset: 0.08 },
        { transform: 'translate(104vw, -16vh) scale(0.42)', opacity: 1 },
      ],
      { duration: dur, delay, easing: 'cubic-bezier(.5,.05,.35,1)', fill: 'both' },
    );
    const len = trail.getTotalLength();
    trail.style.strokeDasharray = `${len}`;
    const t = trail.animate(
      [
        { strokeDashoffset: len, opacity: 0.95 },
        { strokeDashoffset: 0, opacity: 0.95, offset: 0.78 },
        { strokeDashoffset: 0, opacity: 0 },
      ],
      { duration: dur + 700, delay, easing: 'cubic-bezier(.5,.05,.35,1)', fill: 'both' },
    );
    const r = window.setTimeout(onReveal, ft.revealAt * 1000);
    const d = window.setTimeout(onDone, ft.end * 1000);
    return () => {
      a.cancel();
      t.cancel();
      clearTimeout(r);
      clearTimeout(d);
    };
  }, []);

  return (
    <div className="fallback-flight" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          ref={trailRef}
          d="M-4 108 C 22 84, 40 72, 58 54 S 92 16, 106 -6"
          fill="none"
          stroke="#F5B51B"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 4 }}
        />
      </svg>
      <div ref={planeRef} className="fallback-plane" style={{ opacity: 0 }}>
        <svg viewBox="0 0 24 24" width="100%" height="100%">
          <path
            fill="#081847"
            transform="rotate(45 12 12)"
            d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
          />
        </svg>
      </div>
    </div>
  );
}
