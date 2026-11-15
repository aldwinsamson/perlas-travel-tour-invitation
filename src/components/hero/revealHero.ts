/** brings the invitation in after the aircraft has passed. gsap is a separate chunk, already warm by the time this runs. */
export async function revealHero(): Promise<void> {
  const root = document.documentElement;
  try {
    const { gsap } = await import('gsap');
    const items = gsap.utils.toArray<HTMLElement>('.hero-item');
    gsap.set(items, { autoAlpha: 0, y: 22 });
    root.setAttribute('data-intro', 'done'); // css stops hiding; gsap now owns the fade
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'power2.out', stagger: 0.12, clearProps: 'all' });
  } catch {
    root.setAttribute('data-intro', 'done');
  }
}
