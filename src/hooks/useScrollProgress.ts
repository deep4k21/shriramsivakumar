import { useEffect, useState } from 'react';

function sectionProgress(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  return travel <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / travel));
}

export interface ScrollProgressState {
  introP: number;
  portP: number;
  navOn: boolean;
}

/**
 * Mirrors the .dc.html rAF-throttled scroll handler: tracks how far the
 * visitor has scrolled through the pinned "intro" and "portfolio" sections,
 * plus whether the sticky nav should be visible.
 */
export function useScrollProgress(): ScrollProgressState {
  const [state, setState] = useState<ScrollProgressState>({ introP: 0, portP: 0, navOn: false });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setState({ introP: 1, portP: 1, navOn: true });
      return;
    }

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setState((prev) => {
          const introP = sectionProgress('intro');
          const portP = sectionProgress('portfolio');
          const introEl = document.getElementById('intro');
          const navOn = introEl
            ? introEl.getBoundingClientRect().top <= window.innerHeight * 0.45
            : prev.navOn;

          const next = { ...prev };
          let changed = false;
          if (introP != null && Math.abs(introP - prev.introP) > 0.004) {
            next.introP = introP;
            changed = true;
          }
          if (portP != null && Math.abs(portP - prev.portP) > 0.004) {
            next.portP = portP;
            changed = true;
          }
          if (navOn !== prev.navOn) {
            next.navOn = navOn;
            changed = true;
          }
          return changed ? next : prev;
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return state;
}
