import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { GhostSkin, readSkin, type Skin } from './GhostSkin';

/** How strongly the flight path bows outward from the straight line. */
const ARC_STRENGTH = 0.5;

/**
 * The handoff: it starts while the intro panel is still on screen and ends once
 * the about tiles have settled. Measured in intro-window units, that overlap
 * sits just past 1.0 — the intro has unpinned but its panel is still sliding
 * away while about scrolls in beneath it.
 */
const STAGE_ONE = { start: 1.0, end: 1.6 } as const;

/**
 * The travelling ghost, tracking both endpoints live.
 *
 * The intro panel is still sliding off screen while the about tile is still
 * sliding on, so neither endpoint is stationary. Reading both each frame is
 * what makes the outline actually detach from the panel and follow the tile in,
 * rather than appearing at a fixed spot once about has settled.
 */
export function HandoffGhost({
  progress,
  range,
  fromSelector,
  fromIndex = 0,
  toSelector,
  toIndex = 0,
  stickySelector,
}: {
  progress: MotionValue<number>;
  range: { start: number; end: number };
  fromSelector: string;
  fromIndex?: number;
  toSelector: string;
  toIndex?: number;
  /**
   * The destination's `sticky top-0` wrapper, used to find its parked position.
   * Omit for a destination in normal flow, which has no parked offset to undo.
   */
  stickySelector?: string;
}) {
  const geometry = useTransform(progress, (p) => {
    const t = Math.min(1, Math.max(0, (p - range.start) / (range.end - range.start)));
    const fromEl = document.querySelectorAll(fromSelector)[fromIndex];
    const toEl = document.querySelectorAll(toSelector)[toIndex];
    if (!fromEl || !toEl) return null;

    const f = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const lerp = (a: number, b: number) => a + (b - a) * t;

    // During the handoff both endpoints are scrolling upward together, so
    // lerping between their live positions leaves the ghost hovering in place.
    // The destination is aimed at its *parked* position instead — where the
    // tile comes to rest once about pins — which is stationary and gives the
    // path somewhere real to travel to.
    //
    // That parked position is the tile's offset inside its sticky wrapper,
    // minus the reveal transform it still has to animate through. A destination
    // in normal flow has no sticky wrapper and simply travels with the page, so
    // its live top is already the right target.
    const sticky = stickySelector ? document.querySelector(stickySelector) : null;
    const stickyTop = sticky ? sticky.getBoundingClientRect().top : 0;
    const toRevealY = new DOMMatrixReadOnly(getComputedStyle(toEl).transform).m42;
    const toParkedTop = to.top - stickyTop - toRevealY;

    // The panel is scrolling away while the destination is parked, so the
    // straight line between them sags into the top edge mid-flight. A sine pull
    // toward the viewport's vertical centre — zero at both ends, strongest in
    // the middle — keeps the outline fully in view without moving either
    // endpoint.
    const height = lerp(f.height, to.height);
    const linearTop = lerp(f.top, toParkedTop);
    const midCenter = window.innerHeight / 2 - height / 2;
    const pull = Math.sin(t * Math.PI) * ARC_STRENGTH;

    return {
      top: linearTop + (midCenter - linearTop) * pull,
      left: lerp(f.left, to.left),
      width: lerp(f.width, to.width),
      height,
      radius: lerp(
        Number.parseFloat(getComputedStyle(fromEl).borderTopLeftRadius) || 0,
        Number.parseFloat(getComputedStyle(toEl).borderTopLeftRadius) || 0,
      ),
    };
  });

  const top = useTransform(geometry, (g) => g?.top ?? 0);
  const left = useTransform(geometry, (g) => g?.left ?? 0);
  const width = useTransform(geometry, (g) => g?.width ?? 0);
  const height = useTransform(geometry, (g) => g?.height ?? 0);
  const borderRadius = useTransform(geometry, (g) => g?.radius ?? 0);
  const opacity = useTransform(
    progress,
    [range.start, range.start + 0.04, range.end - 0.06, range.end],
    [0, 1, 1, 0],
    { clamp: true },
  );

  // The ghost wears its origin's look on the way out and its destination's on
  // the way in, so it reads as that panel travelling rather than a bare
  // rectangle. Both are read once, after the endpoints exist and their styles
  // have settled.
  const [skins, setSkins] = useState<{ from: Skin | null; to: Skin | null }>({ from: null, to: null });
  useEffect(() => {
    const read = () =>
      setSkins({
        from: readSkin(document.querySelectorAll(fromSelector)[fromIndex]),
        to: readSkin(document.querySelectorAll(toSelector)[toIndex]),
      });
    const raf = requestAnimationFrame(read);
    const timers = [200, 700].map((ms) => setTimeout(read, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [fromSelector, fromIndex, toSelector, toIndex]);

  /** The flight's own 0–1 progress, which is what drives the skin crossfade. */
  const flight = useTransform(
    progress,
    (p) => Math.min(1, Math.max(0, (p - range.start) / (range.end - range.start))),
  );

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-20 max-[900px]:hidden"
      style={{ top, left, width, height, borderRadius, opacity }}
    >
      <GhostSkin t={flight} from={skins.from} to={skins.to} borderRadius={borderRadius} />
    </motion.div>
  );
}

/**
 * The outline that carries the intro's slide panel into the about section,
 * landing on the middle "After Hours" tile.
 *
 * Both sections are pinned, so the endpoints hold their screen position and the
 * path stays stable for the whole journey.
 */
export function AboutTravelGhosts() {
  const { scrollY } = useScroll();
  const [windows, setWindows] = useState<{
    intro: { start: number; span: number };
  } | null>(null);

  const measure = useCallback(() => {
    const introEl = document.getElementById('intro');
    const aboutEl = document.getElementById('about');
    if (!introEl || !aboutEl) return;

    // The ghost measures both of its endpoints live — neither holds still
    // during the handoff — so nothing about the path is precomputed here. Both
    // still have to exist before the window is published, or the ghost mounts
    // with nothing to travel between.
    const panel = document.querySelector('[data-card-travel-target]');
    const tile = document.querySelector('[data-about-tile]');
    if (!panel || !tile) return;

    const introRect = introEl.getBoundingClientRect();
    setWindows({
      intro: {
        start: introRect.top + window.scrollY,
        span: introRect.height - window.innerHeight,
      },
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

  // The flight straddles the section boundary, so it runs on the intro's window
  // and is allowed past 1.0 — the intro has unpinned by then, but that is
  // exactly where the panel and the incoming tiles share the screen.
  //
  // Driven imperatively rather than derived with `useTransform`, because a
  // transform callback closes over `windows` at first render — when it's still
  // null — and never picks up the measured values.
  const introProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!windows || windows.intro.span <= 0) return;
    introProgress.set((y - windows.intro.start) / windows.intro.span);
  });

  if (!windows) return null;

  return (
    <HandoffGhost
      progress={introProgress}
      range={STAGE_ONE}
      fromSelector="[data-card-travel-target]"
      toSelector="[data-about-tile]"
      toIndex={1}
      stickySelector="#about > div"
    />
  );
}
