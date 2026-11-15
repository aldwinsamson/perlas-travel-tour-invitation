import { eventConfig } from '../config/event';
import { hasWebGL, isLowPower, prefersReducedMotion } from './capability';

export type Engine = 'webgl' | 'css' | 'none';

export const MODEL_FULL = '/models/perlas_passenger_jet.glb';
export const MODEL_LITE = '/models/perlas_passenger_jet.lite.glb';
/** past this many ms since the page started loading, the 3d flight gives way to the lighter css one */
export const READY_BUDGET_MS = 16000;
/** the loading screen always shows at least this long, so it never flashes */
export const BOOT_MIN_MS = 800;

function pick(): Engine {
  if (!eventConfig.intro.enabled || prefersReducedMotion()) return 'none';
  if (document.documentElement.getAttribute('data-intro') !== 'loading') return 'none';
  // phones get the same real 3d flight as desktop; the css version is only for devices with no webgl at all
  return hasWebGL() ? 'webgl' : 'css';
}

/** decided once, as the bundle starts, so downloads can begin before react has rendered anything */
export const engineAtLoad: Engine = pick();

/** seconds, identical on every device. the invitation appears only once the aircraft and its trail have fully left the screen. */
export const flightTiming = () => {
  const start = 0.4;
  const flight = 4.6;
  const revealAt = start + flight + 0.25;
  return { start, flight, revealAt, end: revealAt + 1.0 };
};

export const isCompact = () => window.innerWidth < eventConfig.intro.mobileBreakpoint;
export const modelUrl = () => (isCompact() || isLowPower() ? MODEL_LITE : MODEL_FULL);

/** milliseconds since the browser started loading this page */
export const sinceNavigation = () => performance.now();

/** drives the loading bar on the static #boot screen (a css variable, so no react render per tick) */
export function setBootProgress(ratio: number) {
  document.documentElement.style.setProperty('--boot-p', Math.max(0.04, Math.min(1, ratio)).toFixed(3));
}

/* ------------------------------------------------------------------ one download, shared
   the model is fetched here (started from main.tsx) and handed to the loader as bytes, so it is only ever downloaded once. */
let modelPromise: Promise<ArrayBuffer> | null = null;
let listener: ((r: number | null) => void) | null = null;
export const onModelProgress = (fn: (r: number | null) => void) => (listener = fn);

export function fetchModel(): Promise<ArrayBuffer> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const res = await fetch(modelUrl());
    if (!res.ok || !res.body) throw new Error(`model ${res.status}`);
    // content-length is only the real size when the server did not compress the body
    const total = res.headers.get('content-encoding') ? 0 : Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const parts: Uint8Array[] = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      got += value.length;
      listener?.(total ? Math.min(1, got / total) : null);
    }
    const out = new Uint8Array(got);
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out.buffer;
  })();
  modelPromise.catch(() => (modelPromise = null));
  return modelPromise;
}

/** called from main.tsx before react renders: start the heavy downloads in parallel with the app itself */
export function prefetchIntro() {
  if (engineAtLoad !== 'webgl') return;
  void import('../components/intro/SkyScene');
  void fetchModel().catch(() => undefined);
}
