import { useCallback, useEffect, useRef, useState } from 'react';
import { eventConfig } from './config/event';
import { useReveal } from './hooks/useReveal';
import { useEventPhase } from './hooks/useEventPhase';
import MainLayout from './layouts/MainLayout';
import SkyBackdrop from './components/intro/SkyBackdrop';
import IntroOverlay from './components/intro/IntroOverlay';
import EntryGate from './components/intro/EntryGate';
import { FallbackFlight, FallbackSky } from './components/intro/FallbackSky';
import { revealHero } from './components/hero/revealHero';
import { BOOT_MIN_MS, OPEN_EVENT, engineAtLoad, flightTiming, markOpened, setBootProgress, sinceNavigation, type Engine } from './utils/intro';

type Stage = 'off' | 'loading' | 'playing' | 'done';

const root = () => document.documentElement;

export default function App() {
  const phase = useEventPhase();
  useReveal(true);

  const [engine, setEngine] = useState<Engine>(engineAtLoad);
  const [stage, setStage] = useState<Stage>(engineAtLoad === 'none' ? 'off' : 'loading');
  const [opened, setOpened] = useState(false);
  const revealed = useRef(false);

  // the tap itself is the user gesture browsers need, so the music element is unlocked right here, inside the click
  const enter = useCallback(() => {
    window.dispatchEvent(new Event(OPEN_EVENT));
    markOpened();
    setOpened(true);
  }, []);

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
    void import('gsap'); 
  }, []);

  const onFail = useCallback(() => {
    setStage((s) => {
      if (s === 'playing') {
        reveal();
        return 'done';
      }
      return s;
    });
    setEngine('css');
  }, [reveal]);

  useEffect(() => {
    if (engine !== 'css' || stage !== 'loading' || !opened) return;
    setBootProgress(0.85);
    const id = window.setTimeout(() => {
      setBootProgress(1);
      startFlight();
    }, Math.max(350, BOOT_MIN_MS - sinceNavigation()));
    return () => clearTimeout(id);
  }, [engine, stage, opened, startFlight]);

  useEffect(() => {
    // counted from the tap, so a visitor who waits on the open button is never cut off
    if (stage === 'off' || stage === 'done' || !opened) return;
    const id = window.setTimeout(finish, eventConfig.intro.failsafeSeconds * 1000);
    return () => clearTimeout(id);
  }, [stage, opened, finish]);

  useEffect(() => {
    const site = document.getElementById('site');
    site?.toggleAttribute('inert', stage === 'loading' || stage === 'playing');
    if (stage === 'done') root().setAttribute('data-intro', 'done');
    if (stage === 'off') root().removeAttribute('data-intro');
  }, [stage]);

  const timing = flightTiming();

  return (
    <>
      {stage === 'loading' && !opened && <EntryGate onEnter={enter} />}
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
