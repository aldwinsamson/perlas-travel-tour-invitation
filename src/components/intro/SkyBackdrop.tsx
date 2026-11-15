import { useEffect, useRef } from 'react';
import type { SkyScene } from './SkyScene';
import { isLowPower, prefersReducedMotion } from '../../utils/capability';
import { BOOT_MIN_MS, READY_BUDGET_MS, fetchModel, isCompact, onModelProgress, setBootProgress, sinceNavigation } from '../../utils/intro';

interface Props {
  /** true when this visit plays the 3d flight */
  playIntro: boolean;
  onStart: () => void;
  onReveal: () => void;
  onComplete: () => void;
  /** webgl, the scene or the download failed or ran out of time: the page switches to the css intro */
  onFail: () => void;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** the fixed sky behind the hero. owns the three.js scene, which is imported lazily so it never blocks first paint. */
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
        scene.renderOnce(); // sky is on screen immediately; the aircraft follows when it has loaded

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
        // hold the loading screen for a beat so a fast load never reads as a flash
        // gsap is parsed now, not mid-flight, and the loading screen holds a beat so a fast load never reads as a flash
        await Promise.all([wait(Math.max(0, BOOT_MIN_MS - sinceNavigation())), import('gsap').catch(() => undefined)]);
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

    // stop drawing when the hero is off screen
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
