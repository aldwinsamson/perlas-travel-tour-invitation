import { useCallback, useEffect, useRef, useState } from 'react';
import { eventConfig } from './config/event';
import { useReveal } from './hooks/useReveal';
import { useEventPhase } from './hooks/useEventPhase';
import MainLayout from './layouts/MainLayout';
import SkyBackdrop from './components/intro/SkyBackdrop';
import IntroOverlay from './components/intro/IntroOverlay';
import { FallbackFlight, FallbackSky } from './components/intro/FallbackSky';
import { revealHero } from './components/hero/revealHero';
import { BOOT_MIN_MS, engineAtLoad, flightTiming, setBootProgress, sinceNavigation, type Engine } from './utils/intro';

/** loading = static boot screen is up; playing = flight in progress; done / off = normal page */
type Stage = 'off' | 'loading' | 'playing' | 'done';

const root = () => document.documentElement;

export default function App() {
  const phase = useEventPhase();
  useReveal(true);

  const [engine, setEngine] = useState<Engine>(engineAtLoad);
  const [stage, setStage] = useState<Stage>(engineAtLoad === 'none' ? 'off' : 'loading');
  const revealed = useRef(false);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    void revealHero();
  }, []);

  const finish = useCallback(() => {
    reveal();
    setStage('done');
  }, [reveal]);

  const startFlight = useCallback(() => {
    setStage('playing');
    root().setAttribute('data-intro', 'playing');
    void import('gsap'); // warm the chunk now so the reveal fires instantly
  }, []);

  const onFail = useCallback(() => {
    // 3d gave up. if it was mid-flight just let the page appear, otherwise swap in the light css intro
    setStage((s) => {
      if (s === 'playing') {
        reveal();
        return 'done';
      }
      return s;
    });
    setEngine('css');
  }, [reveal]);

  // css intro: wait out the boot screen's minimum time, then fly
  useEffect(() => {
    if (engine !== 'css' || stage !== 'loading') return;
    setBootProgress(0.85);
    const id = window.setTimeout(() => {
      setBootProgress(1);
      startFlight();
    }, Math.max(350, BOOT_MIN_MS - sinceNavigation()));
    return () => clearTimeout(id);
  }, [engine, stage, startFlight]);

  // failsafe: whatever goes wrong, the invitation always appears
  useEffect(() => {
    if (stage === 'off' || stage === 'done') return;
    const id = window.setTimeout(finish, Math.max(1500, eventConfig.intro.failsafeSeconds * 1000 - sinceNavigation()));
    return () => clearTimeout(id);
  }, [stage, finish]);

  // the invitation is not reachable (focus, screen readers) until the aircraft has passed
  useEffect(() => {
    const site = document.getElementById('site');
    site?.toggleAttribute('inert', stage === 'loading' || stage === 'playing');
    if (stage === 'done') root().setAttribute('data-intro', 'done');
    if (stage === 'off') root().removeAttribute('data-intro');
  }, [stage]);

  const timing = flightTiming();

  return (
    <>
      {engine === 'css' ? (
        <FallbackSky />
      ) : (
        <SkyBackdrop playIntro={engine === 'webgl'} onStart={startFlight} onReveal={reveal} onComplete={finish} onFail={onFail} />
      )}
      {engine === 'css' && stage === 'playing' && <FallbackFlight onReveal={reveal} onDone={finish} />}
      {stage === 'playing' && <IntroOverlay revealAt={timing.revealAt} />}
      <MainLayout phase={phase} />
    </>
  );
}
