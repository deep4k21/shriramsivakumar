import { useEffect } from 'react';

/**
 * Drives the radial-gradient mask on the background grid so it follows the
 * pointer, via CSS custom properties on the document root.
 */
export function usePointerGlow(radiusPx: number) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--gr', `${radiusPx}px`);

    let raf: number | null = null;
    let mx = -9999;
    let my = -9999;

    const apply = () => {
      raf = null;
      root.style.setProperty('--mx', `${mx}px`);
      root.style.setProperty('--my', `${my}px`);
    };

    const onMove = (e: PointerEvent | MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      mx = -9999;
      my = -9999;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [radiusPx]);
}
