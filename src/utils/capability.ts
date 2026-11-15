/** feature checks for the intro. cheap, no side effects. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface NavExtra {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/** low-power guess: few cores, little ram or data saver. the intro then uses the lite model and cheaper clouds. */
export function isLowPower(): boolean {
  const n = navigator as Navigator & NavExtra;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = n.deviceMemory ?? 8;
  const save = !!n.connection?.saveData || /(^|-)2g$/.test(n.connection?.effectiveType ?? '');
  return cores <= 4 || mem <= 4 || save;
}
