import { useCallback, useEffect, useRef, useState } from 'react';
import { eventConfig } from '../../config/event';
import { OPEN_EVENT } from '../../utils/intro';

const PAUSED_KEY = 'perlas-music-paused';
const MUSIC_DELAY_MS = 0;
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'] as const;

const remember = (paused: boolean) => {
  try {
    if (paused) sessionStorage.setItem(PAUSED_KEY, '1');
    else sessionStorage.removeItem(PAUSED_KEY);
  } catch {
    /* private mode: the choice just will not survive a refresh */
  }
};
const wasPaused = () => {
  try {
    return sessionStorage.getItem(PAUSED_KEY) === '1';
  } catch {
    return false;
  }
};

const introRunning = () => {
  const s = document.documentElement.getAttribute('data-intro');
  return s === 'loading' || s === 'playing';
};

export function MusicToggle() {
  const { src, volume } = eventConfig.music;
  const audio = useRef<HTMLAudioElement>(null);
  const fade = useRef(0);
  const wanted = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ramp = useCallback((to: number, ms: number, done?: () => void) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(fade.current);
    const from = a.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      a.volume = from + (to - from) * p;
      if (p < 1) fade.current = requestAnimationFrame(step);
      else done?.();
    };
    fade.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(async () => {
    const a = audio.current;
    if (!a) return false;
    try {
      if (a.paused) a.volume = 0;
      await a.play();
      ramp(volume, 1800);
      return true;
    } catch {
      return false;
    }
  }, [ramp, volume]);

  const stop = useCallback(() => {
    ramp(0, 350, () => audio.current?.pause());
  }, [ramp]);

  const toggle = () => {
    if (playing) {
      wanted.current = false;
      remember(true);
      setPlaying(false);
      stop();
    } else {
      wanted.current = true;
      remember(false);
      void start();
    }
  };

  useEffect(() => {
    if (!src || !audio.current) return;
    if (wasPaused()) wanted.current = false;
    let started = false;
    let delay = 0;
    const root = document.documentElement;
    const release = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    const attempt = () => {
      // nothing plays while the plane is still flying
      if (started || !wanted.current || introRunning()) return;
      void start().then((ok) => {
        if (ok) {
          started = true;
          release();
        }
      });
    };
    function onGesture(e: Event) {
      if ((e.target as Element | null)?.closest?.('[data-music]')) return;
      attempt();
    }
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    const unlock = () => {
      remember(false);
      wanted.current = true;
      const a = audio.current;
      if (!a) return;
      a.volume = 0;
      void a.play().catch(() => undefined);
    };
    window.addEventListener(OPEN_EVENT, unlock);
    const afterIntro = () => {
      window.clearTimeout(delay);
      delay = window.setTimeout(() => {
        const a = audio.current;
        if (a && !a.paused && a.volume === 0) a.currentTime = 0;
        attempt();
      }, MUSIC_DELAY_MS);
    };
    const watch = new MutationObserver(() => {
      if (!introRunning()) afterIntro();
    });
    watch.observe(root, { attributes: true, attributeFilter: ['data-intro'] });
    if (!introRunning()) afterIntro();
    return () => {
      window.clearTimeout(delay);
      watch.disconnect();
      window.removeEventListener(OPEN_EVENT, unlock);
      release();
    };
  }, [src, start]);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) {
        resume = !a.paused;
        if (resume) a.pause();
      } else if (resume && wanted.current) {
        resume = false;
        void start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [start]);

  if (!src || failed) return null;

  return (
    <>
      <audio ref={audio} src={src} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
      <button
        type="button"
        data-music
        className="icon-btn group rounded-full"
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        title={playing ? 'Pause music' : 'Play music'}
        onClick={toggle}
      >
        {playing ? (
          <>
            <svg viewBox="0 0 20 20" className="col-start-1 row-start-1 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" aria-hidden="true">
              {[3, 7.5, 12, 16.5].map((x, i) => (
                <rect key={x} x={x - 1} y={still ? 6 : 8} width="2" height={still ? 8 : 4} rx="1" fill="currentColor">
                  {!still && (
                    <>
                      <animate attributeName="height" values="3;13;5;11;3" dur={`${1.1 + i * 0.17}s`} repeatCount="indefinite" />
                      <animate attributeName="y" values="8.5;3.5;7.5;4.5;8.5" dur={`${1.1 + i * 0.17}s`} repeatCount="indefinite" />
                    </>
                  )}
                </rect>
              ))}
            </svg>
            <svg viewBox="0 0 20 20" className="col-start-1 row-start-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
              <rect x="5.5" y="4" width="3" height="12" rx="1" fill="currentColor" />
              <rect x="11.5" y="4" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
          </>
        ) : (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 4.6v10.8a.6.6 0 0 0 .9.5l8.3-5.4a.6.6 0 0 0 0-1L7.9 4.1a.6.6 0 0 0-.9.5z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}