import { useEffect, useState } from 'react';
import { NAV_OF, SECTION_IDS, type NavId, type SectionId } from '../constants/nav';

const isSection = (id: string): id is SectionId => (SECTION_IDS as readonly string[]).includes(id);

export function pickSection(tops: { id: SectionId; top: number }[], line: number, atBottom: boolean): SectionId {
  if (atBottom) return tops.reduce((a, b) => (b.top > a.top ? b : a)).id;
  let best: { id: SectionId; top: number } | null = null;
  for (const t of tops) if (t.top <= line && (!best || t.top > best.top)) best = t;
  return (best ?? tops.reduce((a, b) => (b.top < a.top ? b : a))).id;
}

export function useActiveSection(): NavId {
  const [active, setActive] = useState<NavId>('home');

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    let pinned: NavId | null = null;
    let glide = 0;
    let raf = 0;

    const landing = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;

    const compute = (): NavId => {
      const atBottom = window.scrollY >= maxY() - 4;
      const line = Math.max(window.innerHeight * 0.35, 120);
      const tops = els.map((el) => ({ id: el.id as SectionId, top: el.getBoundingClientRect().top }));
      return NAV_OF[pickSection(tops, line, atBottom)];
    };
    const update = () => {
      raf = 0;
      if (pinned === null) setActive(compute());
    };
    const stop = () => {
      if (glide) cancelAnimationFrame(glide);
      glide = 0;
      pinned = null;
      update();
    };

    const goTo = (el: HTMLElement) => {
      if (glide) cancelAnimationFrame(glide);
      const from = window.scrollY;
      const target = () => Math.min(Math.max(0, el.getBoundingClientRect().top + window.scrollY - landing()), maxY());
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = calm ? 0 : Math.min(1100, 450 + Math.abs(target() - from) * 0.12);
      const t0 = performance.now();
      const step = (now: number) => {
        const p = duration ? Math.min(1, Math.max(0, (now - t0) / duration)) : 1;
        const eased = 1 - Math.pow(1 - p, 3);
        window.scrollTo({ top: from + (target() - from) * eased, behavior: 'instant' });
        if (p < 1) {
          glide = requestAnimationFrame(step);
        } else {
          glide = 0;
          pinned = null;
          update();
        }
      };
      glide = requestAnimationFrame(step);
    };

    const onScroll = () => {
      if (pinned === null && !raf) raf = requestAnimationFrame(update);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = (e.target as Element).closest?.('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (!id || !isSection(id)) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      pinned = NAV_OF[id];
      setActive(pinned);
      history.replaceState(null, '', `#${id}`);
      goTo(el);
      if (e.detail === 0) {
        el.tabIndex = -1;
        el.style.outline = 'none';
        el.focus({ preventScroll: true });
      }
    };
    const takeOver = () => {
      if (pinned !== null) stop();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchmove', takeOver, { passive: true });
    window.addEventListener('keydown', takeOver);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchmove', takeOver);
      window.removeEventListener('keydown', takeOver);
      document.removeEventListener('click', onClick);
      if (glide) cancelAnimationFrame(glide);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}