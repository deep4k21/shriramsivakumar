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

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

/** How strongly each flight path bows outward from the straight line. */
const ARC_STRENGTH = 0.5;

/**
 * Stage 1 spans the handoff: it starts while the intro panel is still on screen
 * and ends once the about tiles have settled. Measured in intro-window units,
 * that overlap sits just past 1.0 — the intro has unpinned but its panel is
 * still sliding away while about scrolls in beneath it.
 *
 * Stage 2 runs on the about window, where its tiles hold position.
 */
const STAGE_ONE = { start: 1.0, end: 1.6 } as const;
const STAGE_TWO = { start: 0.24, end: 0.42 } as const;

function readRect(el: Element | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0) return null;
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    radius: Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
  };
}

/**
 * Resting position of an element inside a `sticky top-0` child: its offset
 * within that child, minus any reveal transform it animates through.
 */
function restingRect(el: Element | null, stickyEl: Element | null): Rect | null {
  const rect = readRect(el);
  if (!rect || !el || !stickyEl) return null;
  const stickyTop = stickyEl.getBoundingClientRect().top;
  const revealY = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
  return { ...rect, top: rect.top - stickyTop - revealY };
}

interface Path {
  from: Rect;
  to: Rect;
  /** Sign of the sideways bow, so paired ghosts arc away from each other. */
  bow: number;
}

/**
 * Stage 1's ghost, tracking both endpoints live.
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

function Ghost({
  path,
  progress,
  range,
}: {
  path: Path;
  progress: MotionValue<number>;
  range: { start: number; end: number };
}) {
  const span: [number, number] = [range.start, range.end];

  const left = useTransform(progress, span, [path.from.left, path.to.left], { clamp: true });
  const width = useTransform(progress, span, [path.from.width, path.to.width], { clamp: true });
  const height = useTransform(progress, span, [path.from.height, path.to.height], { clamp: true });
  const borderRadius = useTransform(progress, span, [path.from.radius, path.to.radius], { clamp: true });
  const opacity = useTransform(
    progress,
    [range.start, range.start + 0.08, range.end - 0.08, range.end],
    [0, 1, 1, 0],
    { clamp: true },
  );

  // Bow the vertical path so paired ghosts separate visibly instead of sliding
  // along the same horizontal line.
  const top = useTransform(progress, (p) => {
    const t = Math.min(1, Math.max(0, (p - range.start) / (range.end - range.start)));
    const linear = path.from.top + (path.to.top - path.from.top) * t;
    const lift = Math.sin(t * Math.PI) * path.from.height * ARC_STRENGTH * path.bow;
    return linear + lift;
  });

  // Both ends of a stage-two flight are about tiles, so there is one look to
  // wear for the whole trip rather than a crossfade between two.
  const [skin, setSkin] = useState<Skin | null>(null);
  useEffect(() => {
    const read = () => setSkin(readSkin(document.querySelector('[data-about-tile]')));
    const raf = requestAnimationFrame(read);
    const timers = [200, 700].map((ms) => setTimeout(read, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

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
      <GhostSkin t={flight} from={skin} to={skin} borderRadius={borderRadius} />
    </motion.div>
  );
}

/**
 * Outlines that carry the intro's slide panel into the about section: first
 * into the middle "After Hours" tile, then splitting outward from it into the
 * tiles on either side.
 *
 * Both sections are pinned, so every endpoint holds its screen position and the
 * paths stay stable for the whole journey.
 */
export function AboutTravelGhosts() {
  const { scrollY } = useScroll();
  const [paths, setPaths] = useState<{ two: Path[] } | null>(null);
  const [windows, setWindows] = useState<{
    intro: { start: number; span: number };
    about: { start: number; span: number };
  } | null>(null);

  const measure = useCallback(() => {
    const introEl = document.getElementById('intro');
    const aboutEl = document.getElementById('about');
    if (!introEl || !aboutEl) return;

    const aboutSticky = aboutEl.firstElementChild;
    const panel = document.querySelector('[data-card-travel-target]');
    const tiles = [...document.querySelectorAll('[data-about-tile]')];
    if (tiles.length < 3) return;

    const tileRects = tiles.map((t) => restingRect(t, aboutSticky));
    if (!panel || tileRects.some((r) => !r)) return;

    const [exploring, afterHours, openTo] = tileRects as Rect[];

    // Stage 1 is not precomputed — it measures both endpoints live, because
    // neither holds still during the handoff.
    setPaths({
      two: [
        { from: afterHours, to: exploring, bow: -1 },
        { from: afterHours, to: openTo, bow: 1 },
      ],
    });

    const introRect = introEl.getBoundingClientRect();
    const aboutRect = aboutEl.getBoundingClientRect();
    setWindows({
      intro: {
        start: introRect.top + window.scrollY,
        span: introRect.height - window.innerHeight,
      },
      about: {
        start: aboutRect.top + window.scrollY,
        span: aboutRect.height - window.innerHeight,
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

  // Stage 1 straddles the section boundary, so it runs on the intro's window and
  // is allowed past 1.0 — the intro has unpinned by then, but that is exactly
  // where the panel and the incoming tiles share the screen. Stage 2 stays on
  // the about window, where its tiles hold position.
  //
  // These are driven imperatively rather than derived with `useTransform`,
  // because a transform callback closes over `windows` at first render — when
  // it's still null — and never picks up the measured values.
  const introProgress = useMotionValue(0);
  const aboutProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!windows) return;
    if (windows.intro.span > 0) {
      introProgress.set((y - windows.intro.start) / windows.intro.span);
    }
    if (windows.about.span > 0) {
      aboutProgress.set((y - windows.about.start) / windows.about.span);
    }
  });

  if (!paths) return null;

  return (
    <>
      <HandoffGhost
        progress={introProgress}
        range={STAGE_ONE}
        fromSelector="[data-card-travel-target]"
        toSelector="[data-about-tile]"
        toIndex={1}
        stickySelector="#about > div"
      />
      {paths.two.map((p, i) => (
        <Ghost key={i} path={p} progress={aboutProgress} range={STAGE_TWO} />
      ))}
    </>
  );
}
