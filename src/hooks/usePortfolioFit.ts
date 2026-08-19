import { useEffect, useState } from 'react';

/**
 * Scales the pinned portfolio content down so it always fits the sticky
 * viewport, even on short screens — mirrors the .dc.html `_fit` routine.
 */
export function usePortfolioFit(pinSelector: string) {
  const [fit, setFit] = useState(1);

  useEffect(() => {
    const recompute = () => {
      const pin = document.querySelector<HTMLElement>(pinSelector);
      if (!pin) return;
      const inner = pin.firstElementChild as HTMLElement | null;
      if (!inner) return;
      const paddingTop = parseFloat(getComputedStyle(pin).paddingTop || '0');
      const avail = pin.clientHeight - 2 * paddingTop;
      const need = inner.scrollHeight;
      const next = need > 0 ? Math.min(1, avail / need) : 1;
      setFit((prev) => (Math.abs(next - prev) > 0.005 ? next : prev));
    };

    window.addEventListener('resize', recompute);
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(recompute));

    return () => {
      window.removeEventListener('resize', recompute);
      cancelAnimationFrame(raf1);
    };
  }, [pinSelector]);

  return fit;
}
