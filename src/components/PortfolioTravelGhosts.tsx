import { useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { HandoffGhost } from './AboutTravelGhosts';

/**
 * Carries the outline onward through the back half of the page: out of the
 * about section's last tile into the portfolio stage panel, then out of the
 * portfolio's collapsed mark into the career section's first card.
 *
 * Both hops cross a section boundary, so each runs on the *departing* section's
 * window and is allowed past 1.0 — that section has unpinned by then, but that
 * is exactly where the two endpoints share the screen. `HandoffGhost` measures
 * both ends every frame, which is what makes the outline track endpoints that
 * are still moving during the handoff.
 */

/**
 * About → portfolio, on the about window. The tail of about scrolls away while
 * the portfolio stage rises into place beneath it.
 */
const TO_PORTFOLIO = { start: 1.02, end: 1.62 } as const;

/**
 * Portfolio → career, on the portfolio window. Career is shorter than the
 * viewport so it has no scroll window of its own to drive this.
 *
 * The window is short because portfolio's is long: its 3200px span means one
 * unit of progress is far more scroll than the distance to career, and the mark
 * has left the screen by 1.2. This range covers the stretch where the mark and
 * the career card are actually both visible.
 */
const TO_CAREER = { start: 1.02, end: 1.24 } as const;

export function PortfolioTravelGhosts() {
  const { scrollY } = useScroll();
  const [windows, setWindows] = useState<{
    about: { start: number; span: number };
    portfolio: { start: number; span: number };
  } | null>(null);

  const measure = useCallback(() => {
    const aboutEl = document.getElementById('about');
    const portfolioEl = document.getElementById('portfolio');
    if (!aboutEl || !portfolioEl) return;

    const read = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { start: r.top + window.scrollY, span: r.height - window.innerHeight };
    };
    setWindows({ about: read(aboutEl), portfolio: read(portfolioEl) });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    const timers = [80, 250, 600, 1200].map((ms) => setTimeout(measure, ms));
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Driven imperatively rather than with `useTransform`, whose callback would
  // close over `windows` while it is still null and never see the measurements.
  const aboutProgress = useMotionValue(0);
  const portfolioProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!windows) return;
    if (windows.about.span > 0) {
      aboutProgress.set((y - windows.about.start) / windows.about.span);
    }
    if (windows.portfolio.span > 0) {
      portfolioProgress.set((y - windows.portfolio.start) / windows.portfolio.span);
    }
  });

  if (!windows) return null;

  return (
    <>
      {/*
        Leaves from the centre "After Hours" tile — where the previous section's
        ghosts converged — and lands on the portfolio stage panel while it is
        still at full size, so the outline continues from where it arrived.
      */}
      <HandoffGhost
        progress={aboutProgress}
        range={TO_PORTFOLIO}
        fromSelector="[data-about-tile]"
        fromIndex={1}
        toSelector="[data-portfolio-panel]"
        stickySelector="#portfolio > div"
      />
      {/*
        Leaves from the collapsed mark and lands on career's academic card.
        Career is in normal flow, so there is no sticky wrapper to correct for.
      */}
      <HandoffGhost
        progress={portfolioProgress}
        range={TO_CAREER}
        fromSelector="[data-portfolio-panel]"
        toSelector="[data-career-first-card]"
      />
    </>
  );
}
