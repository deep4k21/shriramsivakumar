import { useEffect, useRef } from 'react';

/** Ignore wheel deltas smaller than this — a trackpad fires many tiny events per gesture. */
const WHEEL_THRESHOLD = 4;
/** A touch drag has to cross this many pixels before it counts as a swipe. */
const TOUCH_THRESHOLD = 32;
/** How long a jump animation takes. */
const JUMP_MS = 3000;
/** Ignores further input for this long after a jump finishes, so the residual tail of a fast fling cannot immediately trigger the next page. */
const COOLDOWN_MS = 150;
/** How far past the first/last stop the zone still claims input, so a gesture that begins right at the boundary isn't fumbled to the browser's native scroll. */
const ZONE_MARGIN = 4;

/** Slow ease-in-out, matching `useSmoothScrollTo`'s. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * True paginated scroll snap between a fixed set of document-Y stops: one
 * wheel tick or touch swipe advances exactly one stop, forward or back, fully
 * animated — never a free scroll through the stretch between them.
 *
 * The zone is implicit in `getStops()` itself — the first and last values it
 * returns. Outside that span, native scrolling is left completely alone;
 * inside it, this hook owns the wheel and touch input entirely. Stops are
 * measured fresh on every interaction rather than cached, since the pinned
 * sections they come from are sized in viewport units and move on resize.
 *
 * Unlike `useScrollSnap` (which eases toward the nearest settled point only
 * once the reader stops scrolling, and never blocks native scroll), this
 * captures the wheel/touch events themselves and prevents the browser's own
 * scroll from running at all while inside the zone.
 */
export function usePagedSnap(
  getStops: () => number[],
  enabled = true,
  /**
   * Fired instead of jumping when a forward gesture arrives already on the
   * last stop — a "next" that isn't a scroll position at all, like opening a
   * modal. Scroll stays exactly where it is; the caller drives whatever
   * happens next itself.
   */
  onPastLastStop?: () => void,
  /**
   * Fired with the stop indices a jump is about to travel between, right
   * before it starts. For a scroll-linked effect tied to one specific
   * boundary (a ghost that used to scrub across the scroll distance between
   * two stops, say), this is what that effect can trigger off instead — the
   * jump's jump covers the whole gap in one animated `scrollTo` sequence, so
   * a narrow scroll-distance window designed for free-scroll often only
   * occupies a sliver of the jump's actual duration.
   */
  onAdvance?: (fromIndex: number, toIndex: number) => void,
) {
  const jumping = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const cooldownUntil = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frame = { current: null as number | null };

    const jumpTo = (targetY: number) => {
      if (jumping.current) return;
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 2) return;

      jumping.current = true;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';

      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / JUMP_MS);
        window.scrollTo(0, startY + distance * easeInOutCubic(t));
        if (t < 1) {
          frame.current = requestAnimationFrame(step);
          return;
        }
        frame.current = null;
        root.style.scrollBehavior = previousBehavior;
        jumping.current = false;
        cooldownUntil.current = performance.now() + COOLDOWN_MS;
      };
      frame.current = requestAnimationFrame(step);
    };

    /**
     * Attempts one step. Returns whether it actually consumed the gesture —
     * jumped, or handed off to `onPastLastStop` — so a caller only blocks
     * native scroll when there was somewhere for the gesture to go.
     *
     * Without that distinction, scrolling backward while already sitting on
     * the *first* stop (nothing before it to jump to, and no
     * `onPastLastStop`-style escape hatch on that side) would still
     * `preventDefault()` every wheel tick and never actually move — the
     * reader gets stuck unable to scroll back toward whatever precedes the
     * zone, wheel input dead until they reach for the scrollbar instead.
     */
    const advance = (dir: 1 | -1): boolean => {
      if (jumping.current || performance.now() < cooldownUntil.current) return jumping.current;
      const stops = getStops();
      if (stops.length < 2) return false;

      const y = window.scrollY;
      let bestI = 0;
      let bestD = Infinity;
      stops.forEach((s, i) => {
        const d = Math.abs(s - y);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      });

      const next = bestI + dir;
      if (next >= stops.length) {
        // Already on the last stop and still pushing forward — nothing left
        // to scroll to, but the caller may have something else to advance to.
        if (dir === 1 && bestI === stops.length - 1 && onPastLastStop) {
          cooldownUntil.current = performance.now() + JUMP_MS + COOLDOWN_MS;
          onPastLastStop();
          return true;
        }
        return false;
      }
      if (next < 0) return false;
      onAdvance?.(bestI, next);
      jumpTo(stops[next]);
      return true;
    };

    /** Whether the page is currently inside the paginated zone. */
    const inZone = () => {
      const stops = getStops();
      if (stops.length < 2) return false;
      const y = window.scrollY;
      return y > stops[0] - ZONE_MARGIN && y < stops[stops.length - 1] + ZONE_MARGIN;
    };

    const onWheel = (e: WheelEvent) => {
      // Outside the zone and not mid-jump — leave the browser's own scroll
      // alone (e.g. scrolling Hero further up, away from Intro).
      if (!inZone() && !jumping.current) return;
      if (jumping.current) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) {
        e.preventDefault();
        return;
      }
      // Only claim the gesture once `advance` confirms there is somewhere for
      // it to go — otherwise it falls through to the browser's native scroll,
      // which is what lets the reader keep scrolling past either edge of the
      // zone instead of getting stuck against it.
      if (advance(e.deltaY > 0 ? 1 : -1)) e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!inZone()) return;
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      // Zone check repeated here (not just in touchstart): a swipe that
      // started just outside the zone can carry the page in during the move.
      if (!inZone() && !jumping.current) return;
      if (jumping.current) {
        e.preventDefault();
        return;
      }
      const y = e.touches[0]?.clientY ?? touchStartY.current;
      const dy = touchStartY.current - y;
      if (Math.abs(dy) < TOUCH_THRESHOLD) {
        e.preventDefault();
        return;
      }
      if (advance(dy > 0 ? 1 : -1)) {
        e.preventDefault();
        touchStartY.current = y;
      } else {
        // Nowhere to advance to — release the gesture to native scroll and
        // stop tracking it as a swipe, the same way `onWheel` falls through.
        touchStartY.current = null;
      }
    };

    const onTouchEnd = () => {
      touchStartY.current = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!inZone()) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (advance(1)) e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (advance(-1)) e.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [getStops, enabled, onPastLastStop, onAdvance]);
}
