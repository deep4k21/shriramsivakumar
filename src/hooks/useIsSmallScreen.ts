import { useEffect, useState } from 'react';

/**
 * The width below which the desktop layout is not attempted at all.
 *
 * Matches the `max-[900px]:hidden` the travelling ghosts already carry: below
 * that the pinned sections, the mosaic and the ghost flights between them have
 * no room to read as anything, so the site shows a standing notice instead of
 * a broken version of itself.
 */
export const SMALL_SCREEN_MAX = 900;

/**
 * Whether the viewport is too narrow for the desktop layout.
 *
 * Driven by `matchMedia` rather than a resize listener on `innerWidth`: the
 * query only fires when the answer actually changes, so rotating a phone or
 * dragging a desktop window across the breakpoint costs one update instead of
 * one per frame of the drag.
 *
 * Starts `null` rather than `false` so the first paint can hold off on
 * choosing: rendering the full desktop site for a frame and then replacing it
 * with the notice reads as a flash of the wrong thing on exactly the devices
 * this exists for.
 */
export function useIsSmallScreen(): boolean | null {
  const [isSmall, setIsSmall] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SMALL_SCREEN_MAX}px)`);
    const apply = () => setIsSmall(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return isSmall;
}
