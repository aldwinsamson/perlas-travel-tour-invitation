import { useEffect, useState } from 'react';
import { NAV_OF, SECTION_IDS, type NavId, type SectionId } from '../constants/nav';

const isSection = (id: string): id is SectionId => (SECTION_IDS as readonly string[]).includes(id);

/** the current section is the last one whose top has passed the reading line. at the very bottom it is always the last one,
 *  because a short final section can never reach the line. `tops` must be in page order. */
export function pickSection(tops: { id: SectionId; top: number }[], line: number, atBottom: boolean): SectionId {
  if (atBottom) return tops[tops.length - 1].id;
  let current = tops[0].id;
  for (const t of tops) {
    if (t.top <= line) current = t.id;
    else break;
  }
  return current;
}

/** which menu item to underline.
 *  - follows the section you are reading, using scroll position (no gaps like an observer has)
 *  - clicking a link moves the underline there at once and holds it until the scroll stops, so it never flickers through the sections in between */
export function useActiveSection(): NavId {
  const [active, setActive] = useState<NavId>('home');

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    let pinned: NavId | null = null;
    let release = 0;
    let raf = 0;

    const compute = (): NavId => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      // 35% down the screen, never above the point a clicked link scrolls its section to (below the fixed bar)
      const line = Math.max(window.innerHeight * 0.35, 120);
      const tops = els.map((el) => ({ id: el.id as SectionId, top: el.getBoundingClientRect().top }));
      return NAV_OF[pickSection(tops, line, atBottom)];
    };
    const update = () => {
      raf = 0;
      if (!pinned) setActive(compute());
    };
    const unpin = () => {
      pinned = null;
      update();
    };
    const onScroll = () => {
      if (pinned) {
        window.clearTimeout(release);
        release = window.setTimeout(unpin, 160); // still scrolling toward the clicked link: keep holding
      } else if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = (e.target as Element).closest?.('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (!id || !isSection(id)) return;
      pinned = NAV_OF[id];
      setActive(pinned);
      window.clearTimeout(release);
      release = window.setTimeout(unpin, 250); // covers a click that needs no scrolling
    };
    // the person grabbed the page themselves: stop holding and follow where they actually are
    const takeOver = () => {
      if (!pinned) return;
      window.clearTimeout(release);
      unpin();
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
      window.clearTimeout(release);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}