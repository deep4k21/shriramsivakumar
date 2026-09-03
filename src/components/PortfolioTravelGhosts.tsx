import { animate, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HandoffGhost } from './AboutTravelGhosts';

/**
 * An invisible stand-in for the connect modal, so the closing ghost has a real
 * element to measure rather than hardcoded numbers.
 *
 * It mirrors the modal's own box — the same width cap inside the same scrim
 * padding — with spacers standing in for its content, so the height comes out
 * the same without duplicating the form itself.
 */
function ConnectTarget() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 grid place-items-center overflow-hidden p-[clamp(24px,5vh,64px)] opacity-0"
    >
      <div
        data-connect-target
        className="flex max-h-full w-[min(560px,100%)] flex-col gap-5.5 rounded-[20px] px-9 py-8.5"
      >
        {/* Spacers standing in for the modal's header, links, form and button. */}
        <div className="h-[120px]" />
        <div className="h-[64px]" />
        <div className="h-[248px]" />
        <div className="h-[74px]" />
      </div>
    </div>
  );
}

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

/**
 * Career → the connect modal. The ghost grows from the career card into the
 * modal's footprint, played as a fixed-duration animation rather than scrubbed
 * by scroll — see `playCount` below. The modal itself opens once it lands, so
 * the panel appears to be what the outline was becoming, rather than a dialog
 * thrown over the page.
 */
const TO_CONNECT = { start: 0, end: 1 } as const;

/**
 * How long the closing flight takes when played on its own, not scrubbed.
 * Deliberately shorter than `JUMP_MS` in `usePagedSnap` — this is a single
 * card growing into the modal's shape, not a scroll across the page, and it
 * read as sluggish at the same 3s the section jumps use.
 */
const CONNECT_FLIGHT_MS = 900;

export function PortfolioTravelGhosts({
  onOpenConnect,
  playCount,
}: {
  onOpenConnect: () => void;
  /**
   * Bumped to play the Career → connect-modal flight once, in place of the
   * scroll-scrubbed runway this used to have: the paginated snap between
   * Career and Connect jumps straight there rather than scrolling through a
   * stretch the ghost could scrub against, so the flight instead runs on its
   * own clock, timed to finish as the modal opens.
   */
  playCount: number;
}) {
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

    setWindows({
      about: read(aboutEl),
      portfolio: read(portfolioEl),
    });
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
  const connectProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!windows) return;
    if (windows.about.span > 0) {
      aboutProgress.set((y - windows.about.start) / windows.about.span);
    }
    if (windows.portfolio.span > 0) {
      portfolioProgress.set((y - windows.portfolio.start) / windows.portfolio.span);
    }
  });

  // Runs the closing flight once per bump, then opens the modal as it lands —
  // matching what the scroll-scrubbed version used to do at its own threshold.
  // Guarded against `0`, the initial value: only an actual increment plays it.
  const lastPlayed = useRef(playCount);
  useEffect(() => {
    if (playCount === lastPlayed.current) return;
    lastPlayed.current = playCount;
    connectProgress.set(0);
    const controls = animate(connectProgress, 1, {
      duration: CONNECT_FLIGHT_MS / 1000,
      ease: [0.2, 0.7, 0.2, 1],
    });
    controls.then(() => {
      onOpenConnect();
      connectProgress.set(0);
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playCount]);

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
      {/*
        The closing hop: the career card grows into the connect modal's
        footprint. `[data-connect-target]` is an invisible box matching the
        modal's size and position, so the ghost has something real to measure
        rather than hardcoded numbers.
      */}
      <HandoffGhost
        progress={connectProgress}
        range={TO_CONNECT}
        fromSelector="[data-career-first-card]"
        toSelector="[data-connect-target]"
      />
      <ConnectTarget />
    </>
  );
}
