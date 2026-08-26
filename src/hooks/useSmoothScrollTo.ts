import { useCallback, useEffect, useRef } from 'react';

/** Slow ease-in-out — gentle at both ends, no lurch on departure or arrival. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * An eased scroll to an absolute Y, run on rAF.
 *
 * The native `scrollIntoView({ behavior: 'smooth' })` has a fixed duration the
 * page cannot set, which reads as a quick jerk over a long distance. This gives
 * the travel its own duration and easing, and cancels cleanly if the reader
 * takes over with the wheel mid-flight.
 */
export function useSmoothScrollTo() {
  const frame = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  return useCallback(
    (targetY: number, durationMs = 900) => {
      cancel();

      const startY = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const endY = Math.max(0, Math.min(targetY, max));
      const distance = endY - startY;
      if (Math.abs(distance) < 2) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, endY);
        return;
      }

      // A wheel or touch gesture means the reader has taken over — stop rather
      // than fighting them for the scroll position.
      const onInterrupt = () => cancel();
      window.addEventListener('wheel', onInterrupt, { passive: true, once: true });
      window.addEventListener('touchstart', onInterrupt, { passive: true, once: true });

      // The site sets `scroll-behavior: smooth` globally, which makes every one
      // of the per-frame `scrollTo` calls below start its own browser-driven
      // smooth animation. They queue up chasing stale targets, so the page lags
      // well behind this curve and starts late. Opting out for the duration
      // makes each call the instant jump the easing here assumes.
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';

      const finish = () => {
        frame.current = null;
        root.style.scrollBehavior = previousBehavior;
        window.removeEventListener('wheel', onInterrupt);
        window.removeEventListener('touchstart', onInterrupt);
      };

      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        window.scrollTo(0, startY + distance * easeInOutCubic(t));
        if (t < 1) {
          frame.current = requestAnimationFrame(step);
          return;
        }
        finish();
      };
      frame.current = requestAnimationFrame(step);
    },
    [cancel],
  );
}
