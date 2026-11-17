export async function revealHero(): Promise<void> {
  const root = document.documentElement;
  try {
    const { gsap } = await import('gsap');
    const items = gsap.utils.toArray<HTMLElement>('.hero-item');
    gsap.set(items, { autoAlpha: 0, y: 22 });
    root.setAttribute('data-intro', 'done'); 
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'power2.out', stagger: 0.12, clearProps: 'all' });
  } catch {
    root.setAttribute('data-intro', 'done');
  }
}
