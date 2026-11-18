import { useEffect, useRef, type ReactNode } from 'react';

export function Tilt({ className = '', children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const aim = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--tx', x.toFixed(3));
        el.style.setProperty('--ty', y.toFixed(3));
      });
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      aim(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const leave = () => aim(0, 0);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div ref={root} className={`tilt ${className}`}>
      <div className="tilt__scene">{children}</div>
    </div>
  );
}