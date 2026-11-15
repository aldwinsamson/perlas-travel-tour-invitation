import { useEffect } from 'react';

/**
 * marks anything with [data-reveal] as visible once it scrolls into view.
 * content is visible by default in css; only html.js-reveal hides it, so a failed script never hides the page.
 */
export function useReveal(enabled: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      root.classList.remove('js-reveal');
      return;
    }
    root.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = '1';
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    const watch = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])').forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);
}
