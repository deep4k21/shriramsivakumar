import { useEffect } from 'react';
import { BACKDROPS } from '../../App';
import { MobileWork } from './MobileWork';

/**
 * The featured-work section on its own, at `?mobile=2`.
 *
 * The same `MobileWork` the full preview renders, with nothing above or below
 * it — no hero, intro, about or nav bar. Those sections are still being
 * worked through, and reviewing the project cards meant scrolling past them
 * every time.
 *
 * Shares the component rather than copying it, so the two previews cannot
 * drift: a change to a card or a case study shows up in both.
 */
export function MobileWorkOnly() {
  /*
    The chalkboard backdrop, the same way `MobileApp` and `DesktopApp` set
    it — a fixed `body::before` in `global.css` reads this property. Without
    it the section sits on the stylesheet's fallback instead of the texture
    the rest of the site uses.
  */
  useEffect(() => {
    document.documentElement.style.setProperty('--site-backdrop', `url('${BACKDROPS.two}')`);
  }, []);

  return (
    <main className="min-h-dvh py-14 text-white">
      <MobileWork />
    </main>
  );
}
