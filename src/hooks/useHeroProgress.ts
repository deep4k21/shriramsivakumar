import { useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { useCallback, useEffect } from 'react';

/**
 * Progress across the hero's own scroll — 0 at the top of the page, 1 once the
 * hero has scrolled fully out of view.
 *
 * The hero is one viewport tall in normal flow, so like career it has no pinned
 * window of its own. `CardTravelGhost` drives the hero → intro hop off raw
 * scrollY rather than a section progress, so this gives the hero's own content
 * something equivalent to fade against.
 */
export function useHeroProgress() {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);

  const apply = useCallback(
    (y: number) => {
      const el = document.getElementById('home');
      if (!el) return;
      const span = Math.max(1, el.getBoundingClientRect().height);
      progress.set(Math.min(1, Math.max(0, y / span)));
    },
    [progress],
  );

  useMotionValueEvent(scrollY, 'change', apply);

  useEffect(() => {
    const sync = () => apply(window.scrollY);
    const raf = requestAnimationFrame(() => requestAnimationFrame(sync));
    const timers = [80, 250, 600].map((ms) => setTimeout(sync, ms));
    window.addEventListener('resize', sync);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', sync);
    };
  }, [apply]);

  return progress;
}
