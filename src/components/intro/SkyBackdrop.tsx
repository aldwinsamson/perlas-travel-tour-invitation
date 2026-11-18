import { useEffect, useRef } from 'react';
import type { SkyScene } from './SkyScene';
import { isLowPower, prefersReducedMotion } from '../../utils/capability';
import { BOOT_MIN_MS, READY_BUDGET_MS, fetchModel, isCompact, onModelProgress, setBootProgress, sinceNavigation, whenOpened } from '../../utils/intro';

interface Props {
  playIntro: boolean;
  onStart: () => void;
  onReveal: () => void;
  onComplete: () => void;
  onFail: () => void;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export default function SkyBackdrop(p: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SkyScene | null>(null);
  const cb = useRef(p);
  cb.current = p;

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = prefersReducedMotion();
    const compact = isCompact();

    (async () => {
      try {
        const budget = () => Math.max(2500, READY_BUDGET_MS - sinceNavigation());
        const limit = <T,>(pr: Promise<T>) =>
          Promise.race([pr, wait(budget()).then(() => Promise.reject(new Error('intro assets too slow')))]);

        if (cb.current.playIntro) setBootProgress(0.12);
        const { SkyScene } = await limit(import('./SkyScene'));
        if (cancelled) return;
        if (cb.current.playIntro) setBootProgress(0.35);

        const scene = new SkyScene({
          canvas,
          lowPower: isLowPower(),
          compact,
          animated: !reduced,
          onReveal: () => cb.current.onReveal(),
          onComplete: () => cb.current.onComplete(),
          onContextLost: () => cb.current.onFail(),
        });
        sceneRef.current = scene;
        scene.renderOnce(); 

        if (!cb.current.playIntro || reduced) {
          scene.ambient();
          return;
        }
        onModelProgress((r) => r !== null && setBootProgress(0.35 + r * 0.5));
        const bytes = await limit(fetchModel());
        if (cancelled) return;
        setBootProgress(0.9);
        await limit(scene.load(bytes));
        if (cancelled) return;
        setBootProgress(1);
        await Promise.all([wait(Math.max(0, BOOT_MIN_MS - sinceNavigation())), import('gsap').catch(() => undefined)]);
        if (cancelled) return;
        // everything is loaded; the plane takes off only once the visitor has tapped open
        await whenOpened;
        if (cancelled) return;
        cb.current.onStart();
        scene.play();
      } catch {
        if (!cancelled) cb.current.onFail();
      }
    })();

    const ro = new ResizeObserver(() => sceneRef.current?.resize());
    ro.observe(canvas);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => sceneRef.current?.setScroll(Math.min(1, window.scrollY / window.innerHeight)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const home = document.getElementById('home');
    const io = home ? new IntersectionObserver(([e]) => sceneRef.current?.setActive(e.isIntersecting), { threshold: 0 }) : null;
    if (home) io?.observe(home);

    return () => {
      cancelled = true;
      ro.disconnect();
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      onModelProgress(() => undefined);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="sky-canvas" aria-hidden="true" />;
}
