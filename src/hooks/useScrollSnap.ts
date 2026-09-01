import { useEffect, useRef } from 'react';

/** How long the page must be still before a snap is considered. */
const IDLE_MS = 140;

/**
 * How far from a settled point a snap will reach, as a fraction of the
 * viewport height.
 *
 * Wide enough to catch someone who has stopped just short of a section's
 * settled state, narrow enough that deliberately parking mid-window — to watch
 * a reveal partway through, say — is left alone.
 */
const REACH = 0.52;

/**
 * A snap point never reaches more than this share of the way to its nearest
 * neighbour.
 *
 * Without it a closely-spaced pair traps the reader: the portfolio's stops sit
 * as little as 276px apart, and a reach of half a viewport meant an ordinary
 * wheel scroll could not clear one before being pulled back into it. Capping
 * the reach at just under half the gap guarantees a normal scroll always ends
 * up nearer the next point than the one it left, so the page moves on instead
 * of fighting back. 0.38 rather than a half so that one wheel gesture (~360px)
 * still clears a stop even where the neighbouring points are a viewport apart.
 */
const NEIGHBOUR_REACH = 0.38;

/** Below this the reader is treated as still scrolling, not stopped. */
const SETTLED_VELOCITY = 0.08;

export interface SnapPoint {
  id: string;
  /** Absolute document Y where this section's content has finished revealing. */
  y: number;
}

/**
 * Eases the page to the nearest section's settled position once scrolling stops.
 *
 * CSS `scroll-snap-type` cannot do this. It snaps to element *edges*, but every
 * pinned section here is several viewports tall and its content reveals partway
 * through that window — the top is the blank pre-reveal state. So the snap
 * targets are computed from the same settled fractions the sidebar navigates
 * to, and the scroll is driven by the same eased helper.
 *
 * `scrollTo` is the only lever a hook has here, so this deliberately does
 * nothing while the reader is still moving: it waits for a genuine stop, and
 * any wheel or touch during the glide cancels it.
 */
export function useScrollSnap(
  getPoints: () => SnapPoint[],
  scrollTo: (y: number, durationMs?: number) => void,
  enabled = true,
) {
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastY = useRef(0);
  const lastT = useRef(0);
  /** Set while this hook is driving, so its own scrolling does not re-trigger it. */
  const snapping = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lastY.current = window.scrollY;
    lastT.current = performance.now();

    const consider = () => {
      if (snapping.current) return;

      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // At either end of the document there is nothing to snap toward, and
      // pulling away from the top or bottom feels like the page fighting back.
      if (y <= 2 || y >= max - 2) return;

      const points = getPoints();
      if (points.length === 0) return;

      let best = points[0];
      for (const p of points) {
        if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
      }

      const distance = Math.abs(best.y - y);
      if (distance < 2) return;

      // How far this point may pull from: the standard reach, but never so far
      // that leaving it is impossible. A point close to another only holds the
      // ground nearer to itself than to its neighbour.
      let gap = Infinity;
      for (const p of points) {
        if (p === best) continue;
        gap = Math.min(gap, Math.abs(p.y - best.y));
      }
      const reach = Math.min(window.innerHeight * REACH, gap * NEIGHBOUR_REACH);
      if (distance > reach) return;

      snapping.current = true;
      // Duration scales with the distance, so a short correction is quick and a
      // longer pull still eases rather than lurching.
      const ms = Math.round(280 + (distance / window.innerHeight) * 520);
      scrollTo(best.y, ms);
      window.setTimeout(() => {
        snapping.current = false;
      }, ms + 80);
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastT.current;
      const velocity = dt > 0 ? Math.abs(y - lastY.current) / dt : 0;
      lastY.current = y;
      lastT.current = now;

      clearTimeout(idle.current);
      // Momentum scrolling keeps firing events as it decays; waiting for the
      // rate to fall as well as for the events to stop avoids snapping out from
      // under a fling that is still travelling.
      idle.current = setTimeout(() => {
        if (velocity <= SETTLED_VELOCITY) consider();
        else idle.current = setTimeout(consider, IDLE_MS);
      }, IDLE_MS);
    };

    /**
     * A deliberate gesture cancels a *pending* snap.
     *
     * It does not clear `snapping`, which marks a glide already in flight —
     * `useSmoothScrollTo` cancels that itself on wheel or touch, and clearing
     * the flag here would let this hook immediately re-snap to the point the
     * reader has just chosen to scroll away from.
     */
    const onInterrupt = () => {
      clearTimeout(idle.current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onInterrupt, { passive: true });
    window.addEventListener('touchstart', onInterrupt, { passive: true });
    window.addEventListener('keydown', onInterrupt);

    return () => {
      clearTimeout(idle.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onInterrupt);
      window.removeEventListener('touchstart', onInterrupt);
      window.removeEventListener('keydown', onInterrupt);
    };
  }, [getPoints, scrollTo, enabled]);
}
