import { useEffect } from 'react';
import { BACKDROPS } from '../../App';
import { MobileAbout } from './MobileAbout';
import { MobileHero } from './MobileHero';
import { MobileIntro } from './MobileIntro';
import { MobileNav } from './MobileNav';
import { MobileWork } from './MobileWork';

/**
 * The mobile site, in progress.
 *
 * Reached only via `?mobile=1` (see `MOBILE_PREVIEW`) while it is built
 * section by section; narrow viewports still get `SmallScreenNotice` by
 * default. Sections are added here one at a time as each is adapted.
 *
 * A plain vertical scroll rather than the desktop's pinned-section chain:
 * that choreography is built on sections taller than the viewport that hold
 * themselves in place while their contents scrub, which needs both a large
 * viewport and a scrollbar the page controls. A phone has neither.
 */
export function MobileApp() {
  /*
    The same chalkboard backdrop the desktop site paints, set the same way:
    a fixed `body::before` in `global.css` reads this property. Only
    `DesktopApp` was setting it, so the mobile layout fell through to the
    stylesheet's fallback and lost the texture the rest of the site sits on.
  */
  useEffect(() => {
    document.documentElement.style.setProperty('--site-backdrop', `url('${BACKDROPS.two}')`);
  }, []);

  return (
    <>
      {/*
        Padded for the fixed bottom bar, so the last section's content can
        scroll clear of it rather than ending underneath.

        No background of its own: the backdrop is painted behind the page by
        `body::before`, and an opaque fill here would cover it.
      */}
      <main id="home" className="min-h-dvh pb-20 text-white">
        <MobileHero />
        <MobileIntro />
        <MobileAbout />
        <MobileWork />
      </main>
      <MobileNav />
    </>
  );
}
